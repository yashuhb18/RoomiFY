import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseAdmin } from './supabase.client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private readonly supabaseAdmin: SupabaseClient;
  private readonly bucketName: string;
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    this.supabaseAdmin = createSupabaseAdmin(configService);
    this.bucketName = configService.get<string>('supabase.storageBucket') || 'aegis-hostel-assets';
    this.uploadDir = path.join(process.cwd(), 'uploads');
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
    const fileName = `${Date.now()}-${sanitizedName}`;
    const filePath = `${folder}/${fileName}`;

    try {
      if (this.supabaseAdmin) {
        const { error } = await this.supabaseAdmin.storage
          .from(this.bucketName)
          .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (!error) {
          return filePath;
        }
        this.logger.warn(`Supabase upload failed: ${error.message}. Falling back to local storage.`);
      }
    } catch {
      this.logger.warn(`Supabase storage unavailable. Falling back to local storage.`);
    }

    // Local Fallback
    const localFolderDir = path.join(this.uploadDir, folder);
    if (!fs.existsSync(localFolderDir)) {
      fs.mkdirSync(localFolderDir, { recursive: true });
    }
    const fullLocalPath = path.join(localFolderDir, fileName);
    fs.writeFileSync(fullLocalPath, file.buffer);
    this.logger.log(`File saved locally at: ${fullLocalPath}`);

    return `uploads/${folder}/${fileName}`;
  }

  async getSignedUrl(filePath: string): Promise<string> {
    if (!filePath) return '';
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    if (filePath.startsWith('uploads/') || filePath.startsWith('/uploads')) {
      const cleanPath = filePath.replace(/^\/+/, '');
      return `http://localhost:5000/${cleanPath}`;
    }

    try {
      const { data, error } = await this.supabaseAdmin.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, 3600);

      if (error || !data?.signedUrl) {
        return `http://localhost:5000/${filePath}`;
      }

      return data.signedUrl;
    } catch {
      return `http://localhost:5000/${filePath}`;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    if (filePath.startsWith('uploads/') || filePath.startsWith('/uploads')) {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      return;
    }

    try {
      await this.supabaseAdmin.storage.from(this.bucketName).remove([filePath]);
    } catch (error) {
      this.logger.error('Delete error', error instanceof Error ? error.stack : undefined);
    }
  }
}
