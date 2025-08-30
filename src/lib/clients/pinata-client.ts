/**
 * Pinata IPFS Client for file storage
 * Replaces Filebase with Pinata for decentralized storage
 */

import { PinataSDK } from "pinata-web3";

// Global client instance
let pinataClient: PinataSDK | null = null;

/**
 * Get or create Pinata client instance
 */
export function getPinataClient(): PinataSDK {
  if (!pinataClient) {
    const jwt = process.env.PINATA_JWT;
    const apiKey = process.env.PINATA_API_KEY;
    const apiSecret = process.env.PINATA_API_SECRET;

    if (!jwt && (!apiKey || !apiSecret)) {
      throw new Error(
        'Pinata configuration missing. Please set PINATA_JWT or (PINATA_API_KEY and PINATA_API_SECRET) in your environment variables.'
      );
    }

    // Initialize with JWT (preferred) or API key/secret
    if (jwt) {
      pinataClient = new PinataSDK({
        pinataJwt: jwt,
      });
    } else {
      pinataClient = new PinataSDK({
        pinataJwt: `${apiKey}:${apiSecret}`,
      });
    }
  }

  return pinataClient;
}

/**
 * Pinata Service Class - replaces FilebaseClient functionality
 */
export class PinataService {
  private client: PinataSDK;

  constructor() {
    this.client = getPinataClient();
  }

  /**
   * Upload JSON metadata to IPFS
   */
  async uploadJSON(data: Record<string, unknown>, options: { name?: string; keyValues?: Record<string, string> } = {}): Promise<{
    success: boolean;
    data?: { hash: string; url: string };
    error?: string;
  }> {
    try {
      const result = await this.client.upload.json(data, {
        metadata: {
          name: options.name || 'Event Metadata',
          keyValues: {
            type: 'metadata',
            ...options.keyValues,
          },
        },
      });

      const url = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

      return {
        success: true,
        data: {
          hash: result.IpfsHash,
          url,
        },
      };
    } catch (error) {
      console.error('Pinata JSON upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Upload file buffer to IPFS
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    options: { name?: string; keyValues?: Record<string, string> } = {}
  ): Promise<{
    success: boolean;
    data?: { hash: string; url: string };
    error?: string;
  }> {
    try {
      const file = new File([buffer], filename, { type: mimeType });
      
      const result = await this.client.upload.file(file, {
        metadata: {
          name: options.name || filename,
          keyValues: {
            type: 'file',
            mimeType,
            ...options.keyValues,
          },
        },
      });

      const url = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

      return {
        success: true,
        data: {
          hash: result.IpfsHash,
          url,
        },
      };
    } catch (error) {
      console.error('Pinata file upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Upload event metadata to IPFS
   */
  async uploadEventMetadata(eventId: string, metadata: Record<string, unknown>): Promise<{
    success: boolean;
    data?: { hash: string; url: string };
    error?: string;
  }> {
    return this.uploadJSON(metadata, {
      name: `Event Metadata - ${eventId}`,
      keyValues: {
        eventId,
        type: 'event-metadata',
      },
    });
  }

  /**
   * Upload event banner image to IPFS
   */
  async uploadEventBanner(eventId: string, imageBuffer: Buffer, mimeType: string): Promise<{
    success: boolean;
    data?: { hash: string; url: string };
    error?: string;
  }> {
    const filename = `banner.${mimeType.split('/')[1] || 'webp'}`;
    
    return this.uploadFile(imageBuffer, filename, mimeType, {
      name: `Event Banner - ${eventId}`,
      keyValues: {
        eventId,
        type: 'event-banner',
      },
    });
  }

  /**
   * Upload POAP metadata to IPFS
   */
  async uploadPOAPMetadata(eventId: string, metadata: Record<string, unknown>): Promise<{
    success: boolean;
    data?: { hash: string; url: string };
    error?: string;
  }> {
    return this.uploadJSON(metadata, {
      name: `POAP Metadata - ${eventId}`,
      keyValues: {
        eventId,
        type: 'poap-metadata',
      },
    });
  }

  /**
   * Upload NFT ticket metadata to IPFS
   */
  async uploadTicketMetadata(ticketId: string, metadata: Record<string, unknown>): Promise<{
    success: boolean;
    data?: { hash: string; url: string };
    error?: string;
  }> {
    return this.uploadJSON(metadata, {
      name: `Ticket Metadata - ${ticketId}`,
      keyValues: {
        ticketId,
        type: 'ticket-metadata',
      },
    });
  }

  /**
   * Get file from IPFS hash
   */
  getFileUrl(ipfsHash: string): string {
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
  }

  /**
   * Get presigned URL (IPFS doesn't need presigned URLs, but kept for compatibility)
   */
  async generateAccessUrl(ipfsHash: string, _expiresIn?: number): Promise<string> {
    // IPFS URLs don't expire, but we keep this method for compatibility with existing code
    return this.getFileUrl(ipfsHash);
  }

  /**
   * List files (optional - for debugging/management)
   */
  async listFiles(options: { limit?: number; keyValues?: Record<string, string> } = {}) {
    try {
      let query = this.client.listFiles().pageLimit(options.limit || 10);
      
      // Add keyValue filters if provided
      if (options.keyValues) {
        Object.entries(options.keyValues).forEach(([key, value]) => {
          query = query.keyValue(key, value);
        });
      }
      
      const files = await query;
      return files;
    } catch (error) {
      console.error('Pinata list files error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const pinataService = new PinataService();

// Export for backward compatibility
export const getPinataService = () => pinataService;