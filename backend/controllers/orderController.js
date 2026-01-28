import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import productModel from "../models/productModel.js"
import Razorpay from 'razorpay'
import crypto from 'crypto'
import Stripe from 'stripe'
import { sendEmail } from "../utils/emailService.js"

const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address, payment, paymentMethod, paymentInfo} = req.body
        
        // Get user details
        const user = await userModel.findById(userId);
        
        // Get customer name and phone from address form data (form fields are compulsory)
        const customerName = address?.firstName && address?.lastName 
            ? `${address.firstName} ${address.lastName}` 
            : user?.name || 'Unknown';
        const customerPhone = address?.phone || '';
        
        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: paymentMethod || "COD",
            payment: payment || false,
            date: Date.now(),
            userName: customerName,
            userEmail: address?.email || user?.email || '',
            userPhone: customerPhone
        }

        // If payment is through Razorpay, verify it
        if (paymentMethod === 'Razorpay' && paymentInfo) {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentInfo
            
            // Verify signature
            const body = razorpay_order_id + '|' + razorpay_payment_id
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body)
                .digest('hex')

            if (expectedSignature !== razorpay_signature) {
                return res.json({ success: false, message: 'Payment verification failed' })
            }

            // Payment verified, update order data
            orderData.razorpay_payment_id = razorpay_payment_id
            orderData.payment = true
        }

        // If payment is through Stripe, add payment ID
        if (paymentMethod === 'Stripe' && paymentInfo) {
            orderData.stripe_payment_id = paymentInfo.stripe_payment_id
            orderData.payment = true
        }

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        await userModel.findByIdAndUpdate(userId, {cartData: {}})

        // Send order confirmation email
        try {
            const user = await userModel.findById(userId);
            if (user && user.email) {
                console.log(`[Order Email] Sending order confirmation to ${user.email}`);
                const emailResult = await sendEmail(user.email, 'orderConfirmed', user.name || 'Valued Customer', newOrder._id.toString(), amount, items);
                console.log(`[Order Email] Result:`, emailResult);
            } else {
                console.log(`[Order Email] User not found or no email: ${userId}`);
            }
        } catch (emailError) {
            console.error('[Order Email] Failed to send order confirmation email:', emailError);
            // Don't fail the order placement if email fails
        }

        res.json({success: true, message: "Order Placed"})
    }
    catch (error){
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// Placing orders using stripe method
const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, amount, address, paymentMethod } = req.body
        
        console.log('placeOrderStripe called with:', { userId, items, amount, address });

        // Validate items exist
        if (!items || items.length === 0) {
            return res.json({ success: false, message: 'No items in order' })
        }

        if (!process.env.STRIPE_API_KEY) {
            return res.json({ success: false, message: 'Stripe not configured' })
        }

        const stripe = new Stripe(process.env.STRIPE_API_KEY)

        // Create line items for Stripe
        const line_items = items.map((item) => ({
            price_data: {
                currency: 'inr',
                product_data: {
                    name: item.name,
                    images: item.images && item.images[0] ? [item.images[0]] : [],
                },
                unit_amount: Math.round(item.price * 100) // Convert to paise
            },
            quantity: item.quantity
        }))

        console.log('Line items created:', line_items);

        // Create checkout session
        // Prepare item quantities for metadata
        const itemQuantities = {};
        items.forEach(i => { itemQuantities[i._id] = i.quantity });
        const sessionData = {
            success_url: `${process.env.FRONTEND_URL}/orders?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cart`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                userId,
                address: JSON.stringify(address),
                itemIds: items.map(i => i._id).join(','),
                itemQuantities: JSON.stringify(itemQuantities),
                amount: amount.toString()
            }
        }
        
        console.log('Creating Stripe session with metadata:', sessionData.metadata);
        
        const session = await stripe.checkout.sessions.create(sessionData)
        
        console.log('Stripe session created:', session.id);

        res.json({ success: true, session_id: session.id })
    } catch (error) {
        console.log('ERROR in placeOrderStripe:', error)
        res.json({ success: false, message: error.message })
    }
}

// Verify Stripe payment
const verifyStripe = async (req, res) => {
    try {
        const { session_id } = req.body
        
        console.log('verifyStripe called with session_id:', session_id);

        if (!process.env.STRIPE_API_KEY) {
            return res.json({ success: false, message: 'Stripe not configured' })
        }

        const stripe = new Stripe(process.env.STRIPE_API_KEY)
        console.log('Retrieving session from Stripe...');
        const session = await stripe.checkout.sessions.retrieve(session_id)
        
        console.log('Session retrieved. Payment status:', session.payment_status);
        console.log('Session metadata:', session.metadata);

        if (session.payment_status === 'paid') {
            // Get data from session metadata
            console.log('Payment successful, extracting order data...');
            const userId = session.metadata.userId
            console.log('userId:', userId);
            
            let address, items;
            try {
                address = JSON.parse(session.metadata.address)
                console.log('Address parsed:', address);
            } catch (e) {
                console.log('Error parsing address:', e.message);
                throw new Error(`Failed to parse address: ${e.message}`);
            }


            // Get product details from itemIds and merge with quantities
            let itemIds = [];
            if (session.metadata.itemIds) {
                itemIds = session.metadata.itemIds.split(',').filter(Boolean);
            }
            if (!itemIds.length) {
                throw new Error('No itemIds found in Stripe metadata');
            }
            // Parse itemQuantities from metadata
            let itemQuantities = {};
            if (session.metadata.itemQuantities) {
                try {
                    itemQuantities = JSON.parse(session.metadata.itemQuantities);
                } catch (e) {
                    console.log('Error parsing itemQuantities:', e.message);
                }
            }
            // Fetch product details from DB (lean for less overhead)
            const products = await productModel.find({ _id: { $in: itemIds } }).lean()

            // Merge quantity into each product
            items = products.map((prod) => ({
                ...prod,
                quantity: itemQuantities[prod._id.toString()] || 1
            }))
            console.log('Merged items with quantities:', items);

            const amount = Number(session.metadata.amount)
            console.log('Amount:', amount);

            console.log('Verifying Stripe payment for user:', userId);
            console.log('Order data:', { userId, items, amount, address });


            // Fetch user details for order
            let userName = '', userEmail = '';
            try {
                const user = await userModel.findById(userId);
                if (user) {
                    userName = user.name || '';
                    userEmail = user.email || '';
                }
            } catch (e) {
                console.log('Error fetching user for order:', e.message);
            }

            // Payment successful, create order
            const orderData = {
                userId,
                userName,
                userEmail,
                items,
                amount,
                address,
                paymentMethod: 'Stripe',
                payment: true,
                stripe_payment_id: session.payment_intent,
                date: Date.now()
            }

            console.log('Creating order with data:', orderData);
            const newOrder = new orderModel(orderData)
            await newOrder.save()
            console.log('Order saved successfully:', newOrder._id);

            console.log('Clearing cart for user:', userId);
            await userModel.findByIdAndUpdate(userId, { cartData: {} })
            console.log('Cart cleared successfully');

            res.json({ success: true, message: 'Order Placed' })
        } else {
            res.json({ success: false, message: 'Payment not completed' })
        }
    } catch (error) {
        console.log('ERROR in verifyStripe:', error);
        res.json({ success: false, message: error.message })
    }
}

// Placing orders using Razorpay method
const placeOrderRazorpay = async (req, res) => {
    try{
        const { userId, items, amount, address } = req.body

        // If keys missing, return a mock order for local development/testing
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.warn('Razorpay keys not configured — returning mock order for development')
            const mockOrder = {
                id: `mock_order_${Date.now()}`,
                amount: Math.round(amount * 100),
                currency: 'INR'
            }
            return res.json({ success: true, order: mockOrder, key: 'rzp_test_mock_key' })
        }

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })

        const options = {
            amount: Math.round(amount * 100), // amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        }

        const order = await instance.orders.create(options)

        // Return order details and key id to frontend
        res.json({ success: true, order, key: process.env.RAZORPAY_KEY_ID })
    }
    catch (error){
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// All orders data for admin panel
const allOrders = async (req, res) => {
    try{
        const orders = await orderModel.find({}).sort({ date: -1 }).lean()
        res.json({success: true, orders})
    }
    catch(error){
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// User order data for frontend
const userOrders = async (req, res) => {
    try{
        const {userId} = req.body
        const orders = await orderModel.find({ userId }).sort({ date: -1 }).lean()
        res.json({success: true, orders})
    }
    catch (error){
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// Update order status
const updateStatus = async (req, res) => {
    try{
        const {orderId, status} = req.body
        
        const order = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true }).lean()
        
        // Send status update emails
        try {
            const user = await userModel.findById(order.userId).lean()
            if (user && user.email) {
                if (status === 'Shipped') {
                    await sendEmail(user.email, 'orderShipped', user.name || 'Valued Customer', orderId);
                } else if (status === 'Out for Delivery') {
                    await sendEmail(user.email, 'orderOutForDelivery', user.name || 'Valued Customer', orderId);
                } else if (status === 'Delivered') {
                    await sendEmail(user.email, 'orderDelivered', user.name || 'Valued Customer', orderId);
                }
            }
        } catch (emailError) {
            console.error('Failed to send status update email:', emailError);
            // Don't fail the status update if email fails
        }
        
        res.json({success: true, message: "Order Status Updated"})
    }
    catch (error){
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// Cancel order
const cancelOrder = async (req, res) => {
    try {
        const { orderId, cancellationReason } = req.body
        const userId = req.body.userId || req.user?.userId
        
        // Find the order
        const order = await orderModel.findById(orderId).lean()
        
        if (!order) {
            return res.json({ success: false, message: "Order not found" })
        }
        
        // Check if user is the order owner
        if (order.userId !== userId) {
            return res.json({ success: false, message: "Unauthorized: Cannot cancel this order" })
        }
        
        // Check if order can be cancelled (only if not already shipped or delivered)
        const cancelableStatuses = ['Order Placed', 'Processing', 'Packing']
        if (!cancelableStatuses.includes(order.status)) {
            return res.json({ success: false, message: `Cannot cancel order with status: ${order.status}` })
        }
        
        // Check if already cancelled
        if (order.cancelled) {
            return res.json({ success: false, message: "This order is already cancelled" })
        }
        
        // Update the order with cancellation details
        await orderModel.findByIdAndUpdate(orderId, {
            cancelled: true,
            cancellationDate: new Date(),
            cancellationReason: cancellationReason || 'Customer requested cancellation',
            cancelledBy: 'customer',
            status: 'Cancelled'
        })

        // Send cancellation email to customer
        try {
            if (order.userEmail) {
                await sendEmail(order.userEmail, 'orderCancelled', order.userName || 'Valued Customer', orderId);
            }
        } catch (emailError) {
            console.error('Failed to send customer cancellation email:', emailError);
        }

        // Send admin notification email
        try {
            const adminEmail = process.env.ADMIN_EMAIL;
            if (adminEmail) {
                await sendEmail(adminEmail, 'adminOrderCancelled', order.userName || 'Unknown Customer', orderId, order.userEmail || 'N/A', order.amount, order.items);
            }
        } catch (emailError) {
            console.error('Failed to send admin notification email:', emailError);
        }
        
        res.json({ success: true, message: "Order cancelled successfully" })
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Admin cancel order
const adminCancelOrder = async (req, res) => {
    try {
        const { orderId, cancellationReason } = req.body
        
        // Find the order
        const order = await orderModel.findById(orderId).lean()
        
        if (!order) {
            return res.json({ success: false, message: "Order not found" })
        }
        
        // Check if already cancelled
        if (order.cancelled) {
            return res.json({ success: false, message: "This order is already cancelled" })
        }
        
        // Update the order with cancellation details (admin can cancel from any status)
        await orderModel.findByIdAndUpdate(orderId, {
            cancelled: true,
            cancellationDate: new Date(),
            cancellationReason: cancellationReason || 'Cancelled by admin',
            cancelledBy: 'admin',
            status: 'Cancelled'
        })
        
        res.json({ success: true, message: "Order cancelled successfully by admin" })
    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {placeOrder, placeOrderRazorpay, placeOrderStripe, verifyStripe, allOrders, updateStatus, userOrders, cancelOrder, adminCancelOrder}