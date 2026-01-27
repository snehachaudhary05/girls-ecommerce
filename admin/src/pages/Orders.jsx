import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    if (!token) return;

    try {
      const response = await axios.post(
        `${backendUrl}/api/order/list`,
        {},
        { headers: { token } }
      );
      console.log('Orders Response:', response.data);
      if (response.data.success) {
        setOrders(response.data.orders);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const statusHandler = async (event, orderId, currentStatus) => {
    const newStatus = event.target.value;
    
    // Get appropriate confirmation message based on status change
    const confirmMessages = {
      'Packing': '⚠️ Are you sure you want to mark this order as PACKING?\n\nMake sure:\n✓ Payment verified\n✓ Items picked from warehouse\n✓ Items ready for packing',
      'Shipped': '📦 Are you sure you want to mark this order as SHIPPED?\n\nMake sure:\n✓ Order is packed\n✓ Handed to courier partner\n✓ Tracking number available',
      'Out for Delivery': '🚚 Are you sure you want to mark this order as OUT FOR DELIVERY?\n\nMake sure:\n✓ Order has been shipped\n✓ Order is with delivery partner\n✓ Out for delivery today',
      'Delivered': '✅ Are you sure you want to mark this order as DELIVERED?\n\nMake sure:\n✓ Customer has received the order\n✓ Order verified by customer'
    };

    const confirmMessage = confirmMessages[newStatus] || `Are you sure you want to change status to ${newStatus}?`;
    
    if (!window.confirm(confirmMessage)) {
      event.target.value = currentStatus;
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status: newStatus },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(`✓ Order status updated to ${newStatus}`);
        await fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Orders Management</h1>
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <div
              key={index}
              className="bg-white border-2 border-gray-200 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header with Order ID and Status */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">Order #{index + 1}</p>
                  <p className="text-lg font-semibold text-gray-800">Order ID: {order._id?.slice(-8) || 'N/A'}</p>
                </div>
                <select
                  onChange={(event) => statusHandler(event, order._id, order.status)}
                  value={order.status}
                  className="px-4 py-2 text-base font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="Order Placed">Order Placed</option>
                  <option value="Packing">Packing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Items and Customer Info */}
                <div className="lg:col-span-2">
                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Order Items</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                            <div>
                              <p className="text-base font-medium text-gray-800">{item.name}</p>
                              {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
                            </div>
                            <p className="text-base font-semibold text-gray-700">x{item.quantity}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No items available</p>
                      )}
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Customer Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Customer Name</p>
                        <p className="text-base font-medium text-gray-800">{order.userName || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-base font-medium text-blue-600">{order.userEmail || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-base font-medium text-gray-800">{order.userPhone || order.address?.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Delivery Address and Order Details */}
                <div>
                  {/* Delivery Address */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Delivery Address</h3>
                    {order.address ? (
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <p className="text-base font-semibold text-gray-800 mb-2">
                          {order.address.firstName} {order.address.lastName}
                        </p>
                        <p className="text-sm text-gray-700 mb-1">{order.address.street}</p>
                        <p className="text-sm text-gray-700 mb-1">
                          {order.address.city}, {order.address.state}
                        </p>
                        <p className="text-sm text-gray-700 mb-1">
                          {order.address.country} - {order.address.zipcode}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-500">Address not available</p>
                      </div>
                    )}
                  </div>

                  {/* Order Details */}
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Total Items</p>
                      <p className="text-2xl font-bold text-gray-800">{order.items?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-2xl font-bold text-green-600">{currency}{order.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="text-base font-medium text-gray-800">{order.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Status</p>
                      <p className={`text-base font-medium ${order.payment ? 'text-green-600' : 'text-red-600'}`}>
                        {order.payment ? 'Paid' : 'Pending'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Order Date</p>
                      <p className="text-base font-medium text-gray-800">
                        {new Date(order.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
