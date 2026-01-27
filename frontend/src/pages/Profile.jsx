import { useContext, useState, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { assets } from '../assets/assets'

const Profile = () => {
  const { navigate, token, backendUrl } = useContext(ShopContext)
  
  // Remove trailing slash from backendUrl if present
  const cleanBackendUrl = backendUrl && backendUrl.endsWith('/') 
    ? backendUrl.slice(0, -1) 
    : backendUrl
  const [profileData, setProfileData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchProfile()
  }, [token])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${cleanBackendUrl}/api/user/profile`, {
        headers: { token }
      })
      
      if (response.data.success) {
        setProfileData(response.data.user)
        setFormData({
          name: response.data.user.name || '',
          email: response.data.user.email || '',
          phone: response.data.user.phone || '',
          address: response.data.user.address || ''
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async () => {
    try {
      console.log('Saving profile with data:', formData)
      console.log('Backend URL:', cleanBackendUrl)
      console.log('Token:', token)
      
      // Try PUT first, then fallback to POST
      let response;
      try {
        response = await axios.put(
          `${cleanBackendUrl}/api/user/profile`,
          formData,
          { 
            headers: { 
              token,
              'Content-Type': 'application/json'
            } 
          }
        )
      } catch (putError) {
        if (putError.response?.status === 404) {
          console.log('PUT not found, trying POST...')
          response = await axios.post(
            `${cleanBackendUrl}/api/user/profile`,
            formData,
            { 
              headers: { 
                token,
                'Content-Type': 'application/json'
              } 
            }
          )
        } else {
          throw putError
        }
      }
      
      console.log('Response:', response.data)
      
      if (response.data.success) {
        setProfileData(response.data.user)
        setIsEditing(false)
        alert('Profile updated successfully!')
      } else {
        alert('Failed: ' + (response.data.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile: ' + (error.response?.data?.message || error.message))
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-xl text-gray-600'>Loading profile...</div>
      </div>
    )
  }

  return (
    <div className='border-t border-pink-200 pt-10 transition-opacity duration-500 bg-gradient-to-b from-pink-50 to-white'>
      <div className='text-2xl mb-10 text-center'>
        <span className='text-pink-600 inline-flex gap-2 font-bold'>
          My Profile
          <img className='w-6' src={assets.dropdown_icon} alt="" />
        </span>
      </div>

      <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-10'>
        <div className='bg-white rounded-lg shadow-lg p-6 sm:p-8 border-2 border-pink-200'>
          {!isEditing ? (
            // View Mode
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='text-sm font-semibold text-gray-600'>Name</label>
                  <p className='text-lg text-gray-800 mt-2'>{profileData?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className='text-sm font-semibold text-gray-600'>Email</label>
                  <p className='text-lg text-gray-800 mt-2'>{profileData?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className='text-sm font-semibold text-gray-600'>Phone</label>
                  <p className='text-lg text-gray-800 mt-2'>{profileData?.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className='text-sm font-semibold text-gray-600'>Address</label>
                  <p className='text-lg text-gray-800 mt-2'>{profileData?.address || 'N/A'}</p>
                </div>
              </div>

              <div className='flex gap-4 pt-6 border-t border-pink-200'>
                <button
                  onClick={() => setIsEditing(true)}
                  className='px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition'
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className='px-6 py-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition font-medium'
                >
                  View Orders
                </button>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='text-sm font-semibold text-gray-600'>Name</label>
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    className='w-full mt-2 px-4 py-2 border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-600'
                  />
                </div>
                <div>
                  <label className='text-sm font-semibold text-gray-600'>Email</label>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    className='w-full mt-2 px-4 py-2 border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-600'
                  />
                </div>
                <div>
                  <label className='text-sm font-semibold text-gray-600'>Phone</label>
                  <input
                    type='tel'
                    name='phone'
                    value={formData.phone}
                    onChange={handleInputChange}
                    className='w-full mt-2 px-4 py-2 border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-600'
                  />
                </div>
                <div>
                  <label className='text-sm font-semibold text-gray-600'>Address</label>
                  <input
                    type='text'
                    name='address'
                    value={formData.address}
                    onChange={handleInputChange}
                    className='w-full mt-2 px-4 py-2 border-2 border-pink-200 rounded-lg focus:outline-none focus:border-pink-600'
                  />
                </div>
              </div>

              <div className='flex gap-4 pt-6 border-t border-pink-200'>
                <button
                  onClick={handleSaveProfile}
                  className='px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition'
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setFormData({
                      name: profileData?.name || '',
                      email: profileData?.email || '',
                      phone: profileData?.phone || '',
                      address: profileData?.address || ''
                    })
                  }}
                  className='px-6 py-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition font-medium'
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
