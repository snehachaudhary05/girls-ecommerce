import nodemailer from 'nodemailer';

// Create transporter - supports both Gmail and Zoho Mail
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: (process.env.EMAIL_PORT || '587') === '465',
    auth: {
        user: process.env.SMTP_EMAIL || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD
    },
    connectionTimeout: 20000, // fail fast if SMTP is unreachable
    socketTimeout: 20000,
});

// Email templates
const emailTemplates = {
    orderConfirmed: (userName, orderId, orderAmount, items) => ({
        subject: '✓ Order Confirmed - Scrunchies Store',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #6B4899; margin-bottom: 20px;">Order Confirmed! 🎉</h2>
                    
                    <p style="color: #333; margin-bottom: 10px;">Hi <strong>${userName}</strong>,</p>
                    
                    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                        Thank you for your order! We're thrilled to have your business. Your order has been confirmed and will be processed shortly.
                    </p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #6B4899; margin-bottom: 20px;">
                        <p style="margin: 5px 0; color: #555;"><strong>Order ID:</strong> ${orderId}</p>
                        <p style="margin: 5px 0; color: #555;"><strong>Total Amount:</strong> ₹${orderAmount}</p>
                        <p style="margin: 5px 0; color: #555;"><strong>Status:</strong> <span style="color: #27ae60;">Order Placed</span></p>
                    </div>
                    
                    <h3 style="color: #6B4899; margin-top: 20px; margin-bottom: 10px;">Order Items:</h3>
                    <ul style="color: #555; line-height: 1.8; margin-bottom: 20px;">
                        ${Array.isArray(items) ? items.map(item => {
                            const itemName = item.name || 'Product';
                            const itemQty = item.quantity || 1;
                            const itemSize = item.size ? ` - ${item.size}` : '';
                            const itemColor = item.color ? ` (${item.color})` : '';
                            return `<li>${itemName}${itemSize}${itemColor} x ${itemQty}</li>`;
                        }).join('') : '<li>Items not available</li>'}
                    </ul>
                    
                    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                        We'll send you updates as your order progresses. You'll receive notifications when your order is shipped and delivered.
                    </p>
                    
                    <p style="color: #555; margin-bottom: 10px;">Thank you for shopping with us!</p>
                    
                    <p style="color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
                        This is an automated email. Please do not reply to this email.
                    </p>
                </div>
            </div>
        `
    }),
    
    orderShipped: (userName, orderId, trackingInfo) => ({
        subject: '📦 Your Order Has Been Shipped - Scrunchies Store',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #6B4899; margin-bottom: 20px;">Great News! Your Order is on its Way 📦</h2>
                    
                    <p style="color: #333; margin-bottom: 10px;">Hi <strong>${userName}</strong>,</p>
                    
                    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                        Exciting news! Your order has been shipped and is on its way to you. You can expect delivery within 3-7 business days.
                    </p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #3498db; margin-bottom: 20px;">
                        <p style="margin: 5px 0; color: #555;"><strong>Order ID:</strong> ${orderId}</p>
                        <p style="margin: 5px 0; color: #555;"><strong>Status:</strong> <span style="color: #3498db;">Shipped</span></p>
                    </div>
                    
                    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                        Keep an eye on your inbox for the delivery notification. If you have any questions, feel free to reach out to us.
                    </p>
                    
                    <p style="color: #555; margin-bottom: 10px;">Happy shopping!</p>
                    
                    <p style="color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
                        This is an automated email. Please do not reply to this email.
                    </p>
                </div>
            </div>
        `
    }),
    
    orderDelivered: (userName, orderId) => ({
        subject: '✓ Your Order Has Been Delivered - Scrunchies Store',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #6B4899; margin-bottom: 20px;">Order Delivered! 🎉</h2>
                    
                    <p style="color: #333; margin-bottom: 10px;">Hi <strong>${userName}</strong>,</p>
                    
                    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                        Your order has been successfully delivered! We hope you enjoy your purchase. Thank you for choosing us!
                    </p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #27ae60; margin-bottom: 20px;">
                        <p style="margin: 5px 0; color: #555;"><strong>Order ID:</strong> ${orderId}</p>
                        <p style="margin: 5px 0; color: #555;"><strong>Status:</strong> <span style="color: #27ae60;">Delivered</span></p>
                    </div>
                    
                    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                        If you have any feedback or concerns about your order, please let us know. We'd love to hear from you!
                    </p>
                    
                    <p style="color: #555; margin-bottom: 10px;">Thank you for your business!</p>
                    
                    <p style="color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
                        This is an automated email. Please do not reply to this email.
                    </p>
                </div>
            </div>
        `
    }),

    orderOutForDelivery: (userName, orderId) => ({
        subject: '🚚 Your Order is Out for Delivery - Scrunchies Store',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #6B4899; margin-bottom: 20px;">Out for Delivery! 🚚</h2>
                    
                    <p style="color: #333; margin-bottom: 10px;">Hi <strong>${userName}</strong>,</p>
                    
                    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                        Great news! Your order is out for delivery today. Our delivery partner is on the way with your package. Please ensure someone is available to receive it.
                    </p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #f39c12; margin-bottom: 20px;">
                        <p style="margin: 5px 0; color: #555;"><strong>Order ID:</strong> ${orderId}</p>
                        <p style="margin: 5px 0; color: #555;"><strong>Status:</strong> <span style="color: #f39c12;">Out for Delivery</span></p>
                    </div>
                    
                    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                        You should receive your order by end of today. If you have any questions, feel free to reach out to us.
                    </p>
                    
                    <p style="color: #555; margin-bottom: 10px;">Thank you for your patience!</p>
                    
                    <p style="color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
                        This is an automated email. Please do not reply to this email.
                    </p>
                </div>
            </div>
        `
    }),

    orderCancelled: (userName, orderId) => ({
        subject: '❌ Order Cancelled - Scrunchies Store',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #e74c3c; margin-bottom: 20px;">Order Cancelled ❌</h2>
                    
                    <p style="color: #333; margin-bottom: 10px;">Hi <strong>${userName}</strong>,</p>
                    
                    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                        Your order has been successfully cancelled. If you have already made a payment, we will process a refund to your original payment method within 5-7 business days.
                    </p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #e74c3c; margin-bottom: 20px;">
                        <p style="margin: 5px 0; color: #555;"><strong>Order ID:</strong> ${orderId}</p>
                        <p style="margin: 5px 0; color: #555;"><strong>Status:</strong> <span style="color: #e74c3c;">Cancelled</span></p>
                    </div>
                    
                    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                        If you have any questions or concerns, please don't hesitate to reach out to us.
                    </p>
                    
                    <p style="color: #555; margin-bottom: 10px;">We'd love to serve you again in the future!</p>
                    
                    <p style="color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
                        This is an automated email. Please do not reply to this email.
                    </p>
                </div>
            </div>
        `
    }),

    adminOrderCancelled: (customerName, orderId, customerEmail, amount, items) => ({
        subject: '⚠️ Order Cancelled by Customer - Scrunchies Store Admin',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #e74c3c; margin-bottom: 20px;">⚠️ Order Cancelled Alert</h2>
                    
                    <p style="color: #333; margin-bottom: 20px;">An order has been cancelled by the customer.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #e74c3c; margin-bottom: 20px;">
                        <p style="margin: 5px 0; color: #555;"><strong>Order ID:</strong> ${orderId}</p>
                        <p style="margin: 5px 0; color: #555;"><strong>Customer Name:</strong> ${customerName}</p>
                        <p style="margin: 5px 0; color: #555;"><strong>Customer Email:</strong> ${customerEmail}</p>
                        <p style="margin: 5px 0; color: #555;"><strong>Order Amount:</strong> ₹${amount}</p>
                    </div>
                    
                    <h3 style="color: #e74c3c; margin-top: 20px; margin-bottom: 10px;">Cancelled Items:</h3>
                    <ul style="color: #555; line-height: 1.8; margin-bottom: 20px;">
                        ${Array.isArray(items) ? items.map(item => {
                            const itemName = item.name || 'Product';
                            const itemQty = item.quantity || 1;
                            return `<li>${itemName} x ${itemQty}</li>`;
                        }).join('') : '<li>Items not available</li>'}
                    </ul>
                    
                    <p style="color: #555; line-height: 1.6; margin-bottom: 10px;">
                        Please process any necessary refunds and update your records accordingly.
                    </p>
                    
                    <p style="color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
                        This is an automated admin notification. Please do not reply to this email.
                    </p>
                </div>
            </div>
        `
    })
};

// Send email function
export const sendEmail = async (email, template, ...args) => {
    try {
        if ((!process.env.SMTP_EMAIL && !process.env.EMAIL_USER) || (!process.env.SMTP_PASSWORD && !process.env.EMAIL_PASSWORD)) {
            console.log('Email service not configured. Skipping email.');
            return { success: true, message: 'Email service not configured' };
        }

        console.log('Sending email to:', email);
        console.log('Using email:', process.env.SMTP_EMAIL || process.env.EMAIL_USER);
        
        const emailContent = emailTemplates[template](...args);
        
        const mailOptions = {
            from: `"Scrunchies Store" <${process.env.SMTP_EMAIL || process.env.EMAIL_USER}>`,
            to: email,
            ...emailContent
        };

        // Wrap sendMail in Promise.race to enforce hard 15s timeout
        const sendWithTimeout = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Email sending timed out after 15 seconds'));
            }, 15000);
            
            transporter.sendMail(mailOptions)
                .then(info => {
                    clearTimeout(timeout);
                    resolve(info);
                })
                .catch(err => {
                    clearTimeout(timeout);
                    reject(err);
                });
        });

        const info = await sendWithTimeout;
        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        console.error('Email service error details:', error.message);
        return { success: false, error: error.message };
    }
};

export default { sendEmail, emailTemplates };
