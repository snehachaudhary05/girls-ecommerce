import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';


const Orders = () => {
  const {backendUrl, token, currency, cartItems, setCartItems} = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [searchParams] = useSearchParams();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  // Verify Stripe payment on component mount
  useEffect(() => {
    const verifyStripePayment = async () => {
      const sessionId = searchParams.get('session_id');
      if (sessionId && token) {
        try {
          console.log('Verifying Stripe payment with session_id:', sessionId);
          const response = await axios.post(
            backendUrl + '/api/order/verifyStripe',
            { session_id: sessionId },
            { headers: { token } }
          );
          
          console.log('Verification response:', response.data);
          
          if (response.data.success) {
            console.log('Stripe payment verified successfully');
            toast.success('Payment verified and order created!');
            // Clear cart from context
            setCartItems({});
            // Reload orders to show the new order
            await loadOrderData();
            // Clear the URL parameter
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            console.log('Stripe verification failed:', response.data.message);
            toast.error(response.data.message);
          }
        } catch (error) {
          console.log('Error verifying Stripe payment:', error);
          toast.error(error.message || 'Failed to verify payment');
        }
      }
    };

    verifyStripePayment();
  }, [searchParams, token, backendUrl]);

  const loadOrderData = async () => {
    try{
      if(!token){
        return null
      }
      const response = await axios.post(backendUrl + '/api/order/userOrders', {}, {headers: {token}})
      if(response.data.success){
        setAllOrders(response.data.orders);
        let allOrderItems = []
        response.data.orders.map((order)=>{
          order.items.map((item)=>{
            item['status'] = order.status
            item['payment'] = order.payment
            item['paymentMethod'] = order.paymentMethod
            item['date'] = order.date
            item['orderId'] = order._id
            allOrderItems.push(item)
          })
        })
        setOrderData(allOrderItems.reverse())
        
      }
    }
    catch(error){
      console.log(error);
    }
  }

  useEffect(()=>{
    loadOrderData()
  }, [token])

  const getOrderStatus = (status) => {
    const statuses = ['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered'];
    return statuses.indexOf(status);
  }

  const trackOrder = (item) => {
    const order = allOrders.find(o => o._id === item.orderId);
    setSelectedOrder({ ...item, ...order });
    setShowTrackModal(true);
  }

  const handleCancelOrder = async (orderId) => {
    setCancellingOrderId(orderId);
    setShowCancelModal(true);
  }

  const confirmCancelOrder = async () => {
    try {
      const response = await axios.post(
        backendUrl + '/api/order/cancel',
        { orderId: cancellingOrderId, userId: '' },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Order cancelled successfully');
        setShowCancelModal(false);
        setCancellingOrderId(null);
        await loadOrderData();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  }

  const cancelCancelOrder = () => {
    setShowCancelModal(false);
    setCancellingOrderId(null);
  }

  return (
    <>
      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-sm w-full p-6 shadow-2xl'>
            <div className='text-center'>
              {/* Warning Icon */}
              <div className='mb-4 flex justify-center'>
                <svg className='w-16 h-16 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </div>
              
              <h2 className='text-2xl font-bold text-gray-800 mb-2'>Delete Order?</h2>
              <p className='text-gray-600 mb-6'>Are you sure you want to delete this order? This action cannot be undone.</p>
              
              {/* Buttons */}
              <div className='flex gap-3 mt-8'>
                <button
                  onClick={cancelCancelOrder}
                  className='flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors'
                >
                  Keep Order
                </button>
                <button
                  onClick={confirmCancelOrder}
                  className='flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors'
                >
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    <div className='border-t border-pink-200 pt-16 px-4 sm:px-8'>
      <div className='text-2xl mb-8'>
        <Title text1 = {'MY'} text2 = {'ORDERS'}/>
      </div>
      
      <div>
        {orderData.length === 0 ? (
          <p className='text-center text-gray-400 py-10 text-lg'>No orders found.</p>
        ) : (
          <div className='space-y-3 sm:space-y-4'>
            {orderData.map((item, index) => (
              <div key={index} className='bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow'>
                {/* Order Card Container */}
                <div className='flex flex-col sm:flex-row gap-0 sm:gap-4 p-4 sm:p-5'>
                  
                  {/* Product Image */}
                  <div className='flex-shrink-0 mb-3 sm:mb-0'>
                    <img
                      className='w-full sm:w-32 sm:h-32 aspect-square object-cover rounded'
                      src={item.images && item.images[0]}
                      alt={item.name}
                      loading='lazy'
                      decoding='async'
                    />
                  </div>

                  {/* Product Details - Main Info */}
                  <div className='flex-grow'>
                    {/* Product Name */}
                    <h3 className='text-xl sm:text-lg font-bold text-gray-900 line-clamp-2 mb-3'>{item.name}</h3>
                    
                    {/* Details in 2x2 grid for mobile, row for desktop */}
                    <div className='grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-6 mb-4 text-sm'>
                      <div>
                        <p className='text-gray-500 text-xs sm:text-xs font-medium uppercase tracking-wider'>Price</p>
                        <p className='text-lg sm:text-base font-bold text-gray-900 mt-1'>{currency}{item.price}</p>
                      </div>
                      <div>
                        <p className='text-gray-500 text-xs sm:text-xs font-medium uppercase tracking-wider'>Quantity</p>
                        <p className='text-lg sm:text-base font-bold text-gray-900 mt-1'>{item.quantity}</p>
                      </div>
                      <div>
                        <p className='text-gray-500 text-xs sm:text-xs font-medium uppercase tracking-wider'>Order Date</p>
                        <p className='text-base sm:text-base font-semibold text-gray-900 mt-1'>{new Date(item.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className='text-gray-500 text-xs sm:text-xs font-medium uppercase tracking-wider'>Payment</p>
                        <p className='text-base sm:text-base font-semibold text-gray-900 mt-1'>{item.paymentMethod}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className='flex items-center gap-3 mb-4 sm:mb-0'>
                      <div className='flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg'>
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          item.status === 'Order Placed' ? 'bg-yellow-500' : 
                          item.status === 'Delivered' ? 'bg-green-500' : 
                          item.status === 'Shipped' || item.status === 'Out for delivery' ? 'bg-blue-500' : 
                          item.status === 'Packing' ? 'bg-orange-500' : 'bg-gray-400'
                        }`}></span>
                        <p className='text-sm font-semibold text-gray-800'>{item.status}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className='flex items-center sm:items-end gap-2'>
                    <button 
                      onClick={() => trackOrder(item)} 
                      className='bg-blue-600 text-white py-2 px-4 rounded font-semibold hover:bg-blue-700 transition-colors text-sm whitespace-nowrap'
                    >
                      Track Order
                    </button>
                    {item.status !== 'Delivered' && item.status !== 'Cancelled' && (
                      <button 
                        onClick={() => handleCancelOrder(item.orderId)} 
                        className='bg-red-600 text-white py-2 px-4 rounded font-semibold hover:bg-red-700 transition-colors text-sm whitespace-nowrap'
                      >
                        Delete Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Track Order Modal */}
      {showTrackModal && selectedOrder && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8'>
            {/* Close Button */}
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-2xl font-bold text-gray-800'>Track Your Order</h2>
              <button 
                onClick={() => setShowTrackModal(false)}
                className='text-2xl text-gray-500 hover:text-gray-800'
              >
                ✕
              </button>
            </div>

            {/* Order ID */}
            <div className='bg-gray-50 p-4 rounded-lg mb-6'>
              <p className='text-sm text-gray-500 font-medium'>ORDER ID</p>
              <p className='text-lg font-bold text-gray-800 mt-1'>{selectedOrder._id || selectedOrder.orderId}</p>
            </div>

            {/* Status Timeline */}
            <div className='mb-8'>
              <h3 className='text-lg font-bold text-gray-800 mb-6'>DELIVERY STATUS</h3>
              <div className='space-y-4'>
                {['Order Placed', 'Packing', 'Shipped', 'Out for delivery', 'Delivered'].map((status, idx) => {
                  const currentStatusIdx = getOrderStatus(selectedOrder.status);
                  const isCompleted = idx <= currentStatusIdx;
                  const isCurrent = idx === currentStatusIdx;
                  
                  return (
                    <div key={idx} className='flex items-start gap-4'>
                      {/* Timeline Circle */}
                      <div className='flex flex-col items-center'>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {isCompleted ? '✓' : idx + 1}
                        </div>
                        {idx < 4 && (
                          <div className={`w-1 h-8 mt-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        )}
                      </div>

                      {/* Status Text */}
                      <div className='pt-2 flex-grow'>
                        <p className={`text-base font-bold ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                          {status}
                        </p>
                        {isCurrent && (
                          <p className='text-sm text-blue-500 mt-1'>Currently at this stage</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Details */}
            <div className='grid grid-cols-2 gap-4 mb-6'>
              <div className='bg-blue-50 p-4 rounded-lg'>
                <p className='text-sm text-gray-500 font-medium'>PAYMENT METHOD</p>
                <p className='text-base font-bold text-gray-800 mt-2'>{selectedOrder.paymentMethod}</p>
              </div>
              <div className='bg-green-50 p-4 rounded-lg'>
                <p className='text-sm text-gray-500 font-medium'>PAYMENT STATUS</p>
                <p className={`text-base font-bold mt-2 ${selectedOrder.payment ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedOrder.payment ? 'Paid' : 'Pending'}
                </p>
              </div>
            </div>

            {/* Product Info */}
            <div className='bg-gray-50 p-4 rounded-lg mb-6'>
              <h3 className='text-base font-bold text-gray-800 mb-3'>ORDERED ITEM</h3>
              <div className='flex gap-4'>
                <img
                  className='w-16 h-16 object-cover rounded-lg'
                  src={selectedOrder.images && selectedOrder.images[0]}
                  alt={selectedOrder.name}
                  loading='lazy'
                  decoding='async'
                />
                <div className='flex-grow'>
                  <p className='font-semibold text-gray-800'>{selectedOrder.name}</p>
                  <p className='text-sm text-gray-600 mt-1'>Quantity: {selectedOrder.quantity}</p>
                  <p className='text-sm font-bold text-gray-800 mt-2'>{currency}{selectedOrder.price}</p>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button 
              onClick={() => setShowTrackModal(false)}
              className='w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors'
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

export default Orders;
