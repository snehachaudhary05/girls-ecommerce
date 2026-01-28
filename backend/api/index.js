import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '../.env') })

import express from 'express'
import path from 'path'
import cors from 'cors'
import compression from 'compression'
import helmet from 'helmet'
import connectDB from '../config/mongodb.js'
import connectCloudinary from '../config/cloudinary.js'
import userRouter from '../routes/userRoute.js'
import productRouter from '../routes/productRoute.js'
import cartRouter from '../routes/cartRoute.js'
import orderRouter from '../routes/orderRoute.js'
import authRouter from '../routes/authRoute.js'
import adminRouter from '../routes/adminRoute.js'
import wishlistRouter from '../routes/wishlistRoute.js'

//App config
const app = express()

app.disable('x-powered-by')
app.set('trust proxy', 1)

// Connect to DB and Cloudinary in background
connectDB();
connectCloudinary();

// CORS configuration
const corsOptions = {
  origin: true,
  credentials: true
};

// middlewares
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}))
app.use(compression())
app.use(express.json())
app.use(cors(corsOptions))

// serve uploaded files statically
app.use(
  '/uploads',
  express.static(path.join(process.cwd(), 'uploads'), {
    immutable: true,
    maxAge: '7d',
  })
)

// api endpoints
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/admin', adminRouter);
app.use('/api/wishlist', wishlistRouter);

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).send('ok')
})

app.get('/', (req, res) => {
  res.send("API working")
})

export default app;
