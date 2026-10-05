import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const imageExtensions: Record<string, string> = {
  'image/gif': 'gif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

@Injectable()
export class ProductImageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly publicBaseUrl: string;

  constructor(config: ConfigService) {
    this.region = config.get<string>('AWS_REGION') || 'us-east-1';
    this.bucket = config.get<string>('S3_BUCKET') || '';
    this.publicBaseUrl = (config.get<string>('S3_PUBLIC_BASE_URL') || '').replace(/\/+$/, '');
    const accessKeyId = config.get<string>('AWS_ACCESS_KEY_ID')?.trim();
    const secretAccessKey = config.get<string>('AWS_SECRET_ACCESS_KEY')?.trim();

    if (Boolean(accessKeyId) !== Boolean(secretAccessKey)) {
      throw new Error('Configure both AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY, or leave both unset.');
    }

    this.client = new S3Client({
      region: this.region,
      ...(accessKeyId && secretAccessKey
        ? { credentials: { accessKeyId, secretAccessKey } }
        : {}),
    });
  }

  async upload(file: Express.Multer.File): Promise<{ key: string; imageUrl: string }> {
    const bucket = this.requireBucket();
    const extension = imageExtensions[file.mimetype];
    if (!extension) throw new ServiceUnavailableException('Unsupported product image type.');

    const key = `products/${randomUUID()}.${extension}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    return { key, imageUrl: this.getImageUrl(key) };
  }

  async deleteByImageUrl(imageUrl: string | null): Promise<void> {
    if (!imageUrl) return;
    const key = this.getManagedObjectKey(imageUrl);
    if (!key) return;

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.requireBucket(),
        Key: key,
      }),
    );
  }

  private getImageUrl(key: string): string {
    const encodedKey = key.split('/').map(encodeURIComponent).join('/');
    if (this.publicBaseUrl) return `${this.publicBaseUrl}/${encodedKey}`;
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${encodedKey}`;
  }

  private getManagedObjectKey(imageUrl: string): string | null {
    let url: URL;
    try {
      url = new URL(imageUrl);
    } catch {
      return null;
    }

    let encodedKey: string | null = null;
    if (this.publicBaseUrl) {
      try {
        const base = new URL(this.publicBaseUrl);
        const prefix = `${base.pathname.replace(/\/+$/, '')}/`;
        if (url.origin === base.origin && url.pathname.startsWith(prefix)) {
          encodedKey = url.pathname.slice(prefix.length);
        }
      } catch {
        return null;
      }
    } else if (
      this.bucket &&
      [
        `${this.bucket}.s3.${this.region}.amazonaws.com`,
        `${this.bucket}.s3.amazonaws.com`,
      ].includes(url.hostname)
    ) {
      encodedKey = url.pathname.slice(1);
    }

    if (!encodedKey) return null;
    try {
      const key = encodedKey.split('/').map(decodeURIComponent).join('/');
      return key.startsWith('products/') ? key : null;
    } catch {
      return null;
    }
  }

  private requireBucket(): string {
    if (!this.bucket) {
      throw new ServiceUnavailableException('Product image storage is not configured.');
    }
    return this.bucket;
  }
}