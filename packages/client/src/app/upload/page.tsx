'use client'

import { useState, useRef, type ChangeEvent, type FormEvent } from 'react'
import { uploadMedia } from '@/lib/api'

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (files.length === 0) return

    setUploading(true)
    setMessage(null)

    try {
      const res = await uploadMedia(files)
      if (res.success) {
        setMessage(`Uploaded ${res.data?.length ?? 0} file(s) successfully!`)
        setFiles([])
        if (inputRef.current) inputRef.current.value = ''
      } else {
        setMessage(`Error: ${res.error}`)
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <h1 className="page-title">Upload</h1>

      <form onSubmit={handleSubmit}>
        <div className="upload-zone" onClick={() => inputRef.current?.click()}>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          {files.length > 0 ? (
            <p>
              {files.length} file(s) selected:{' '}
              {files.map((f) => f.name).join(', ')}
            </p>
          ) : (
            <div>
              <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                Drop files here or click to browse
              </p>
              <p className="text-muted">
                Supports images (JPG, PNG, GIF, WebP) and video (MP4, WebM, MOV)
              </p>
            </div>
          )}
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={files.length === 0 || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </form>

      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  )
}
