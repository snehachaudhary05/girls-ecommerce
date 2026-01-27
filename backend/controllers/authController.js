import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";

// Configure Nodemailer transporter with explicit host/port and sane timeouts
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: (process.env.EMAIL_PORT || "587") === "465",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
  connectionTimeout: 20000, // fail fast if SMTP is unreachable
  socketTimeout: 20000,
});

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash OTP (simple implementation)
const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

// Request OTP endpoint
export const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({
        success: false,
        message: "Email is required",
      });
    }

    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Update or create user with OTP
    const user = await userModel.findOneAndUpdate(
      { email },
      { otp: hashedOTP, otpExpiry },
      { upsert: true, new: true }
    );

    // Send OTP via email with timeout wrapper
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "Your OTP for Forever Store Login",
      html: `<p>Your OTP is: <strong>${otp}</strong></p><p>This OTP will expire in 10 minutes.</p>`,
    };

    // Wrap in Promise.race to enforce hard 15s timeout
    const sendWithTimeout = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Email sending timed out after 15 seconds'));
      }, 15000);
      
      transporter.sendMail(mailOptions)
        .then(info => {
          clearTimeout(timeout);
          resolve(info);
        })
        .catch(err => {
          clearTimeout(timeout);
          reject(err);
        });
    });

    await sendWithTimeout;

    res.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Verify OTP endpoint
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Check OTP expiry
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });
    }

    // Verify OTP
    const hashedInputOTP = hashOTP(otp);
    if (user.otp !== hashedInputOTP) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name || "",
        address: user.address || "",
      },
    });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
