/**
 * IPFS Service using Pinata
 * Replaces the previous Filebase implementation
 */

import { pinataService } from '@/lib/clients/pinata-client';

export interface IPFSUploadResult {
  success: boolean;
  data?: {
    hash: string;
    url: string;
  };
  error?: string;
}

export class IPFSService {
  /**
   * Upload event metadata to IPFS
   */
  async uploadEventMetadata(eventId: string, metadata: Record<string, unknown>): Promise<IPFSUploadResult> {
    return pinataService.uploadEventMetadata(eventId, metadata);
  }

  /**
   * Upload event banner image to IPFS
   */
  async uploadEventBanner(eventId: string, imageBuffer: Buffer, mimeType: string): Promise<IPFSUploadResult> {
    return pinataService.uploadEventBanner(eventId, imageBuffer, mimeType);
  }

  /**
   * Upload POAP metadata to IPFS
   */
  async uploadPOAPMetadata(eventId: string, metadata: Record<string, unknown>): Promise<IPFSUploadResult> {
    return pinataService.uploadPOAPMetadata(eventId, metadata);
  }

  /**
   * Upload NFT ticket metadata to IPFS
   */
  async uploadTicketMetadata(ticketId: string, metadata: Record<string, unknown>): Promise<IPFSUploadResult> {
    return pinataService.uploadTicketMetadata(ticketId, metadata);
  }

  /**
   * Upload generic JSON data to IPFS
   */
  async uploadJSON(data: Record<string, unknown>, name?: string): Promise<IPFSUploadResult> {
    return pinataService.uploadJSON(data, { name });
  }

  /**
   * Upload file buffer to IPFS
   */
  async uploadFile(buffer: Buffer, filename: string, mimeType: string): Promise<IPFSUploadResult> {
    return pinataService.uploadFile(buffer, filename, mimeType);
  }

  /**
   * Get IPFS file URL
   */
  getFileUrl(ipfsHash: string): string {
    return pinataService.getFileUrl(ipfsHash);
  }

  /**
   * Generate access URL (for compatibility)
   */
  async generateAccessUrl(ipfsHash: string): Promise<string> {
    return pinataService.generateAccessUrl(ipfsHash);
  }

  /**
   * Get IPFS service configuration
   */
  getConfig(): Record<string, unknown> {
    return {
      service: 'Pinata IPFS',
      gateway: 'https://gateway.pinata.cloud',
      hasApiKey: !!process.env.PINATA_API_KEY,
      hasJwt: !!process.env.PINATA_JWT,
    };
  }
}

// Export singleton instance
export const ipfsService = new IPFSService();