import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryStorageService {
  private readonly configured: boolean;

  constructor(config: ConfigService) {
    const cloudName = config.get<string>('CLOUDINARY_CLOUD_NAME')?.trim();
    const apiKey = config.get<string>('CLOUDINARY_API_KEY')?.trim();
    const apiSecret = config.get<string>('CLOUDINARY_API_SECRET')?.trim();
    const values = [cloudName, apiKey, apiSecret];
    if (values.some(Boolean) && !values.every(Boolean)) throw new Error('All Cloudinary credentials must be configured together');
    if (cloudName && !/^[A-Za-z0-9_-]+$/.test(cloudName)) throw new Error('CLOUDINARY_CLOUD_NAME is invalid');
    this.configured = values.every(Boolean);
    if (this.configured) cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  }

  get enabled() { return this.configured; }

  async upload(id: string, bytes: Buffer): Promise<string> {
    if (!this.configured) throw new ServiceUnavailableException('Image storage is not configured');
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'compus/images', public_id: id, overwrite: true, unique_filename: false, use_filename: false }, (error, uploaded) => {
        if (error || !uploaded) reject(error || new Error('Cloudinary returned no upload result'));
        else resolve(uploaded);
      });
      stream.end(bytes);
    });
    if (!result.secure_url?.startsWith('https://res.cloudinary.com/')) throw new ServiceUnavailableException('Cloudinary returned an invalid secure image URL');
    return result.secure_url;
  }

  async destroy(id: string) {
    if (!this.configured) return;
    await cloudinary.uploader.destroy(`compus/images/${id}`, { resource_type: 'image', invalidate: true });
  }
}
