import express from 'express';
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  isInWishlist,
} from '../controllers/wishlistController.js';
import authUser from '../middleware/auth.js';

const wishlistRouter = express.Router();

wishlistRouter.post('/add', authUser, addToWishlist);
wishlistRouter.post('/remove', authUser, removeFromWishlist);
wishlistRouter.post('/get', authUser, getWishlist);
wishlistRouter.post('/check', authUser, isInWishlist);

export default wishlistRouter;
