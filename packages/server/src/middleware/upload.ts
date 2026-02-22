import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { env } from '../config/env.js'
import {
  ALLOWED_IMAGE_MIMETYPES,
  ALLOWED_VIDEO_MIMETYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from '@slop-factory/shared'

// Ensure upload directory exists
const uploadDir = path.resolve(env.UPLOAD_DIR)
fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir)
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = crypto.randomUUID()
    const ext = path.extname(file.originalname)
    cb(null, `${uniqueSuffix}${ext}`)
  },
})

const allowedMimetypes = [
  ...ALLOWED_IMAGE_MIMETYPES,
  ...ALLOWED_VIDEO_MIMETYPES,
] as readonly string[]

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  if (allowedMimetypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_VIDEO_SIZE, // Use the larger limit; per-type validation in route
  },
})

export { MAX_IMAGE_SIZE, MAX_VIDEO_SIZE }
