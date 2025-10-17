"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = exports.log = exports.sendError = exports.sendResponse = exports.sanitizeHtml = exports.generateColorFromString = exports.formatBytes = exports.throttle = exports.debounce = exports.retryWithBackoff = exports.deepMerge = exports.isEmpty = exports.deepClone = exports.groupBy = exports.removeDuplicates = exports.shuffleArray = exports.getRandomItem = exports.calculatePercentage = exports.generatePagination = exports.extractDomain = exports.isValidUrl = exports.isValidEmail = exports.formatRelativeTime = exports.formatDate = exports.formatPrice = exports.truncateString = exports.slugify = exports.capitalizeWords = exports.sleep = exports.generateUUID = exports.hashString = exports.generateSecureToken = exports.generateRandomString = void 0;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Generate a random string of specified length
 */
const generateRandomString = (length = 32) => {
    return crypto_1.default.randomBytes(length).toString('hex');
};
exports.generateRandomString = generateRandomString;
/**
 * Generate a secure random token
 */
const generateSecureToken = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
exports.generateSecureToken = generateSecureToken;
/**
 * Hash a string using SHA-256
 */
const hashString = (input) => {
    return crypto_1.default.createHash('sha256').update(input).digest('hex');
};
exports.hashString = hashString;
/**
 * Generate a UUID v4
 */
const generateUUID = () => {
    return crypto_1.default.randomUUID();
};
exports.generateUUID = generateUUID;
/**
 * Sleep for specified milliseconds
 */
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.sleep = sleep;
/**
 * Capitalize first letter of each word
 */
const capitalizeWords = (str) => {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};
exports.capitalizeWords = capitalizeWords;
/**
 * Convert string to slug format
 */
const slugify = (str) => {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
exports.slugify = slugify;
/**
 * Truncate string to specified length
 */
const truncateString = (str, length, suffix = '...') => {
    if (str.length <= length)
        return str;
    return str.substring(0, length - suffix.length) + suffix;
};
exports.truncateString = truncateString;
/**
 * Format price with currency
 */
const formatPrice = (price, currency = 'INR') => {
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
    return formatter.format(price);
};
exports.formatPrice = formatPrice;
/**
 * Format date to readable string
 */
const formatDate = (date, locale = 'en-IN') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
exports.formatDate = formatDate;
/**
 * Format date to relative time (e.g., "2 hours ago")
 */
const formatRelativeTime = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    if (diffInSeconds < 60)
        return 'just now';
    if (diffInSeconds < 3600)
        return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000)
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000)
        return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};
exports.formatRelativeTime = formatRelativeTime;
/**
 * Check if email is valid
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
/**
 * Check if URL is valid
 */
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
};
exports.isValidUrl = isValidUrl;
/**
 * Extract domain from URL
 */
const extractDomain = (url) => {
    try {
        return new URL(url).hostname;
    }
    catch {
        return '';
    }
};
exports.extractDomain = extractDomain;
/**
 * Generate pagination metadata
 */
const generatePagination = (page, limit, total) => {
    const pages = Math.ceil(total / limit);
    const hasNext = page < pages;
    const hasPrev = page > 1;
    return {
        page,
        limit,
        total,
        pages,
        hasNext,
        hasPrev,
        nextPage: hasNext ? page + 1 : null,
        prevPage: hasPrev ? page - 1 : null
    };
};
exports.generatePagination = generatePagination;
/**
 * Calculate percentage
 */
const calculatePercentage = (value, total) => {
    if (total === 0)
        return 0;
    return Math.round((value / total) * 100);
};
exports.calculatePercentage = calculatePercentage;
/**
 * Get random item from array
 */
const getRandomItem = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};
exports.getRandomItem = getRandomItem;
/**
 * Shuffle array
 */
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};
exports.shuffleArray = shuffleArray;
/**
 * Remove duplicates from array
 */
const removeDuplicates = (array, key) => {
    if (!key) {
        return [...new Set(array)];
    }
    const seen = new Set();
    return array.filter(item => {
        const value = item[key];
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
};
exports.removeDuplicates = removeDuplicates;
/**
 * Group array by key
 */
const groupBy = (array, key) => {
    return array.reduce((groups, item) => {
        const groupKey = String(item[key]);
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
    }, {});
};
exports.groupBy = groupBy;
/**
 * Deep clone object
 */
const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};
exports.deepClone = deepClone;
/**
 * Check if object is empty
 */
const isEmpty = (obj) => {
    if (obj == null)
        return true;
    if (Array.isArray(obj) || typeof obj === 'string')
        return obj.length === 0;
    if (typeof obj === 'object')
        return Object.keys(obj).length === 0;
    return false;
};
exports.isEmpty = isEmpty;
/**
 * Merge objects deeply
 */
const deepMerge = (target, source) => {
    const result = { ...target };
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = (0, exports.deepMerge)(result[key] || {}, source[key]);
        }
        else {
            result[key] = source[key];
        }
    }
    return result;
};
exports.deepMerge = deepMerge;
/**
 * Retry function with exponential backoff
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt === maxRetries) {
                throw lastError;
            }
            const delay = baseDelay * Math.pow(2, attempt);
            await (0, exports.sleep)(delay);
        }
    }
    throw lastError;
};
exports.retryWithBackoff = retryWithBackoff;
/**
 * Debounce function
 */
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};
exports.debounce = debounce;
/**
 * Throttle function
 */
const throttle = (func, limit) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};
exports.throttle = throttle;
/**
 * Convert bytes to human readable format
 */
const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
exports.formatBytes = formatBytes;
/**
 * Generate color from string (for avatars, etc.)
 */
const generateColorFromString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
};
exports.generateColorFromString = generateColorFromString;
/**
 * Validate and sanitize HTML
 */
const sanitizeHtml = (html) => {
    // Basic HTML sanitization - in production, use a library like DOMPurify
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+="[^"]*"/gi, '');
};
exports.sanitizeHtml = sanitizeHtml;
/**
 * Standard API response format
 */
const sendResponse = (res, statusCode, success, message, data, meta) => {
    const response = {
        success,
        message,
        timestamp: new Date().toISOString()
    };
    if (data !== undefined) {
        response.data = data;
    }
    if (meta !== undefined) {
        response.meta = meta;
    }
    return res.status(statusCode).json(response);
};
exports.sendResponse = sendResponse;
/**
 * Standard error response
 */
const sendError = (res, statusCode, message, errors) => {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };
    if (errors && errors.length > 0) {
        response.errors = errors;
    }
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
/**
 * Log with timestamp and level
 */
const log = (level, message, data) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    if (data) {
        console[level](logMessage, data);
    }
    else {
        console[level](logMessage);
    }
};
exports.log = log;
/**
 * Environment helpers
 */
exports.env = {
    isDevelopment: () => process.env.NODE_ENV === 'development',
    isProduction: () => process.env.NODE_ENV === 'production',
    isTest: () => process.env.NODE_ENV === 'test',
    get: (key, defaultValue) => process.env[key] || defaultValue,
    getRequired: (key) => {
        const value = process.env[key];
        if (!value) {
            throw new Error(`Required environment variable ${key} is not set`);
        }
        return value;
    }
};
//# sourceMappingURL=helpers.js.map