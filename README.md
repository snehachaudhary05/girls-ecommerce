# 🛍️ E-Commerce Platform

A full-stack e-commerce platform built with MERN stack (MongoDB, Express, React, Node.js) featuring a customer-facing storefront and admin panel.

## 🌟 Features

### Customer Features
- 🔐 User authentication (Email/Password & OTP Login)
- 🛒 Shopping cart management
- ❤️ Wishlist functionality
- 📦 Order placement and tracking
- 💳 Multiple payment options (Stripe, Razorpay, COD)
- 🔍 Product search and filtering
- 📧 Email notifications (OTP, Order confirmation)
- 👤 User profile management

### Admin Features
- 📊 Product management (Add, Edit, Delete)
- 📦 Order management and status updates
- 🖼️ Image upload to Cloudinary
- 📈 Dashboard overview

### Technical Features
- 🔒 JWT authentication
- 🌐 RESTful API
- 📱 Responsive design with Tailwind CSS
- ☁️ Cloud image storage (Cloudinary)
- 📧 Email service (Nodemailer)
- 🔄 Real-time updates
- 🚀 Optimized performance

## 📁 Project Structure

```
ecommerce/
├── backend/          # Node.js/Express API
├── frontend/         # React customer app
├── admin/           # React admin panel
├── DEPLOYMENT_GUIDE.md
├── QUICK_DEPLOY.md
└── ENV_VARIABLES.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB
- Cloudinary account
- Stripe account
- Gmail account (for SMTP)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ecommerce
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with backend URL
   npm run dev
   ```

4. **Admin Panel Setup**
   ```bash
   cd admin
   npm install
   cp .env.example .env
   # Edit .env with backend URL
   npm run dev
   ```

### Access the Applications

- **Frontend:** http://localhost:5173
- **Admin:** http://localhost:5174
- **Backend API:** http://localhost:4000

## 🌐 Deployment

We provide comprehensive deployment guides:

- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Quick start guide
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Detailed deployment instructions
- **[DEPLOYMENT_OPTIONS.md](./DEPLOYMENT_OPTIONS.md)** - Alternative hosting options
- **[ENV_VARIABLES.md](./ENV_VARIABLES.md)** - Environment variables checklist

### Recommended Hosting

- **Backend:** Render.com
- **Frontend:** Vercel
- **Admin:** Vercel
- **Database:** MongoDB Atlas
- **Images:** Cloudinary

## 🔧 Environment Variables

### Backend (.env)
```env
MONGODB_URI=
JWT_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
STRIPE_SECRET_KEY=
SMTP_EMAIL=
SMTP_PASSWORD=
```

See [ENV_VARIABLES.md](./ENV_VARIABLES.md) for complete list and setup instructions.

### Frontend (.env)
```env
VITE_BACKEND_URL=
VITE_STRIPE_PUBLIC_KEY=
```

### Admin (.env)
```env
VITE_BACKEND_URL=
```

## 📚 API Documentation

### Endpoints

**Authentication**
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login

**User**
- `POST /api/user/register` - Register new user
- `POST /api/user/login` - User login
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile

**Products**
- `GET /api/product/list` - Get all products
- `GET /api/product/:id` - Get single product
- `POST /api/product/add` - Add product (Admin)
- `PUT /api/product/:id` - Update product (Admin)
- `DELETE /api/product/:id` - Delete product (Admin)

**Cart**
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove` - Remove from cart

**Orders**
- `POST /api/order/place` - Place order
- `GET /api/order/user` - Get user orders
- `GET /api/order/list` - Get all orders (Admin)
- `PUT /api/order/status` - Update order status (Admin)

**Wishlist**
- `GET /api/wishlist` - Get wishlist
- `POST /api/wishlist/add` - Add to wishlist
- `DELETE /api/wishlist/remove` - Remove from wishlist

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads
- Cloudinary for image storage
- Nodemailer for emails
- Stripe & Razorpay for payments

### Frontend & Admin
- React 18
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- React Toastify

## 📱 Features Breakdown

### Payment Integration
- **Stripe:** Credit/Debit card payments
- **Razorpay:** UPI, Cards, Net Banking
- **Cash on Delivery:** Traditional payment option

### Email Service
- OTP verification
- Order confirmation
- Password reset (if implemented)
- Custom email templates

### Image Management
- Cloudinary integration
- Multiple image upload
- Image optimization
- Secure URLs

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Environment variables for sensitive data
- CORS configuration
- Helmet.js for security headers
- Input validation
- XSS protection

## 🧪 Testing

```bash
# Backend tests (if implemented)
cd backend
npm test

# Frontend tests (if implemented)
cd frontend
npm test
```

## 📄 Scripts

### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run migrate:product-images  # Migrate images to Cloudinary
```

### Frontend/Admin
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👤 Author

Your Name - Your Email

## 🙏 Acknowledgments

- MongoDB for database
- Cloudinary for image hosting
- Stripe & Razorpay for payment processing
- Render & Vercel for hosting

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Email: your.email@example.com

## 🗺️ Roadmap

- [ ] Product reviews and ratings
- [ ] Advanced search filters
- [ ] Inventory management
- [ ] Sales analytics dashboard
- [ ] Multiple currencies support
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Social media login
- [ ] Advanced SEO optimization
- [ ] Newsletter integration

---

**Built with ❤️ using MERN Stack**
