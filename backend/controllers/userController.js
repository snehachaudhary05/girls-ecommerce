import userModel from "../models/userModel.js";
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}
// Route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success:false, message: "User doesn't exists"})
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success:false, message: "Invalid password" });
        }
        else{
            const token = createToken(user._id);
            res.json({ success: true, token: token });
        }
        
    }
    catch (err) {
        console.error(err);
        res.json({ success: false, message: error.message });
    }
}

// Route for user register
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const exists = await userModel.findOne({email});
        if (exists) {
            return res.json({ success:false, message: "User already exists" });
        }
        if(!validator.isEmail(email)){
            return res.json({ success:false, message: "Please enter a valid email" });
        }
        if(password.length < 8){
            return res.json({ success:false, message: "Please enter a strong password"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        });
        const user = await newUser.save();
        const token = createToken(user._id)
        res.json({ success: true, token });

    }
    catch (error){
        console.log(error);
        res.json({success: false, message: error.message})
    }
}

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const userId = req.body.userId; // From auth middleware

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                wishlist: user.wishlist || []
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Route for updating user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.body.userId; // From auth middleware
        const { name, phone, address } = req.body;

        if (!userId) {
            return res.json({ success: false, message: "User not authenticated" });
        }

        const user = await userModel.findByIdAndUpdate(
            userId,
            { name, phone, address },
            { new: true }
        );

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                wishlist: user.wishlist || []
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Toggle wishlist
const toggleWishlist = async (req, res) => {
    try {
        const userId = req.body.userId;
        const { productId } = req.body;

        if (!userId) {
            return res.json({ success: false, message: "User not authenticated" });
        }

        if (!productId) {
            return res.json({ success: false, message: "Product ID is required" });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const wishlist = user.wishlist || [];
        const isInWishlist = wishlist.includes(productId);

        let message = "";
        if (isInWishlist) {
            user.wishlist = wishlist.filter(id => id !== productId);
            message = "Removed from wishlist";
        } else {
            user.wishlist = [...wishlist, productId];
            message = "Added to wishlist";
        }

        await user.save();

        res.json({
            success: true,
            message,
            wishlist: user.wishlist
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email + password, process.env.JWT_SECRET);
            res.json({ success: true, token });
        }
        else {
            res.json({ success: false, message: "Invalid email or password" });
        }
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { loginUser, registerUser, adminLogin, updateProfile, getUserProfile, toggleWishlist };