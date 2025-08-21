import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface FilebaseUploadResult {
  key: string;
  url: string;
  size: number;
  etag: string;
}

export interface FilebaseConfig {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  region: string;
  bucket: string;
}

export class FilebaseClient {
  private client: S3Client;
  private config: FilebaseConfig;

  constructor(config: FilebaseConfig) {
    this.config = config;
    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true, // Required for Filebase
    });
  }

  /**
   * Upload a file to Filebase
   */
  async uploadFile(
    key: string,
    data: Buffer | string,
    contentType?: string
  ): Promise<FilebaseUploadResult> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: data,
        ContentType: contentType || 'application/octet-stream',
      });

      const result = await this.client.send(command);
      
      return {
        key,
        url: `${this.config.endpoint}/${this.config.bucket}/${key}`,
        size: data.length,
        etag: result.ETag || '',
      };
    } catch (error) {
      console.error('Filebase upload error:', error);
      throw new Error(`Failed to upload file to Filebase: ${error}`);
    }
  }

  /**
   * Upload JSON metadata
   */
  async uploadMetadata(
    key: string,
    metadata: Record<string, unknown>
  ): Promise<FilebaseUploadResult> {
    const jsonString = JSON.stringify(metadata, null, 2);
    return this.uploadFile(key, jsonString, 'application/json');
  }

  /**
   * Upload image file with compression
   */
  async uploadImage(
    key: string,
    imageBuffer: Buffer,
    contentType: string = 'image/jpeg',
    compress: boolean = true,
    imageType: 'banner' | 'thumbnail' | 'profile' | 'general' = 'general'
  ): Promise<FilebaseUploadResult> {
    let finalBuffer = imageBuffer;
    let finalContentType = contentType;
    let compressionStats = null;

    if (compress) {
      try {
        // Import server-side compression utilities
        const { 
          smartCompress, 
          validateImage, 
          getCompressionStats, 
          formatFileSize 
        } = await import('@/lib/utils/image-compression-server');

        // Validate image first
        const validation = validateImage(imageBuffer);
        if (!validation.isValid) {
          throw new Error(`Image validation failed: ${validation.error}`);
        }

        // Compress image
        const compressionResult = await smartCompress(imageBuffer, imageType);
        finalBuffer = compressionResult.buffer;
        
        // Update content type based on compressed format
        finalContentType = `image/${compressionResult.format}`;
        
        // Log compression statistics
        compressionStats = getCompressionStats(imageBuffer.length, finalBuffer.length);
        console.log(`Image compression: ${formatFileSize(imageBuffer.length)} → ${formatFileSize(finalBuffer.length)} (${compressionStats.sizeReductionPercent.toFixed(1)}% reduction)`);
        
      } catch (error) {
        console.warn('Image compression failed, uploading original:', error);
        // Continue with original image if compression fails
      }
    }

    return this.uploadFile(key, finalBuffer, finalContentType);
  }

  /**
   * Get a file from Filebase
   */
  async getFile(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      const result = await this.client.send(command);
      
      if (!result.Body) {
        throw new Error('No file content received');
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of result.Body as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
      }
      
      return Buffer.concat(chunks);
    } catch (error) {
      console.error('Filebase get file error:', error);
      throw new Error(`Failed to get file from Filebase: ${error}`);
    }
  }

  /**
   * Get JSON metadata
   */
  async getMetadata(key: string): Promise<Record<string, unknown>> {
    try {
      const buffer = await this.getFile(key);
      return JSON.parse(buffer.toString()) as Record<string, unknown>;
    } catch (error) {
      console.error('Filebase get metadata error:', error);
      throw new Error(`Failed to get metadata from Filebase: ${error}`);
    }
  }

  /**
   * Delete a file from Filebase
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      await this.client.send(command);
    } catch (error) {
      console.error('Filebase delete file error:', error);
      throw new Error(`Failed to delete file from Filebase: ${error}`);
    }
  }

  /**
   * Generate a presigned URL for direct upload
   */
  async generatePresignedUrl(
    key: string,
    contentType: string = 'application/octet-stream',
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        ContentType: contentType,
      });

      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      console.error('Filebase presigned URL error:', error);
      throw new Error(`Failed to generate presigned URL: ${error}`);
    }
  }

  /**
   * Generate a presigned URL for file access
   */
  async generateAccessUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
      });

      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      console.error('Filebase access URL error:', error);
      throw new Error(`Failed to generate access URL: ${error}`);
    }
  }

  /**
   * Get the public URL for a file
   */
  getPublicUrl(key: string): string {
    return `${this.config.endpoint}/${this.config.bucket}/${key}`;
  }
}

// Global Filebase client instance
let filebaseClient: FilebaseClient | null = null;

/**
 * Get or create Filebase client instance
 */
export function getFilebaseClient(): FilebaseClient {
  if (!filebaseClient) {
    // Use environment variables directly to avoid circular dependencies
    const config: FilebaseConfig = {
      accessKeyId: process.env.FILEBASE_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.FILEBASE_SECRET_ACCESS_KEY || '',
      endpoint: process.env.FILEBASE_ENDPOINT || 'https://s3.filebase.com',
      region: process.env.FILEBASE_REGION || 'us-east-1',
      bucket: process.env.FILEBASE_BUCKET || '',
    };

    // Validate configuration
    if (!config.accessKeyId || !config.secretAccessKey || !config.bucket) {
      throw new Error('Filebase configuration incomplete. Please check environment variables.');
    }

    filebaseClient = new FilebaseClient(config);
  }

  return filebaseClient;
}

/**
 * Generate a unique key for file storage
 */
export function generateFileKey(prefix: string, filename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = filename.split('.').pop() || '';
  return `${prefix}/${timestamp}-${random}.${extension}`;
}

/**
 * Generate a key for event metadata
 */
export function generateEventMetadataKey(eventId: string): string {
  return `events/${eventId}/metadata.json`;
}

/**
 * Generate a key for event images
 */
export function generateEventImageKey(eventId: string, filename: string): string {
  return `events/${eventId}/images/${filename}`;
}
