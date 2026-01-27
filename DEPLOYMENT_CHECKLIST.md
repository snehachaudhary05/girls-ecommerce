# 🚀 Pre-Deployment Checklist

Complete this checklist before deploying to production.

## 📋 Code Preparation

- [ ] All features tested locally
- [ ] No console.log statements in production code
- [ ] All TODO comments resolved or documented
- [ ] Error handling implemented
- [ ] Loading states added for async operations

## 🔐 Security

- [ ] Environment variables never committed to git
- [ ] Strong JWT_SECRET generated (min 32 characters)
- [ ] Strong ADMIN_PASSWORD set
- [ ] CORS configured for production URLs
- [ ] Rate limiting implemented (optional but recommended)
- [ ] Input validation on all forms
- [ ] SQL/NoSQL injection prevention
- [ ] XSS protection enabled

## 📝 Configuration Files

- [ ] `.gitignore` includes `.env`, `node_modules`, `dist`
- [ ] `.env.example` files created for all projects
- [ ] `vercel.json` configured for frontend
- [ ] `vercel.json` configured for admin
- [ ] `render.yaml` configured for backend
- [ ] `netlify.toml` as alternative (optional)

## 🗄️ Database

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with strong password
- [ ] Network access allows all IPs (0.0.0.0/0) for Render
- [ ] Connection string tested
- [ ] Indexes created for performance (optional)
- [ ] Database backup strategy planned

## ☁️ External Services

### Cloudinary
- [ ] Account created
- [ ] Cloud name, API key, API secret obtained
- [ ] Upload presets configured (if needed)
- [ ] Storage limits checked

### Stripe
- [ ] Account created and verified
- [ ] Test keys obtained
- [ ] Live keys obtained (for production)
- [ ] Webhook endpoints configured (if using webhooks)
- [ ] Payment methods enabled

### Razorpay (if using)
- [ ] Account created
- [ ] Key ID and Secret obtained
- [ ] Payment methods configured

### Email (Gmail SMTP)
- [ ] 2FA enabled on Gmail account
- [ ] App password generated
- [ ] Test email sent successfully
- [ ] Email templates reviewed

## 🌐 Git & GitHub

- [ ] Repository created on GitHub
- [ ] `.env` files NOT in repository
- [ ] All code committed and pushed
- [ ] README.md updated with project info
- [ ] Repository is public or accessible to deployment services

## 🖥️ Backend Deployment (Render)

- [ ] Render account created
- [ ] Web service created from GitHub repo
- [ ] Root directory set to `backend`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] All environment variables added:
  - [ ] `NODE_VERSION`
  - [ ] `PORT`
  - [ ] `MONGODB_URI`
  - [ ] `JWT_SECRET`
  - [ ] `ADMIN_EMAIL`
  - [ ] `ADMIN_PASSWORD`
  - [ ] `CLOUDINARY_*` (3 variables)
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `CURRENCY`
  - [ ] `DELIVERY_CHARGE`
  - [ ] `SMTP_EMAIL`
  - [ ] `SMTP_PASSWORD`
  - [ ] `EMAIL_HOST`
  - [ ] `EMAIL_PORT`
  - [ ] `FRONTEND_URL` (add after frontend deployed)
  - [ ] `ADMIN_URL` (add after admin deployed)
- [ ] Service deployed successfully
- [ ] Backend URL saved

## 🎨 Frontend Deployment (Vercel)

- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Framework preset: `Vite`
- [ ] Root directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variables added:
  - [ ] `VITE_BACKEND_URL`
  - [ ] `VITE_STRIPE_PUBLIC_KEY`
- [ ] Deployment successful
- [ ] Frontend URL saved
- [ ] Site loads correctly

## 🔧 Admin Deployment (Vercel)

- [ ] New Vercel project created
- [ ] Same GitHub repo imported
- [ ] Framework preset: `Vite`
- [ ] Root directory: `admin`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variables added:
  - [ ] `VITE_BACKEND_URL`
- [ ] Deployment successful
- [ ] Admin URL saved
- [ ] Admin panel loads correctly

## 🔄 Post-Deployment Configuration

- [ ] Backend CORS updated with frontend URL
- [ ] Backend CORS updated with admin URL
- [ ] Backend environment variables `FRONTEND_URL` and `ADMIN_URL` added
- [ ] Backend redeployed with new CORS settings

## ✅ Testing

### Backend API
- [ ] GET /api/product/list works
- [ ] POST /api/user/register works
- [ ] POST /api/user/login works
- [ ] POST /api/auth/send-otp works
- [ ] Protected routes require authentication
- [ ] Admin routes require admin authentication

### Frontend
- [ ] Home page loads
- [ ] Product list displays
- [ ] User can register
- [ ] User can login (email/password)
- [ ] User can login (OTP)
- [ ] Add to cart works
- [ ] Wishlist works
- [ ] Checkout process works
- [ ] Stripe payment works (use test card: 4242 4242 4242 4242)
- [ ] Order confirmation email received
- [ ] User can view order history

### Admin Panel
- [ ] Admin can login
- [ ] Products list loads
- [ ] Add product works
- [ ] Edit product works
- [ ] Delete product works
- [ ] Orders list loads
- [ ] Order status update works
- [ ] Image upload to Cloudinary works

## 📱 Cross-Browser Testing

- [ ] Chrome
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Edge
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## 🎯 Performance

- [ ] Frontend build size checked
- [ ] Images optimized
- [ ] Lazy loading implemented (if needed)
- [ ] API response times acceptable
- [ ] No memory leaks

## 📊 Monitoring & Analytics

- [ ] Error tracking setup (Sentry, LogRocket, etc.) - optional
- [ ] Analytics setup (Google Analytics, etc.) - optional
- [ ] Uptime monitoring (UptimeRobot, etc.) - optional

## 📚 Documentation

- [ ] README.md complete
- [ ] API documentation available
- [ ] Deployment guides up to date
- [ ] Environment variables documented
- [ ] Known issues documented

## 🎉 Launch

- [ ] Soft launch to test users
- [ ] Monitor for errors
- [ ] Collect feedback
- [ ] Fix critical issues
- [ ] Public launch

## 🔧 Maintenance Plan

- [ ] Backup strategy in place
- [ ] Update schedule planned
- [ ] Support channel established
- [ ] Monitoring in place

---

## ⚠️ Common Issues & Solutions

### Issue: Render backend is slow/sleeping
**Solution:** Upgrade to paid tier ($7/month) for always-on service

### Issue: CORS errors
**Solution:** Ensure FRONTEND_URL and ADMIN_URL are set in backend environment variables

### Issue: Images not uploading
**Solution:** Check Cloudinary credentials and quota

### Issue: Emails not sending
**Solution:** Verify Gmail app password and 2FA enabled

### Issue: Payment failing
**Solution:** Check Stripe keys (test vs live) and webhook configuration

---

## 📞 Support Resources

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas:** https://docs.atlas.mongodb.com
- **Stripe Docs:** https://stripe.com/docs
- **Cloudinary Docs:** https://cloudinary.com/documentation

---

**Good luck with your deployment! 🚀**
