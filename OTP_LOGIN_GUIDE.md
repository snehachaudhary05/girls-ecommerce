# OTP-Based Login Implementation Guide

## What Has Been Implemented

### Backend Setup (Already Complete)
- ✅ OTP generation and hashing
- ✅ Email sending via nodemailer (Gmail SMTP)
- ✅ OTP verification with expiry (10 minutes)
- ✅ JWT token generation after successful OTP verification
- ✅ Routes: `/api/auth/request-otp` and `/api/auth/verify-otp`

### Frontend Login Page (Updated)
- ✅ Two login methods: **OTP Login** and **Password Login**
- ✅ Sign Up functionality (unchanged)
- ✅ Toggle between login methods with one click

---

## How to Use OTP Login

### For End Users (Customers):

1. **Click "Login with OTP"** on the login page
2. **Enter your email address** where you want to receive the OTP
3. **Click "Send OTP"** - An OTP will be sent to your email
4. **Enter the 6-digit OTP** from your email
5. **Click "Verify OTP & Login"** - You'll be logged in automatically
6. **Option to resend OTP** if needed (10-minute expiry)

### Alternative: Password Login
- Users can still use traditional email + password login
- Click "Login with password" to switch modes

---

## Backend Configuration Required

Your `.env` file already has:
```
SMTP_EMAIL=komalgambler@gmail.com
SMTP_PASSWORD=pihl kewx mrjz sxsr
```

**Important:** Make sure your `SMTP_PASSWORD` is an **App-Specific Password** from Google:
1. Enable 2-Factor Authentication on Gmail
2. Go to myaccount.google.com → Security → App passwords
3. Generate an app password for "Mail" on "Windows Computer"
4. Use this 16-character password in `.env`

---

## Database Schema

The `userModel` already includes:
- `email` - User's email (unique)
- `otp` - Hashed OTP
- `otpExpiry` - OTP expiration timestamp
- `cartData` - Shopping cart
- Other user profile fields

---

## API Endpoints

### 1. Request OTP
**POST** `/api/auth/request-otp`
```json
{
  "email": "user@gmail.com"
}
```

Response:
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

### 2. Verify OTP
**POST** `/api/auth/verify-otp`
```json
{
  "email": "user@gmail.com",
  "otp": "123456"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@gmail.com",
    "name": "John Doe",
    "address": ""
  }
}
```

---

## Features

✅ **No Password Required** - Only email + OTP needed
✅ **Secure OTP Hashing** - OTP is hashed before storage
✅ **Time-Limited OTP** - Expires after 10 minutes
✅ **Automatic User Creation** - New users are created automatically on first OTP verification
✅ **Resend OTP** - Users can request a new OTP
✅ **Error Handling** - Clear error messages for invalid/expired OTP
✅ **Loading States** - UI shows loading during API calls
✅ **Toast Notifications** - Success/error messages displayed to user

---

## Testing the Feature

1. Start backend: `npm start` (from backend folder)
2. Start frontend: `npm run dev` (from frontend folder)
3. Go to http://localhost:5173/login
4. Click "Login with OTP"
5. Enter an email address
6. Click "Send OTP"
7. Check email for the OTP
8. Enter OTP and click "Verify OTP & Login"
9. You should be logged in!

---

## Security Considerations

- OTP is hashed using SHA-256 before storage
- OTP expires after 10 minutes
- Each new OTP request generates a new hash
- Sensitive data not logged
- HTTPS recommended for production

---

## Notes

- Password login still works as before
- Users can switch between OTP and password login methods
- No password is stored when using OTP login
- OTP is sent to Gmail using App Password (not main Gmail password)
