import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs/promises'

// Load backend/.env
dotenv.config({ path: path.join(process.cwd(), '.env') })

const connectDB = (await import('../config/mongodb.js')).default
const Product = (await import('../models/productModel.js')).default

await connectDB()

const extractUploadsFilename = (url) => {
  if (typeof url !== 'string') return null
  const idx = url.indexOf('/uploads/')
  if (idx === -1) return null
  const after = url.slice(idx + '/uploads/'.length)
  const filename = after.split('?')[0].split('#')[0]
  return filename || null
}

const fileExists = async (p) => {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

const limit = Number(process.argv[2] || 10)
const products = await Product.find({ images: { $elemMatch: { $regex: '/uploads/' } } })
  .limit(limit)
  .lean()

const uploadsDir = path.join(process.cwd(), 'uploads')

const report = await Promise.all(
  products.map(async (p) => {
    const imgs = Array.isArray(p.images) ? p.images : []
    const first = imgs[0]
    const filename = extractUploadsFilename(first)
    const localPath = filename ? path.join(uploadsDir, filename) : null
    return {
      id: p._id,
      name: p.name,
      firstImage: first,
      filename,
      localFileExists: localPath ? await fileExists(localPath) : false,
    }
  })
)

console.log(JSON.stringify(report, null, 2))

process.exit(0)
