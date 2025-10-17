import api from './api';

export interface TrendingOutfit {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  occasion: string;
  season: string;
  trendingScore: number;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  tags: string[];
  colors: string[];
  priceRange: string;
  isFeatured: boolean;
  items: TrendingOutfitItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TrendingOutfitItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  description?: string;
  fitAdvice?: string;
  stylingTip?: string;
}

class TrendingService {
  // Get trending outfits
  async getTrending(limit?: number, offset?: number): Promise<TrendingOutfit[]> {
    try {
      const response = await api.get('/trending', {
        params: { limit, offset },
      });
      return response.data.data.outfits;
    } catch (error) {
      console.error('❌ Failed to get trending outfits:', error);
      throw error;
    }
  }

  // Get featured trending outfits
  async getFeatured(limit?: number): Promise<TrendingOutfit[]> {
    try {
      const response = await api.get('/trending/featured', {
        params: { limit },
      });
      return response.data.data.outfits;
    } catch (error) {
      console.error('❌ Failed to get featured outfits:', error);
      throw error;
    }
  }

  // Get trending outfit by ID
  async getById(id: string): Promise<TrendingOutfit> {
    try {
      const response = await api.get(`/trending/${id}`);
      return response.data.data.outfit;
    } catch (error) {
      console.error('❌ Failed to get trending outfit:', error);
      throw error;
    }
  }

  // Like/Unlike trending outfit
  async toggleLike(id: string): Promise<{ liked: boolean }> {
    try {
      const response = await api.post(`/trending/${id}/like`);
      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to toggle like:', error);
      throw error;
    }
  }

  // Share trending outfit
  async share(id: string): Promise<void> {
    try {
      await api.post(`/trending/${id}/share`);
    } catch (error) {
      console.error('❌ Failed to share outfit:', error);
      throw error;
    }
  }

  // Get trending by category
  async getByCategory(category: string, limit?: number, offset?: number): Promise<TrendingOutfit[]> {
    try {
      const response = await api.get(`/trending/category/${category}`, {
        params: { limit, offset },
      });
      return response.data.data.outfits;
    } catch (error) {
      console.error('❌ Failed to get trending by category:', error);
      throw error;
    }
  }

  // Get trending by occasion
  async getByOccasion(occasion: string, limit?: number, offset?: number): Promise<TrendingOutfit[]> {
    try {
      const response = await api.get(`/trending/occasion/${occasion}`, {
        params: { limit, offset },
      });
      return response.data.data.outfits;
    } catch (error) {
      console.error('❌ Failed to get trending by occasion:', error);
      throw error;
    }
  }
}

export const trendingService = new TrendingService();