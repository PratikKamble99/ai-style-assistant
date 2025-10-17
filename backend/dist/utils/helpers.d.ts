import { Response } from 'express';
/**
 * Generate a random string of specified length
 */
export declare const generateRandomString: (length?: number) => string;
/**
 * Generate a secure random token
 */
export declare const generateSecureToken: () => string;
/**
 * Hash a string using SHA-256
 */
export declare const hashString: (input: string) => string;
/**
 * Generate a UUID v4
 */
export declare const generateUUID: () => string;
/**
 * Sleep for specified milliseconds
 */
export declare const sleep: (ms: number) => Promise<void>;
/**
 * Capitalize first letter of each word
 */
export declare const capitalizeWords: (str: string) => string;
/**
 * Convert string to slug format
 */
export declare const slugify: (str: string) => string;
/**
 * Truncate string to specified length
 */
export declare const truncateString: (str: string, length: number, suffix?: string) => string;
/**
 * Format price with currency
 */
export declare const formatPrice: (price: number, currency?: string) => string;
/**
 * Format date to readable string
 */
export declare const formatDate: (date: Date | string, locale?: string) => string;
/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export declare const formatRelativeTime: (date: Date | string) => string;
/**
 * Check if email is valid
 */
export declare const isValidEmail: (email: string) => boolean;
/**
 * Check if URL is valid
 */
export declare const isValidUrl: (url: string) => boolean;
/**
 * Extract domain from URL
 */
export declare const extractDomain: (url: string) => string;
/**
 * Generate pagination metadata
 */
export declare const generatePagination: (page: number, limit: number, total: number) => {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextPage: number | null;
    prevPage: number | null;
};
/**
 * Calculate percentage
 */
export declare const calculatePercentage: (value: number, total: number) => number;
/**
 * Get random item from array
 */
export declare const getRandomItem: <T>(array: T[]) => T;
/**
 * Shuffle array
 */
export declare const shuffleArray: <T>(array: T[]) => T[];
/**
 * Remove duplicates from array
 */
export declare const removeDuplicates: <T>(array: T[], key?: keyof T) => T[];
/**
 * Group array by key
 */
export declare const groupBy: <T>(array: T[], key: keyof T) => Record<string, T[]>;
/**
 * Deep clone object
 */
export declare const deepClone: <T>(obj: T) => T;
/**
 * Check if object is empty
 */
export declare const isEmpty: (obj: any) => boolean;
/**
 * Merge objects deeply
 */
export declare const deepMerge: (target: any, source: any) => any;
/**
 * Retry function with exponential backoff
 */
export declare const retryWithBackoff: <T>(fn: () => Promise<T>, maxRetries?: number, baseDelay?: number) => Promise<T>;
/**
 * Debounce function
 */
export declare const debounce: <T extends (...args: any[]) => any>(func: T, wait: number) => ((...args: Parameters<T>) => void);
/**
 * Throttle function
 */
export declare const throttle: <T extends (...args: any[]) => any>(func: T, limit: number) => ((...args: Parameters<T>) => void);
/**
 * Convert bytes to human readable format
 */
export declare const formatBytes: (bytes: number, decimals?: number) => string;
/**
 * Generate color from string (for avatars, etc.)
 */
export declare const generateColorFromString: (str: string) => string;
/**
 * Validate and sanitize HTML
 */
export declare const sanitizeHtml: (html: string) => string;
/**
 * Standard API response format
 */
export declare const sendResponse: (res: Response, statusCode: number, success: boolean, message: string, data?: any, meta?: any) => Response<any, Record<string, any>>;
/**
 * Standard error response
 */
export declare const sendError: (res: Response, statusCode: number, message: string, errors?: any[]) => Response<any, Record<string, any>>;
/**
 * Log with timestamp and level
 */
export declare const log: (level: "info" | "warn" | "error", message: string, data?: any) => void;
/**
 * Environment helpers
 */
export declare const env: {
    isDevelopment: () => boolean;
    isProduction: () => boolean;
    isTest: () => boolean;
    get: (key: string, defaultValue?: string) => string | undefined;
    getRequired: (key: string) => string;
};
//# sourceMappingURL=helpers.d.ts.map