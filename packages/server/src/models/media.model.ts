import mongoose, { Schema, type Document } from 'mongoose'
import { MediaType } from '@slop-factory/shared'

export interface IMedia extends Document {
  type: MediaType
  filename: string
  originalName: string
  mimetype: string
  size: number
  path: string
  metadata: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const mediaSchema = new Schema<IMedia>(
  {
    type: {
      type: String,
      enum: Object.values(MediaType),
      required: true,
    },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  },
)

mediaSchema.index({ type: 1, createdAt: -1 })

export const Media = mongoose.model<IMedia>('Media', mediaSchema)
