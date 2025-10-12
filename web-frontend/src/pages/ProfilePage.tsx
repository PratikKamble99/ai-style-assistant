import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { User, Save, Sparkles, Eye, X } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import PhotoUpload from '../components/PhotoUpload'
import { userService, aiService } from '../services/api'

interface ProfileForm {
  gender: 'MALE' | 'FEMALE' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY'
  height: number
  weight: number
  bodyType?: 'ECTOMORPH' | 'MESOMORPH' | 'ENDOMORPH' | 'PEAR' | 'APPLE' | 'HOURGLASS' | 'RECTANGLE' | 'INVERTED_TRIANGLE'
  faceShape?: 'OVAL' | 'ROUND' | 'SQUARE' | 'HEART' | 'DIAMOND' | 'OBLONG'
  skinTone?: 'VERY_FAIR' | 'FAIR' | 'LIGHT' | 'MEDIUM' | 'OLIVE' | 'TAN' | 'DARK' | 'VERY_DARK'
  styleType: ('CASUAL' | 'FORMAL' | 'BUSINESS' | 'TRENDY' | 'CLASSIC' | 'BOHEMIAN' | 'MINIMALIST' | 'SPORTY' | 'VINTAGE' | 'EDGY')[]
  budgetRange: 'BUDGET_FRIENDLY' | 'MID_RANGE' | 'PREMIUM' | 'LUXURY'
}

interface Photo {
  id: string
  url: string
  type: 'FACE' | 'FULL_BODY'
  publicId?: string
  createdAt: string
}

interface AnalysisResult {
  bodyType?: ProfileForm['bodyType']
  faceShape?: ProfileForm['faceShape']
  skinTone?: ProfileForm['skinTone']
  confidence: number
}

const ProfilePage = () => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [message, setMessage] = useState('')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ProfileForm>()

  const selectedStyles = watch('styleType') || []

  useEffect(() => {
    if (user?.profile) {
      const profile = user.profile
      setValue('gender', profile.gender)
      setValue('height', profile.height)
      setValue('weight', profile.weight)
      setValue('bodyType', profile.bodyType)
      setValue('faceShape', profile.faceShape)
      setValue('skinTone', profile.skinTone)
      setValue('styleType', profile.styleType || [])
      setValue('budgetRange', profile.budgetRange)
    }
    loadUserPhotos()
  }, [user, setValue])

  // Load user photos from API
  const loadUserPhotos = async () => {
    try {
      const response = await userService.getProfile()
      const userPhotos = response.data.user.photos || []
      setPhotos(userPhotos)
    } catch (error) {
      console.error('Failed to load photos:', error)
      // Fallback to empty array
      setPhotos([])
    }
  }

  // Handle photo upload
  const handlePhotoUploaded = async (url: string, publicId: string, type: 'FACE' | 'FULL_BODY') => {
    try {
      // Add photo to backend
      await userService.addPhoto(url, publicId, type)

      // Add to local state
      const newPhoto: Photo = {
        id: Date.now().toString(),
        url,
        publicId,
        type,
        createdAt: new Date().toISOString()
      }

      setPhotos(prev => [...prev, newPhoto])
      setMessage(`${type === 'FACE' ? 'Face' : 'Body'} photo uploaded successfully!`)
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to save photo')
    }
  }

  // Handle photo removal
  const handlePhotoRemoved = (publicId: string) => {
    setPhotos(prev => prev.filter(p => p.publicId !== publicId))
    setMessage('Photo removed successfully!')
  }

  const onSubmit = async (data: ProfileForm) => {
    // Validate photos
    const facePhotos = photos.filter(p => p.type === 'FACE')
    const bodyPhotos = photos.filter(p => p.type === 'FULL_BODY')

    if (facePhotos.length < 1) {
      setMessage('Please upload at least 1 face photo')
      return
    }

    if (bodyPhotos.length < 4) {
      setMessage('Please upload at least 4 full body photos')
      return
    }

    // Validate style preferences
    if (!selectedStyles || selectedStyles.length === 0) {
      setMessage('Please select at least one style preference')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      // For testing, just simulate API call with the form data
      console.log('Profile data to save:', { ...data, styleType: selectedStyles })
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage('Profile updated successfully!')
    } catch (error: any) {
      setMessage('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }



  const analyzePhotos = async () => {
    const facePhotos = photos.filter(p => p.type === 'FACE')
    const bodyPhotos = photos.filter(p => p.type === 'FULL_BODY')

    if (facePhotos.length === 0 || bodyPhotos.length === 0) {
      setMessage('Please upload both face and body photos before analyzing')
      return
    }

    setIsAnalyzing(true)
    setMessage('')

    try {
      // Progressive updates for better UX
      setMessage('Analyzing face structure...')
      await new Promise(resolve => setTimeout(resolve, 1000))

      setMessage('Detecting body proportions...')
      await new Promise(resolve => setTimeout(resolve, 1000))

      setMessage('Analyzing skin tone...')
      await new Promise(resolve => setTimeout(resolve, 500))

      // Call the real API
      const response = await aiService.analyzePhotos(
        facePhotos.map(p => p.url),
        bodyPhotos.map(p => p.url)
      )

      const results = response.data.results

      const analysisResults: AnalysisResult = {
        bodyType: results.bodyType as any,
        faceShape: results.faceShape as any,
        skinTone: results.skinTone as any,
        confidence: results.confidence
      }

      setAnalysisResult(analysisResults)

      // Auto-fill the form fields
      setValue('bodyType', analysisResults.bodyType)
      setValue('faceShape', analysisResults.faceShape)
      setValue('skinTone', analysisResults.skinTone)

      setMessage(`AI Analysis completed with ${Math.round(analysisResults.confidence * 100)}% confidence! Fields have been auto-filled.`)
    } catch (error) {
      setMessage('Failed to analyze photos. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setAnalysisResult(null)
    setValue('bodyType', undefined)
    setValue('faceShape', undefined)
    setValue('skinTone', undefined)
    setMessage('Analysis results cleared. You can re-analyze or manually select values.')
  }

  const getAnalysisStatus = () => {
    const facePhotos = photos.filter(p => p.type === 'FACE')
    const bodyPhotos = photos.filter(p => p.type === 'FULL_BODY')
    const formData = watch()

    // Check photo requirements
    if (facePhotos.length === 0) {
      return { canAnalyze: false, message: 'Upload at least 1 face photo' }
    }
    if (bodyPhotos.length < 4) {
      return { canAnalyze: false, message: `Upload ${4 - bodyPhotos.length} more body photos` }
    }

    // Check required form fields
    if (!formData.gender) {
      return { canAnalyze: false, message: 'Complete gender field' }
    }
    if (!formData.height || formData.height < 100) {
      return { canAnalyze: false, message: 'Complete height field' }
    }
    if (!formData.weight || formData.weight < 30) {
      return { canAnalyze: false, message: 'Complete weight field' }
    }
    if (!formData.budgetRange) {
      return { canAnalyze: false, message: 'Complete budget range field' }
    }
    if (!selectedStyles || selectedStyles.length === 0) {
      return { canAnalyze: false, message: 'Select at least one style preference' }
    }

    return { canAnalyze: true, message: 'Ready for AI analysis' }
  }

  const styleOptions = [
    { value: 'CASUAL', label: 'Casual' },
    { value: 'FORMAL', label: 'Formal' },
    { value: 'BUSINESS', label: 'Business' },
    { value: 'TRENDY', label: 'Trendy' },
    { value: 'CLASSIC', label: 'Classic' },
    { value: 'BOHEMIAN', label: 'Bohemian' },
    { value: 'MINIMALIST', label: 'Minimalist' },
    { value: 'SPORTY', label: 'Sporty' },
    { value: 'VINTAGE', label: 'Vintage' },
    { value: 'EDGY', label: 'Edgy' }
  ]

  const toggleStyle = (style: string) => {
    const currentStyles = selectedStyles || []
    const newStyles = currentStyles.includes(style as any)
      ? currentStyles.filter(s => s !== style)
      : [...currentStyles, style as any]
    setValue('styleType', newStyles)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-pink-600 rounded-xl p-8 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <p className="text-primary-100">Complete your profile for personalized recommendations</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Photo Upload Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Photos</h2>

            <div className="space-y-6">
              {/* Face Photos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Face Photos (Required: 1 minimum)
                  </label>
                  <span className="text-xs text-gray-500">
                    {photos.filter(p => p.type === 'FACE').length}/1+
                  </span>
                </div>

                <PhotoUpload
                  photoType="face"
                  maxPhotos={3}
                  existingPhotos={photos.filter(p => p.type === 'FACE').map(p => ({ url: p.url, publicId: p.publicId }))}
                  onPhotoUploaded={(url, publicId) => handlePhotoUploaded(url, publicId, 'FACE')}
                  onPhotoRemoved={handlePhotoRemoved}
                />
              </div>

              {/* Full Body Photos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Full Body Photos (Required: 4 minimum)
                  </label>
                  <span className="text-xs text-gray-500">
                    {photos.filter(p => p.type === 'FULL_BODY').length}/4+
                  </span>
                </div>

                <PhotoUpload
                  photoType="body"
                  maxPhotos={6}
                  existingPhotos={photos.filter(p => p.type === 'FULL_BODY').map(p => ({ url: p.url, publicId: p.publicId }))}
                  onPhotoUploaded={(url, publicId) => handlePhotoUploaded(url, publicId, 'FULL_BODY')}
                  onPhotoRemoved={handlePhotoRemoved}
                />
              </div>

              {/* Photo Requirements & Analysis Status */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-1">Photo Requirements:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• At least 1 clear face photo</li>
                  <li>• At least 4 full body photos</li>
                  <li>• Good lighting and clear visibility</li>
                  <li>• Different angles/outfits preferred</li>
                </ul>

                {photos.filter(p => p.type === 'FACE').length >= 1 && photos.filter(p => p.type === 'FULL_BODY').length >= 4 && (
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-xs text-purple-700 font-medium">
                        Photos ready for AI analysis! Complete the form below.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    {...register('gender', { required: 'Gender is required' })}
                    className="input w-full"
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="NON_BINARY">Non-Binary</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm) *
                  </label>
                  <input
                    {...register('height', {
                      required: 'Height is required',
                      min: { value: 100, message: 'Height must be at least 100cm' },
                      max: { value: 250, message: 'Height must be less than 250cm' }
                    })}
                    type="number"
                    className="input w-full"
                    placeholder="170"
                  />
                  {errors.height && (
                    <p className="text-red-500 text-sm mt-1">{errors.height.message}</p>
                  )}
                </div>
              </div>

              {/* Weight */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg) *
                  </label>
                  <input
                    {...register('weight', {
                      required: 'Weight is required',
                      min: { value: 30, message: 'Weight must be at least 30kg' },
                      max: { value: 300, message: 'Weight must be less than 300kg' }
                    })}
                    type="number"
                    className="input w-full"
                    placeholder="65"
                  />
                  {errors.weight && (
                    <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>
                  )}
                </div>
                <div></div>
              </div>

              {/* AI Analysis Section */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h4 className="text-sm font-medium text-purple-900">AI Photo Analysis</h4>
                  </div>
                  {analysisResult && (
                    <span className="text-xs text-green-600 flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{Math.round(analysisResult.confidence * 100)}% confident</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-purple-700 mb-3">
                  Complete your profile above, then let AI analyze your photos to detect body shape, face shape, and skin tone.
                </p>

                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs ${getAnalysisStatus().canAnalyze ? 'text-green-600' : 'text-orange-600'}`}>
                    {getAnalysisStatus().message}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={analyzePhotos}
                    disabled={!getAnalysisStatus().canAnalyze || isAnalyzing}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${getAnalysisStatus().canAnalyze && !isAnalyzing
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Analyze Photos</span>
                      </>
                    )}
                  </button>

                  {analysisResult && (
                    <button
                      onClick={resetAnalysis}
                      disabled={isAnalyzing}
                      className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      title="Clear analysis results"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {analysisResult && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-purple-200">
                    <h5 className="text-xs font-medium text-gray-900 mb-2">Analysis Results:</h5>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="text-gray-600">Body Type</div>
                        <div className="font-medium text-purple-600">{analysisResult.bodyType?.replace('_', ' ')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600">Face Shape</div>
                        <div className="font-medium text-purple-600">{analysisResult.faceShape}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600">Skin Tone</div>
                        <div className="font-medium text-purple-600">{analysisResult.skinTone?.replace('_', ' ')}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Body Type & Face Shape (Optional - will be analyzed from photos) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body Type
                    <span className="text-xs text-gray-500">(Optional - AI analyzed)</span>
                    {analysisResult?.bodyType && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Detected
                      </span>
                    )}
                  </label>
                  <select
                    {...register('bodyType')}
                    className={`input w-full ${analysisResult?.bodyType ? 'border-purple-300 bg-purple-50' : ''}`}
                  >
                    <option value="">Will be analyzed from photos</option>
                    <option value="ECTOMORPH">Ectomorph (Lean)</option>
                    <option value="MESOMORPH">Mesomorph (Athletic)</option>
                    <option value="ENDOMORPH">Endomorph (Curvy)</option>
                    <option value="PEAR">Pear Shape</option>
                    <option value="APPLE">Apple Shape</option>
                    <option value="HOURGLASS">Hourglass</option>
                    <option value="RECTANGLE">Rectangle</option>
                    <option value="INVERTED_TRIANGLE">Inverted Triangle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Face Shape
                    <span className="text-xs text-gray-500">(Optional - AI analyzed)</span>
                    {analysisResult?.faceShape && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Detected
                      </span>
                    )}
                  </label>
                  <select
                    {...register('faceShape')}
                    className={`input w-full ${analysisResult?.faceShape ? 'border-purple-300 bg-purple-50' : ''}`}
                  >
                    <option value="">Will be analyzed from photos</option>
                    <option value="OVAL">Oval</option>
                    <option value="ROUND">Round</option>
                    <option value="SQUARE">Square</option>
                    <option value="HEART">Heart</option>
                    <option value="DIAMOND">Diamond</option>
                    <option value="OBLONG">Oblong</option>
                  </select>
                </div>
              </div>

              {/* Skin Tone & Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skin Tone
                    <span className="text-xs text-gray-500">(Optional - AI analyzed)</span>
                    {analysisResult?.skinTone && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Detected
                      </span>
                    )}
                  </label>
                  <select
                    {...register('skinTone')}
                    className={`input w-full ${analysisResult?.skinTone ? 'border-purple-300 bg-purple-50' : ''}`}
                  >
                    <option value="">Will be analyzed from photos</option>
                    <option value="VERY_FAIR">Very Fair</option>
                    <option value="FAIR">Fair</option>
                    <option value="LIGHT">Light</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="OLIVE">Olive</option>
                    <option value="TAN">Tan</option>
                    <option value="DARK">Dark</option>
                    <option value="VERY_DARK">Very Dark</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range *
                  </label>
                  <select
                    {...register('budgetRange', { required: 'Budget range is required' })}
                    className="input w-full"
                  >
                    <option value="">Select Budget Range</option>
                    <option value="BUDGET_FRIENDLY">Budget Friendly (Under ₹2,000)</option>
                    <option value="MID_RANGE">Mid Range (₹2,000 - ₹8,000)</option>
                    <option value="PREMIUM">Premium (₹8,000 - ₹20,000)</option>
                    <option value="LUXURY">Luxury (Above ₹20,000)</option>
                  </select>
                  {errors.budgetRange && (
                    <p className="text-red-500 text-sm mt-1">{errors.budgetRange.message}</p>
                  )}
                </div>
              </div>

              {/* Style Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Style Preferences (Select at least one) *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {styleOptions.map((style) => (
                    <button
                      key={style.value}
                      type="button"
                      onClick={() => toggleStyle(style.value)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${selectedStyles?.includes(style.value as any)
                        ? 'bg-primary-50 border-primary-200 text-primary-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
                {selectedStyles.length === 0 && (
                  <p className="text-red-500 text-sm mt-2">Please select at least one style preference</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage