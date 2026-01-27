import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import path from 'path'
import fs from 'fs/promises'
import os from 'os'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env') })

const connectDB = (await import('../config/mongodb.js')).default
const connectCloudinary = (await import('../config/cloudinary.js')).default
const { cloudinary, isCloudinaryConfigured, isCloudinaryReady } = await import('../config/cloudinary.js')
const productModel = (await import('../models/productModel.js')).default

const argv = process.argv.slice(2)
const hasFlag = (flag) => argv.includes(flag)
const getArgValue = (prefix, fallback) => {
  const hit = argv.find((a) => a.startsWith(prefix))
  if (!hit) return fallback
  const [, value] = hit.split('=')
  return value ?? fallback
}

const DRY_RUN = hasFlag('--dry-run')
const LIMIT = Number(getArgValue('--limit', '0')) || 0
const ONLY_MISSING = hasFlag('--only-missing')
const VERBOSE = hasFlag('--verbose')
const PRODUCT_ID = getArgValue('--productId', '')

const isCloudinaryUrl = (url) => typeof url === 'string' && url.includes('res.cloudinary.com')

const extractUploadsFilename = (url) => {
  if (typeof url !== 'string') return null
  const idx = url.indexOf('/uploads/')
  if (idx === -1) return null
  const after = url.slice(idx + '/uploads/'.length)
  const filename = after.split('?')[0].split('#')[0]
  return filename || null
}

const looksLikeMulterPrefixedFilename = (filename) => {
  // Expected: <Date.now()>-<rand>-<originalname>
  if (typeof filename !== 'string') return false
  const parts = filename.split('-')
  if (parts.length < 3) return false
  return /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1])
}

const extractOriginalNameFromPrefixed = (filename) => {
  if (!looksLikeMulterPrefixedFilename(filename)) return null
  return filename.split('-').slice(2).join('-') || null
}

const findLocalUploadsFile = async (uploadsDir, filename) => {
  // 1) Exact match
  const exact = path.join(uploadsDir, filename)
  if (await fileExists(exact)) return exact

  // 2) Fuzzy match by original filename (ignoring timestamp/random prefix)
  const original = extractOriginalNameFromPrefixed(filename)
  if (!original) return null

  try {
    const files = await fs.readdir(uploadsDir)
    const suffix = `-${original}`
    const match = files.find((f) => f.endsWith(suffix))
    if (match) return path.join(uploadsDir, match)
  } catch {
    // ignore
  }

  return null
}

const fileExists = async (p) => {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

const downloadToTemp = async (url) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const arrayBuffer = await res.arrayBuffer()
    const buf = Buffer.from(arrayBuffer)

    // Best-effort extension based on URL
    const base = path.basename(url.split('?')[0].split('#')[0]) || `download-${Date.now()}`
    const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}-${base}`
    const tmpPath = path.join(os.tmpdir(), filename)
    await fs.writeFile(tmpPath, buf)
    return tmpPath
  } finally {
    clearTimeout(timeout)
  }
}

const uploadFileToCloudinary = async (filePath, publicIdHint) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'ecommerce/products',
    resource_type: 'image',
    public_id: publicIdHint || undefined,
  })
  return result.secure_url
}

const main = async () => {
  if (!isCloudinaryConfigured()) {
    console.error('Cloudinary is not configured. Set CLOUDINARY_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET (or CLOUDINARY_SECRET_KEY).')
    process.exit(1)
  }

  await connectDB()
  await connectCloudinary()

  if (!isCloudinaryReady()) {
    console.error('Cloudinary credentials are invalid. Fix CLOUDINARY_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET and try again.')
    process.exit(1)
  }

  const filter = PRODUCT_ID
    ? { _id: PRODUCT_ID }
    : ONLY_MISSING
      ? { images: { $elemMatch: { $regex: '/uploads/' } } }
      : {}

  const cursor = productModel.find(filter).cursor()

  let scanned = 0
  let changed = 0
  let skipped = 0
  let failed = 0

  const localUploadsDir = path.join(process.cwd(), 'uploads')

  for await (const product of cursor) {
    scanned += 1
    if (LIMIT && scanned > LIMIT) break

    const images = Array.isArray(product.images) ? product.images : []
    if (!images.length) {
      skipped += 1
      continue
    }

    // Skip if everything already on Cloudinary
    if (images.every(isCloudinaryUrl)) {
      skipped += 1
      continue
    }

    let anyChange = false
    const migrated = []

    for (const imgUrl of images) {
      // Keep Cloudinary URLs unchanged
      if (isCloudinaryUrl(imgUrl)) {
        migrated.push(imgUrl)
        continue
      }

      let tmpPath = null
      try {
        const filename = extractUploadsFilename(imgUrl)

        if (filename) {
          const localPath = await findLocalUploadsFile(localUploadsDir, filename)
          if (localPath) tmpPath = localPath
        }

        if (!tmpPath && typeof imgUrl === 'string' && (imgUrl.startsWith('http://') || imgUrl.startsWith('https://'))) {
          tmpPath = await downloadToTemp(imgUrl)
        }

        if (!tmpPath) {
          // Cannot migrate this image; keep original
          migrated.push(imgUrl)
          continue
        }

        const cloudUrl = DRY_RUN
          ? `DRY_RUN:${imgUrl}`
          : await uploadFileToCloudinary(tmpPath)

        migrated.push(cloudUrl)
        anyChange = true

        // Remove only downloaded temp files; never delete project uploads/ here
        if (!DRY_RUN && tmpPath && tmpPath.startsWith(os.tmpdir())) {
          await fs.unlink(tmpPath).catch(() => {})
        }
      } catch (e) {
        failed += 1
        if (VERBOSE) {
          console.error(
            JSON.stringify(
              {
                productId: product._id?.toString(),
                productName: product.name,
                image: imgUrl,
                error: e?.message || String(e),
              },
              null,
              2
            )
          )
        }
        migrated.push(imgUrl)
        if (tmpPath && tmpPath.startsWith(os.tmpdir())) {
          await fs.unlink(tmpPath).catch(() => {})
        }
      }
    }

    // Persist updates only if something migrated AND we didn't destroy array shape
    if (anyChange) {
      if (!DRY_RUN) {
        await productModel.updateOne({ _id: product._id }, { $set: { images: migrated } })
      }
      changed += 1
    } else {
      skipped += 1
    }
  }

  console.log(
    JSON.stringify(
      {
        dryRun: DRY_RUN,
        scanned,
        changed,
        skipped,
        failed,
      },
      null,
      2
    )
  )

  process.exit(0)
}

main().catch((e) => {
  console.error('Migration failed:', e?.message || e)
  process.exit(1)
})
