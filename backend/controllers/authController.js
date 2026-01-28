import userModel from "../models/userModel.js";
import otpModel from "../models/otpModel.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/emailService.js";
import crypto from "crypto";

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

    console.log(`[OTP Request] Email: ${email}`);

    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    console.log(`[OTP Request] Generated OTP: ${otp}, Hash: ${hashedOTP}`);

    // Store OTP in separate OTP collection - NOT in user collection
    // This prevents auto-creating user accounts
    const otpRecord = await otpModel.findOneAndUpdate(
      { email },
      { otp: hashedOTP, otpExpiry },
      { upsert: true, new: true }
    );

    console.log(`[OTP Request] OTP record saved:`, otpRecord);

    // Send OTP via email
    console.log(`[OTP Request] Sending email to ${email}`);
    const emailResult = await sendEmail(email, 'otpEmail', otp);
    
    console.log(`[OTP Request] Email result:`, emailResult);
    
    // Check if email was actually sent
    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.error);
      return res.json({
        success: false,
        message: "Failed to send OTP. Please try again.",
      });
    }

    res.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error(`[OTP Request Error]`, error);
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

    console.log(`[OTP Verify] Email: ${email}, OTP: ${otp}`);

    // Check OTP in OTP collection
    const otpRecord = await otpModel.findOne({ email });

    console.log(`[OTP Verify] OTP Record found:`, otpRecord);

    if (!otpRecord) {
      return res.json({
        success: false,
        message: "OTP not found. Please request a new one.",
      });
    }

    // Check OTP expiry
    if (otpRecord.otpExpiry < new Date()) {
      console.log(`[OTP Verify] OTP expired. Expiry: ${otpRecord.otpExpiry}, Now: ${new Date()}`);
      return res.json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });
    }

    // Verify OTP
    const hashedInputOTP = hashOTP(otp);
    console.log(`[OTP Verify] Hashed input OTP: ${hashedInputOTP}, Stored: ${otpRecord.otp}`);
    
    if (otpRecord.otp !== hashedInputOTP) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Delete OTP record after successful verification
    await otpModel.deleteOne({ email });
    console.log(`[OTP Verify] OTP record deleted`);

    // Now find or create the user
    let user = await userModel.findOne({ email });

    if (!user) {
      console.log(`[OTP Verify] Creating new user for email: ${email}`);
      // Create new user account only after OTP verification
      user = await userModel.create({
        email,
        name: "",
        cartData: {},
        wishlist: []
      });
    } else {
      console.log(`[OTP Verify] User already exists: ${email}`);
    }

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
    console.error(`[OTP Verify Error]`, error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
