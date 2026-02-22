import mongoose, { Schema, type Document } from 'mongoose'

export interface ITextContent extends Document {
  title: string
  body: string
  metadata: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const textContentSchema = new Schema<ITextContent>(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  },
)

textContentSchema.index({ createdAt: -1 })

export const TextContent = mongoose.model<ITextContent>(
  'TextContent',
  textContentSchema,
)
