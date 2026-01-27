import multer from 'multer'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { isCloudinaryReady } from '../config/cloudinary.js'

// Keep both directories available:
// - Local fallback uses project `uploads/` which is served at /uploads
// - Cloudinary mode uses OS temp dir; files are uploaded then deleted
const uploadsDir = path.join(process.cwd(), 'uploads')
const tempDir = path.join(os.tmpdir(), 'ecommerce-uploads')

fs.mkdirSync(uploadsDir, { recursive: true })
fs.mkdirSync(tempDir, { recursive: true })

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, isCloudinaryReady() ? tempDir : uploadsDir)
    },
    filename: function (req, file, cb) {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, unique + '-' + file.originalname)
    }
})

const upload = multer({ storage })

export default upload