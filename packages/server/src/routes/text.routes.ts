import { Router, type Request, type Response } from 'express'
import { TextContent } from '../models/text.model.js'
import type {
  ApiResponse,
  TextContent as TextContentType,
  PaginatedResponse,
} from '@slop-factory/shared'

const router = Router()

// POST /api/text — create text content
router.post(
  '/',
  async (req: Request, res: Response<ApiResponse<TextContentType>>) => {
    try {
      const { title, body, metadata } = req.body as {
        title?: string
        body?: string
        metadata?: Record<string, unknown>
      }

      if (!title || !body) {
        res
          .status(400)
          .json({ success: false, error: 'title and body are required' })
        return
      }

      const doc = await TextContent.create({
        title,
        body,
        metadata: metadata ?? {},
      })

      res.status(201).json({
        success: true,
        data: toTextContent(doc),
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create text'
      res.status(500).json({ success: false, error: message })
    }
  },
)

// GET /api/text — list text content
router.get(
  '/',
  async (req: Request, res: Response<PaginatedResponse<TextContentType>>) => {
    try {
      const page = Math.max(1, Number(req.query['page']) || 1)
      const limit = Math.min(100, Math.max(1, Number(req.query['limit']) || 20))

      const [docs, total] = await Promise.all([
        TextContent.find()
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        TextContent.countDocuments(),
      ])

      res.json({
        success: true,
        data: docs.map(toTextContent),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to list text'
      res.status(500).json({
        success: false,
        error: message,
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      })
    }
  },
)

// GET /api/text/:id
router.get(
  '/:id',
  async (req: Request, res: Response<ApiResponse<TextContentType>>) => {
    try {
      const doc = await TextContent.findById(req.params['id'])
      if (!doc) {
        res
          .status(404)
          .json({ success: false, error: 'Text content not found' })
        return
      }
      res.json({ success: true, data: toTextContent(doc) })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get text'
      res.status(500).json({ success: false, error: message })
    }
  },
)

// DELETE /api/text/:id
router.delete(
  '/:id',
  async (req: Request, res: Response<ApiResponse<null>>) => {
    try {
      const doc = await TextContent.findByIdAndDelete(req.params['id'])
      if (!doc) {
        res
          .status(404)
          .json({ success: false, error: 'Text content not found' })
        return
      }
      res.json({ success: true, message: 'Text content deleted' })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete text'
      res.status(500).json({ success: false, error: message })
    }
  },
)

// Helper

function toTextContent(doc: InstanceType<typeof TextContent>): TextContentType {
  return {
    id: doc._id.toString(),
    title: doc.title,
    body: doc.body,
    metadata: doc.metadata,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }
}

export default router
