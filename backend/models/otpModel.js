import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    otpExpiry: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 } // Auto-delete after 10 minutes
}, { timestamps: true });

const otpModel = mongoose.models.otp || mongoose.model('otp', otpSchema);

export default otpModel;
