import type { Request, Response, NextFunction } from 'express'
import type { ApiResponse } from '@slop-factory/shared'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ApiResponse<never>>,
  _next: NextFunction,
): void {
  console.error('[error]', err.message)

  if (
    err.message.includes('File type') &&
    err.message.includes('not allowed')
  ) {
    res.status(400).json({
      success: false,
      error: err.message,
    })
    return
  }

  if (err.name === 'MulterError') {
    res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`,
    })
    return
  }

  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: err.message,
    })
    return
  }

  res.status(500).json({
    success: false,
    error:
      process.env['NODE_ENV'] === 'production'
        ? 'Internal server error'
        : err.message,
  })
}
