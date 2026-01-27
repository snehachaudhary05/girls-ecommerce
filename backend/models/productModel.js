import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true},
    price: { type: Number, required: true},
    description: { type: String, required: true },
    features: { type: [String], default: [] },
    images: { type: [String], required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    colors: { type: [String], default: [] },
    discount: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    bestseller: { type: Boolean, default: false },
    date: { type: Number, required: true }
})

productSchema.index({ category: 1, subCategory: 1 })
productSchema.index({ bestseller: 1, date: -1 })
productSchema.index({ inStock: 1, date: -1 })
productSchema.index({ date: -1 })

const productModel =mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;