import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly isConfigured: boolean;
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    const cloudName = configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = configService.get<string>('CLOUDINARY_API_SECRET');

    this.isConfigured = !!(
      cloudName &&
      apiKey &&
      apiSecret &&
      cloudName !== 'YOUR_CLOUD_NAME_HERE' &&
      apiKey !== 'YOUR_API_KEY_HERE'
    );

    if (this.isConfigured) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      this.logger.log('Cloudinary configured successfully.');
    } else {
      this.logger.warn('Cloudinary NOT configured — falling back to local file storage.');
    }

    this.uploadDir = path.join(process.cwd(), 'uploads');
  }

  /**
   * Upload a file buffer to Cloudinary. Falls back to local storage if not configured.
   * Returns { secureUrl, publicId } for database storage.
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ secureUrl: string; publicId: string }> {
    // Try Cloudinary first
    if (this.isConfigured) {
      try {
        const result = await this.uploadToCloudinary(file.buffer, {
          folder: `roomify/${folder}`,
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { width: 1200, crop: 'limit' },
          ],
        });

        this.logger.log(`Cloudinary upload success: ${result.public_id}`);
        return {
          secureUrl: result.secure_url,
          publicId: result.public_id,
        };
      } catch (error) {
        this.logger.error('Cloudinary upload failed, falling back to local', error);
      }
    }

    // Local fallback
    return this.saveLocally(file, folder);
  }

  /**
   * Get a publicly accessible URL for an image.
   * Cloudinary URLs are already public.
   * Local files are served from the /uploads static route.
   */
  getPublicUrl(secureUrl: string): string {
    if (!secureUrl) return '';
    // If it's already a full URL (Cloudinary or external), return as-is
    if (secureUrl.startsWith('http://') || secureUrl.startsWith('https://')) {
      return secureUrl;
    }
    // Local fallback path
    return `http://localhost:5000/${secureUrl.replace(/^\/+/, '')}`;
  }

  /**
   * Delete an image from Cloudinary or local storage.
   */
  async deleteImage(publicId: string): Promise<void> {
    if (!publicId) return;

    // If it's a local file path
    if (publicId.startsWith('uploads/') || publicId.startsWith('/uploads')) {
      const fullPath = path.join(process.cwd(), publicId);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        this.logger.log(`Local file deleted: ${fullPath}`);
      }
      return;
    }

    // If Cloudinary is configured, delete from Cloudinary
    if (this.isConfigured) {
      try {
        await cloudinary.uploader.destroy(publicId);
        this.logger.log(`Cloudinary image deleted: ${publicId}`);
      } catch (error) {
        this.logger.error(`Failed to delete Cloudinary image: ${publicId}`, error);
      }
    }
  }

  /**
   * Generate an optimized Cloudinary thumbnail URL.
   */
  getThumbnailUrl(publicId: string, width = 400, height = 300): string {
    if (!this.isConfigured || !publicId || publicId.startsWith('uploads/')) {
      return this.getPublicUrl(publicId);
    }

    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
      secure: true,
    });
  }

  // --- Private helpers ---

  private uploadToCloudinary(
    buffer: Buffer,
    options: Record<string, any>,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('No result from Cloudinary'));
          resolve(result);
        },
      );

      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  private saveLocally(
    file: Express.Multer.File,
    folder: string,
  ): { secureUrl: string; publicId: string } {
    const sanitizedName = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .toLowerCase();
    const fileName = `${Date.now()}-${sanitizedName}`;
    const localFolderDir = path.join(this.uploadDir, folder);

    if (!fs.existsSync(localFolderDir)) {
      fs.mkdirSync(localFolderDir, { recursive: true });
    }

    const fullLocalPath = path.join(localFolderDir, fileName);
    fs.writeFileSync(fullLocalPath, file.buffer);
    this.logger.log(`File saved locally: ${fullLocalPath}`);

    const relativePath = `uploads/${folder}/${fileName}`;
    return {
      secureUrl: `http://localhost:5000/${relativePath}`,
      publicId: relativePath,
    };
  }
}
