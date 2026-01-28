import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '.env') })

import express from 'express'
import path from 'path'
import cors from 'cors'
import compression from 'compression'
import helmet from 'helmet'

// Setup app and routes using async IIFE
(async () => {
  // Dynamic imports to ensure env vars are loaded first
  const connectDB = (await import('./config/mongodb.js')).default
  const connectCloudinary = (await import('./config/cloudinary.js')).default
  const userRouter = (await import('./routes/userRoute.js')).default
  const productRouter = (await import('./routes/productRoute.js')).default
  const cartRouter = (await import('./routes/cartRoute.js')).default
  const orderRouter = (await import('./routes/orderRoute.js')).default
  const authRouter = (await import('./routes/authRoute.js')).default
  const adminRouter = (await import('./routes/adminRoute.js')).default
  const wishlistRouter = (await import('./routes/wishlistRoute.js')).default

  //App config
  const app = express()
  const port = process.env.PORT || 4000

  app.disable('x-powered-by')
  // Helpful when deployed behind Render/NGINX proxies
  app.set('trust proxy', 1)

  // Connect to DB and Cloudinary in background (don't await)
  connectDB();
  connectCloudinary();
  
  // CORS configuration - simple and works for both dev and production
  const corsOptions = {
    origin: true, // Allow all origins for now (simplest solution)
    credentials: true
  };

  // middlewares
  app.use(helmet({
    // keep things compatible with Stripe/Razorpay redirects
    crossOriginEmbedderPolicy: false,
  }))
  app.use(compression())
  app.use(express.json())
  app.use(cors(corsOptions))
  // serve uploaded files statically
  app.use(
    '/uploads',
    express.static(path.join(process.cwd(), 'uploads'), {
      // uploaded filenames are typically unique (timestamp/hash), so safe to cache
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
    // Health check endpoint for Railway - respond immediately
    app.get('/healthz', (req, res) => {
      res.status(200).send('ok')
    })
  app.get('/', (req, res) => {
      res.send("API working")
  })

  app.listen(port, '0.0.0.0', () => console.log('Server started on port: ' + port));
})();