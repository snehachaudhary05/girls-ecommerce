## Environment Variables Checklist

Copy this checklist when setting up your deployment.

### Backend (Render)

#### Essential
- [ ] `NODE_VERSION=18`
- [ ] `PORT=4000`
- [ ] `NODE_ENV=production`
- [ ] `MONGODB_URI=mongodb+srv://...`
- [ ] `JWT_SECRET=` (min 32 characters)

#### Admin Access
- [ ] `ADMIN_EMAIL=`
- [ ] `ADMIN_PASSWORD=`

#### Cloudinary
- [ ] `CLOUDINARY_CLOUD_NAME=`
- [ ] `CLOUDINARY_API_KEY=`
- [ ] `CLOUDINARY_API_SECRET=`

#### Payment (Stripe)
- [ ] `STRIPE_SECRET_KEY=sk_...`
- [ ] `CURRENCY=usd`
- [ ] `DELIVERY_CHARGE=10`

#### Payment (Razorpay) - Optional
- [ ] `RAZORPAY_KEY_ID=`
- [ ] `RAZORPAY_KEY_SECRET=`

#### Email (SMTP)
- [ ] `SMTP_EMAIL=`
- [ ] `SMTP_PASSWORD=` (Gmail App Password)
- [ ] `EMAIL_HOST=smtp.gmail.com`
- [ ] `EMAIL_PORT=587`

#### CORS
- [ ] `FRONTEND_URL=https://...`
- [ ] `ADMIN_URL=https://...`

---

### Frontend (Vercel)

- [ ] `VITE_BACKEND_URL=https://your-backend.onrender.com`
- [ ] `VITE_STRIPE_PUBLIC_KEY=pk_test_...`

---

### Admin (Vercel)

- [ ] `VITE_BACKEND_URL=https://your-backend.onrender.com`

---

## How to Get Credentials

### MongoDB Atlas
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Database Access → Add User
4. Network Access → Add IP Address → Allow from Anywhere (0.0.0.0/0)
5. Connect → Connect your application → Copy connection string
6. Replace `<password>` with your database user password

### Cloudinary
1. Go to https://cloudinary.com
2. Sign up for free
3. Dashboard → Account Details
4. Copy Cloud Name, API Key, API Secret

### Stripe
1. Go to https://stripe.com
2. Sign up
3. Dashboard → Developers → API Keys
4. Copy Publishable Key (pk_test_...) and Secret Key (sk_test_...)
5. For production, use live keys (pk_live_... and sk_live_...)

### Gmail App Password
1. Enable 2-Factor Authentication on Gmail
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and your device
4. Copy the 16-character password
5. Use this as `SMTP_PASSWORD`

### JWT Secret
Generate a random string:
```bash
# In terminal:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Or use an online generator: https://randomkeygen.com/
