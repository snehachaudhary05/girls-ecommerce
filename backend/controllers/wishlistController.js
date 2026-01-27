import wishlistModel from '../models/wishlistModel.js';
import productModel from '../models/productModel.js';

// Add item to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.json({ success: false, message: 'UserId and ProductId are required' });
    }

    // Check if product exists
    const product = await productModel.findById(productId);
    if (!product) {
      return res.json({ success: false, message: 'Product not found' });
    }

    // Check if already in wishlist
    const existingWishlist = await wishlistModel.findOne({ userId, productId });
    if (existingWishlist) {
      return res.json({ success: false, message: 'Product already in wishlist' });
    }

    // Add to wishlist
    const newWishlistItem = new wishlistModel({ userId, productId });
    await newWishlistItem.save();

    res.json({ success: true, message: 'Added to wishlist' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Remove item from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.json({ success: false, message: 'UserId and ProductId are required' });
    }

    const result = await wishlistModel.findOneAndDelete({ userId, productId });

    if (!result) {
      return res.json({ success: false, message: 'Item not found in wishlist' });
    }

    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get all wishlist items for a user
const getWishlist = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.json({ success: false, message: 'UserId is required' });
    }

    const wishlistItems = await wishlistModel.find({ userId });

    // Get product details for each wishlist item
    const wishlistWithProducts = await Promise.all(
      wishlistItems.map(async (item) => {
        const product = await productModel.findById(item.productId);
        return {
          _id: item._id,
          productId: item.productId,
          product,
          addedAt: item.createdAt,
        };
      })
    );

    res.json({ success: true, wishlist: wishlistWithProducts });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Check if product is in wishlist
const isInWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.json({ success: false, isInWishlist: false });
    }

    const wishlistItem = await wishlistModel.findOne({ userId, productId });
    res.json({ success: true, isInWishlist: !!wishlistItem });
  } catch (error) {
    console.log(error);
    res.json({ success: false, isInWishlist: false });
  }
};

export { addToWishlist, removeFromWishlist, getWishlist, isInWishlist };
