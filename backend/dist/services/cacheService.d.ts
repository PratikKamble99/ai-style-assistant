export declare class CacheService {
    private cache;
    private isConnected;
    constructor();
    private cleanupExpired;
    /**
     * Set a key-value pair with optional expiration
     */
    set(key: string, value: any, expirationInSeconds?: number): Promise<boolean>;
    /**
     * Get value by key
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Delete a key
     */
    delete(key: string): Promise<boolean>;
    /**
     * Check if key exists
     */
    exists(key: string): Promise<boolean>;
    /**
     * Clear all cache
     */
    flushAll(): Promise<boolean>;
    /**
     * Get cache statistics
     */
    getStats(): Promise<any>;
    /**
     * Cache with automatic TTL
     */
    cacheWithTTL<T>(key: string, fetchFunction: () => Promise<T>, ttlSeconds: number): Promise<T>;
    /**
     * Generate cache key with prefix
     */
    generateKey(prefix: string, ...parts: (string | number)[]): string;
}
export declare const cacheService: CacheService;
//# sourceMappingURL=cacheService.d.ts.map