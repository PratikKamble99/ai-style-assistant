import { OutfitItem } from './outfitSuggestionService';
export interface ProductResult {
    id: string;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    currency: string;
    imageUrl: string;
    productUrl: string;
    platform: 'MYNTRA' | 'AMAZON';
    rating?: number;
    reviewCount?: number;
    inStock: boolean;
    category: string;
    searchRelevance: number;
}
export interface ProductSearchOptions {
    maxResults?: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price' | 'rating' | 'relevance';
    gender?: 'men' | 'women' | 'unisex';
}
export declare class ProductSearchService {
    private myntraApiKey;
    private amazonApiKey;
    constructor();
    searchProducts(outfitItems: OutfitItem[], options?: ProductSearchOptions): Promise<{
        [category: string]: ProductResult[];
    }>;
    private searchMyntra;
    private searchAmazon;
    private buildSearchQuery;
    private getRandomBrand;
    private getRandomPrice;
    private filterByOptions;
    getRealProductLinks(searchQuery: string, platform: 'MYNTRA' | 'AMAZON'): Promise<ProductResult[]>;
}
//# sourceMappingURL=productSearchService.d.ts.map