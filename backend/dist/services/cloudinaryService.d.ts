export interface UploadOptions {
    folder?: string;
    publicId?: string;
    transformation?: any[];
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
    format?: string;
    quality?: string | number;
}
export interface UploadResult {
    publicId: string;
    url: string;
    secureUrl: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
    createdAt: string;
}
export declare class CloudinaryService {
    /**
     * Upload image buffer to Cloudinary
     */
    uploadBuffer(buffer: Buffer, options?: UploadOptions): Promise<UploadResult>;
    /**
     * Upload image from URL to Cloudinary
     */
    uploadFromUrl(file: string, options?: UploadOptions): Promise<UploadResult>;
    /**
     * Delete image from Cloudinary
     */
    deleteImage(publicId: string): Promise<boolean>;
    /**
     * Generate transformation URL
     */
    generateUrl(publicId: string, transformations?: any[]): string;
    /**
     * Generate optimized URL for different use cases
     */
    generateOptimizedUrl(publicId: string, type: 'thumbnail' | 'medium' | 'large' | 'avatar'): string;
    /**
     * Generate upload signature for direct client uploads
     */
    generateUploadSignature(params: any): {
        signature: string;
        timestamp: number;
    };
    /**
     * Get image metadata
     */
    getImageInfo(publicId: string): Promise<any>;
    /**
     * Add tags to image
     */
    addTags(publicId: string, tags: string[]): Promise<void>;
    /**
     * Remove tags from image
     */
    removeTags(publicId: string, tags: string[]): Promise<void>;
    /**
     * Search images by tags
     */
    searchByTags(tags: string[], maxResults?: number): Promise<any[]>;
    /**
     * Create image archive (ZIP)
     */
    createArchive(publicIds: string[], archiveName?: string): Promise<string>;
    /**
     * Auto-tag image using AI
     */
    autoTag(publicId: string): Promise<string[]>;
    /**
     * Detect faces in image
     */
    detectFaces(publicId: string): Promise<any[]>;
    /**
     * Remove background from image
     */
    removeBackground(publicId: string): Promise<string>;
    /**
     * Apply AI-based image enhancement
     */
    enhanceImage(publicId: string, enhancementType: 'improve' | 'upscale' | 'restore'): Promise<string>;
}
export declare const cloudinaryService: CloudinaryService;
//# sourceMappingURL=cloudinaryService.d.ts.map