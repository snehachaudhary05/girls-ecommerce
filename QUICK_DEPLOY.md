## Quick Start Deployment

Follow these steps to deploy your e-commerce project:

### 1️⃣ Prepare Your Repository

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for deployment"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2️⃣ Deploy Backend (Render)

1. Go to https://render.com
2. Click **New +** → **Web Service**
3. Connect GitHub and select your repo
4. **Configure:**
   - Name: `ecommerce-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   
5. **Add Environment Variables** (see DEPLOYMENT_GUIDE.md for full list):
   - MONGODB_URI
   - JWT_SECRET
   - ADMIN_EMAIL
   - ADMIN_PASSWORD
   - CLOUDINARY credentials
   - STRIPE_SECRET_KEY
   - SMTP credentials

6. Click **Create Web Service**
7. **Copy the URL** (e.g., `https://your-app.onrender.com`)

### 3️⃣ Deploy Frontend (Vercel)

1. Go to https://vercel.com
2. Click **Add New** → **Project**
3. Import your GitHub repo
4. **Configure:**
   - Root Directory: `frontend`
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **Add Environment Variables:**
   ```
   VITE_BACKEND_URL=https://your-backend.onrender.com
   VITE_STRIPE_PUBLIC_KEY=pk_test_...
   ```

6. Click **Deploy**

### 4️⃣ Deploy Admin (Vercel)

1. Click **Add New** → **Project** again
2. Import same GitHub repo
3. **Configure:**
   - Root Directory: `admin`
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variables:**
   ```
   VITE_BACKEND_URL=https://your-backend.onrender.com
   ```

5. Click **Deploy**

### 5️⃣ Update Backend CORS

After getting your frontend and admin URLs:

1. In Render, go to your backend service
2. Add these environment variables:
   ```
   FRONTEND_URL=https://your-frontend.vercel.app
   ADMIN_URL=https://your-admin.vercel.app
   ```
3. Service will redeploy automatically

### 6️⃣ Test Your Deployment

- Visit your frontend URL
- Test registration/login
- Visit your admin URL
- Test admin login and product management

## Need Help?

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions and troubleshooting.

## Important Notes

- Free tier on Render sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds to wake up
- Consider upgrading to paid tier ($7/month) for production
- Always use HTTPS URLs in production
