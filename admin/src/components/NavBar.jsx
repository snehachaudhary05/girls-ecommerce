import React, { useState, useEffect } from 'react'
import {assets} from '../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const NavBar = ({setToken}) => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(false)

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'
  
  // Remove trailing slash if present
  const cleanBackendUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  // Fetch analytics on component mount
  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('No token available for notifications')
        return
      }
      const response = await axios.get(
        `${cleanBackendUrl}/api/admin/notifications`,
        { headers: { token } }
      )
      if (response.data.success) {
        setNotifications(response.data.data)
      }
    } catch (error) {
      // Silently fail - notifications are non-critical
      console.log('Notifications fetch failed (non-critical):', error.message)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('No token available for analytics')
        return
      }
      const response = await axios.get(
        `${cleanBackendUrl}/api/admin/analytics`,
        { headers: { token } }
      )
      if (response.data.success) {
        setAnalytics(response.data.data)
      }
    } catch (error) {
      // Silently fail - analytics are non-critical
      console.log('Analytics fetch failed (non-critical):', error.message)
    }
  }

  const handleSearch = async (e) => {
    if (e) e.preventDefault()
    
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowSearch(false)
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      console.log('Searching for:', searchQuery, 'Token:', token)
      
      const response = await axios.post(
        `${cleanBackendUrl}/api/admin/search`,
        { query: searchQuery },
        { 
          headers: { 
            token,
            'Content-Type': 'application/json'
          } 
        }
      )
      
      console.log('Search response:', response.data)
      
      if (response.data.success) {
        setSearchResults(response.data.data)
        setShowSearch(true)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search failed:', error.message)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  // Handle search input change - search as user types
  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    
    if (value.trim()) {
      setShowSearch(true)
      // Auto-search as user types
      const timer = setTimeout(() => {
        handleSearch()
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setSearchResults([])
      setShowSearch(false)
    }
  }

  const handleLogout = () => {
    setToken('')
    localStorage.removeItem('token')
  }

  const handleSearchResultClick = (result) => {
    console.log('Clicked result:', result)
    setShowSearch(false)
    setSearchQuery('')
    setSearchResults([])
    
    if (result.type === 'product') {
      // Navigate to edit page with product ID
      navigate(`/edit/${result.id}`)
    } else if (result.type === 'order') {
      // Navigate to orders page
      navigate('/orders', { state: { orderId: result.id } })
    } else if (result.type === 'user') {
      // Navigate to list page with user name filter
      navigate('/list', { state: { searchUser: result.name } })
    }
  }

  return (
    <div className='flex items-center py-2 sm:py-3 md:py-4 px-3 sm:px-4 md:px-[4%] justify-between bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-200 gap-3 sm:gap-4 md:gap-6 flex-wrap'>
      {/* Logo and Dashboard Link */}
      <Link to='/' className='flex items-center gap-2 flex-shrink-0'>
        <img className='w-20 sm:w-24 md:w-32 lg:w-[max(40%,300px)] h-auto' src={assets.logo} alt="Logo" />
      </Link>

      {/* Search Bar - Hidden on mobile, visible on tablet and up */}
      <form onSubmit={handleSearch} className='hidden md:flex items-center bg-pink-100 rounded-full px-3 md:px-6 py-2 md:py-3 gap-2 md:gap-3 flex-1 mx-2 md:mx-8 max-w-sm md:max-w-2xl relative border border-pink-300'>
        <input
          type='text'
          placeholder='Search...'
          value={searchQuery}
          onChange={handleSearchInputChange}
          onFocus={() => searchQuery && setShowSearch(true)}
          className='bg-pink-100 outline-none text-xs md:text-base text-gray-700 flex-1'
          autoComplete='off'
        />
        <button type='submit' className='text-pink-600 hover:text-pink-700 text-lg md:text-2xl'>
          🔍
        </button>

        {/* Search Results Dropdown */}
        {showSearch && searchQuery && (
          <div className='absolute top-16 left-0 w-full bg-white border border-pink-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto'>
            {loading ? (
              <div className='p-6 text-center text-gray-500 text-lg'>Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSearchResultClick(result)}
                  className='p-5 border-b border-pink-100 hover:bg-pink-50 cursor-pointer transition'
                >
                  <p className='text-gray-800 text-base font-medium'>
                    {result.type === 'product' && '📦 ' }
                    {result.type === 'order' && '📋 ' }
                    {result.type === 'user' && '👤 ' }
                    {result.name}
                  </p>
                  {result.email && <p className='text-gray-500 text-sm'>{result.email}</p>}
                  <p className='text-gray-400 text-xs mt-1 capitalize'>{result.type}</p>
                </div>
              ))
            ) : (
              <div className='p-6 text-gray-500 text-base text-center'>No results found</div>
            )}
          </div>
        )}
      </form>

      {/* Right Side - Icons and Menus */}
      <div className='flex items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 flex-shrink-0'>
        {/* Notifications */}
        <div className='relative'>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className='relative text-pink-600 hover:text-pink-700 transition text-2xl sm:text-3xl lg:text-4xl'
          >
            🔔
            {notifications.length > 0 && (
              <span className='absolute -top-3 -right-3 bg-pink-600 text-white text-xs sm:text-sm rounded-full w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 flex items-center justify-center font-bold'>
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className='absolute right-0 top-12 sm:top-14 lg:top-16 w-72 sm:w-80 lg:w-96 bg-white border border-pink-200 rounded-lg shadow-lg z-50'>
              <div className='p-3 sm:p-4 lg:p-5 border-b border-pink-200 font-semibold text-gray-800 text-sm sm:text-base lg:text-lg flex items-center justify-between'>
                <span>Notifications</span>
                <button onClick={fetchNotifications} className='text-xs text-pink-600 hover:text-pink-700'>↻ Refresh</button>
              </div>
              <div className='max-h-96 overflow-y-auto'>
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif.id} className='p-3 sm:p-4 lg:p-5 border-b border-pink-100 hover:bg-pink-50 cursor-pointer transition'>
                      <p className='text-gray-800 text-xs sm:text-sm lg:text-base font-medium'>{notif.icon} {notif.message}</p>
                      <p className='text-gray-500 text-xs mt-1'>{notif.time}</p>
                    </div>
                  ))
                ) : (
                  <div className='p-4 text-gray-500 text-sm text-center'>No notifications</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className='relative'>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className='flex items-center gap-2 px-2 sm:px-3 md:px-4 py-2 md:py-3 rounded-full hover:bg-pink-100 transition'
          >
            <span className='w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 bg-pink-200 rounded-full flex items-center justify-center text-xs sm:text-sm lg:text-xl font-bold text-pink-700'>
              A
            </span>
            <span className='hidden sm:inline text-xs md:text-sm lg:text-lg text-gray-700 font-semibold'>Admin</span>
          </button>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div className='absolute right-0 top-12 sm:top-14 lg:top-16 w-56 sm:w-64 lg:w-72 bg-white border border-pink-200 rounded-lg shadow-lg z-50'>
              <div className='p-3 sm:p-4 lg:p-5 border-b border-pink-200 bg-pink-50'>
                <p className='text-gray-800 font-semibold text-sm md:text-base lg:text-lg'>Admin Panel</p>
                <p className='text-gray-500 text-xs md:text-sm'>admin@glowgals.com</p>
              </div>

              {/* Quick Stats */}
              {analytics && (
                <div className='p-3 sm:p-4 lg:p-5 border-b border-pink-100 bg-pink-50'>
                  <p className='text-xs font-semibold text-gray-600 mb-2 md:mb-3'>Quick Stats</p>
                  <div className='grid grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm'>
                    <div className='bg-white p-2 md:p-3 rounded border border-pink-200'>
                      <p className='text-gray-500 text-xs'>Orders</p>
                      <p className='font-bold text-pink-600'>{analytics.totalOrders}</p>
                    </div>
                    <div className='bg-white p-2 md:p-3 rounded border border-pink-200'>
                      <p className='text-gray-500 text-xs'>Products</p>
                      <p className='font-bold text-pink-600'>{analytics.totalProducts}</p>
                    </div>
                    <div className='bg-white p-2 md:p-3 rounded col-span-2 border border-pink-200'>
                      <p className='text-gray-500 text-xs'>Total Sales</p>
                      <p className='font-bold text-pink-600'>₹{analytics.totalSales}</p>
                    </div>
                  </div>
                </div>
              )}

              <Link
                to='/list'
                className='block px-3 sm:px-4 lg:px-5 py-3 md:py-4 text-gray-700 hover:bg-pink-50 transition text-xs sm:text-sm lg:text-base font-medium border-b border-pink-100'
                onClick={() => setShowProfileMenu(false)}
              >
                📊 Analytics
              </Link>
              <Link
                to='/add'
                className='block px-3 sm:px-4 lg:px-5 py-3 md:py-4 text-gray-700 hover:bg-pink-50 transition text-xs sm:text-sm lg:text-base font-medium border-b border-pink-100'
                onClick={() => setShowProfileMenu(false)}
              >
                ⚙️ Settings
              </Link>
              <a
                href='#'
                className='block px-3 sm:px-4 lg:px-5 py-3 md:py-4 text-gray-700 hover:bg-pink-50 transition text-xs sm:text-sm lg:text-base font-medium border-b border-pink-100'
                onClick={() => setShowProfileMenu(false)}
              >
                ❓ Help & Support
              </a>
              <button
                onClick={handleLogout}
                className='w-full text-left px-3 sm:px-4 lg:px-5 py-3 md:py-4 text-pink-600 hover:bg-pink-100 transition text-xs sm:text-sm lg:text-base font-medium'
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NavBar
