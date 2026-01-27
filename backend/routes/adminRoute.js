import express from 'express'
import {
  getDashboardAnalytics,
  getNotifications,
  getAdminSettings,
  updateAdminSettings,
  getHelpSupport,
  searchAdmin
} from '../controllers/adminController.js'
import adminAuth from '../middleware/adminAuth.js'

const adminRouter = express.Router()

// Analytics/Dashboard
adminRouter.get('/analytics', adminAuth, getDashboardAnalytics)

// Notifications
adminRouter.get('/notifications', adminAuth, getNotifications)

// Settings
adminRouter.get('/settings', adminAuth, getAdminSettings)
adminRouter.put('/settings', adminAuth, updateAdminSettings)

// Help & Support
adminRouter.get('/help-support', adminAuth, getHelpSupport)

// Search
adminRouter.post('/search', adminAuth, searchAdmin)

export default adminRouter
