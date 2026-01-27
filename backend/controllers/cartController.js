import userModel from "../models/userModel.js";

// Helper function to clean and validate cart data
const validateAndCleanCart = (cartData) => {
    let cleanedCart = {};
    for(const itemId in cartData){
        const value = cartData[itemId];
        // Skip if not a valid item ID format
        if(!itemId || typeof itemId !== 'string' || itemId.length === 0){
            continue;
        }
        let quantity = 0;
        // Handle number format (correct format)
        if(typeof value === 'number'){
            quantity = value;
        }
        // Handle object format (old size-based format) - sum quantities, skip if all keys are empty or all values are zero
        else if(typeof value === 'object' && value !== null && !Array.isArray(value)){
            let hasValid = false;
            for(const key in value){
                if(key && typeof value[key] === 'number' && value[key] > 0){
                    quantity += value[key];
                    hasValid = true;
                }
            }
            if(!hasValid) continue;
        }
        // Handle string format (corrupted) - try to extract number
        else if(typeof value === 'string'){
            const extracted = parseInt(value.replace(/[^0-9]/g, ''), 10);
            if(!isNaN(extracted) && extracted > 0){
                quantity = extracted;
            }
        }
        // Only add if quantity is positive and itemId is valid
        if(quantity > 0 && itemId && typeof itemId === 'string' && itemId.length > 0){
            cleanedCart[itemId] = quantity;
        }
    }
    return cleanedCart;
}

// add products to user cart
const addToCart = async (req, res) => {
    try{
        const { userId, itemId } = req.body;
        const userData = await userModel.findById(userId);
        let cartData = userData.cartData || {};
        
        // Clean cart before modifying
        cartData = validateAndCleanCart(cartData);
        
        if(cartData[itemId]){
            cartData[itemId] += 1;
        }
        else{
            cartData[itemId] = 1;
        }
        await userModel.findByIdAndUpdate(userId, {cartData})
        res.json({success: true, message: "Product added to cart successfully"});
    }
    catch(error){
        console.log(error)
        res.json({success: false, message: error.message});
    }
}


// update user cart
const updateCart = async (req, res) => {
    try{
        const { userId, itemId, quantity } = req.body
        const userData = await userModel.findById(userId);
        let cartData = userData.cartData || {};

        if(quantity <= 0){
            // Remove item if quantity is 0 or less
            delete cartData[itemId];
            console.log('Item removed from cart:', itemId);
        } else {
            cartData[itemId] = quantity;
        }
        await userModel.findByIdAndUpdate(userId, {cartData})
        res.json({success: true, message: "Cart updated successfully"});
    }
    catch(error){
        console.log(error)
        res.json({success: false, message: error.message});
    }
}

// get user cart
const getUserCart = async (req, res) => {
    try{
        const { userId } = req.body;
        console.log('=== getUserCart endpoint called ===');
        console.log('userId from req.body:', userId);
        console.log('req.body:', req.body);
        
        if(!userId){
            console.log('ERROR: No userId provided');
            return res.json({success: false, message: 'User ID not found'});
        }
        
        const userData = await userModel.findById(userId);
        if(!userData){
            console.log('ERROR: User not found for userId:', userId);
            return res.json({success: false, message: 'User not found'});
        }
        
        let cartData = userData.cartData || {};
        console.log('Cart data from DB:', JSON.stringify(cartData));
        console.log('Cart keys:', Object.keys(cartData));
        // Clean and validate cart before sending to frontend
        cartData = validateAndCleanCart(cartData);
        res.json({success: true, cartData});
    }
    catch(error){
        console.log('ERROR in getUserCart:', error)
        res.json({success: false, message: error.message})
    }
}

// clear user cart
const clearCart = async (req, res) => {
    try{
        const { userId } = req.body;
        await userModel.findByIdAndUpdate(userId, { cartData: {} });
        console.log('Cart cleared for userId:', userId);
        res.json({success: true, message: "Cart cleared successfully"});
    }
    catch(error){
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

export { addToCart, updateCart, getUserCart, clearCart }