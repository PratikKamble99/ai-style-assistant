import { useState, useEffect } from 'react'

import { Sparkles, Share2, ThumbsUp, ThumbsDown, ShoppingBag, Camera, ExternalLink, Star, Heart, Wand2, TrendingUp, Calendar, Flame } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

interface Product {
  id: string
  name: string
  brand: string
  price: number
  originalPrice?: number
  imageUrl: string
  productUrl: string
  category: string
  rating?: number
  inStock: boolean
}

interface Suggestion {
  id: string
  occasion: string
  outfitDesc: string
  hairstyle?: string
  accessories?: string
  skincare?: string
  colors: string[]
  outfitImageUrl?: string
  styleImageUrl?: string
  createdAt: string
  products: Product[]
  confidence: number
}

interface SeasonalTrend {
  id: string
  title: string
  description: string
  season: string
  popularity: number
  imageUrl: string
  colors: string[]
  keyPieces: string[]
  products: Product[]
  tags: string[]
}

const SuggestionsPage = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [seasonalTrends, setSeasonalTrends] = useState<SeasonalTrend[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingTrends, setIsLoadingTrends] = useState(false)
  const [selectedOccasion, setSelectedOccasion] = useState<string>('')
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'suggestions' | 'trends'>('suggestions')

  const occasions = [
    { value: 'CASUAL', label: 'Casual', icon: '👕' },
    { value: 'OFFICE', label: 'Office', icon: '💼' },
    { value: 'DATE', label: 'Date', icon: '💕' },
    { value: 'WEDDING', label: 'Wedding', icon: '💒' },
    { value: 'PARTY', label: 'Party', icon: '🎉' },
    { value: 'FORMAL_EVENT', label: 'Formal Event', icon: '🎭' },
    { value: 'VACATION', label: 'Vacation', icon: '🏖️' },
    { value: 'WORKOUT', label: 'Workout', icon: '💪' },
    { value: 'INTERVIEW', label: 'Interview', icon: '📋' }
  ]

  useEffect(() => {
    fetchSuggestions()
    fetchSeasonalTrends()
  }, [])

  const fetchSeasonalTrends = async () => {
    setIsLoadingTrends(true)
    try {
      // Mock seasonal trends data
      const mockTrends: SeasonalTrend[] = [
        {
          id: '1',
          title: 'Winter Cozy Layers',
          description: 'Embrace the art of layering with cozy knits, oversized blazers, and warm textures. Perfect for staying stylish during the colder months.',
          season: 'Winter 2024',
          popularity: 95,
          imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
          colors: ['#8B4513', '#F5DEB3', '#2F4F4F', '#FFFFFF'],
          keyPieces: ['Oversized Blazer', 'Chunky Knit Sweater', 'Wide-leg Trousers', 'Ankle Boots'],
          tags: ['Cozy', 'Layering', 'Neutral Tones'],
          products: [
            {
              id: 't1-p1',
              name: 'Oversized Wool Blazer',
              brand: 'Zara',
              price: 7999,
              originalPrice: 9999,
              imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop',
              productUrl: 'https://zara.com/wool-blazer',
              category: 'Blazers',
              rating: 4.6,
              inStock: true
            },
            {
              id: 't1-p2',
              name: 'Chunky Knit Sweater',
              brand: 'H&M',
              price: 2999,
              imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&h=200&fit=crop',
              productUrl: 'https://hm.com/knit-sweater',
              category: 'Sweaters',
              rating: 4.4,
              inStock: true
            }
          ]
        },
        {
          id: '2',
          title: 'Minimalist Chic',
          description: 'Clean lines, neutral colors, and timeless pieces define this trend. Less is more with carefully curated wardrobe essentials.',
          season: 'All Season',
          popularity: 88,
          imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=300&fit=crop',
          colors: ['#FFFFFF', '#000000', '#F5F5F5', '#C0C0C0'],
          keyPieces: ['White Button Shirt', 'Black Trousers', 'Minimalist Bag', 'Classic Sneakers'],
          tags: ['Minimalist', 'Timeless', 'Neutral'],
          products: [
            {
              id: 't2-p1',
              name: 'Classic White Shirt',
              brand: 'COS',
              price: 3999,
              imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
              productUrl: 'https://cos.com/white-shirt',
              category: 'Shirts',
              rating: 4.7,
              inStock: true
            }
          ]
        },
        {
          id: '3',
          title: 'Bold Color Blocking',
          description: 'Make a statement with vibrant colors and bold combinations. This trend is all about confidence and creative expression.',
          season: 'Spring 2024',
          popularity: 76,
          imageUrl: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=300&fit=crop',
          colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
          keyPieces: ['Bright Blazer', 'Colorful Dress', 'Statement Accessories', 'Bold Shoes'],
          tags: ['Bold', 'Colorful', 'Statement'],
          products: [
            {
              id: 't3-p1',
              name: 'Bright Coral Blazer',
              brand: 'Mango',
              price: 5999,
              originalPrice: 7999,
              imageUrl: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=200&h=200&fit=crop',
              productUrl: 'https://mango.com/coral-blazer',
              category: 'Blazers',
              rating: 4.3,
              inStock: true
            }
          ]
        }
      ]
      
      setSeasonalTrends(mockTrends)
    } catch (error) {
      setMessage('Failed to fetch seasonal trends')
    } finally {
      setIsLoadingTrends(false)
    }
  }

  const fetchSuggestions = async () => {
    setIsLoading(true)
    try {
      // Mock data for testing
      const mockSuggestions: Suggestion[] = [
        {
          id: '1',
          occasion: 'OFFICE',
          outfitDesc: 'A sophisticated business casual look featuring a tailored blazer in navy blue paired with well-fitted trousers. Complete the look with a crisp white button-down shirt and comfortable yet professional loafers.',
          hairstyle: 'Sleek low bun or professional side-parted hairstyle',
          accessories: 'Minimalist watch, structured handbag, and subtle stud earrings',
          skincare: 'Use a lightweight moisturizer with SPF and a natural-looking foundation',
          colors: ['#1e3a8a', '#ffffff', '#374151', '#d1d5db'],
          outfitImageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
          styleImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
          createdAt: '2024-01-15T10:30:00Z',
          confidence: 0.92,
          products: [
            {
              id: 'p1',
              name: 'Classic Navy Blazer',
              brand: 'Zara',
              price: 4999,
              originalPrice: 6999,
              imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
              productUrl: 'https://zara.com/blazer-navy',
              category: 'Blazers',
              rating: 4.5,
              inStock: true
            },
            {
              id: 'p2',
              name: 'White Cotton Shirt',
              brand: 'H&M',
              price: 1999,
              imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
              productUrl: 'https://hm.com/white-shirt',
              category: 'Shirts',
              rating: 4.2,
              inStock: true
            },
            {
              id: 'p3',
              name: 'Formal Trousers',
              brand: 'Mango',
              price: 2999,
              imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=200&fit=crop',
              productUrl: 'https://mango.com/trousers',
              category: 'Trousers',
              rating: 4.3,
              inStock: true
            },
            {
              id: 'p4',
              name: 'Professional Loafers',
              brand: 'Clarks',
              price: 5999,
              imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop',
              productUrl: 'https://clarks.com/loafers',
              category: 'Shoes',
              rating: 4.7,
              inStock: true
            }
          ]
        },
        {
          id: '2',
          occasion: 'DATE',
          outfitDesc: 'A romantic and elegant outfit perfect for a dinner date. Features a flowing midi dress in a soft blush pink with delicate lace details, paired with comfortable block heels and a light cardigan.',
          hairstyle: 'Soft waves or a romantic updo with face-framing pieces',
          accessories: 'Delicate jewelry, small crossbody bag, and a light scarf',
          skincare: 'Dewy makeup look with subtle highlighter and soft pink lips',
          colors: ['#fce7f3', '#ec4899', '#374151', '#f3f4f6'],
          outfitImageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop',
          styleImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face',
          createdAt: '2024-01-14T18:45:00Z',
          confidence: 0.88,
          products: [
            {
              id: 'p5',
              name: 'Blush Pink Midi Dress',
              brand: 'Forever 21',
              price: 3499,
              originalPrice: 4999,
              imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&h=200&fit=crop',
              productUrl: 'https://forever21.com/midi-dress',
              category: 'Dresses',
              rating: 4.4,
              inStock: true
            },
            {
              id: 'p6',
              name: 'Block Heel Sandals',
              brand: 'Steve Madden',
              price: 4999,
              imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200&h=200&fit=crop',
              productUrl: 'https://stevemadden.com/heels',
              category: 'Shoes',
              rating: 4.6,
              inStock: true
            }
          ]
        }
      ]
      
      setSuggestions(mockSuggestions)
    } catch (error: any) {
      setMessage('Failed to fetch suggestions')
    } finally {
      setIsLoading(false)
    }
  }

  const generateSuggestion = async () => {
    if (!selectedOccasion) {
      setMessage('Please select an occasion')
      return
    }

    setIsGenerating(true)
    setMessage('')
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Generate mock suggestion based on occasion
      const mockSuggestion: Suggestion = {
        id: Date.now().toString(),
        occasion: selectedOccasion,
        outfitDesc: generateOutfitDescription(selectedOccasion),
        hairstyle: generateHairstyle(selectedOccasion),
        accessories: generateAccessories(selectedOccasion),
        skincare: generateSkincareAdvice(selectedOccasion),
        colors: generateColors(selectedOccasion),
        outfitImageUrl: generateOutfitImage(selectedOccasion),
        styleImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
        createdAt: new Date().toISOString(),
        confidence: 0.85 + (Math.random() * 0.12), // 85-97% confidence
        products: generateProducts(selectedOccasion)
      }
      
      setSuggestions(prev => [mockSuggestion, ...prev])
      setMessage('New style suggestion generated with AI-powered outfit photo!')
      setSelectedOccasion('')
    } catch (error: any) {
      setMessage('Failed to generate suggestion')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateOutfitDescription = (occasion: string): string => {
    const descriptions: Record<string, string> = {
      CASUAL: 'A comfortable yet stylish casual look featuring well-fitted jeans, a soft cotton t-shirt, and a versatile denim jacket. Perfect for everyday activities while maintaining a put-together appearance.',
      OFFICE: 'A professional business casual ensemble with a tailored blazer, crisp button-down shirt, and well-fitted trousers. Combines comfort with sophistication for the workplace.',
      DATE: 'An elegant and romantic outfit featuring a flowing dress with delicate details, paired with comfortable heels and subtle accessories for a perfect date night look.',
      WEDDING: 'A sophisticated wedding guest outfit with a midi dress in appropriate colors, elegant heels, and tasteful accessories that respect the occasion while looking stunning.',
      PARTY: 'A fun and festive party look with a statement piece, bold accessories, and comfortable dancing shoes. Perfect for celebrating while looking fabulous.',
      FORMAL_EVENT: 'An elegant formal ensemble with a sophisticated dress or suit, refined accessories, and polished shoes suitable for upscale events.',
      VACATION: 'A comfortable and stylish vacation outfit with breathable fabrics, versatile pieces, and practical accessories perfect for exploring new places.',
      WORKOUT: 'High-performance activewear with moisture-wicking fabrics, supportive sports bra, and comfortable athletic shoes designed for your fitness routine.',
      INTERVIEW: 'A polished and professional interview outfit that conveys confidence and competence while remaining appropriate for the company culture.'
    }
    return descriptions[occasion] || 'A stylish outfit perfect for the occasion.'
  }

  const generateHairstyle = (occasion: string): string => {
    const hairstyles: Record<string, string> = {
      CASUAL: 'Relaxed waves or a messy bun for an effortless look',
      OFFICE: 'Sleek low bun or professional side-parted style',
      DATE: 'Soft romantic waves or an elegant updo',
      WEDDING: 'Sophisticated updo or polished curls',
      PARTY: 'Voluminous curls or a trendy braided style',
      FORMAL_EVENT: 'Classic chignon or sleek straight hair',
      VACATION: 'Beachy waves or a practical ponytail',
      WORKOUT: 'High ponytail or secure braids',
      INTERVIEW: 'Neat and polished style that frames your face well'
    }
    return hairstyles[occasion] || 'A hairstyle that complements your look'
  }

  const generateAccessories = (occasion: string): string => {
    const accessories: Record<string, string> = {
      CASUAL: 'Simple jewelry, crossbody bag, and comfortable sneakers',
      OFFICE: 'Professional watch, structured handbag, and minimal jewelry',
      DATE: 'Delicate jewelry, small clutch, and elegant heels',
      WEDDING: 'Statement earrings, formal clutch, and dressy shoes',
      PARTY: 'Bold jewelry, fun handbag, and dancing-friendly heels',
      FORMAL_EVENT: 'Sophisticated jewelry, evening clutch, and formal shoes',
      VACATION: 'Sunglasses, comfortable backpack, and walking shoes',
      WORKOUT: 'Fitness tracker, water bottle, and athletic accessories',
      INTERVIEW: 'Minimal professional jewelry and a polished handbag'
    }
    return accessories[occasion] || 'Accessories that complement your outfit'
  }

  const generateSkincareAdvice = (occasion: string): string => {
    const skincare: Record<string, string> = {
      CASUAL: 'Light moisturizer with SPF and tinted lip balm',
      OFFICE: 'Professional makeup with good coverage and long-lasting formula',
      DATE: 'Dewy skin with subtle highlighter and romantic lip color',
      WEDDING: 'Long-lasting makeup that photographs well',
      PARTY: 'Bold makeup with statement lips or eyes',
      FORMAL_EVENT: 'Elegant makeup with sophisticated color palette',
      VACATION: 'Waterproof makeup and strong SPF protection',
      WORKOUT: 'Minimal makeup and sweat-resistant products',
      INTERVIEW: 'Natural, polished makeup that enhances your features'
    }
    return skincare[occasion] || 'Skincare and makeup tips for your look'
  }

  const generateColors = (occasion: string): string[] => {
    const colorPalettes: Record<string, string[]> = {
      CASUAL: ['#3b82f6', '#ffffff', '#6b7280', '#f3f4f6'],
      OFFICE: ['#1e3a8a', '#ffffff', '#374151', '#d1d5db'],
      DATE: ['#fce7f3', '#ec4899', '#374151', '#f3f4f6'],
      WEDDING: ['#fef3c7', '#f59e0b', '#374151', '#f9fafb'],
      PARTY: ['#7c3aed', '#ec4899', '#000000', '#ffffff'],
      FORMAL_EVENT: ['#000000', '#ffffff', '#6b7280', '#f3f4f6'],
      VACATION: ['#06b6d4', '#ffffff', '#fbbf24', '#f3f4f6'],
      WORKOUT: ['#ef4444', '#000000', '#6b7280', '#ffffff'],
      INTERVIEW: ['#1f2937', '#ffffff', '#6b7280', '#f9fafb']
    }
    return colorPalettes[occasion] || ['#3b82f6', '#ffffff', '#6b7280', '#f3f4f6']
  }

  const generateOutfitImage = (occasion: string): string => {
    const images: Record<string, string> = {
      CASUAL: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop',
      OFFICE: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
      DATE: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop',
      WEDDING: 'https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1b5?w=400&h=600&fit=crop',
      PARTY: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=600&fit=crop',
      FORMAL_EVENT: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=400&h=600&fit=crop',
      VACATION: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop',
      WORKOUT: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop',
      INTERVIEW: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop'
    }
    return images[occasion] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop'
  }

  const generateProducts = (_occasion: string): Product[] => {
    // Mock products based on occasion
    const baseProducts: Product[] = [
      {
        id: `${Date.now()}-1`,
        name: 'Stylish Top',
        brand: 'Zara',
        price: 2999,
        originalPrice: 3999,
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
        productUrl: 'https://zara.com/top',
        category: 'Tops',
        rating: 4.5,
        inStock: true
      },
      {
        id: `${Date.now()}-2`,
        name: 'Perfect Bottoms',
        brand: 'H&M',
        price: 2499,
        imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=200&fit=crop',
        productUrl: 'https://hm.com/bottoms',
        category: 'Bottoms',
        rating: 4.3,
        inStock: true
      },
      {
        id: `${Date.now()}-3`,
        name: 'Comfortable Shoes',
        brand: 'Nike',
        price: 5999,
        imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop',
        productUrl: 'https://nike.com/shoes',
        category: 'Shoes',
        rating: 4.7,
        inStock: true
      },
      {
        id: `${Date.now()}-4`,
        name: 'Stylish Accessory',
        brand: 'Accessorize',
        price: 1499,
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop',
        productUrl: 'https://accessorize.com/bag',
        category: 'Accessories',
        rating: 4.4,
        inStock: true
      }
    ]
    return baseProducts
  }

  const submitFeedback = async (suggestionId: string, liked: boolean) => {
    try {
      // For testing, just simulate feedback
      console.log('Feedback submitted:', { suggestionId, liked })
      setMessage(liked ? 'Thanks for the positive feedback!' : 'Thanks for the feedback!')
    } catch (error: any) {
      setMessage('Failed to submit feedback')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getOccasionLabel = (occasion: string) => {
    return occasions.find(o => o.value === occasion)?.label || occasion
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-pink-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Style Hub</h1>
            <p className="text-primary-100">AI-powered suggestions & seasonal trends</p>
          </div>
          <Sparkles className="w-12 h-12 text-white/80" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="flex">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'suggestions'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Wand2 className="w-5 h-5" />
              <span>Personal Suggestions</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === 'trends'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Seasonal Trends</span>
            </div>
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('success') || message.includes('Thanks') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      {activeTab === 'suggestions' && (
        <>
          {/* Generate New Suggestion */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Generate New Suggestion</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Select an occasion:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {occasions.map((occasion) => (
                <button
                  key={occasion.value}
                  onClick={() => setSelectedOccasion(occasion.value)}
                  className={`p-4 rounded-lg border text-center transition-colors ${
                    selectedOccasion === occasion.value
                      ? 'bg-primary-50 border-primary-200 text-primary-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-2">{occasion.icon}</div>
                  <div className="text-sm font-medium">{occasion.label}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateSuggestion}
            disabled={isGenerating || !selectedOccasion}
            className="btn-primary flex items-center space-x-2"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Generating outfit photo & products...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate AI Outfit & Products</span>
              </>
            )}
          </button>
          
          {isGenerating && (
            <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">AI is working on your suggestion...</span>
              </div>
              <div className="text-xs text-purple-700 space-y-1">
                <div>✨ Analyzing your style preferences</div>
                <div>🎨 Generating outfit photo</div>
                <div>🛍️ Finding matching products</div>
                <div>💡 Creating style recommendations</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Style History</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions yet</h3>
            <p className="text-gray-500 mb-6">Generate your first style suggestion to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {/* Suggestion Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">
                        {occasions.find(o => o.value === suggestion.occasion)?.icon || '✨'}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {getOccasionLabel(suggestion.occasion)}
                        </h3>
                        <p className="text-sm text-gray-500">{formatDate(suggestion.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => submitFeedback(suggestion.id, true)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => submitFeedback(suggestion.id, false)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* AI Generated Outfit Image */}
                  {suggestion.outfitImageUrl && (
                    <div className="mb-4">
                      <div className="relative">
                        <img
                          src={suggestion.outfitImageUrl}
                          alt="AI Generated Outfit"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <div className="absolute top-3 left-3 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                          <Wand2 className="w-3 h-3" />
                          <span>AI Generated</span>
                        </div>
                        <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                          {Math.round(suggestion.confidence * 100)}% match
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Color Palette */}
                  {suggestion.colors && suggestion.colors.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Color Palette</h4>
                      <div className="flex space-x-2">
                        {suggestion.colors.map((color, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: color.startsWith('#') ? color : `var(--color-${color})` }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggestion Details */}
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Outfit Recommendation</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{suggestion.outfitDesc}</p>
                  </div>

                  {suggestion.hairstyle && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Hairstyle</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">{suggestion.hairstyle}</p>
                    </div>
                  )}

                  {suggestion.accessories && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Accessories</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">{suggestion.accessories}</p>
                    </div>
                  )}

                  {suggestion.skincare && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Skincare Tips</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">{suggestion.skincare}</p>
                    </div>
                  )}

                  {/* Recommended Products */}
                  {suggestion.products && suggestion.products.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Shop This Look</h4>
                        <span className="text-xs text-gray-500">{suggestion.products.length} items</span>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {suggestion.products.slice(0, 3).map((product) => (
                          <div key={product.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                            <div className="flex space-x-3">
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="text-sm font-medium text-gray-900 truncate">{product.name}</h5>
                                <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-semibold text-primary-600">₹{product.price}</span>
                                  {product.originalPrice && (
                                    <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                                  )}
                                  {product.originalPrice && (
                                    <span className="text-xs bg-green-100 text-green-800 px-1 rounded">
                                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-1">
                                    {product.rating && (
                                      <>
                                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                        <span className="text-xs text-gray-600">{product.rating}</span>
                                      </>
                                    )}
                                    <span className={`text-xs ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                  </div>
                                  <div className="flex space-x-1">
                                    <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                                      <Heart className="w-3 h-3" />
                                    </button>
                                    <a
                                      href={product.productUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {suggestion.products.length > 3 && (
                        <button className="mt-3 w-full btn-outline text-sm flex items-center justify-center space-x-1">
                          <ShoppingBag className="w-4 h-4" />
                          <span>View All {suggestion.products.length} Products</span>
                        </button>
                      )}
                      <div className="mt-3 flex space-x-2">
                        <button className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center space-x-1">
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add All to Cart</span>
                        </button>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                          Save Look
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </>
      )}

      {activeTab === 'trends' && (
        <>
          {/* Seasonal Trends Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Current Seasonal Trends</h2>
                <p className="text-gray-600">AI-curated trends based on global fashion data</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Updated daily</span>
              </div>
            </div>

            {isLoadingTrends ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {seasonalTrends.map((trend) => (
                  <div key={trend.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                    {/* Trend Image */}
                    <div className="relative">
                      <img
                        src={trend.imageUrl}
                        alt={trend.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-900">
                        {trend.season}
                      </div>
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                        <Flame className="w-3 h-3" />
                        <span>{trend.popularity}% popular</span>
                      </div>
                    </div>

                    {/* Trend Content */}
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{trend.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{trend.description}</p>
                      </div>

                      {/* Color Palette */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Trending Colors</h4>
                        <div className="flex space-x-2">
                          {trend.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Key Pieces */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Pieces</h4>
                        <div className="flex flex-wrap gap-1">
                          {trend.keyPieces.map((piece, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {piece}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {trend.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Featured Products */}
                      {trend.products.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Shop This Trend</h4>
                          <div className="space-y-2">
                            {trend.products.slice(0, 2).map((product) => (
                              <div key={product.id} className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50 transition-colors">
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-sm font-medium text-gray-900 truncate">{product.name}</h5>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-semibold text-primary-600">₹{product.price}</span>
                                    {product.originalPrice && (
                                      <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                                    )}
                                  </div>
                                </div>
                                <a
                                  href={product.productUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center space-x-1">
                          <Wand2 className="w-4 h-4" />
                          <span>Get Trend Outfit</span>
                        </button>
                        <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default SuggestionsPage