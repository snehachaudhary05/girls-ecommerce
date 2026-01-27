import { useContext, useState } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const loadExternalScript = (src) => {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') return resolve(true);

    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) return resolve(true);

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
};

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);
  const [method, setMethod] = useState('cod');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: ''
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      // Validate all required fields
      if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || 
          !formData.street.trim() || !formData.city.trim() || !formData.state.trim() || 
          !formData.zipcode.trim() || !formData.country.trim() || !formData.phone.trim()) {
        toast.error('Please fill in all delivery information fields');
        return;
      }

      let orderItems = [];

      Object.keys(cartItems).forEach((itemId) => {
        if (cartItems[itemId] > 0) {
          const itemInfo = structuredClone(products.find(product => product._id === itemId));
          if (itemInfo) {
            itemInfo.quantity = cartItems[itemId];
            orderItems.push(itemInfo);
          }
        }
      });
      
      // Check if cart is empty
      if (orderItems.length === 0) {
        toast.error('Please add items to cart');
        return;
      }
      
      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee
      };

      switch (method) {
        case 'cod': {
          const response = await axios.post(`${backendUrl}/api/order/place`, orderData, { headers: { token } });
          if (response.data.success) {
            setCartItems({});
            setShowSuccessModal(true);
            setTimeout(() => {
              setShowSuccessModal(false);
              navigate('/orders');
            }, 3000);
          } else {
            toast.error(response.data.message);
          }
          break;
        }
        
        case 'stripe': {
          const response = await axios.post(`${backendUrl}/api/order/stripe`, orderData, { headers: { token } });
          if (response.data.success) {
            console.log('Stripe response:', response.data);
            if (response.data.session_id) {
              if (!window.Stripe) {
                await loadExternalScript('https://js.stripe.com/v3/');
              }
              // Use Stripe's redirect to checkout
              const stripe = window.Stripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
              stripe.redirectToCheckout({
                sessionId: response.data.session_id
              }).then((result) => {
                if (result.error) {
                  toast.error(result.error.message);
                }
              });
            } else {
              toast.error('Failed to create Stripe session');
            }
          } else {
            toast.error(response.data.message);
          }
          break;
        }
        
        case 'razorpay': {
          const response = await axios.post(`${backendUrl}/api/order/razorpay`, orderData, { headers: { token } });
          if (response.data.success) {
            if (!window.Razorpay) {
              await loadExternalScript('https://checkout.razorpay.com/v1/checkout.js');
            }
            const options = {
              key: response.data.key,
              amount: response.data.order.amount,
              currency: response.data.order.currency,
              name: 'Ecommerce',
              description: 'Order Payment',
              order_id: response.data.order.id,
              receipt: response.data.order.receipt,
              handler: async (paymentResult) => {
                try {
                  const verifyResponse = await axios.post(`${backendUrl}/api/order/place`, {
                    ...orderData,
                    payment: true,
                    paymentMethod: 'razorpay',
                    paymentInfo: {
                      razorpay_order_id: paymentResult.razorpay_order_id,
                      razorpay_payment_id: paymentResult.razorpay_payment_id,
                      razorpay_signature: paymentResult.razorpay_signature
                    }
                  }, { headers: { token } });
                  
                  if (verifyResponse.data.success) {
                    setCartItems({});
                    setShowSuccessModal(true);
                    setTimeout(() => {
                      setShowSuccessModal(false);
                      navigate('/orders');
                    }, 3000);
                  } else {
                    toast.error(verifyResponse.data.message);
                  }
                } catch (error) {
                  console.error(error);
                  toast.error(error.message);
                }
              }
            };
            const razorpay = new window.Razorpay(options);
            razorpay.open();
          } else {
            toast.error(response.data.message);
          }
          break;
        }
        
        default:
          break;
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  return (
    <>
      {showSuccessModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-8 text-center shadow-2xl'>
            <div className='mb-4'>
              <svg className='w-16 h-16 text-green-500 mx-auto' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
              </svg>
            </div>
            <h2 className='text-2xl font-bold text-gray-800 mb-2'>Order Successfully Placed!</h2>
            <p className='text-gray-600'>Thank you for your order. You will be redirected to your orders page shortly.</p>
          </div>
        </div>
      )}
      <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t border-pink-200'>
      <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
        <div className='text-xl sm:text-2xl my-3'>
          <Title text1={'DELIVERY'} text2={'INFORMATION'} />
        </div>
        <div className='flex gap-3'>
          <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className='border-2 border-pink-200 focus:border-pink-600 focus:ring-2 focus:ring-pink-100 rounded py-1.5 px-3.5 w-full focus:outline-none' type="text" placeholder='First name' />
          <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className='border-2 border-pink-200 focus:border-pink-600 focus:ring-2 focus:ring-pink-100 rounded py-1.5 px-3.5 w-full focus:outline-none' type="text" placeholder='Last name' />
        </div>
        <input required onChange={onChangeHandler} name='email' value={formData.email} className='border-2 border-pink-200 focus:border-pink-600 focus:ring-2 focus:ring-pink-100 rounded py-1.5 px-3.5 w-full focus:outline-none' type="email" placeholder='Email address' />
        <input required onChange={onChangeHandler} name='street' value={formData.street} className='border-2 border-pink-200 focus:border-pink-600 focus:ring-2 focus:ring-pink-100 rounded py-1.5 px-3.5 w-full focus:outline-none' type="text" placeholder='Street' />
        <div className='flex gap-3'>
          <input required onChange={onChangeHandler} name='city' value={formData.city} className='border-2 border-pink-200 focus:border-pink-600 focus:ring-2 focus:ring-pink-100 rounded py-1.5 px-3.5 w-full focus:outline-none' type="text" placeholder='City' />
          <input required onChange={onChangeHandler} name='state' value={formData.state} className='border-2 border-pink-200 focus:border-pink-600 focus:ring-2 focus:ring-pink-100 rounded py-1.5 px-3.5 w-full focus:outline-none' type="text" placeholder='State' />
        </div>
        <div className='flex gap-3'>
          <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode} className='border-2 border-pink-200 focus:border-pink-600 focus:ring-2 focus:ring-pink-100 rounded py-1.5 px-3.5 w-full focus:outline-none' type="number" placeholder='Zipcode' />
          <input required onChange={onChangeHandler} name='country' value={formData.country} className='border-2 border-pink-200 focus:border-pink-600 focus:ring-2 focus:ring-pink-100 rounded py-1.5 px-3.5 w-full focus:outline-none' type="text" placeholder='Country' />
        </div>
        <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='border-2 border-pink-200 focus:border-pink-600 focus:ring-2 focus:ring-pink-100 rounded py-1.5 px-3.5 w-full focus:outline-none' type="number" placeholder='Phone' />
      </div>
      <div className='mt-8'>
        <div className='mt-8 w-full sm:min-w-80'>
          <CartTotal />
        </div>
        <div className='mt-12'>
          <Title text1={'PAYMENT'} text2={'METHOD'} />
          <div className='flex gap-3 flex-col lg:flex-row'>
            <div onClick={() => setMethod('stripe')} className='flex items-center gap-3 border-2 border-pink-200 hover:border-pink-600 p-2 px-3 cursor-pointer rounded-lg transition'>
              <p className={`min-w-3.5 h-3.5 border-2 border-pink-400 rounded-full ${method === 'stripe' ? 'bg-pink-500' : ''}`}></p>
              <img className={`h-5 mx-4`} src={assets.stripe_logo} alt="Stripe" />
            </div>
            <div onClick={() => setMethod('razorpay')} className='flex items-center gap-3 border-2 border-pink-200 hover:border-pink-600 p-2 px-3 cursor-pointer rounded-lg transition'>
              <p className={`min-w-3.5 h-3.5 border-2 border-pink-400 rounded-full ${method === 'razorpay' ? 'bg-pink-500' : ''}`} ></p>
              <img className={`h-5 mx-4`} src={assets.razorpay_logo} alt="Razorpay" />
            </div>
            <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border-2 border-pink-200 hover:border-pink-600 p-2 px-3 cursor-pointer rounded-lg transition'>
              <p className={`min-w-3.5 h-3.5 border-2 border-pink-400 rounded-full ${method === 'cod' ? 'bg-pink-500' : ''}`}></p>
              <p className='text-gray-600 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
            </div>
          </div>
          <div className='w-full text-end mt-8'>
            <button type='submit' className='bg-gradient-to-r from-pink-600 to-rose-500 text-white px-16 py-3 text-sm font-bold rounded-full hover:shadow-lg transition'>PLACE ORDER</button>
          </div>
        </div>
      </div>
    </form>
    </>
  );
};

export default PlaceOrder;
