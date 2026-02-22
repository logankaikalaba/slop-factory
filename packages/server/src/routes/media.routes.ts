import { Router, type Request, type Response } from 'express'
import { upload } from '../middleware/upload.js'
import { Media } from '../models/media.model.js'
import {
  MediaType,
  type ApiResponse,
  type MediaItem,
  type PaginatedResponse,
} from '@slop-factory/shared'
import {
  ALLOWED_IMAGE_MIMETYPES,
  ALLOWED_VIDEO_MIMETYPES,
} from '@slop-factory/shared'

const router = Router()

// POST /api/media/upload — upload one or more files
router.post(
  '/upload',
  upload.array('files', 10),
  async (req: Request, res: Response<ApiResponse<MediaItem[]>>) => {
    try {
      const files = req.files as Express.Multer.File[]
      if (!files || files.length === 0) {
        res.status(400).json({ success: false, error: 'No files uploaded' })
        return
      }

      const docs = await Promise.all(
        files.map(async (file) => {
          const type = getMediaType(file.mimetype)
          const doc = await Media.create({
            type,
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path,
            metadata: {},
          })
          return doc
        }),
      )

      const items: MediaItem[] = docs.map(toMediaItem)
      res.status(201).json({ success: true, data: items })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      res.status(500).json({ success: false, error: message })
    }
  },
)

// GET /api/media — list media with pagination
router.get(
  '/',
  async (req: Request, res: Response<PaginatedResponse<MediaItem>>) => {
    try {
      const page = Math.max(1, Number(req.query['page']) || 1)
      const limit = Math.min(100, Math.max(1, Number(req.query['limit']) || 20))
      const type = req.query['type'] as string | undefined

      const filter: Record<string, unknown> = {}
      if (type && Object.values(MediaType).includes(type as MediaType)) {
        filter['type'] = type
      }

      const [docs, total] = await Promise.all([
        Media.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        Media.countDocuments(filter),
      ])

      res.json({
        success: true,
        data: docs.map(toMediaItem),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to list media'
      res.status(500).json({
        success: false,
        error: message,
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      })
    }
  },
)

// GET /api/media/:id
router.get(
  '/:id',
  async (req: Request, res: Response<ApiResponse<MediaItem>>) => {
    try {
      const doc = await Media.findById(req.params['id'])
      if (!doc) {
        res.status(404).json({ success: false, error: 'Media not found' })
        return
      }
      res.json({ success: true, data: toMediaItem(doc) })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get media'
      res.status(500).json({ success: false, error: message })
    }
  },
)

// DELETE /api/media/:id
router.delete(
  '/:id',
  async (req: Request, res: Response<ApiResponse<null>>) => {
    try {
      const doc = await Media.findByIdAndDelete(req.params['id'])
      if (!doc) {
        res.status(404).json({ success: false, error: 'Media not found' })
        return
      }
      // Optionally delete actual file from disk here
      res.json({ success: true, message: 'Media deleted' })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete media'
      res.status(500).json({ success: false, error: message })
    }
  },
)

// Helpers

function getMediaType(mimetype: string): MediaType {
  if ((ALLOWED_IMAGE_MIMETYPES as readonly string[]).includes(mimetype)) {
    return MediaType.IMAGE
  }
  if ((ALLOWED_VIDEO_MIMETYPES as readonly string[]).includes(mimetype)) {
    return MediaType.VIDEO
  }
  return MediaType.TEXT
}

function toMediaItem(doc: InstanceType<typeof Media>): MediaItem {
  return {
    id: doc._id.toString(),
    type: doc.type,
    filename: doc.filename,
    originalName: doc.originalName,
    mimetype: doc.mimetype,
    size: doc.size,
    url: `/uploads/${doc.filename}`,
    metadata: doc.metadata,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }
}

export default router
