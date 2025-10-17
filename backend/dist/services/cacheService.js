"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = exports.CacheService = void 0;
// Simple in-memory cache for development (replace with Redis in production)
class CacheService {
    constructor() {
        this.cache = new Map();
        this.isConnected = true;
        console.log('Using in-memory cache (development mode)');
        // Clean up expired entries every minute
        setInterval(() => {
            this.cleanupExpired();
        }, 60000);
    }
    cleanupExpired() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (entry.expiry && entry.expiry < now) {
                this.cache.delete(key);
            }
        }
    }
    /**
     * Set a key-value pair with optional expiration
     */
    async set(key, value, expirationInSeconds) {
        try {
            if (!this.isConnected)
                return false;
            const expiry = expirationInSeconds ? Date.now() + (expirationInSeconds * 1000) : undefined;
            this.cache.set(key, { value, expiry });
            return true;
        }
        catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    }
    /**
     * Get value by key
     */
    async get(key) {
        try {
            if (!this.isConnected)
                return null;
            const entry = this.cache.get(key);
            if (!entry)
                return null;
            // Check if expired
            if (entry.expiry && entry.expiry < Date.now()) {
                this.cache.delete(key);
                return null;
            }
            return entry.value;
        }
        catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }
    /**
     * Delete a key
     */
    async delete(key) {
        try {
            if (!this.isConnected)
                return false;
            return this.cache.delete(key);
        }
        catch (error) {
            console.error('Cache delete error:', error);
            return false;
        }
    }
    /**
     * Check if key exists
     */
    async exists(key) {
        try {
            if (!this.isConnected)
                return false;
            const entry = this.cache.get(key);
            if (!entry)
                return false;
            // Check if expired
            if (entry.expiry && entry.expiry < Date.now()) {
                this.cache.delete(key);
                return false;
            }
            return true;
        }
        catch (error) {
            console.error('Cache exists error:', error);
            return false;
        }
    }
    /**
     * Clear all cache
     */
    async flushAll() {
        try {
            this.cache.clear();
            return true;
        }
        catch (error) {
            console.error('Cache flush all error:', error);
            return false;
        }
    }
    /**
     * Get cache statistics
     */
    async getStats() {
        return {
            connected: this.isConnected,
            size: this.cache.size,
            type: 'in-memory'
        };
    }
    /**
     * Cache with automatic TTL
     */
    async cacheWithTTL(key, fetchFunction, ttlSeconds) {
        try {
            // Try to get from cache first
            const cached = await this.get(key);
            if (cached !== null) {
                return cached;
            }
            // Fetch fresh data
            const freshData = await fetchFunction();
            // Cache the result
            await this.set(key, freshData, ttlSeconds);
            return freshData;
        }
        catch (error) {
            console.error('Cache with TTL error:', error);
            // Fallback to direct fetch if cache fails
            return await fetchFunction();
        }
    }
    /**
     * Generate cache key with prefix
     */
    generateKey(prefix, ...parts) {
        return `${prefix}:${parts.join(':')}`;
    }
}
exports.CacheService = CacheService;
// Export singleton instance
exports.cacheService = new CacheService();
//# sourceMappingURL=cacheService.js.map