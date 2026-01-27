import express from 'express'
import authUser from '../middleware/auth.js'
import { getUserCart, updateCart, addToCart, clearCart } from '../controllers/cartController.js'

const cartRouter = express.Router()

cartRouter.post('/get', authUser, getUserCart)
cartRouter.post('/add', authUser, addToCart)
cartRouter.post('/update', authUser, updateCart)
cartRouter.post('/clear', authUser, clearCart)

export default cartRouter;