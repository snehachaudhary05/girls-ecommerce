# 🏗️ Deployment Architecture

This document shows how your e-commerce platform is structured in production.

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS / CUSTOMERS                        │
└─────────────────────────────────────────────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼                               ▼
    ┌────────────────────────┐      ┌────────────────────────┐
    │   FRONTEND (Vercel)    │      │    ADMIN (Vercel)      │
    │                        │      │                        │
    │  - React + Vite        │      │  - React + Vite        │
    │  - Tailwind CSS        │      │  - Tailwind CSS        │
    │  - Product Catalog     │      │  - Product Management  │
    │  - Shopping Cart       │      │  - Order Management    │
    │  - User Auth           │      │  - Admin Dashboard     │
    │  - Checkout            │      │                        │
    │                        │      │                        │
    │  URL: *.vercel.app     │      │  URL: *.vercel.app     │
    └────────────────────────┘      └────────────────────────┘
                 │                               │
                 └───────────────┬───────────────┘
                                 │ HTTPS API Calls
                                 ▼
                    ┌────────────────────────┐
                    │  BACKEND (Render.com)  │
                    │                        │
                    │  - Node.js + Express   │
                    │  - JWT Authentication  │
                    │  - RESTful API         │
                    │  - Business Logic      │
                    │  - Payment Processing  │
                    │                        │
                    │  URL: *.onrender.com   │
                    └────────────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
    ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
    │  MongoDB Atlas   │ │  Cloudinary  │ │   Stripe     │
    │                  │ │              │ │              │
    │  - User Data     │ │  - Product   │ │  - Payments  │
    │  - Products      │ │    Images    │ │  - Checkout  │
    │  - Orders        │ │  - Uploads   │ │              │
    │  - Cart          │ │              │ │              │
    │  - Wishlist      │ │              │ │              │
    └──────────────────┘ └──────────────┘ └──────────────┘
                                 │
                                 ▼
                         ┌──────────────┐
                         │ Gmail SMTP   │
                         │              │
                         │ - OTP Emails │
                         │ - Order      │
                         │   Confirmations│
                         └──────────────┘
```

## 🔄 Data Flow

### User Registration/Login
```
User (Frontend) 
  → POST /api/user/register 
  → Backend validates 
  → Password hashed (bcrypt) 
  → Save to MongoDB 
  → Generate JWT 
  → Return token to Frontend
```

### OTP Login
```
User (Frontend) 
  → POST /api/auth/send-otp 
  → Backend generates OTP 
  → Send email via Gmail SMTP 
  → User receives OTP 
  → POST /api/auth/verify-otp 
  → Backend validates 
  → Generate JWT 
  → Return token
```

### Product Management (Admin)
```
Admin Panel 
  → POST /api/product/add (with images) 
  → Backend validates admin token 
  → Upload images to Cloudinary 
  → Get Cloudinary URLs 
  → Save product to MongoDB 
  → Return success
```

### Order Placement
```
User (Frontend) 
  → POST /api/order/place 
  → Backend validates cart 
  → Create Stripe payment intent 
  → Frontend redirects to Stripe 
  → User completes payment 
  → Stripe webhook → Backend 
  → Update order status 
  → Send confirmation email 
  → Clear cart
```

## 🌐 URL Structure

### Production URLs
```
Frontend:     https://your-ecommerce.vercel.app
Admin Panel:  https://your-ecommerce-admin.vercel.app
Backend API:  https://your-ecommerce-backend.onrender.com
```

### API Endpoints
```
Backend Base: https://your-ecommerce-backend.onrender.com

Public Endpoints:
  GET  /api/product/list
  POST /api/user/register
  POST /api/user/login
  POST /api/auth/send-otp
  POST /api/auth/verify-otp

Authenticated Endpoints (require JWT token):
  GET  /api/cart
  POST /api/cart/add
  POST /api/order/place
  GET  /api/order/user
  GET  /api/wishlist

Admin Endpoints (require admin JWT):
  POST /api/product/add
  PUT  /api/product/:id
  DELETE /api/product/:id
  GET  /api/order/list
  PUT  /api/order/status
```

## 🔐 Security Layers

```
1. Network Level
   └─ HTTPS/SSL (automatic on Vercel & Render)

2. Application Level
   ├─ CORS (allowed origins only)
   ├─ Helmet.js (security headers)
   └─ Rate limiting (optional)

3. Authentication
   ├─ JWT tokens
   ├─ Password hashing (bcrypt)
   └─ Admin verification

4. Data Level
   ├─ Input validation
   ├─ MongoDB injection prevention
   └─ XSS protection
```

## 💾 Data Storage

### MongoDB Collections
```
users
├─ _id
├─ name
├─ email
├─ password (hashed)
├─ phone
└─ createdAt

products
├─ _id
├─ name
├─ description
├─ price
├─ image (Cloudinary URLs array)
├─ category
├─ subCategory
├─ sizes
├─ bestseller
└─ date

orders
├─ _id
├─ userId
├─ items (array)
├─ amount
├─ address
├─ status
├─ paymentMethod
├─ payment
└─ date

wishlists
├─ _id
├─ userId
└─ productIds (array)
```

### Cloudinary Storage
```
/ecommerce
  /products
    ├─ product-1-img1.jpg
    ├─ product-1-img2.jpg
    └─ ...
```

## 🔌 External Service Integration

### Stripe Payment Flow
```
1. User initiates checkout
2. Frontend creates payment intent (backend)
3. Backend contacts Stripe API
4. Stripe returns client_secret
5. Frontend redirects to Stripe checkout
6. User enters payment details
7. Stripe processes payment
8. Stripe sends webhook to backend
9. Backend updates order status
10. Frontend shows success page
```

### Email Service Flow
```
1. User requests OTP
2. Backend generates random 6-digit code
3. Backend creates email with Nodemailer
4. Email sent via Gmail SMTP
5. User receives email
6. User enters OTP
7. Backend verifies and logs in user
```

## 📦 Deployment Pipeline

### Code Changes → Production

```
Developer
  │
  ├─ git commit -m "Add feature"
  │
  └─ git push origin main
        │
        ├─────────────────┬─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
    [Render]          [Vercel]         [Vercel]
    Backend          Frontend          Admin
        │                 │                 │
        ├─ npm install    ├─ npm install    ├─ npm install
        ├─ npm start      ├─ npm run build  ├─ npm run build
        │                 │                 │
        ▼                 ▼                 ▼
    🟢 Live           🟢 Live           🟢 Live
```

## 🎯 Environment Variables Flow

```
Development (.env files)
  ├─ backend/.env
  ├─ frontend/.env
  └─ admin/.env
        │
        └─ (Never committed to git)

Production
  ├─ Render Dashboard → Environment Variables
  │   └─ MONGODB_URI, JWT_SECRET, etc.
  │
  ├─ Vercel (Frontend) → Environment Variables
  │   └─ VITE_BACKEND_URL, VITE_STRIPE_PUBLIC_KEY
  │
  └─ Vercel (Admin) → Environment Variables
      └─ VITE_BACKEND_URL
```

## 🚀 Scaling Strategy

### Current Setup (Free/Starter Tier)
- **Capacity:** ~1000 users/month
- **Cost:** $0-16/month
- **Performance:** Good for development/small business

### Growth Phase
```
Users: 1K-10K/month
├─ Backend: Upgrade to Standard ($25/month)
├─ Database: Shared cluster ($9/month)
└─ Cloudinary: Pay-as-you-go

Users: 10K-100K/month
├─ Backend: Multiple instances + Load balancer
├─ Database: Dedicated cluster ($57+/month)
├─ CDN: Cloudflare Pro
└─ Caching: Redis layer

Users: 100K+/month
├─ Microservices architecture
├─ Database sharding
├─ Multiple regions
└─ Custom CDN setup
```

## 🔍 Monitoring & Logs

### Where to Check Logs

```
Backend Issues:
  └─ Render.com → Your Service → Logs

Frontend/Admin Issues:
  └─ Vercel → Project → Deployments → View Logs

Database Issues:
  └─ MongoDB Atlas → Clusters → Monitoring

Payment Issues:
  └─ Stripe Dashboard → Logs

Email Issues:
  └─ Gmail → Sent folder
  └─ Backend logs for SMTP errors
```

## 🎨 CDN & Static Assets

```
Frontend Build:
  ├─ /index.html
  └─ /assets/
      ├─ app.js (bundled)
      ├─ app.css (bundled)
      └─ [hash].js (code splitting)
            │
            └─ Served via Vercel CDN
                ├─ Edge locations worldwide
                └─ Auto SSL/HTTPS

Product Images:
  └─ Cloudinary CDN
      ├─ Automatic optimization
      ├─ Responsive images
      └─ Global distribution
```

## 📊 Performance Optimization

### Frontend
- Code splitting (automatic with Vite)
- Lazy loading components
- Image optimization (Cloudinary)
- Asset caching (Vercel CDN)

### Backend
- Compression middleware
- Database indexing
- Query optimization
- Cloudinary for image delivery (not local storage)

## 🔧 Backup & Recovery

```
Database (MongoDB Atlas):
  ├─ Automatic daily backups (free tier: 1 day retention)
  ├─ Point-in-time recovery (paid tiers)
  └─ Manual snapshots available

Code (GitHub):
  ├─ Full version history
  ├─ Branch protection
  └─ Easy rollback

Images (Cloudinary):
  ├─ Persistent storage
  └─ No automatic deletion
```

---

## 📝 Summary

Your e-commerce platform uses a modern, scalable architecture:

- **Frontend & Admin:** Static sites on Vercel CDN (fast, global)
- **Backend:** Node.js API on Render (scalable, secure)
- **Database:** MongoDB Atlas (managed, backed up)
- **Images:** Cloudinary CDN (optimized, fast delivery)
- **Payments:** Stripe (PCI compliant, secure)
- **Emails:** Gmail SMTP (reliable, free)

All components work together to provide a fast, secure, and scalable e-commerce experience!
