import { createContext, useEffect, useState } from "react"; 
import axios from 'axios';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';



export const ShopContext = createContext(); 

// eslint-disable-next-line react/prop-types
const ShopContextProvider = (props) => { 
    const currency = '$'; 
    const delivery_fee = 10; 
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    console.log(backendUrl)
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [wishlist, setWishlist] = useState([]);
    const [products, setProducts] = useState([])
    const [token, setToken] = useState('')

    // Utility to always remove zero-quantity items from cart state
    const safeSetCartItems = (cartData) => {
        let cleanedCart = {};
        for(const itemId in cartData){
            if(typeof cartData[itemId] === 'number' && cartData[itemId] > 0){
                cleanedCart[itemId] = cartData[itemId];
            }
        }
        setCartItems(cleanedCart);
    }
    const navigate = useNavigate();

    const addToCart = async (itemId) => {
        console.log('addToCart called with itemId:', itemId);
        if (!itemId) {
            toast.error('Product ID is missing');
            return;
        }
        let cartData = structuredClone(cartItems);
        console.log('Current cartItems before:', cartItems);
        
        // Ensure cartData[itemId] is a number, not an object or string
        if(typeof cartData[itemId] === 'number'){
            cartData[itemId] += 1;
        } else {
            cartData[itemId] = 1;
        }
        console.log('New cartData:', cartData);
        safeSetCartItems(cartData);
        console.log('Updated cartItems:', cartData);
        toast.success('Added to cart');
        if(token){
            try{
                await axios.post(backendUrl + '/api/cart/add', {itemId}, {headers:{token}})
            }
            catch(error){
                console.log(error);
                toast.error(error.message)
            }
        }
    }
       
    const getCartCount = () => {
        let totalCount = 0;
        console.log('=== getCartCount called ===');
        console.log('cartItems object:', JSON.stringify(cartItems));
        console.log('cartItems keys:', Object.keys(cartItems));
        
        for(const items in cartItems){
            try{
                const value = cartItems[items];
                console.log('Item:', items, 'Value:', value, 'Type:', typeof value);
                
                // Handle new format: {itemId: quantity}
                if(typeof value === 'number' && value > 0){
                    console.log('Adding quantity:', value);
                    totalCount += value;
                }
                // Handle old format: {itemId: {size: quantity}}
                else if(typeof value === 'object' && value !== null){
                    console.log('Old format object found for item:', items);
                    for(const size in value){
                        if(typeof value[size] === 'number'){
                            console.log('Size', size, 'qty:', value[size]);
                            totalCount += value[size];
                        }
                    }
                } else {
                    console.log('Skipping - wrong type or quantity 0');
                }
            }
            catch(error){
                console.log('Error processing item:', error);
            }
        }
        console.log('=== Final cart count:', totalCount, '===');
        return totalCount;
    }
    const updateQuantity = async (itemId, quantity) => {
        let cartData = structuredClone(cartItems);
        if(quantity <= 0){
            delete cartData[itemId];
            console.log('Item quantity <= 0, deleting from cart:', itemId);
        } else {
            cartData[itemId] = quantity;
        }
        safeSetCartItems(cartData);
        if(token){
            try{
                // Send 0 to backend to remove item, or actual quantity
                const backendQuantity = quantity <= 0 ? 0 : quantity;
                await axios.post(backendUrl + '/api/cart/update', {itemId, quantity: backendQuantity}, {headers: {token}})
            }
            catch(error){
                console.log(error);
                toast.error(error.message)
            }
        }
    }
    const getCartAmount = () => {
        let totalAmount = 0;
        for(const items in cartItems){
            let itemInfo = products.find((product)=> product._id === items);
            try{
                // Skip if product not found
                if(!itemInfo){
                    console.log('Product not found:', items);
                    continue;
                }
                const value = cartItems[items];
                // Handle new format: {itemId: quantity}
                if(typeof value === 'number' && value > 0){
                    totalAmount += itemInfo.price * value;
                }
                // Handle old format: {itemId: {size: quantity}}
                else if(typeof value === 'object' && value !== null){
                    for(const size in value){
                        if(typeof value[size] === 'number' && value[size] > 0){
                            totalAmount += itemInfo.price * value[size];
                        }
                    }
                }
            }
            catch (error){
                console.log(error);
            }
        }
        return totalAmount;
    }

    // Clean up cart: remove items with quantity 0 or that don't exist in products
    const cleanupCart = (productList) => {
        let cartData = structuredClone(cartItems);
        let hasChanges = false;
        let itemsToDelete = [];
        
        for(const itemId in cartData){
            const value = cartData[itemId];
            
            // Remove if quantity is 0 or undefined
            if((typeof value === 'number' && value <= 0)){
                console.log('Cleaning up cart: removing item with quantity 0:', itemId);
                itemsToDelete.push(itemId);
                delete cartData[itemId];
                hasChanges = true;
            }
            // Remove if product doesn't exist in products array
            else if(!productList.find(p => p._id === itemId)){
                console.log('Cleaning up cart: removing item that no longer exists:', itemId);
                itemsToDelete.push(itemId);
                delete cartData[itemId];
                hasChanges = true;
            }
        }
        
        if(hasChanges){
            console.log('Cart cleaned up, new cart:', cartData);
            safeSetCartItems(cartData);
            // Sync deletions to backend
            if(token && itemsToDelete.length > 0){
                itemsToDelete.forEach(itemId => {
                    axios.post(backendUrl + '/api/cart/update', {itemId, quantity: 0}, {headers: {token}})
                        .catch(error => console.log('Error syncing cart cleanup:', error));
                });
            }
        }
    }

    const getProductsData = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/product/list')
            if(response.data.success){
                setProducts(response.data.products);
                // Clean up cart when products load - remove items with quantity 0 or that don't exist
                cleanupCart(response.data.products);
            }
            else{
                toast.error(response.data.message)
            }
        }
        catch (error){
            console.log(error)
            toast.error(error.message)
        }
    }

    const getUserCart = async (token) => {
        try{
            const response = await axios.post(backendUrl + '/api/cart/get', {}, {headers: {token}})
            if(response.data.success){
                // Migrate old cart format (with sizes) to new format (without sizes)
                let cartData = response.data.cartData;
                let migratedCart = {};
                
                for(const itemId in cartData){
                    if(typeof cartData[itemId] === 'object' && cartData[itemId] !== null){
                        // Old format: {itemId: {size: quantity}}
                        // Sum all quantities for this item
                        let totalQty = 0;
                        for(const size in cartData[itemId]){
                            totalQty += cartData[itemId][size];
                        }
                        migratedCart[itemId] = totalQty;
                    } else if(typeof cartData[itemId] === 'number'){
                        // Already new format: {itemId: quantity}
                        migratedCart[itemId] = cartData[itemId];
                    }
                }
                console.log('Migrated cart:', migratedCart);
                
                // Clean up items with 0 quantity and invalid items
                let cleanedCart = {};
                for(const itemId in migratedCart){
                    const qty = migratedCart[itemId];
                    // Only keep items with quantity > 0
                    if(typeof qty === 'number' && qty > 0){
                        cleanedCart[itemId] = qty;
                    }
                }
                console.log('Cleaned cart after removing 0 quantity items:', cleanedCart);
                safeSetCartItems(cleanedCart);
            }
        }
        catch (error){
            console.log(error)
            toast.error(error.message)
        }
    }
    useEffect(()=>{
        getProductsData()
    }, [backendUrl])

    // Clean up cart whenever products change
    useEffect(()=>{
        if(products.length > 0 && Object.keys(cartItems).length > 0){
            cleanupCart(products);
        }
    }, [products])

    // Load token from localStorage on component mount
    useEffect(()=>{
        const savedToken = localStorage.getItem('token');
        if(savedToken && !token){
            setToken(savedToken);
        }
    }, [])

    // Load user cart whenever token changes
    useEffect(()=>{
        if(token){
            getUserCart(token);
        }
    }, [token])
    // Log cart changes
    useEffect(()=>{
        console.log('=== CartItems changed ===');
        console.log('CartItems object:', JSON.stringify(cartItems));
        console.log('CartItems keys:', Object.keys(cartItems));
        console.log('Count:', getCartCount());
    }, [cartItems])

    // Manual debug function
    const debugCart = async () => {
        console.log('=== CART DEBUG INFO ===');
        console.log('Frontend cartItems:', JSON.stringify(cartItems));
        console.log('Frontend cartItems keys:', Object.keys(cartItems));
        console.log('Frontend getCartCount():', getCartCount());
        
        if(token){
            try{
                const response = await axios.post(backendUrl + '/api/cart/get', {}, {headers: {token}});
                console.log('Backend cart data:', JSON.stringify(response.data.cartData));
                console.log('Backend cart keys:', Object.keys(response.data.cartData));
            } catch(e){
                console.log('Error getting backend cart:', e);
            }
        }
    }
    
    // Make it globally accessible for debugging
    if(typeof window !== 'undefined'){
        window.debugCart = debugCart;
    }

    // Wishlist functions
    const addToWishlist = async (productId) => {
        try {
            if (!token) {
                toast.error('Please login to add to wishlist');
                return;
            }
            
            const response = await axios.post(
                backendUrl + '/api/wishlist/add',
                { userId: token, productId },
                { headers: { token } }
            );
            
            if (response.data.success) {
                setWishlist([...wishlist, productId]);
                toast.success('Added to wishlist');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message || 'Error adding to wishlist');
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            if (!token) {
                toast.error('Please login');
                return;
            }
            
            const response = await axios.post(
                backendUrl + '/api/wishlist/remove',
                { userId: token, productId },
                { headers: { token } }
            );
            
            if (response.data.success) {
                setWishlist(wishlist.filter(id => id !== productId));
                toast.success('Removed from wishlist');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message || 'Error removing from wishlist');
        }
    };

    const getWishlist = async () => {
        try {
            if (!token) {
                return;
            }
            
            const response = await axios.post(
                backendUrl + '/api/wishlist/get',
                {},
                { headers: { token } }
            );
            
            if (response.data.success) {
                const wishlistProductIds = response.data.wishlist.map(item => item.productId);
                setWishlist(wishlistProductIds);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.includes(productId);
    };

    // Load wishlist when token changes
    useEffect(() => {
        if (token) {
            getWishlist();
        }
    }, [token]);

    const value = { 
        products, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, setCartItems, addToCart, 
        getCartCount, updateQuantity, getCartAmount,
        navigate, backendUrl, token, setToken,
        setProducts, wishlist, addToWishlist, removeFromWishlist, 
        isInWishlist, getWishlist
    } 
    return ( 
        <ShopContext.Provider value={value}> 
            {props.children}
        </ShopContext.Provider> 
    ) 
} 
export default ShopContextProvider;