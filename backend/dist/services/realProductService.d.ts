export interface RealProductResult {
    id: string;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    currency: string;
    imageUrl: string;
    productUrl: string;
    platform: string;
    rating?: number;
    reviewCount?: number;
    inStock: boolean;
    category: string;
    description?: string;
    sizes?: string[];
    colors?: string[];
}
export interface ProductSearchOptions {
    maxResults?: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price' | 'rating' | 'relevance';
    gender?: 'men' | 'women' | 'unisex';
    category?: string;
}
export declare class RealProductService {
    private rapidApiKey;
    private serpApiKey;
    constructor();
    /**
     * Search for real products across multiple platforms
     */
    searchRealProducts(query: string, options?: ProductSearchOptions): Promise<RealProductResult[]>;
    /**
     * Search Myntra using multiple real-time methods
     */
    private searchMyntraReal;
    /**
     * Search Myntra using their internal mobile API
     */
    private searchMyntraInternalAPI;
    /**
     * Search Myntra via RapidAPI
     */
    private searchMyntraViaRapidAPI;
    /**
     * Scrape Myntra products directly
     */
    private scrapeMyntraProducts;
    /**
     * Parse Myntra internal API response
     */
    private parseMyntraInternalResponse;
    /**
     * Extract products from Myntra HTML
     */
    private extractMyntraProductsFromHTML;
    /**
     * Search Amazon using multiple real-time methods
     */
    private searchAmazonReal;
    /**
     * Search Amazon using Product Advertising API
     */
    private searchAmazonPAAPI;
    /**
     * Search Amazon via RapidAPI
     */
    private searchAmazonViaRapidAPI;
    /**
     * Scrape Amazon products directly
     */
    private scrapeAmazonProducts;
    /**
     * Extract Amazon products from HTML
     */
    private extractAmazonProductsFromHTML;
    /**
     * Extract brand from product title
     */
    private extractBrandFromTitle;
    /**
     * Search Flipkart using available APIs
     */
    private searchFlipkartReal;
    /**
     * Search using SerpAPI (Google Shopping results)
     */
    private searchViaSerpAPI;
    /**
     * Parse API responses into standardized format
     */
    private parseMyntraApiResponse;
    private parseAmazonApiResponse;
    private parseFlipkartApiResponse;
    private parseSerpApiResponse;
    /**
     * Helper methods
     */
    private parsePrice;
    private generateAmazonASIN;
    private filterAndSortResults;
    /**
     * Get product details with real-time data
     */
    getProductDetails(platform: string, productId: string): Promise<RealProductResult | null>;
}
//# sourceMappingURL=realProductService.d.ts.map