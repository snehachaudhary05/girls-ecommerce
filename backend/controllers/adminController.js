import Order from '../models/orderModel.js'
import Product from '../models/productModel.js'
import User from '../models/userModel.js'

// Get Dashboard Analytics
export const getDashboardAnalytics = async (req, res) => {
  try {
    // Get total sales
    const orders = await Order.find()
    const totalSales = orders.reduce((sum, order) => sum + order.amount, 0)
    const totalOrders = orders.length

    // Get total products
    const totalProducts = await Product.countDocuments()

    // Get total users
    const totalUsers = await User.countDocuments()

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id date amount status')

    // Get sales by month (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const monthlySales = await Order.aggregate([
      {
        $match: { createdAt: { $gte: sixMonthsAgo } }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          sales: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])

    res.json({
      success: true,
      data: {
        totalSales: totalSales.toFixed(2),
        totalOrders,
        totalProducts,
        totalUsers,
        recentOrders,
        monthlySales
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get Notifications
export const getNotifications = async (req, res) => {
  try {
    // Get recent orders for notifications
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('_id date status')

    // Get low stock products (less than 10 units)
    const lowStockProducts = await Product.find({ quantity: { $lt: 10 } }).limit(2)

    // Create notifications array
    const notifications = []

    // Add order notifications
    recentOrders.forEach((order, index) => {
      notifications.push({
        id: index + 1,
        message: `New order #${order._id.toString().slice(-6)} received`,
        time: getTimeAgo(order.createdAt),
        type: 'order',
        icon: '📦'
      })
    })

    // Add low stock notifications
    lowStockProducts.forEach((product, index) => {
      notifications.push({
        id: recentOrders.length + index + 1,
        message: `Low stock alert: ${product.name} (${product.quantity} units left)`,
        time: '1 hour ago',
        type: 'stock',
        icon: '⚠️'
      })
    })

    // Add general message
    notifications.push({
      id: notifications.length + 1,
      message: 'System running smoothly',
      time: 'Just now',
      type: 'system',
      icon: '✅'
    })

    res.json({
      success: true,
      data: notifications.slice(0, 5) // Return top 5 notifications
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get Admin Settings
export const getAdminSettings = async (req, res) => {
  try {
    const settings = {
      success: true,
      data: {
        adminName: 'Glowgals Admin',
        adminEmail: 'admin@glowgals.com',
        storeName: 'Glowgals',
        currency: 'INR',
        timezone: 'IST',
        lowStockThreshold: 10,
        notifications: {
          emailNotifications: true,
          orderAlerts: true,
          stockAlerts: true,
          systemAlerts: true
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 30, // minutes
          lastLogin: new Date()
        }
      }
    }
    res.json(settings)
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update Admin Settings
export const updateAdminSettings = async (req, res) => {
  try {
    const { setting, value } = req.body
    // Implement setting update logic
    res.json({
      success: true,
      message: `Setting '${setting}' updated successfully`,
      data: { [setting]: value }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get Help & Support Data
export const getHelpSupport = async (req, res) => {
  try {
    const helpData = {
      success: true,
      data: {
        faqs: [
          {
            id: 1,
            question: 'How to add a new product?',
            answer: 'Go to Products > Add Product, fill in the details and upload images.'
          },
          {
            id: 2,
            question: 'How to manage orders?',
            answer: 'Navigate to Orders section to view, update, and manage all orders.'
          },
          {
            id: 3,
            question: 'How to view analytics?',
            answer: 'Click on Analytics in the profile dropdown to see sales reports and statistics.'
          },
          {
            id: 4,
            question: 'How to update settings?',
            answer: 'Go to Admin Settings to update store information and preferences.'
          },
          {
            id: 5,
            question: 'How to manage users?',
            answer: 'Use the Users section to view customer profiles and manage accounts.'
          }
        ],
        supportChannels: [
          {
            id: 1,
            name: 'Email Support',
            contact: 'support@glowgals.com',
            icon: '📧',
            responseTime: '24 hours'
          },
          {
            id: 2,
            name: 'Live Chat',
            contact: 'Available 9 AM - 6 PM',
            icon: '💬',
            responseTime: 'Instant'
          },
          {
            id: 3,
            name: 'Phone Support',
            contact: '+91-XXXXX-XXXXX',
            icon: '☎️',
            responseTime: '2 hours'
          }
        ],
        documentation: [
          {
            id: 1,
            title: 'Getting Started Guide',
            url: '/docs/getting-started',
            icon: '📖'
          },
          {
            id: 2,
            title: 'Product Management',
            url: '/docs/products',
            icon: '📚'
          },
          {
            id: 3,
            title: 'Order Processing',
            url: '/docs/orders',
            icon: '📋'
          },
          {
            id: 4,
            title: 'Reports & Analytics',
            url: '/docs/analytics',
            icon: '📊'
          }
        ]
      }
    }
    res.json(helpData)
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Search functionality
export const searchAdmin = async (req, res) => {
  try {
    const { query } = req.body

    if (!query || query.trim() === '') {
      return res.json({ success: true, data: [] })
    }

    const searchRegex = { $regex: query, $options: 'i' }

    // Search products by name and description
    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex }
      ]
    }).limit(5)

    // Search orders
    const orders = await Order.find().limit(10).select('_id date status amount')
    const filteredOrders = orders.filter(order =>
      order._id.toString().includes(query) || 
      order.status.toLowerCase().includes(query.toLowerCase()) ||
      order.amount.toString().includes(query)
    )

    // Search users
    const users = await User.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex }
      ]
    }).limit(5).select('name email')

    const results = [
      ...products.map(p => ({ type: 'product', id: p._id, name: p.name })),
      ...filteredOrders.slice(0, 5).map(o => ({ type: 'order', id: o._id, name: `Order #${o._id.toString().slice(-6)}` })),
      ...users.map(u => ({ type: 'user', id: u._id, name: u.name, email: u.email }))
    ]

    console.log('Search query:', query, 'Results:', results.length) // Debug log
    res.json({ success: true, data: results })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// Helper function to get time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000)
  let interval = seconds / 31536000

  if (interval > 1) return Math.floor(interval) + ' years ago'
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + ' months ago'
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + ' days ago'
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + ' hours ago'
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + ' minutes ago'
  return Math.floor(seconds) + ' seconds ago'
}
