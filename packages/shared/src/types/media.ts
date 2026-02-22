export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  TEXT = 'text',
}

export interface MediaItem {
  id: string
  type: MediaType
  filename: string
  originalName: string
  mimetype: string
  size: number
  url: string
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface TextContent {
  id: string
  title: string
  body: string
  metadata: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export const ALLOWED_IMAGE_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const

export const ALLOWED_VIDEO_MIMETYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
] as const

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB
