import { v2 as cloudinary } from 'cloudinary'

const looksLikePlaceholder = (v) => !v || String(v).toLowerCase().startsWith('your') || String(v).toLowerCase().includes('placeholder')

let cloudinaryReady = false

const isCloudinaryConfigured = () => {
  // Support both naming conventions
  const name = (process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME || '').trim().toLowerCase()
  const key = process.env.CLOUDINARY_API_KEY
  // Support both common names
  const secret = process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET_KEY

  if (looksLikePlaceholder(name) || looksLikePlaceholder(key) || looksLikePlaceholder(secret)) return false
  return Boolean(name && key && secret)
}

// Configure Cloudinary SDK if env vars are present.
// Safe to call multiple times.
const connectCloudinary = async () => {
  if (!isCloudinaryConfigured()) {
    console.log('Cloudinary not configured (local uploads enabled)')
    return false
  }

  const cloudName = (process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME || '').trim().toLowerCase()

  cloudinary.config({
    cloud_name: cloudName,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET_KEY,
    secure: true,
  })

  try {
    await cloudinary.api.ping()
    cloudinaryReady = true
    console.log('Cloudinary configured')
    return true
  } catch (e) {
    cloudinaryReady = false
    console.error('Cloudinary config invalid:', e?.message || String(e))
    return false
  }
}

const isCloudinaryReady = () => cloudinaryReady

export { cloudinary, isCloudinaryConfigured, isCloudinaryReady }
export default connectCloudinary