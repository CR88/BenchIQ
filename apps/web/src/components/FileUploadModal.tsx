'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@benchiq/ui'
import { Card, CardHeader, CardTitle, CardContent } from '@benchiq/ui'

interface FileWithPreview {
  file: File
  preview?: string
  id: string
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  companyName?: string
}

interface Ticket {
  id: string
  ticketNumber: string
  title: string
  customer?: Customer
}

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: Ticket
  onFilesUploaded?: (files: FileWithPreview[]) => void
}

export function FileUploadModal({ isOpen, onClose, ticket, onFilesUploaded }: FileUploadModalProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Accepted file types
  const acceptedTypes = {
    // Images
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'image/bmp': ['.bmp'],
    'image/tiff': ['.tiff', '.tif'],
    'image/svg+xml': ['.svg'],

    // Documents
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-powerpoint': ['.ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    'text/plain': ['.txt'],
    'text/csv': ['.csv'],

    // Other common formats
    'application/zip': ['.zip'],
    'application/x-rar-compressed': ['.rar'],
    'application/x-7z-compressed': ['.7z'],
    'video/mp4': ['.mp4'],
    'video/avi': ['.avi'],
    'video/quicktime': ['.mov'],
    'audio/mpeg': ['.mp3'],
    'audio/wav': ['.wav']
  }

  const maxFileSize = 50 * 1024 * 1024 // 50MB
  const maxFiles = 10

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!Object.keys(acceptedTypes).includes(file.type)) {
      return `File type ${file.type} is not supported`
    }

    // Check file size
    if (file.size > maxFileSize) {
      return `File size must be less than ${maxFileSize / 1024 / 1024}MB`
    }

    return null
  }

  const createFilePreview = (file: File): Promise<FileWithPreview> => {
    return new Promise((resolve) => {
      const fileWithPreview: FileWithPreview = {
        file,
        id: Math.random().toString(36).substr(2, 9)
      }

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          fileWithPreview.preview = e.target?.result as string
          resolve(fileWithPreview)
        }
        reader.readAsDataURL(file)
      } else {
        resolve(fileWithPreview)
      }
    })
  }

  const handleFiles = useCallback(async (fileList: FileList) => {
    const newFiles: File[] = Array.from(fileList)

    if (files.length + newFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    setError(null)

    const validFiles: File[] = []
    const errors: string[] = []

    newFiles.forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      setError(errors.join('\n'))
    }

    if (validFiles.length > 0) {
      const filesWithPreview = await Promise.all(
        validFiles.map(file => createFilePreview(file))
      )

      setFiles(prev => [...prev, ...filesWithPreview])
    }
  }, [files.length])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
    setError(null)
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      // Simulate upload - in real implementation, upload to your backend
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Call onFilesUploaded callback
      if (onFilesUploaded) {
        onFilesUploaded(files)
      }

      // Reset and close
      setFiles([])
      onClose()

    } catch (error) {
      console.error('Upload error:', error)
      setError('Failed to upload files. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = (file: File) => {
    const type = file.type

    if (type.startsWith('image/')) return '🖼️'
    if (type.includes('pdf')) return '📄'
    if (type.includes('word') || type.includes('document')) return '📝'
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊'
    if (type.includes('powerpoint') || type.includes('presentation')) return '📈'
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return '🗜️'
    if (type.startsWith('video/')) return '🎥'
    if (type.startsWith('audio/')) return '🎵'
    if (type.includes('text')) return '📋'

    return '📁'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Upload Files - {ticket.ticketNumber}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {ticket.title}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          <div className="space-y-6">
            {/* Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload Photos & Documents</CardTitle>
                <p className="text-sm text-gray-600">
                  Drag and drop files here, or click to select files from your device
                </p>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="space-y-4">
                    <div className="text-6xl">📎</div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {dragActive ? 'Drop files here' : 'Choose files or drag them here'}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Supports: Images (JPG, PNG, GIF), Documents (PDF, DOC, XLS), Videos, Audio, and more
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Max file size: {maxFileSize / 1024 / 1024}MB • Max files: {maxFiles}
                      </p>
                    </div>
                    <Button type="button" variant="outline">
                      📱 Select from Device
                    </Button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={Object.values(acceptedTypes).flat().join(',')}
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* File List */}
            {files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Selected Files ({files.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {files.map((fileItem) => (
                      <div
                        key={fileItem.id}
                        className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        {/* File Preview/Icon */}
                        <div className="flex-shrink-0">
                          {fileItem.preview ? (
                            <img
                              src={fileItem.preview}
                              alt={fileItem.file.name}
                              className="w-12 h-12 object-cover rounded border"
                            />
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded border text-2xl">
                              {getFileIcon(fileItem.file)}
                            </div>
                          )}
                        </div>

                        {/* File Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {fileItem.file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(fileItem.file.size)} • {fileItem.file.type}
                          </p>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFile(fileItem.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          🗑️
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upload Actions */}
            {files.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Ready to upload {files.length} file{files.length !== 1 ? 's' : ''} for ticket {ticket.ticketNumber}
                    </div>
                    <div className="flex space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setFiles([])}
                        disabled={uploading}
                      >
                        Clear All
                      </Button>
                      <Button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="min-w-[120px]"
                      >
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>📤 Upload Files</>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Help Text */}
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Supported formats:</strong></p>
              <p><strong>Images:</strong> JPG, PNG, GIF, WebP, BMP, TIFF, SVG</p>
              <p><strong>Documents:</strong> PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, TXT, CSV</p>
              <p><strong>Media:</strong> MP4, AVI, MOV, MP3, WAV</p>
              <p><strong>Archives:</strong> ZIP, RAR, 7Z</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}