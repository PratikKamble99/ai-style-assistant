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
    saveTrendingOutfits(outfits: TrendingOutfitData[]): Promise<any[]>;
    updateTrendingScores(): Promise<void>;
    getTrendingOutfits(limit?: number, offset?: number): Promise<any>;
    getFeaturedOutfits(limit?: number): Promise<any>;
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