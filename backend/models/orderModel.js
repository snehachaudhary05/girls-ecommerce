import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String },
    userEmail: { type: String },
    userPhone: { type: String },
    items: { type: Array, required: true },
    amount: { type: Number, required: true },
    address: { type: Object, required: true},
    status: { type: String, required: true, default: 'Order Placed' },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, required: true, default: false},
    date: { type: Date, required: true },
    razorpay_payment_id: { type: String, default: null },
    stripe_payment_id: { type: String, default: null },
    cancelled: { type: Boolean, default: false },
    cancellationDate: { type: Date, default: null },
    cancellationReason: { type: String, default: null },
    cancelledBy: { type: String, enum: ['customer', 'admin'], default: null }
})

orderSchema.index({ userId: 1, date: -1 })
orderSchema.index({ status: 1, date: -1 })
orderSchema.index({ cancelled: 1, date: -1 })

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema)
export default orderModel;