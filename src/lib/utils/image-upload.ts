/**
 * Image Upload Utilities
 *
 * This file contains utilities for handling image uploads in React components
 * with automatic compression and validation.
 */

import { FILE_CONFIG } from '@/lib/constants';

// Client-side validation and utility functions
export interface CompressionResult {
  buffer: Buffer;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  format: string;
  width: number;
  height: number;
  quality: number;
}

/**
 * Image upload options
 */
export interface ImageUploadOptions {
  compress?: boolean;
  imageType?: 'banner' | 'thumbnail' | 'profile' | 'general';
  maxSize?: number;
  allowedFormats?: string[];
  onProgress?: (progress: number) => void;
  onCompressionStart?: () => void;
  onCompressionComplete?: (result: CompressionResult) => void;
}

/**
 * Image upload result
 */
export interface ImageUploadResult {
  success: boolean;
  file?: File;
  buffer?: Buffer;
  compressedBuffer?: Buffer;
  url?: string;
  error?: string;
  compressionStats?: {
    originalSize: number;
    compressedSize: number;
    reductionPercent: number;
  };
}

/**
 * Process image file for upload with basic validation
 * Note: Compression is handled server-side in API routes
 */
export async function processImageForUpload(
  file: File,
  options: ImageUploadOptions = {}
): Promise<ImageUploadResult> {
  const {
    maxSize = FILE_CONFIG.MAX_IMAGE_SIZE,
    allowedFormats = FILE_CONFIG.ALLOWED_IMAGE_TYPES,
    onProgress,
  } = options;

  try {
    // Validate file type
    if (!(allowedFormats as readonly string[]).includes(file.type)) {
      return {
        success: false,
        error: `File type ${file.type} is not supported. Allowed types: ${allowedFormats.join(', ')}`,
      };
    }

    // Validate file size
    if (file.size > maxSize) {
      return {
        success: false,
        error: `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxSize)})`,
      };
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    onProgress?.(100);

    return {
      success: true,
      file,
      buffer,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process image',
    };
  }
}

/**
 * Create a data URL from buffer
 */
export function createDataURL(buffer: Buffer, mimeType: string): string {
  const base64 = buffer.toString('base64');
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Generate preview URL for image
 */
export async function generateImagePreview(
  file: File,
  maxWidth: number = 300,
  maxHeight: number = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;

      // Set canvas dimensions
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw image
      ctx?.drawImage(img, 0, 0, newWidth, newHeight);

      // Convert to data URL
      const dataURL = canvas.toDataURL('image/jpeg', 0.8);
      resolve(dataURL);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for preview'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Validate image dimensions
 */
export function validateImageDimensions(
  width: number,
  height: number,
  minWidth: number = 100,
  minHeight: number = 100,
  maxWidth: number = 4000,
  maxHeight: number = 4000
): { isValid: boolean; error?: string } {
  if (width < minWidth || height < minHeight) {
    return {
      isValid: false,
      error: `Image dimensions (${width}x${height}) are too small. Minimum: ${minWidth}x${minHeight}`,
    };
  }

  if (width > maxWidth || height > maxHeight) {
    return {
      isValid: false,
      error: `Image dimensions (${width}x${height}) are too large. Maximum: ${maxWidth}x${maxHeight}`,
    };
  }

  return { isValid: true };
}

/**
 * Get image dimensions from file
 */
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      reject(new Error('Failed to get image dimensions'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Format image dimensions for display
 */
export function formatImageDimensions(width: number, height: number): string {
  return `${width} × ${height}`;
}

/**
 * Calculate aspect ratio
 */
export function calculateAspectRatio(width: number, height: number): number {
  return width / height;
}

/**
 * Check if image has acceptable aspect ratio
 */
export function hasAcceptableAspectRatio(
  width: number,
  height: number,
  minRatio: number = 0.5,
  maxRatio: number = 3
): boolean {
  const ratio = calculateAspectRatio(width, height);
  return ratio >= minRatio && ratio <= maxRatio;
}

/**
 * Get recommended image dimensions for different use cases
 */
export const RECOMMENDED_DIMENSIONS = {
  banner: {
    width: 1920,
    height: 1080,
    aspectRatio: 16 / 9,
  },
  thumbnail: {
    width: 400,
    height: 300,
    aspectRatio: 4 / 3,
  },
  profile: {
    width: 512,
    height: 512,
    aspectRatio: 1,
  },
  general: {
    width: 1200,
    height: 800,
    aspectRatio: 3 / 2,
  },
} as const;

/**
 * Get recommended dimensions for image type
 */
export function getRecommendedDimensions(
  imageType: keyof typeof RECOMMENDED_DIMENSIONS
): (typeof RECOMMENDED_DIMENSIONS)[keyof typeof RECOMMENDED_DIMENSIONS] {
  return RECOMMENDED_DIMENSIONS[imageType];
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
