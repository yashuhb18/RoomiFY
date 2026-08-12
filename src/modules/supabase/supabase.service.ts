import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseAdmin } from './supabase.client';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private readonly supabaseAdmin: SupabaseClient;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.supabaseAdmin = createSupabaseAdmin(configService);
    this.bucketName = configService.get<string>('supabase.storageBucket') || 'aegis-hostel-assets';
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    try {
      // Sanitize filename: remove special characters, keep extension
      const sanitizedName = file.originalname
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .toLowerCase();
      const path = `${folder}/${Date.now()}-${sanitizedName}`;

      const { error } = await this.supabaseAdmin.storage
        .from(this.bucketName)
        .upload(path, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        this.logger.error(`File upload failed: ${error.message}`);
        throw new InternalServerErrorException('File upload failed.');
      }

      return path;
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error('Upload error', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('File upload failed.');
    }
  }

  async getSignedUrl(path: string): Promise<string> {
    try {
      const { data, error } = await this.supabaseAdmin.storage
        .from(this.bucketName)
        .createSignedUrl(path, 60); // 60 seconds

      if (error || !data?.signedUrl) {
        this.logger.error(`Signed URL generation failed: ${error?.message}`);
        throw new InternalServerErrorException(
          'Failed to generate file access URL.',
        );
      }

      return data.signedUrl;
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error('Signed URL error', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException(
        'Failed to generate file access URL.',
      );
    }
  }

  async deleteFile(path: string): Promise<void> {
    try {
      const { error } = await this.supabaseAdmin.storage
        .from(this.bucketName)
        .remove([path]);

      if (error) {
        this.logger.error(`File deletion failed: ${error.message}`);
      }
    } catch (error) {
      this.logger.error('Delete error', error instanceof Error ? error.stack : undefined);
    }
  }
}
