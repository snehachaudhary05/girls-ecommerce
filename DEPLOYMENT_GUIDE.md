# E-Commerce Deployment Guide

This guide will help you deploy your e-commerce application with:
- **Backend** on Render
- **Frontend** on Vercel
- **Admin Panel** on Vercel

## Prerequisites

- GitHub account
- Render account (https://render.com)
- Vercel account (https://vercel.com)
- MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)
- Cloudinary account (https://cloudinary.com)
- Stripe account (https://stripe.com)
- Razorpay account (if using Razorpay)
- Gmail account (for SMTP)

## Part 1: Prepare Your Code

### 1. Initialize Git Repository (if not already done)

```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Create a GitHub Repository

1. Go to GitHub and create a new repository
2. Push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Part 2: Deploy Backend on Render

### 1. Sign up/Login to Render

Go to https://render.com and sign up or log in.

### 2. Create a New Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select your repository

### 3. Configure the Web Service

- **Name**: `your-ecommerce-backend` (or any name)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free` (or paid for production)

### 4. Add Environment Variables

Click "Environment" and add these variables:

**Required:**
```
NODE_VERSION=18
PORT=4000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_random_string_here
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_admin_password

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
CURRENCY=usd
DELIVERY_CHARGE=10
```

**Email Configuration (Gmail):**
```
SMTP_EMAIL=your.email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

**Optional (Razorpay):**
```
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 5. Deploy

Click "Create Web Service". Render will:
- Install dependencies
- Start your server
- Provide a URL like: `https://your-ecommerce-backend.onrender.com`

**Save this URL! You'll need it for frontend configuration.**

## Part 3: Deploy Frontend on Vercel

### 1. Sign up/Login to Vercel

Go to https://vercel.com and sign up or log in.

### 2. Import Your Project

1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. Vercel will detect it's a monorepo

### 3. Configure Frontend Deployment

- **Framework Preset**: `Vite`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. Add Environment Variables

Click "Environment Variables" and add:

```
VITE_BACKEND_URL=https://your-ecommerce-backend.onrender.com
VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
```

### 5. Deploy

Click "Deploy". Vercel will:
- Build your frontend
- Deploy it
- Provide a URL like: `https://your-ecommerce.vercel.app`

## Part 4: Deploy Admin Panel on Vercel

### 1. Create Another Vercel Project

Follow the same steps as frontend, but:

### 2. Configure Admin Deployment

- **Framework Preset**: `Vite`
- **Root Directory**: `admin`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Add Environment Variables

```
VITE_BACKEND_URL=https://your-ecommerce-backend.onrender.com
```

### 4. Deploy

Click "Deploy". You'll get a URL like: `https://your-ecommerce-admin.vercel.app`

## Part 5: Update Backend CORS Configuration

After deploying frontend and admin, update your backend's CORS settings:

1. Go to your backend code
2. In `backend/server.js`, find the CORS configuration
3. Add your frontend and admin URLs to allowed origins
4. Commit and push changes - Render will auto-deploy

## Part 6: Configure External Services

### MongoDB Atlas

1. Create a cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user
3. Whitelist all IPs (0.0.0.0/0) for Render access
4. Get connection string and add to Render environment variables

### Cloudinary

1. Sign up at https://cloudinary.com
2. Get your credentials from dashboard
3. Add to Render environment variables

### Stripe

1. Sign up at https://stripe.com
2. Get API keys from dashboard
3. Add secret key to Render, public key to Vercel

### Gmail SMTP

1. Enable 2-factor authentication on your Gmail
2. Generate an App Password (https://myaccount.google.com/apppasswords)
3. Use the app password in SMTP_PASSWORD

## Part 7: Testing

1. Visit your frontend URL
2. Test user registration and login
3. Test product browsing
4. Test cart functionality
5. Test checkout with Stripe test cards
6. Visit admin URL
7. Test admin login
8. Test product management

## Part 8: Custom Domains (Optional)

### For Vercel (Frontend & Admin):
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### For Render (Backend):
1. Go to Settings → Custom Domain
2. Add your API subdomain (e.g., api.yourdomain.com)
3. Configure DNS records

## Troubleshooting

### Backend Issues

**Problem**: Render shows "Service Unavailable"
- Check Render logs
- Verify environment variables are set
- Ensure MongoDB allows connections from 0.0.0.0/0

**Problem**: Email not sending
- Verify SMTP credentials
- Check Gmail app password is correct
- Ensure 2FA is enabled on Gmail

### Frontend Issues

**Problem**: Cannot connect to backend
- Verify VITE_BACKEND_URL is correct
- Check backend CORS settings
- Inspect browser console for errors

**Problem**: Build fails
- Check Vercel build logs
- Ensure all dependencies are in package.json
- Verify Node version compatibility

### CORS Errors

Add this to backend environment variables:
```
FRONTEND_URL=https://your-ecommerce.vercel.app
ADMIN_URL=https://your-ecommerce-admin.vercel.app
```

And update CORS in server.js to use these URLs.

## Security Checklist

- [ ] Strong JWT_SECRET (minimum 32 characters)
- [ ] Strong ADMIN_PASSWORD
- [ ] MongoDB network access restricted
- [ ] Environment variables never committed to Git
- [ ] CORS configured for specific domains (not *)
- [ ] Rate limiting enabled (add rate limiter middleware)
- [ ] HTTPS enabled (automatic on Render/Vercel)

## Cost Estimates

### Free Tier
- Render: Free (with sleep after inactivity)
- Vercel: Free (2 projects included)
- MongoDB Atlas: Free (512 MB)
- Cloudinary: Free (25 credits/month)

### Production Recommendations
- Render: $7/month (always-on)
- MongoDB Atlas: $9/month (shared cluster)
- Cloudinary: Pay as you go
- Total: ~$16-20/month

## Support

For issues:
1. Check Render/Vercel logs
2. Review this guide
3. Check environment variables
4. Test locally first

---

**Congratulations!** Your e-commerce site is now live! 🎉
