/**
 * IPFS Service - Media Layer
 * 
 * Handles all Filebase/IPFS operations for decentralized file storage,
 * including event banners, user avatars, and POAP metadata.
 */

import { 
  StorageProvider, 
  HealthStatus, 
  MediaUploadResult,
  StorageOperationResult,
  ValidationError
} from '../core/interfaces';
import { FilebaseClient } from '@/lib/filebase/client';
import { appConfig } from '@/lib/config/app-config';

export class IPFSService implements StorageProvider {
  readonly name = 'Filebase/IPFS';
  readonly type = 'ipfs' as const;
  
  private client: FilebaseClient;
  private healthCheckCache: { status: HealthStatus; timestamp: number } | null = null;
  private readonly HEALTH_CACHE_DURATION = 60000; // 1 minute

  constructor() {
    // Initialize with default config if Filebase is not configured
    const filebaseConfig = {
      accessKeyId: appConfig.fileStorage.accessKeyId || '',
      secretAccessKey: appConfig.fileStorage.secretAccessKey || '',
      endpoint: appConfig.fileStorage.endpoint || 'https://s3.filebase.com',
      region: appConfig.fileStorage.region || 'us-east-1',
      bucket: appConfig.fileStorage.bucket || 'festos-events'
    };

    this.client = new FilebaseClient(filebaseConfig);
  }

  /**
   * Health check for IPFS connectivity
   */
  async healthCheck(): Promise<HealthStatus> {
    const now = Date.now();
    
    // Return cached result if still valid
    if (this.healthCheckCache && (now - this.healthCheckCache.timestamp) < this.HEALTH_CACHE_DURATION) {
      return this.healthCheckCache.status;
    }

    const startTime = Date.now();
    
    try {
      // Test IPFS connectivity by uploading a small test file
      const testData = JSON.stringify({ test: true, timestamp: Date.now() });
      const testKey = `health-check-${Date.now()}.json`;
      
      const result = await this.client.uploadFile(testKey, testData, 'application/json');
      
      // Clean up test file
      try {
        await this.client.deleteFile(testKey);
      } catch (cleanupError) {
        console.warn('Failed to cleanup health check file:', cleanupError);
      }
      
      const responseTime = Date.now() - startTime;
      
      const status: HealthStatus = {
        status: 'healthy',
        responseTime,
        lastChecked: new Date(),
              details: {
        uploadedSize: result.size,
        endpoint: appConfig.fileStorage.endpoint,
        bucket: appConfig.fileStorage.bucket
      }
      };

      // Cache the result
      this.healthCheckCache = { status, timestamp: now };
      
      return status;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      const status: HealthStatus = {
        status: 'unhealthy',
        responseTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.healthCheckCache = { status, timestamp: now };
      return status;
    }
  }

  /**
   * Get IPFS configuration
   */
  getConfig(): Record<string, unknown> {
    return {
      endpoint: appConfig.fileStorage.endpoint,
      region: appConfig.fileStorage.region,
      bucket: appConfig.fileStorage.bucket,
      hasAccessKey: !!appConfig.fileStorage.accessKeyId,
      hasSecretKey: !!appConfig.fileStorage.secretAccessKey
    };
  }

  /**
   * Upload event banner image
   */
  async uploadEventBanner(
    eventId: string,
    imageBuffer: Buffer,
    contentType: string = 'image/jpeg'
  ): Promise<StorageOperationResult<MediaUploadResult>> {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!imageBuffer || imageBuffer.length === 0) {
        throw new ValidationError('Image buffer is required');
      }

      // Generate unique key for the image
      const key = `events/${eventId}/banner-${Date.now()}.${this.getFileExtension(contentType)}`;
      
      // Upload image with compression
      const result = await this.client.uploadImage(
        key,
        imageBuffer,
        contentType,
        true, // compress
        'banner'
      );

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          url: result.url,
          hash: result.etag,
          size: result.size,
          contentType,
          metadata: {
            eventId,
            type: 'banner',
            compressed: true
          }
        },
        metadata: {
          operationId: `ipfs_banner_${eventId}`,
          timestamp: new Date(),
          provider: this.name,
          responseTime
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          operationId: `ipfs_banner_${eventId}`,
          timestamp: new Date(),
          provider: this.name,
          responseTime
        }
      };
    }
  }

  /**
   * Upload event metadata
   */
  async uploadEventMetadata(
    eventId: string,
    metadata: Record<string, unknown>
  ): Promise<StorageOperationResult<MediaUploadResult>> {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!metadata || Object.keys(metadata).length === 0) {
        throw new ValidationError('Metadata is required');
      }

      // Add metadata to the metadata object
      const enrichedMetadata = {
        ...metadata,
        eventId,
        uploadedAt: new Date().toISOString(),
        version: '1.0'
      };

      // Generate unique key for the metadata
      const key = `events/${eventId}/metadata-${Date.now()}.json`;
      
      // Upload metadata
      const result = await this.client.uploadMetadata(key, enrichedMetadata);

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          url: result.url,
          hash: result.etag,
          size: result.size,
          contentType: 'application/json',
          metadata: {
            eventId,
            type: 'metadata',
            version: '1.0'
          }
        },
        metadata: {
          operationId: `ipfs_metadata_${eventId}`,
          timestamp: new Date(),
          provider: this.name,
          responseTime
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          operationId: `ipfs_metadata_${eventId}`,
          timestamp: new Date(),
          provider: this.name,
          responseTime
        }
      };
    }
  }

  /**
   * Upload POAP metadata
   */
  async uploadPOAPMetadata(
    eventId: string,
    poapData: {
      name: string;
      description: string;
      image: string;
      attributes?: Array<{ trait_type: string; value: string }>;
    }
  ): Promise<StorageOperationResult<MediaUploadResult>> {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!poapData.name || !poapData.description || !poapData.image) {
        throw new ValidationError('POAP name, description, and image are required');
      }

      // Create POAP metadata in standard format
      const poapMetadata = {
        name: poapData.name,
        description: poapData.description,
        image: poapData.image,
        attributes: poapData.attributes || [],
        eventId,
        created_at: new Date().toISOString(),
        version: '1.0'
      };

      // Generate unique key for the POAP metadata
      const key = `events/${eventId}/poap-metadata-${Date.now()}.json`;
      
      // Upload POAP metadata
      const result = await this.client.uploadMetadata(key, poapMetadata);

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          url: result.url,
          hash: result.etag,
          size: result.size,
          contentType: 'application/json',
          metadata: {
            eventId,
            type: 'poap_metadata',
            version: '1.0'
          }
        },
        metadata: {
          operationId: `ipfs_poap_${eventId}`,
          timestamp: new Date(),
          provider: this.name,
          responseTime
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          operationId: `ipfs_poap_${eventId}`,
          timestamp: new Date(),
          provider: this.name,
          responseTime
        }
      };
    }
  }

  /**
   * Upload user avatar
   */
  async uploadUserAvatar(
    userId: string,
    imageBuffer: Buffer,
    contentType: string = 'image/jpeg'
  ): Promise<StorageOperationResult<MediaUploadResult>> {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!imageBuffer || imageBuffer.length === 0) {
        throw new ValidationError('Image buffer is required');
      }

      // Generate unique key for the avatar
      const key = `users/${userId}/avatar-${Date.now()}.${this.getFileExtension(contentType)}`;
      
      // Upload image with compression
      const result = await this.client.uploadImage(
        key,
        imageBuffer,
        contentType,
        true, // compress
        'profile'
      );

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          url: result.url,
          hash: result.etag,
          size: result.size,
          contentType,
          metadata: {
            userId,
            type: 'avatar',
            compressed: true
          }
        },
        metadata: {
          operationId: `ipfs_avatar_${userId}`,
          timestamp: new Date(),
          provider: this.name,
          responseTime
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          operationId: `ipfs_avatar_${userId}`,
          timestamp: new Date(),
          provider: this.name,
          responseTime
        }
      };
    }
  }

  /**
   * Upload general file
   */
  async uploadFile(
    key: string,
    data: Buffer | string,
    contentType?: string
  ): Promise<StorageOperationResult<MediaUploadResult>> {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!data) {
        throw new ValidationError('Data is required');
      }

      // Upload file
      const result = await this.client.uploadFile(key, data, contentType);

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          url: result.url,
          hash: result.etag,
          size: result.size,
          contentType: contentType || 'application/octet-stream',
          metadata: {
            key,
            type: 'general'
          }
        },
        metadata: {
          operationId: `ipfs_file_${key}`,
          timestamp: new Date(),
          provider: this.name,
          responseTime
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          operationId: `ipfs_file_${key}`,
          timestamp: new Date(),
          provider: this.name,
          responseTime
        }
      };
    }
  }

  /**
   * Delete file from IPFS
   */
  async deleteFile(key: string): Promise<StorageOperationResult<void>> {
    const startTime = Date.now();
    
    try {
      await this.client.deleteFile(key);

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        metadata: {
          operationId: `ipfs_delete_${key}`,
          timestamp: new Date(),
          provider: this.name,
          responseTime
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          operationId: `ipfs_delete_${key}`,
          timestamp: new Date(),
          provider: this.name,
          responseTime
        }
      };
    }
  }

  /**
   * Get file extension from content type
   */
  private getFileExtension(contentType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg'
    };
    
    return extensions[contentType] || 'bin';
  }
}
