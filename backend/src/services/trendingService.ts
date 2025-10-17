import { prisma } from '../lib/prisma';
import { AIService } from './aiService';
import { notificationService } from './notificationService';

const aiService = new AIService();

interface TrendingOutfitData {
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  occasion: 'CASUAL' | 'OFFICE' | 'DATE' | 'WEDDING' | 'PARTY' | 'FORMAL_EVENT' | 'VACATION' | 'WORKOUT' | 'INTERVIEW';
  season: string;
  tags: string[];
  colors: string[];
  priceRange: 'BUDGET_FRIENDLY' | 'MID_RANGE' | 'PREMIUM' | 'LUXURY';
  items: TrendingOutfitItemData[];
}

interface TrendingOutfitItemData {
  name: string;
  category: 'TOP' | 'BOTTOM' | 'DRESS' | 'OUTERWEAR' | 'SHOES' | 'ACCESSORIES' | 'JEWELRY' | 'BAG';
  brand: string;
  price: number;
  imageUrl: string;
  productUrl: string;
  description?: string;
  fitAdvice?: string;
  stylingTip?: string;
}

class TrendingService {
  // Generate new trending outfits using AI
  async generateTrendingOutfits(): Promise<TrendingOutfitData[]> {
    try {
      console.log('🤖 Generating new trending outfits with AI...');

      // Get current season
      const currentSeason = this.getCurrentSeason();
      
      // Define trending categories and occasions
      const occasions = ['CASUAL', 'OFFICE', 'DATE', 'PARTY', 'FORMAL_EVENT'];
      const categories = ['Streetwear', 'Business Casual', 'Evening Wear', 'Athleisure', 'Minimalist'];

      const trendingOutfits: TrendingOutfitData[] = [];

      // Generate outfits for each category
      for (const category of categories) {
        for (const occasion of occasions.slice(0, 2)) { // 2 occasions per category
          try {
            const prompt = `Generate a trending ${category} outfit for ${occasion} occasion in ${currentSeason}. 
            Include specific clothing items with brands, prices in INR, and styling tips. 
            Make it fashionable and current with 2024 trends.`;

            // Use AI to generate outfit concept
            const aiResponse = await aiService.generateStyleSuggestions({
              gender: 'FEMALE', // Default for trending
              occasion: occasion as any,
              bodyType: 'RECTANGLE', // Default for trending
              faceShape: 'OVAL', // Default for trending
              skinTone: 'MEDIUM', // Default for trending
              preferences: {
                style: category,
                season: currentSeason,
                budget: 'MID_RANGE',
              }
            });

            // Create trending outfit data
            const trendingOutfit: TrendingOutfitData = {
              title: `${category} ${occasion.toLowerCase().replace('_', ' ')} Look`,
              description: `Trending ${category.toLowerCase()} outfit perfect for ${occasion.toLowerCase().replace('_', ' ')} occasions. Stay stylish with this ${currentSeason.toLowerCase()} look.`,
              imageUrl: this.generateOutfitImageUrl(category, occasion),
              category,
              occasion: occasion as any,
              season: `${currentSeason} 2024`,
              tags: this.generateTrendingTags(category, occasion),
              colors: this.generateTrendingColors(category),
              priceRange: 'MID_RANGE',
              items: this.generateOutfitItems(category, occasion),
            };

            trendingOutfits.push(trendingOutfit);
          } catch (error) {
            console.error(`❌ Failed to generate outfit for ${category} ${occasion}:`, error);
          }
        }
      }

      console.log(`✅ Generated ${trendingOutfits.length} trending outfits`);
      return trendingOutfits;
    } catch (error) {
      console.error('❌ Failed to generate trending outfits:', error);
      throw error;
    }
  }

  // Save trending outfits to database
  async saveTrendingOutfits(outfits: TrendingOutfitData[]) {
    try {
      console.log(`💾 Saving ${outfits.length} trending outfits to database...`);

      const savedOutfits = [];

      for (const outfit of outfits) {
        const savedOutfit = await prisma.trendingOutfit.create({
          data: {
            title: outfit.title,
            description: outfit.description,
            imageUrl: outfit.imageUrl,
            category: outfit.category,
            occasion: outfit.occasion,
            season: outfit.season,
            tags: outfit.tags,
            colors: outfit.colors,
            priceRange: outfit.priceRange,
            trendingScore: Math.random() * 100, // Initial random score
            isActive: true,
            isFeatured: Math.random() > 0.7, // 30% chance to be featured
            items: {
              create: outfit.items.map(item => ({
                name: item.name,
                category: item.category,
                brand: item.brand,
                price: item.price,
                imageUrl: item.imageUrl,
                productUrl: item.productUrl,
                description: item.description,
                fitAdvice: item.fitAdvice,
                stylingTip: item.stylingTip,
              })),
            },
          },
          include: {
            items: true,
          },
        });

        savedOutfits.push(savedOutfit);
      }

      console.log(`✅ Saved ${savedOutfits.length} trending outfits`);
      return savedOutfits;
    } catch (error) {
      console.error('❌ Failed to save trending outfits:', error);
      throw error;
    }
  }

  // Update trending scores based on user interactions
  async updateTrendingScores() {
    try {
      console.log('📊 Updating trending scores...');

      const outfits = await prisma.trendingOutfit.findMany({
        where: { isActive: true },
      });

      for (const outfit of outfits) {
        // Calculate trending score based on views, likes, shares, and recency
        const ageInDays = (Date.now() - outfit.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        const recencyScore = Math.max(0, 100 - (ageInDays * 5)); // Decay over time
        
        const interactionScore = (outfit.viewCount * 1) + (outfit.likeCount * 3) + (outfit.shareCount * 5);
        const trendingScore = (interactionScore + recencyScore) / 2;

        await prisma.trendingOutfit.update({
          where: { id: outfit.id },
          data: { trendingScore },
        });
      }

      console.log(`✅ Updated trending scores for ${outfits.length} outfits`);
    } catch (error) {
      console.error('❌ Failed to update trending scores:', error);
      throw error;
    }
  }

  // Get trending outfits
  async getTrendingOutfits(limit = 20, offset = 0) {
    try {
      const outfits = await prisma.trendingOutfit.findMany({
        where: { isActive: true },
        include: { items: true },
        orderBy: { trendingScore: 'desc' },
        take: limit,
        skip: offset,
      });

      return outfits;
    } catch (error) {
      console.error('❌ Failed to get trending outfits:', error);
      throw error;
    }
  }

  // Get featured trending outfits
  async getFeaturedOutfits(limit = 5) {
    try {
      const outfits = await prisma.trendingOutfit.findMany({
        where: { 
          isActive: true,
          isFeatured: true,
        },
        include: { items: true },
        orderBy: { trendingScore: 'desc' },
        take: limit,
      });

      return outfits;
    } catch (error) {
      console.error('❌ Failed to get featured outfits:', error);
      throw error;
    }
  }

  // Clean up old trending outfits
  async cleanupOldOutfits() {
    try {
      console.log('🧹 Cleaning up old trending outfits...');

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await prisma.trendingOutfit.updateMany({
        where: {
          createdAt: { lt: thirtyDaysAgo },
          trendingScore: { lt: 10 }, // Low engagement
        },
        data: { isActive: false },
      });

      console.log(`✅ Deactivated ${result.count} old trending outfits`);
    } catch (error) {
      console.error('❌ Failed to cleanup old outfits:', error);
      throw error;
    }
  }

  // Main cron job function - runs every 2 days
  async runTrendingOutfitsCron() {
    try {
      console.log('🚀 Starting trending outfits cron job...');

      // 1. Generate new trending outfits
      const newOutfits = await this.generateTrendingOutfits();
      
      // 2. Save to database
      const savedOutfits = await this.saveTrendingOutfits(newOutfits);
      
      // 3. Update trending scores for all outfits
      await this.updateTrendingScores();
      
      // 4. Clean up old outfits
      await this.cleanupOldOutfits();
      
      // 5. Send notifications to users
      await notificationService.sendBulkTrendingNotifications(savedOutfits);
      
      // 6. Update cron job record
      await this.updateCronJobRecord('trending-outfits', true);

      console.log('✅ Trending outfits cron job completed successfully');
      return { success: true, outfitsGenerated: savedOutfits.length };
    } catch (error) {
      console.error('❌ Trending outfits cron job failed:', error);
      await this.updateCronJobRecord('trending-outfits', false, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  // Helper methods
  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'Spring';
    if (month >= 6 && month <= 8) return 'Summer';
    if (month >= 9 && month <= 11) return 'Autumn';
    return 'Winter';
  }

  private generateOutfitImageUrl(category: string, occasion: string): string {
    // In production, you'd use actual fashion images or AI-generated images
    const imageId = Math.floor(Math.random() * 1000);
    return `https://images.unsplash.com/photo-${imageId}?w=400&h=600&fit=crop&auto=format`;
  }

  private generateTrendingTags(category: string, occasion: string): string[] {
    const baseTags = ['trending', '2024', 'fashion', 'style'];
    const categoryTags: Record<string, string[]> = {
      'Streetwear': ['streetstyle', 'urban', 'casual', 'edgy'],
      'Business Casual': ['professional', 'workwear', 'smart', 'elegant'],
      'Evening Wear': ['formal', 'party', 'glamorous', 'chic'],
      'Athleisure': ['sporty', 'comfortable', 'activewear', 'modern'],
      'Minimalist': ['clean', 'simple', 'timeless', 'sophisticated'],
    };

    return [...baseTags, ...(categoryTags[category] || []), occasion.toLowerCase()];
  }

  private generateTrendingColors(category: string): string[] {
    const colorPalettes: Record<string, string[]> = {
      'Streetwear': ['#000000', '#FFFFFF', '#FF6B6B', '#4ECDC4'],
      'Business Casual': ['#2C3E50', '#34495E', '#95A5A6', '#ECF0F1'],
      'Evening Wear': ['#8E44AD', '#2C3E50', '#F39C12', '#E74C3C'],
      'Athleisure': ['#3498DB', '#2ECC71', '#95A5A6', '#34495E'],
      'Minimalist': ['#BDC3C7', '#95A5A6', '#7F8C8D', '#2C3E50'],
    };

    return colorPalettes[category] || ['#2C3E50', '#ECF0F1', '#3498DB'];
  }

  private generateOutfitItems(category: string, occasion: string): TrendingOutfitItemData[] {
    // Sample outfit items - in production, you'd use real product data
    const items: TrendingOutfitItemData[] = [
      {
        name: `${category} Top`,
        category: 'TOP',
        brand: 'Zara',
        price: 2499,
        imageUrl: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=300&h=400&fit=crop',
        productUrl: 'https://www.zara.com/in/',
        description: `Trendy ${category.toLowerCase()} top perfect for ${occasion.toLowerCase()}`,
        fitAdvice: 'True to size, comfortable fit',
        stylingTip: 'Pair with high-waisted bottoms for a flattering silhouette',
      },
      {
        name: `${category} Bottom`,
        category: 'BOTTOM',
        brand: 'H&M',
        price: 1999,
        imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
        productUrl: 'https://www2.hm.com/en_in/',
        description: `Stylish ${category.toLowerCase()} bottom`,
        fitAdvice: 'Size up for a relaxed fit',
        stylingTip: 'Great for creating a balanced silhouette',
      },
      {
        name: 'Trendy Footwear',
        category: 'SHOES',
        brand: 'Nike',
        price: 7999,
        imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=400&fit=crop',
        productUrl: 'https://www.nike.com/in/',
        description: 'Comfortable and stylish shoes',
        fitAdvice: 'Half size up recommended',
        stylingTip: 'Versatile enough for multiple occasions',
      },
    ];

    return items;
  }

  private async updateCronJobRecord(jobName: string, success: boolean, error?: string) {
    try {
      const nextRun = new Date();
      nextRun.setDate(nextRun.getDate() + 2); // Next run in 2 days

      await prisma.cronJob.upsert({
        where: { name: jobName },
        update: {
          lastRun: new Date(),
          nextRun,
          runCount: { increment: 1 },
          failCount: success ? undefined : { increment: 1 },
          lastError: error || null,
        },
        create: {
          name: jobName,
          schedule: '0 9 */2 * *', // Every 2 days at 9 AM
          lastRun: new Date(),
          nextRun,
          runCount: 1,
          failCount: success ? 0 : 1,
          lastError: error || null,
        },
      });
    } catch (error) {
      console.error('❌ Failed to update cron job record:', error);
    }
  }
}

export const trendingService = new TrendingService();