import express from "express";
import { requestOtp, verifyOtp } from "../controllers/authController.js";

const authRouter = express.Router();

// Route to request OTP
authRouter.post("/request-otp", requestOtp);

// Route to verify OTP and get token
authRouter.post("/verify-otp", verifyOtp);

export default authRouter;
