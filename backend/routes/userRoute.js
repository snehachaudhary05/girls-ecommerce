import express from 'express'
import { loginUser, registerUser, adminLogin, updateProfile, getUserProfile, toggleWishlist } from '../controllers/userController.js'
import authUser from '../middleware/auth.js'

const userRouter = express.Router();

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)
userRouter.get('/profile', authUser, getUserProfile)
userRouter.post('/profile', authUser, getUserProfile)
userRouter.put('/profile', authUser, updateProfile)
userRouter.post('/update-profile', authUser, updateProfile)
userRouter.post('/wishlist', authUser, toggleWishlist)

export default userRouter;