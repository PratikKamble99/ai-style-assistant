import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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

export class CloudinaryService {
  /**
   * Upload image buffer to Cloudinary
   */
  async uploadBuffer(buffer: Buffer, options: UploadOptions = {}): Promise<UploadResult> {
    try {

      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'ai-style', // optional: specify folder
            resource_type: 'auto', // auto-detect image/video
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        // Convert buffer to stream and pipe to Cloudinary
        streamifier.createReadStream(buffer).pipe(uploadStream);
      });

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
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image to Cloudinary');
    }
  }

  /**
   * Upload image from URL to Cloudinary
   */
  async uploadFromUrl(file: string, options: UploadOptions = {}): Promise<UploadResult> {
    try {
      // const uploadOptions = {
      //   folder: options.folder || 'ai-stylist',
      //   public_id: options.publicId,
      //   transformation: options.transformation,
      //   resource_type: options.resourceType || 'auto',
      //   ...options
      // };

      const uploadOptions= {
        folder: 'ai-style', // Optional: specify a folder in Cloudinary
        use_filename: true,        // Optional: use original filename as public ID
        unique_filename: false,    // Optional: prevent adding random string to filename
        overwrite: true    
      }

      console.log('------------')
      console.log(file)

      const result = await cloudinary.uploader.upload(file, uploadOptions);

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
    } catch (error) {
      console.error('Cloudinary upload from URL error:', error);
      throw new Error('Failed to upload image from URL to Cloudinary');
    }
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error('Failed to delete image from Cloudinary');
    }
  }

  /**
   * Generate transformation URL
   */
  generateUrl(publicId: string, transformations: any[] = []): string {
    return cloudinary.url(publicId, {
      transformation: transformations
    });
  }

  /**
   * Generate optimized URL for different use cases
   */
  generateOptimizedUrl(publicId: string, type: 'thumbnail' | 'medium' | 'large' | 'avatar'): string {
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

    return cloudinary.url(publicId, {
      transformation: transformations[type]
    });
  }

  /**
   * Generate upload signature for direct client uploads
   */
  generateUploadSignature(params: any): { signature: string; timestamp: number } {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsWithTimestamp = { ...params, timestamp };
    
    const signature = cloudinary.utils.api_sign_request(
      paramsWithTimestamp,
      process.env.CLOUDINARY_API_SECRET!
    );

    return { signature, timestamp };
  }

  /**
   * Get image metadata
   */
  async getImageInfo(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId);
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
    } catch (error) {
      console.error('Cloudinary get info error:', error);
      throw new Error('Failed to get image info from Cloudinary');
    }
  }

  /**
   * Add tags to image
   */
  async addTags(publicId: string, tags: string[]): Promise<void> {
    try {
      await cloudinary.uploader.add_tag(tags.join(','), [publicId]);
    } catch (error) {
      console.error('Cloudinary add tags error:', error);
      throw new Error('Failed to add tags to image');
    }
  }

  /**
   * Remove tags from image
   */
  async removeTags(publicId: string, tags: string[]): Promise<void> {
    try {
      await cloudinary.uploader.remove_tag(tags.join(','), [publicId]);
    } catch (error) {
      console.error('Cloudinary remove tags error:', error);
      throw new Error('Failed to remove tags from image');
    }
  }

  /**
   * Search images by tags
   */
  async searchByTags(tags: string[], maxResults: number = 50): Promise<any[]> {
    try {
      const result = await cloudinary.search
        .expression(`tags:${tags.join(' AND tags:')}`)
        .max_results(maxResults)
        .execute();

      return result.resources;
    } catch (error) {
      console.error('Cloudinary search error:', error);
      throw new Error('Failed to search images by tags');
    }
  }

  /**
   * Create image archive (ZIP)
   */
  async createArchive(publicIds: string[], archiveName?: string): Promise<string> {
    try {
      const result = await cloudinary.utils.archive_params({
        type: 'upload',
        target_format: 'zip',
        public_ids: publicIds,
        ...(archiveName && { target_public_id: archiveName })
      });

      return result.url;
    } catch (error) {
      console.error('Cloudinary create archive error:', error);
      throw new Error('Failed to create image archive');
    }
  }

  /**
   * Auto-tag image using AI
   */
  async autoTag(publicId: string): Promise<string[]> {
    try {
      const result = await cloudinary.uploader.explicit(publicId, {
        type: 'upload',
        categorization: 'google_tagging',
        auto_tagging: 0.7 // Confidence threshold
      });

      return result.tags || [];
    } catch (error) {
      console.error('Cloudinary auto-tag error:', error);
      throw new Error('Failed to auto-tag image');
    }
  }

  /**
   * Detect faces in image
   */
  async detectFaces(publicId: string): Promise<any[]> {
    try {
      const result = await cloudinary.uploader.explicit(publicId, {
        type: 'upload',
        detection: 'adv_face'
      });

      return result.faces || [];
    } catch (error) {
      console.error('Cloudinary face detection error:', error);
      throw new Error('Failed to detect faces in image');
    }
  }

  /**
   * Remove background from image
   */
  async removeBackground(publicId: string): Promise<string> {
    try {
      const transformedUrl = cloudinary.url(publicId, {
        transformation: [
          { effect: 'background_removal' },
          { format: 'png' }
        ]
      });

      return transformedUrl;
    } catch (error) {
      console.error('Cloudinary background removal error:', error);
      throw new Error('Failed to remove background from image');
    }
  }

  /**
   * Apply AI-based image enhancement
   */
  async enhanceImage(publicId: string, enhancementType: 'improve' | 'upscale' | 'restore'): Promise<string> {
    try {
      const transformations = {
        improve: [{ effect: 'improve' }],
        upscale: [{ effect: 'upscale' }],
        restore: [{ effect: 'restore' }]
      };

      const transformedUrl = cloudinary.url(publicId, {
        transformation: transformations[enhancementType]
      });

      return transformedUrl;
    } catch (error) {
      console.error('Cloudinary image enhancement error:', error);
      throw new Error('Failed to enhance image');
    }
  }
}

// Export singleton instance
export const cloudinaryService = new CloudinaryService();