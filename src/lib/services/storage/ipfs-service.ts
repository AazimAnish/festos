/**
 * IPFS Service - Media Layer
 * 
 * Handles all Pinata/IPFS operations for decentralized file storage,
 * including event banners, user avatars, and POAP metadata.
 */

import { 
  StorageProvider, 
  HealthStatus, 
  MediaUploadResult,
  StorageOperationResult
} from '../core/interfaces';
import { pinataService } from '@/lib/clients/pinata-client';

export class IPFSService implements StorageProvider {
  readonly name = 'Pinata/IPFS';
  readonly type = 'ipfs' as const;
  
  private healthCheckCache: { status: HealthStatus; timestamp: number } | null = null;
  private readonly HEALTH_CACHE_DURATION = 60000; // 1 minute

  constructor() {
    // Pinata service is initialized in the client
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
      const testData = { test: true, timestamp: Date.now() };
      
      const result = await pinataService.uploadJSON(testData, {
        name: `Health Check - ${Date.now()}`,
        keyValues: { type: 'health-check' }
      });
      
      const responseTime = Date.now() - startTime;
      
      const status: HealthStatus = {
        status: 'healthy',
        responseTime,
        lastChecked: new Date(),
        details: {
          ipfsHash: result.data?.hash,
          gateway: 'https://gateway.pinata.cloud'
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
        error: error instanceof Error ? error.message : 'Unknown error',
        details: {
          service: 'Pinata IPFS',
          error: error
        }
      };
      
      // Cache the result
      this.healthCheckCache = { status, timestamp: now };
      return status;
    }
  }

  /**
   * Upload event banner image
   */
  async uploadEventBanner(eventId: string, imageBuffer: Buffer, mimeType: string = 'image/webp'): Promise<StorageOperationResult<MediaUploadResult>> {
    try {
      const filename = `banner.${mimeType.split('/')[1] || 'webp'}`;
      const result = await pinataService.uploadFile(imageBuffer, filename, mimeType, {
        name: `Event Banner - ${eventId}`,
        keyValues: {
          eventId,
          type: 'event-banner'
        }
      });

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      return {
        success: true,
        data: {
          hash: result.data!.hash,
          url: result.data!.url,
          size: imageBuffer.length,
          contentType: mimeType,
          metadata: {
            eventId,
            type: 'event-banner',
            ipfsHash: result.data!.hash
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Upload event metadata
   */
  async uploadEventMetadata(eventId: string, metadata: Record<string, unknown>): Promise<StorageOperationResult<MediaUploadResult>> {
    try {
      const result = await pinataService.uploadJSON(metadata, {
        name: `Event Metadata - ${eventId}`,
        keyValues: {
          eventId,
          type: 'event-metadata'
        }
      });

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      const metadataStr = JSON.stringify(metadata);

      return {
        success: true,
        data: {
          url: result.data!.url,
          hash: result.data!.hash,
          size: new Blob([metadataStr]).size,
          contentType: 'application/json',
          metadata: {
            eventId,
            type: 'event-metadata',
            ipfsHash: result.data!.hash
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Upload POAP metadata
   */
  async uploadPOAPMetadata(eventId: string, poapData: Record<string, unknown>): Promise<MediaUploadResult> {
    try {
      const result = await pinataService.uploadJSON(poapData, {
        name: `POAP Metadata - ${eventId}`,
        keyValues: {
          eventId,
          type: 'poap-metadata'
        }
      });

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      const metadataStr = JSON.stringify(poapData);

      return {
        hash: result.data!.hash,
        url: result.data!.url,
        size: new Blob([metadataStr]).size,
        contentType: 'application/json',
        metadata: {
          eventId,
          type: 'poap-metadata',
          ipfsHash: result.data!.hash
        }
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Upload failed');
    }
  }

  /**
   * Upload generic file
   */
  async uploadFile(key: string, data: Buffer | string, contentType: string, metadata?: Record<string, unknown>): Promise<StorageOperationResult> {
    try {
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
      const filename = key.split('/').pop() || 'file';
      
      const result = await pinataService.uploadFile(buffer, filename, contentType, {
        name: (metadata?.name as string) || filename,
        keyValues: {
          originalKey: key,
          type: (metadata?.type as string) || 'file',
          ...metadata
        }
      });

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      return {
        success: true,
        data: {
          hash: result.data!.hash,
          url: result.data!.url,
          size: buffer.length,
          contentType,
          metadata: {
            originalKey: key,
            ipfsHash: result.data!.hash
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Generate access URL (IPFS URLs are always public)
   */
  async generateAccessUrl(key: string, _expiresIn: number = 3600): Promise<string> {
    // For IPFS, we don't need presigned URLs as they're always accessible
    return pinataService.getFileUrl(key);
  }

  /**
   * Delete file (Note: IPFS is immutable, so this is a no-op for compatibility)
   */
  async deleteFile(key: string): Promise<StorageOperationResult> {
    // IPFS is immutable, files cannot be deleted
    // This method exists for interface compatibility
    return {
      success: true,
      data: {
        key,
        message: 'IPFS is immutable - files cannot be deleted'
      }
    };
  }

  /**
   * List files (basic implementation)
   */
  async listFiles(prefix?: string, limit?: number): Promise<StorageOperationResult> {
    try {
      const files = await pinataService.listFiles({ limit });
      return {
        success: true,
        data: files
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'List operation failed'
      };
    }
  }

  /**
   * Get IPFS service configuration
   */
  getConfig(): Record<string, unknown> {
    return {
      service: 'Pinata IPFS',
      type: this.type,
      name: this.name,
      gateway: 'https://gateway.pinata.cloud',
      hasApiKey: !!process.env.PINATA_API_KEY,
      hasJwt: !!process.env.PINATA_JWT,
      cacheEnabled: true,
      cacheDuration: this.HEALTH_CACHE_DURATION
    };
  }
}