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

  await connectDB();
  await connectCloudinary();
  
  // CORS configuration for production
  const allowedOrigins = [
    'http://localhost:5173', // Frontend dev
    'http://localhost:5174', // Admin dev
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL
  ].filter(Boolean); // Remove undefined values

  // If no explicit origins are provided (e.g., env vars missing), allow all to avoid blocking deploys
  const allowAllOrigins = allowedOrigins.length === 0;

  const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, health checks, etc.)
      if (!origin) return callback(null, true);

      if (allowAllOrigins || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        // In development, allow all origins
        if (process.env.NODE_ENV !== 'production') {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    },
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
  app.get('/', (req, res) => {
      res.send("API working")
  })

  app.listen(port, () => console.log('Server started on port: ' + port));
})();