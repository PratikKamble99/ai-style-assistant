import { Platform, StyleSuggestion } from '@prisma/client';
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
export declare class ProductService {
    private myntraApiKey;
    private amazonApiKey;
    private hmApiKey;
    constructor();
    searchProducts(query: string, filters: ProductSearchFilters): Promise<ProductSearchResult>;
    private searchMyntra;
    private searchAmazon;
    private searchHM;
    generateRecommendations(suggestion: StyleSuggestion): Promise<any[]>;
    private extractKeywords;
    getProductDetails(platform: Platform, productId: string): Promise<any>;
    private getMyntraProductDetails;
    private getAmazonProductDetails;
    private getHMProductDetails;
    getTrendingProducts(filters: any): Promise<any[]>;
    getSimilarProducts(platform: Platform, productId: string, limit: number): Promise<any[]>;
    trackProductView(data: ProductViewTrack): Promise<void>;
}
//# sourceMappingURL=productService.d.ts.map