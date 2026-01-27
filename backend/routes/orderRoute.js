import express from 'express'
import { placeOrder, placeOrderRazorpay, placeOrderStripe, verifyStripe, updateStatus, allOrders, userOrders, cancelOrder, adminCancelOrder } from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

// Admin features
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)
orderRouter.post('/admin-cancel', adminAuth, adminCancelOrder)

// Payment features
orderRouter.post('/place', authUser, placeOrder)
orderRouter.post('/stripe', authUser, placeOrderStripe)
orderRouter.post('/verifyStripe', authUser, verifyStripe)
orderRouter.post('/razorpay', authUser, placeOrderRazorpay)

// User features
orderRouter.post('/userorders', authUser, userOrders)
orderRouter.post('/cancel', authUser, cancelOrder)

export default orderRouter;