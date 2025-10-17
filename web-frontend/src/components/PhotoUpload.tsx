import React, { useState, useRef } from 'react'
import { Camera, Upload, X, Loader2, AlertCircle } from 'lucide-react'
import { uploadService } from '../services/api'

interface PhotoUploadProps {
  onPhotoUploaded: (url: string, publicId: string, id: string) => void
  onPhotoRemoved?: (publicId: string) => void
  existingPhotos?: Array<{ url: string; id: string }>
  maxPhotos?: number
  photoType: 'FACE' | 'FULL_BODY'
  className?: string
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onPhotoUploaded,
  onPhotoRemoved,
  existingPhotos = [],
  maxPhotos = 5,
  photoType,
  className = ''
}) => {

  console.log(existingPhotos)

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Check if we can upload more photos
    if (existingPhotos.length >= maxPhotos) {
      setError(`Maximum ${maxPhotos} photos allowed`)
      return
    }

    const file = files[0]
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    await uploadPhoto(file)
  }

  const uploadPhoto = async (file: File) => {
    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      console.log(photoType)

      const response = await uploadService.uploadImage(file, photoType)
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Call the callback with the uploaded photo URL
      if (onPhotoUploaded) {
        onPhotoUploaded(response.data.url, response.data.publicId, response.data.id)
      }

      // Reset state
      setTimeout(() => {
        setUploadProgress(0)
        setIsUploading(false)
      }, 500)

    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to upload photo')
      setIsUploading(false)
      setUploadProgress(0)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemovePhoto = async (photo: { url: string; id: string }) => {
    try {
      console.log(photo)
      if (photo.id && onPhotoRemoved) {
        console.log(photo)
        await uploadService.deleteImage(photo.id)
        onPhotoRemoved(photo.id)
      }
    } catch (error) {
      console.error('Failed to delete photo:', error)
    }
  }

  const canUploadMore = existingPhotos.length < maxPhotos

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Existing Photos Grid */}
      {existingPhotos.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {existingPhotos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo.url}
                alt={`${photoType} photo ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
              />
              {onPhotoRemoved && (
                <button
                  onClick={() => handleRemovePhoto(photo)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  title="Remove photo"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {canUploadMore && (
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <div className="space-y-2">
                <Loader2 className="w-8 h-8 text-primary-600 mx-auto animate-spin" />
                <div className="text-sm text-gray-600">
                  Uploading... {uploadProgress}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {photoType === 'FACE' ? (
                  <Camera className="w-8 h-8 text-gray-400 mx-auto" />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                )}
                <div className="text-sm font-medium text-gray-700">
                  Add {photoType === 'FACE' ? 'Face' : 'Body'} Photo
                </div>
                <div className="text-xs text-gray-500">
                  Click to upload or drag and drop
                </div>
              </div>
            )}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Photo Count */}
      <div className="text-xs text-gray-500 text-center">
        {existingPhotos.length} of {maxPhotos} photos uploaded
      </div>
    </div>
  )
}

export default PhotoUpload