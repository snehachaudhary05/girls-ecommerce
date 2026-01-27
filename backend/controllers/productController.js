import path from 'path'
import fs from 'fs/promises'
import productModel from '../models/productModel.js';
import { cloudinary, isCloudinaryReady } from '../config/cloudinary.js'

const looksLikePlaceholder = (v) => !v || v.startsWith('your') || v.toLowerCase().includes('placeholder')
  

// function for add product
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, bestseller, inStock, discount, rating, colors, features } = req.body;

        // ✅ Ensure req.files exists
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ success: false, message: "No images uploaded" });
        }

        // ✅ Extract images safely
        const image1 = req.files.image1?.[0];
        const image2 = req.files.image2?.[0];
        const image3 = req.files.image3?.[0];
        const image4 = req.files.image4?.[0];

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined);

        let imagesUrl = []

        // Prefer Cloudinary (persistent + CDN) when configured; fallback to local /uploads for dev.
        if (isCloudinaryReady()) {
            imagesUrl = await Promise.all(
                images.map(async (item) => {
                    const result = await cloudinary.uploader.upload(item.path, {
                        folder: 'ecommerce/products',
                        resource_type: 'image',
                    })

                    // Cleanup temp/local file after successful Cloudinary upload
                    await fs.unlink(item.path).catch(() => {})
                    return result.secure_url
                })
            )
        } else {
            const host = process.env.HOST_URL || `http://localhost:${process.env.PORT || 4000}`
            imagesUrl = images.map((item) => {
                const filename = path.basename(item.path)
                return `${host}/uploads/${filename}`
            })
        }

        // ✅ Parse colors if provided, otherwise empty array
        let parsedColors = [];
        if (colors) {
            try {
                parsedColors = JSON.parse(colors);
            } catch (e) {
                parsedColors = [];
            }
        }

        // ✅ Parse features if provided, otherwise empty array
        let parsedFeatures = [];
        if (features) {
            try {
                parsedFeatures = JSON.parse(features);
            } catch (e) {
                parsedFeatures = [];
            }
        }

        // ✅ Create product data object
        const productData = {
            name,
            description,
            price: Number(price),
            category,
            subCategory,
            colors: parsedColors,
            features: parsedFeatures,
            discount: Number(discount) || 0,
            rating: Number(rating) || 0,
            inStock: inStock === "true" ? true : false,
            bestseller: bestseller === "true" ? true : false,
            images: imagesUrl,
            date: Date.now(),
        };

        // ✅ Save product in DB
        const product = new productModel(productData);
        await product.save();
        res.json({ success: true, message: "Product Added" });

    } 
    catch (error){
        console.log(error);
        res.json({success:false, message: error.message})
    }
}

// function for list product
const listProducts = async (req, res) => {
    try{
        const noCache = req.query?.nocache === '1' || req.query?.nocache === 'true'

        // Public endpoint used by frontend to bootstrap the entire catalog.
        // Keep payload the same, but reduce Mongoose overhead.
        const products = await productModel.find({}).sort({ date: -1 }).lean()

        // Allow caching for storefront, but let admin bypass via ?nocache=1
        if (noCache) {
            res.set('Cache-Control', 'no-store')
        } else {
            res.set('Cache-Control', 'public, max-age=60')
        }
        res.json({success:true, products})
    }
    catch (error){
        console.log(error);
        res.json({success:false, message: error.message})
    }
}

// function for remove product
const removeProduct = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Product removed"})
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// function for single product info
const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body
        console.log('Fetching product with ID:', productId);
        const product = await productModel.findById(productId)
        if (!product) {
            return res.json({success: false, message: 'Product not found'})
        }
        res.json({success: true, product})
    }
    catch (error){
        console.log(error)
        res.json({success:false, message: error.message})
    }
}

// function for update product
const updateProduct = async (req, res) => {
    try {
        const { productId, name, description, price, category, subCategory, bestseller, features, deletedImages } = req.body;

        const updateData = {
            name,
            description,
            price: Number(price),
            category,
            subCategory,
            bestseller: bestseller === "true" || bestseller === true ? true : false,
        };

        // Parse features if provided
        if (features) {
            try {
                updateData.features = JSON.parse(features);
            } catch (e) {
                updateData.features = [];
            }
        }

        // Get existing product
        const existingProduct = await productModel.findById(productId);
        let newImages = existingProduct && existingProduct.images ? [...existingProduct.images] : [];

        // Handle deleted images
        if (deletedImages) {
            try {
                const deletedImageIndexes = JSON.parse(deletedImages);
                newImages = newImages.filter((_, idx) => !deletedImageIndexes.includes(idx));
            } catch (e) {
                console.log('Error parsing deleted images:', e);
            }
        }

        // If new images are uploaded, update them
        if (req.files && Object.keys(req.files).length > 0) {
            const uploadedSlots = []
            for (let i = 1; i <= 4; i++) {
                const f = req.files[`image${i}`]?.[0]
                if (f) uploadedSlots.push({ slotIndex: i - 1, file: f })
            }

            let uploadedUrls = []
            if (isCloudinaryReady()) {
                uploadedUrls = await Promise.all(
                    uploadedSlots.map(async ({ slotIndex, file }) => {
                        const result = await cloudinary.uploader.upload(file.path, {
                            folder: 'ecommerce/products',
                            resource_type: 'image',
                        })

                        await fs.unlink(file.path).catch(() => {})
                        return { slotIndex, url: result.secure_url }
                    })
                )
            } else {
                const host = process.env.HOST_URL || `http://localhost:${process.env.PORT || 4000}`
                uploadedUrls = uploadedSlots.map(({ slotIndex, file }) => {
                    const filename = path.basename(file.path)
                    return { slotIndex, url: `${host}/uploads/${filename}` }
                })
            }

            // Replace images in their uploaded slots; preserve slot ordering.
            uploadedUrls.forEach(({ slotIndex, url }) => {
                while (newImages.length <= slotIndex) newImages.push('')
                newImages[slotIndex] = url
            })
        }

        updateData.images = newImages;

        const product = await productModel.findByIdAndUpdate(productId, updateData, { new: true });
        
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        res.json({ success: true, message: "Product updated", product });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { listProducts, addProduct, removeProduct, singleProduct, updateProduct }