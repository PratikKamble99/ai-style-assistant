import axios from 'axios';
import { PrismaClient, Platform, ProductCategory, StyleSuggestion } from '@prisma/client';

const prisma = new PrismaClient();

export interface ProductSearchFilters {
  category?: string;
  platform?: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  limit: number;
}

export interface ProductSearchResult {
  products: any[];
  total: number;
  page: number;
  pages: number;
}

export interface ProductViewTrack {
  userId: string;
  productId: string;
  platform: string;
  suggestionId?: string;
}

export class ProductService {
  private myntraApiKey: string;
  private amazonApiKey: string;
  private hmApiKey: string;

  constructor() {
    this.myntraApiKey = process.env.MYNTRA_API_KEY || '';
    this.amazonApiKey = process.env.AMAZON_API_KEY || '';
    this.hmApiKey = process.env.HM_API_KEY || '';
  }

  async searchProducts(query: string, filters: ProductSearchFilters): Promise<ProductSearchResult> {
    try {
      const results: any[] = [];
      const platforms = filters.platform ? [filters.platform] : ['MYNTRA', 'AMAZON', 'HM'];

      // Search across specified platforms
      const searchPromises = platforms.map(platform => {
        switch (platform) {
          case 'MYNTRA':
            return this.searchMyntra(query, filters);
          case 'AMAZON':
            return this.searchAmazon(query, filters);
          case 'HM':
            return this.searchHM(query, filters);
          default:
            return Promise.resolve([]);
        }
      });

      const platformResults = await Promise.allSettled(searchPromises);
      
      platformResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(...result.value);
        } else {
          console.error(`Search failed for ${platforms[index]}:`, result.reason);
        }
      });

      // Apply filters
      let filteredResults = results;

      if (filters.category) {
        filteredResults = filteredResults.filter(product => 
          product.category === filters.category
        );
      }

      if (filters.minPrice !== undefined) {
        filteredResults = filteredResults.filter(product => 
          product.price >= filters.minPrice!
        );
      }

      if (filters.maxPrice !== undefined) {
        filteredResults = filteredResults.filter(product => 
          product.price <= filters.maxPrice!
        );
      }

      // Sort by relevance/rating
      filteredResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));

      // Pagination
      const total = filteredResults.length;
      const pages = Math.ceil(total / filters.limit);
      const startIndex = (filters.page - 1) * filters.limit;
      const paginatedResults = filteredResults.slice(startIndex, startIndex + filters.limit);

      return {
        products: paginatedResults,
        total,
        page: filters.page,
        pages
      };
    } catch (error) {
      console.error('Product search error:', error);
      throw new Error('Failed to search products');
    }
  }

  private async searchMyntra(query: string, filters: ProductSearchFilters): Promise<any[]> {
    try {
      // Mock Myntra API call - replace with actual API
      const mockProducts = [
        {
          productId: 'myntra_001',
          name: `${query} Casual Shirt`,
          brand: 'Roadster',
          price: 1299,
          currency: 'INR',
          imageUrl: 'https://assets.myntassets.com/h_1440,q_90,w_1080/v1/assets/images/productimage.jpg',
          productUrl: 'https://www.myntra.com/shirts/roadster/casual-shirt/1234567',
          platform: 'MYNTRA' as Platform,
          category: 'CLOTHING' as ProductCategory,
          rating: 4.2,
          reviewCount: 1250,
          inStock: true
        },
        {
          productId: 'myntra_002',
          name: `${query} Formal Trousers`,
          brand: 'Arrow',
          price: 2499,
          currency: 'INR',
          imageUrl: 'https://assets.myntassets.com/h_1440,q_90,w_1080/v1/assets/images/productimage2.jpg',
          productUrl: 'https://www.myntra.com/trousers/arrow/formal-trousers/2345678',
          platform: 'MYNTRA' as Platform,
          category: 'CLOTHING' as ProductCategory,
          rating: 4.5,
          reviewCount: 890,
          inStock: true
        }
      ];

      return mockProducts;
    } catch (error) {
      console.error('Myntra search error:', error);
      return [];
    }
  }

  private async searchAmazon(query: string, filters: ProductSearchFilters): Promise<any[]> {
    try {
      // Mock Amazon API call - replace with actual Product Advertising API
      const mockProducts = [
        {
          productId: 'amazon_001',
          name: `${query} Cotton T-Shirt`,
          brand: 'Amazon Brand - Symbol',
          price: 599,
          currency: 'INR',
          imageUrl: 'https://m.media-amazon.com/images/I/61abc123def.jpg',
          productUrl: 'https://www.amazon.in/dp/B08ABC123DEF',
          platform: 'AMAZON' as Platform,
          category: 'CLOTHING' as ProductCategory,
          rating: 4.0,
          reviewCount: 2340,
          inStock: true
        }
      ];

      return mockProducts;
    } catch (error) {
      console.error('Amazon search error:', error);
      return [];
    }
  }

  private async searchHM(query: string, filters: ProductSearchFilters): Promise<any[]> {
    try {
      // Mock H&M API call - replace with actual API
      const mockProducts = [
        {
          productId: 'hm_001',
          name: `${query} Slim Fit Jeans`,
          brand: 'H&M',
          price: 1999,
          currency: 'INR',
          imageUrl: 'https://lp2.hm.com/hmgoepprod?source=url[file:/product/main]',
          productUrl: 'https://www2.hm.com/en_in/productpage.0123456789.html',
          platform: 'HM' as Platform,
          category: 'CLOTHING' as ProductCategory,
          rating: 4.3,
          reviewCount: 567,
          inStock: true
        }
      ];

      return mockProducts;
    } catch (error) {
      console.error('H&M search error:', error);
      return [];
    }
  }

  async generateRecommendations(suggestion: StyleSuggestion): Promise<any[]> {
    try {
      // Extract keywords from outfit description
      const keywords = this.extractKeywords(suggestion.outfitDesc);
      const recommendations: any[] = [];

      // Search for each keyword
      for (const keyword of keywords) {
        const searchResult = await this.searchProducts(keyword, {
          page: 1,
          limit: 5
        });
        
        recommendations.push(...searchResult.products);
      }

      // Remove duplicates and limit results
      const uniqueRecommendations = recommendations
        .filter((product, index, self) => 
          index === self.findIndex(p => p.productId === product.productId)
        )
        .slice(0, 20);

      return uniqueRecommendations.map(product => ({
        productId: product.productId,
        name: product.name,
        brand: product.brand,
        price: product.price,
        currency: product.currency,
        imageUrl: product.imageUrl,
        productUrl: product.productUrl,
        platform: product.platform,
        category: product.category,
        rating: product.rating,
        reviewCount: product.reviewCount,
        inStock: product.inStock
      }));
    } catch (error) {
      console.error('Generate recommendations error:', error);
      return [];
    }
  }

  private extractKeywords(outfitDescription: string): string[] {
    // Simple keyword extraction - can be enhanced with NLP
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = outfitDescription
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word));

    // Return unique keywords
    return [...new Set(words)].slice(0, 5);
  }

  async getProductDetails(platform: Platform, productId: string): Promise<any> {
    try {
      switch (platform) {
        case 'MYNTRA':
          return this.getMyntraProductDetails(productId);
        case 'AMAZON':
          return this.getAmazonProductDetails(productId);
        case 'HM':
          return this.getHMProductDetails(productId);
        default:
          throw new Error('Unsupported platform');
      }
    } catch (error) {
      console.error('Get product details error:', error);
      throw new Error('Failed to get product details');
    }
  }

  private async getMyntraProductDetails(productId: string): Promise<any> {
    // Mock implementation - replace with actual Myntra API
    return {
      productId,
      name: 'Detailed Product Name',
      brand: 'Brand Name',
      price: 1299,
      originalPrice: 1999,
      discount: 35,
      currency: 'INR',
      images: [
        'https://assets.myntassets.com/image1.jpg',
        'https://assets.myntassets.com/image2.jpg'
      ],
      description: 'Detailed product description...',
      specifications: {
        material: 'Cotton',
        fit: 'Regular',
        color: 'Blue'
      },
      sizes: ['S', 'M', 'L', 'XL'],
      rating: 4.2,
      reviewCount: 1250,
      reviews: [],
      inStock: true,
      deliveryInfo: 'Free delivery in 2-3 days'
    };
  }

  private async getAmazonProductDetails(productId: string): Promise<any> {
    // Mock implementation - replace with actual Amazon API
    return {
      productId,
      name: 'Amazon Product Name',
      brand: 'Amazon Brand',
      price: 599,
      currency: 'INR',
      images: ['https://m.media-amazon.com/image1.jpg'],
      description: 'Amazon product description...',
      rating: 4.0,
      reviewCount: 2340,
      inStock: true
    };
  }

  private async getHMProductDetails(productId: string): Promise<any> {
    // Mock implementation - replace with actual H&M API
    return {
      productId,
      name: 'H&M Product Name',
      brand: 'H&M',
      price: 1999,
      currency: 'INR',
      images: ['https://lp2.hm.com/image1.jpg'],
      description: 'H&M product description...',
      rating: 4.3,
      reviewCount: 567,
      inStock: true
    };
  }

  async getTrendingProducts(filters: any): Promise<any[]> {
    try {
      // Mock trending products - replace with actual analytics data
      const trendingProducts = [
        {
          productId: 'trending_001',
          name: 'Trending Casual Shirt',
          brand: 'Popular Brand',
          price: 1599,
          currency: 'INR',
          imageUrl: 'https://example.com/trending1.jpg',
          productUrl: 'https://example.com/product1',
          platform: 'MYNTRA' as Platform,
          category: 'CLOTHING' as ProductCategory,
          rating: 4.5,
          reviewCount: 3200,
          inStock: true,
          trendScore: 95
        }
      ];

      return trendingProducts.slice(0, filters.limit);
    } catch (error) {
      console.error('Get trending products error:', error);
      return [];
    }
  }

  async getSimilarProducts(platform: Platform, productId: string, limit: number): Promise<any[]> {
    try {
      // Mock similar products - replace with actual recommendation algorithm
      const similarProducts = [
        {
          productId: 'similar_001',
          name: 'Similar Product 1',
          brand: 'Similar Brand',
          price: 1299,
          currency: 'INR',
          imageUrl: 'https://example.com/similar1.jpg',
          productUrl: 'https://example.com/similar1',
          platform,
          category: 'CLOTHING' as ProductCategory,
          rating: 4.2,
          reviewCount: 890,
          inStock: true,
          similarity: 0.85
        }
      ];

      return similarProducts.slice(0, limit);
    } catch (error) {
      console.error('Get similar products error:', error);
      return [];
    }
  }

  async trackProductView(data: ProductViewTrack): Promise<void> {
    try {
      // Log product view for analytics
      console.log('Product view tracked:', data);
      
      // Here you could:
      // 1. Store in analytics database
      // 2. Send to analytics service (Google Analytics, Mixpanel, etc.)
      // 3. Update recommendation algorithms
      // 4. Track conversion funnel
      
      // Example: Store in database for analytics
      // await prisma.productView.create({
      //   data: {
      //     userId: data.userId,
      //     productId: data.productId,
      //     platform: data.platform,
      //     suggestionId: data.suggestionId,
      //     timestamp: new Date()
      //   }
      // });
    } catch (error) {
      console.error('Track product view error:', error);
      // Don't throw error as this is analytics tracking
    }
  }
}