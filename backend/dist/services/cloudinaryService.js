"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinaryService = exports.CloudinaryService = void 0;
const cloudinary_1 = require("cloudinary");
const streamifier_1 = __importDefault(require("streamifier"));
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
class CloudinaryService {
    /**
     * Upload image buffer to Cloudinary
     */
    async uploadBuffer(buffer, options = {}) {
        try {
            const uploadOptions = {
                folder: options.folder || 'ai-style',
                resource_type: options.resourceType || 'auto',
                // transformation: options.transformation,
                // quality: options.quality || 'auto',
                // format: options.format || 'auto'
            };
            console.log(uploadOptions);
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.v2.uploader.upload_stream(uploadOptions, (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload stream error:', error);
                        return reject(error);
                    }
                    resolve(result);
                });
                // Convert buffer to stream and pipe to Cloudinary
                streamifier_1.default.createReadStream(buffer).pipe(uploadStream);
            });
            if (!result) {
                throw new Error('No result from Cloudinary upload');
            }
            return {
                publicId: result.public_id,
                url: result.url,
                secureUrl: result.secure_url,
                width: result.width || 0,
                height: result.height || 0,
                format: result.format || 'unknown',
                bytes: result.bytes || 0,
                createdAt: result.created_at
            };
        }
        catch (error) {
            console.error('Cloudinary upload error:', error);
            throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
        }
    }
    /**
     * Upload image from URL to Cloudinary
     */
    async uploadFromUrl(file, options = {}) {
        try {
            // const uploadOptions = {
            //   folder: options.folder || 'ai-stylist',
            //   public_id: options.publicId,
            //   transformation: options.transformation,
            //   resource_type: options.resourceType || 'auto',
            //   ...options
            // };
            const uploadOptions = {
                folder: 'ai-style', // Optional: specify a folder in Cloudinary
                use_filename: true, // Optional: use original filename as public ID
                unique_filename: false, // Optional: prevent adding random string to filename
                overwrite: true
            };
            const result = await cloudinary_1.v2.uploader.upload(file, uploadOptions);
            return {
                publicId: result.public_id,
                url: result.url,
                secureUrl: result.secure_url,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
                createdAt: result.created_at
            };
        }
        catch (error) {
            console.error('Cloudinary upload from URL error:', error);
            throw new Error('Failed to upload image from URL to Cloudinary');
        }
    }
    /**
     * Delete image from Cloudinary
     */
    async deleteImage(publicId) {
        try {
            const result = await cloudinary_1.v2.uploader.destroy(publicId);
            return result.result === 'ok';
        }
        catch (error) {
            console.error('Cloudinary delete error:', error);
            throw new Error('Failed to delete image from Cloudinary');
        }
    }
    /**
     * Generate transformation URL
     */
    generateUrl(publicId, transformations = []) {
        return cloudinary_1.v2.url(publicId, {
            transformation: transformations
        });
    }
    /**
     * Generate optimized URL for different use cases
     */
    generateOptimizedUrl(publicId, type) {
        const transformations = {
            thumbnail: [
                { width: 150, height: 150, crop: 'fill' },
                { quality: 'auto' },
                { format: 'auto' }
            ],
            medium: [
                { width: 500, height: 500, crop: 'limit' },
                { quality: 'auto' },
                { format: 'auto' }
            ],
            large: [
                { width: 1000, height: 1000, crop: 'limit' },
                { quality: 'auto' },
                { format: 'auto' }
            ],
            avatar: [
                { width: 200, height: 200, crop: 'fill', gravity: 'face' },
                { radius: 'max' },
                { quality: 'auto' },
                { format: 'auto' }
            ]
        };
        return cloudinary_1.v2.url(publicId, {
            transformation: transformations[type]
        });
    }
    /**
     * Generate upload signature for direct client uploads
     */
    generateUploadSignature(params) {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const paramsWithTimestamp = { ...params, timestamp };
        const signature = cloudinary_1.v2.utils.api_sign_request(paramsWithTimestamp, process.env.CLOUDINARY_API_SECRET);
        return { signature, timestamp };
    }
    /**
     * Get image metadata
     */
    async getImageInfo(publicId) {
        try {
            const result = await cloudinary_1.v2.api.resource(publicId);
            return {
                publicId: result.public_id,
                url: result.url,
                secureUrl: result.secure_url,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
                createdAt: result.created_at,
                tags: result.tags,
                colors: result.colors
            };
        }
        catch (error) {
            console.error('Cloudinary get info error:', error);
            throw new Error('Failed to get image info from Cloudinary');
        }
    }
    /**
     * Add tags to image
     */
    async addTags(publicId, tags) {
        try {
            await cloudinary_1.v2.uploader.add_tag(tags.join(','), [publicId]);
        }
        catch (error) {
            console.error('Cloudinary add tags error:', error);
            throw new Error('Failed to add tags to image');
        }
    }
    /**
     * Remove tags from image
     */
    async removeTags(publicId, tags) {
        try {
            await cloudinary_1.v2.uploader.remove_tag(tags.join(','), [publicId]);
        }
        catch (error) {
            console.error('Cloudinary remove tags error:', error);
            throw new Error('Failed to remove tags from image');
        }
    }
    /**
     * Search images by tags
     */
    async searchByTags(tags, maxResults = 50) {
        try {
            const result = await cloudinary_1.v2.search
                .expression(`tags:${tags.join(' AND tags:')}`)
                .max_results(maxResults)
                .execute();
            return result.resources;
        }
        catch (error) {
            console.error('Cloudinary search error:', error);
            throw new Error('Failed to search images by tags');
        }
    }
    /**
     * Create image archive (ZIP)
     */
    async createArchive(publicIds, archiveName) {
        try {
            const result = await cloudinary_1.v2.utils.archive_params({
                type: 'upload',
                target_format: 'zip',
                public_ids: publicIds,
                ...(archiveName && { target_public_id: archiveName })
            });
            return result.url;
        }
        catch (error) {
            console.error('Cloudinary create archive error:', error);
            throw new Error('Failed to create image archive');
        }
    }
    /**
     * Auto-tag image using AI
     */
    async autoTag(publicId) {
        try {
            const result = await cloudinary_1.v2.uploader.explicit(publicId, {
                type: 'upload',
                categorization: 'google_tagging',
                auto_tagging: 0.7 // Confidence threshold
            });
            return result.tags || [];
        }
        catch (error) {
            console.error('Cloudinary auto-tag error:', error);
            throw new Error('Failed to auto-tag image');
        }
    }
    /**
     * Detect faces in image
     */
    async detectFaces(publicId) {
        try {
            const result = await cloudinary_1.v2.uploader.explicit(publicId, {
                type: 'upload',
                detection: 'adv_face'
            });
            return result.faces || [];
        }
        catch (error) {
            console.error('Cloudinary face detection error:', error);
            throw new Error('Failed to detect faces in image');
        }
    }
    /**
     * Remove background from image
     */
    async removeBackground(publicId) {
        try {
            const transformedUrl = cloudinary_1.v2.url(publicId, {
                transformation: [
                    { effect: 'background_removal' },
                    { format: 'png' }
                ]
            });
            return transformedUrl;
        }
        catch (error) {
            console.error('Cloudinary background removal error:', error);
            throw new Error('Failed to remove background from image');
        }
    }
    /**
     * Apply AI-based image enhancement
     */
    async enhanceImage(publicId, enhancementType) {
        try {
            const transformations = {
                improve: [{ effect: 'improve' }],
                upscale: [{ effect: 'upscale' }],
                restore: [{ effect: 'restore' }]
            };
            const transformedUrl = cloudinary_1.v2.url(publicId, {
                transformation: transformations[enhancementType]
            });
            return transformedUrl;
        }
        catch (error) {
            console.error('Cloudinary image enhancement error:', error);
            throw new Error('Failed to enhance image');
        }
    }
}
exports.CloudinaryService = CloudinaryService;
// Export singleton instance
exports.cloudinaryService = new CloudinaryService();
//# sourceMappingURL=cloudinaryService.js.map