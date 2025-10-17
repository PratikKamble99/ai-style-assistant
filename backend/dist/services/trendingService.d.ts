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
declare class TrendingService {
    generateTrendingOutfits(): Promise<TrendingOutfitData[]>;
    saveTrendingOutfits(outfits: TrendingOutfitData[]): Promise<({
        items: {
            id: string;
            name: string;
            createdAt: Date;
            category: import(".prisma/client").$Enums.ProductCategoryType;
            description: string | null;
            imageUrl: string;
            brand: string;
            productUrl: string;
            price: number;
            currency: string;
            fitAdvice: string | null;
            stylingTip: string | null;
            outfitId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        occasion: import(".prisma/client").$Enums.Occasion;
        category: string;
        title: string;
        description: string;
        imageUrl: string;
        isActive: boolean;
        colors: string[];
        trendingScore: number;
        viewCount: number;
        likeCount: number;
        season: string;
        shareCount: number;
        isFeatured: boolean;
        tags: string[];
        priceRange: import(".prisma/client").$Enums.BudgetRange;
    })[]>;
    updateTrendingScores(): Promise<void>;
    getTrendingOutfits(limit?: number, offset?: number): Promise<({
        items: {
            id: string;
            name: string;
            createdAt: Date;
            category: import(".prisma/client").$Enums.ProductCategoryType;
            description: string | null;
            imageUrl: string;
            brand: string;
            productUrl: string;
            price: number;
            currency: string;
            fitAdvice: string | null;
            stylingTip: string | null;
            outfitId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        occasion: import(".prisma/client").$Enums.Occasion;
        category: string;
        title: string;
        description: string;
        imageUrl: string;
        isActive: boolean;
        colors: string[];
        trendingScore: number;
        viewCount: number;
        likeCount: number;
        season: string;
        shareCount: number;
        isFeatured: boolean;
        tags: string[];
        priceRange: import(".prisma/client").$Enums.BudgetRange;
    })[]>;
    getFeaturedOutfits(limit?: number): Promise<({
        items: {
            id: string;
            name: string;
            createdAt: Date;
            category: import(".prisma/client").$Enums.ProductCategoryType;
            description: string | null;
            imageUrl: string;
            brand: string;
            productUrl: string;
            price: number;
            currency: string;
            fitAdvice: string | null;
            stylingTip: string | null;
            outfitId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        occasion: import(".prisma/client").$Enums.Occasion;
        category: string;
        title: string;
        description: string;
        imageUrl: string;
        isActive: boolean;
        colors: string[];
        trendingScore: number;
        viewCount: number;
        likeCount: number;
        season: string;
        shareCount: number;
        isFeatured: boolean;
        tags: string[];
        priceRange: import(".prisma/client").$Enums.BudgetRange;
    })[]>;
    cleanupOldOutfits(): Promise<void>;
    runTrendingOutfitsCron(): Promise<{
        success: boolean;
        outfitsGenerated: number;
    }>;
    private getCurrentSeason;
    private generateOutfitImageUrl;
    private generateTrendingTags;
    private generateTrendingColors;
    private generateOutfitItems;
    private updateCronJobRecord;
}
export declare const trendingService: TrendingService;
export {};
//# sourceMappingURL=trendingService.d.ts.map