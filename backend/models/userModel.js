import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    cartData: { type: Object, default: {} },
    wishlist: { type: [String], default: [] }
}, {minimize: false})

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;