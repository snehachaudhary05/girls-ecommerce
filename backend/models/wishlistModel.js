import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure each user can have each product only once in wishlist
wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

const wishlistModel = mongoose.model('wishlist', wishlistSchema);

export default wishlistModel;
