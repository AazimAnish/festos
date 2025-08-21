/**
 * Server-Side Image Compression Utilities
 *
 * This file contains utilities for compressing images on the server side only.
 * It should only be imported in API routes, server components, or server actions.
 */

import sharp from 'sharp';
import { FILE_CONFIG } from '@/lib/constants';

/**
 * Compression quality presets for different use cases
 */
export const COMPRESSION_PRESETS = {
  // Banner images - high quality, moderate compression
  BANNER: {
    quality: 85,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'webp' as const,
  },
  // Thumbnail images - moderate quality, high compression
  THUMBNAIL: {
    quality: 75,
    maxWidth: 400,
    maxHeight: 300,
    format: 'webp' as const,
  },
  // Profile images - high quality, moderate compression
  PROFILE: {
    quality: 80,
    maxWidth: 512,
    maxHeight: 512,
    format: 'webp' as const,
  },
  // General images - balanced quality and compression
  GENERAL: {
    quality: 80,
    maxWidth: 1200,
    maxHeight: 800,
    format: 'webp' as const,
  },
  // Maximum compression for storage optimization
  MAXIMUM: {
    quality: 60,
    maxWidth: 800,
    maxHeight: 600,
    format: 'webp' as const,
  },
} as const;

/**
 * Supported image formats
 */
export type SupportedFormat = 'jpeg' | 'png' | 'webp' | 'avif';

/**
 * Compression preset type
 */
export type CompressionPreset = {
  quality: number;
  maxWidth: number;
  maxHeight: number;
  format: SupportedFormat;
};

/**
 * Compression options
 */
export interface CompressionOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: SupportedFormat;
  preserveMetadata?: boolean;
  stripMetadata?: boolean;
}

/**
 * Compression result
 */
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
 * Image metadata
 */
export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  hasAlpha: boolean;
  isOpaque: boolean;
}

/**
 * Get optimal compression preset based on image type and size
 */
export function getOptimalPreset(
  imageType: 'banner' | 'thumbnail' | 'profile' | 'general',
  originalSize: number
): CompressionPreset {
  const basePreset =
    COMPRESSION_PRESETS[
      imageType.toUpperCase() as keyof typeof COMPRESSION_PRESETS
    ];

  // If image is very large (>5MB), use maximum compression
  if (originalSize > 5 * 1024 * 1024) {
    return COMPRESSION_PRESETS.MAXIMUM;
  }

  // If image is large (>2MB), reduce quality slightly
  if (originalSize > 2 * 1024 * 1024) {
    const reducedQuality = Math.max(basePreset.quality - 10, 60);
    return {
      ...basePreset,
      quality: reducedQuality,
    };
  }

  return basePreset;
}

/**
 * Detect image format from buffer
 */
export async function detectImageFormat(
  buffer: Buffer
): Promise<SupportedFormat> {
  const metadata = await sharp(buffer).metadata();

  switch (metadata.format) {
    case 'jpeg':
    case 'jpg':
      return 'jpeg';
    case 'png':
      return 'png';
    case 'webp':
      return 'webp';
    case 'avif':
      return 'avif';
    default:
      return 'jpeg'; // Default fallback
  }
}

/**
 * Get image metadata
 */
export async function getImageMetadata(buffer: Buffer): Promise<ImageMetadata> {
  const metadata = await sharp(buffer).metadata();

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    size: buffer.length,
    hasAlpha: metadata.hasAlpha || false,
    isOpaque: !metadata.hasAlpha,
  };
}

/**
 * Compress image using Sharp with optimal settings
 */
export async function compressImage(
  buffer: Buffer,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    quality = 80,
    maxWidth = 1200,
    maxHeight = 800,
    format = 'webp',
  } = options;

  const originalSize = buffer.length;

  // Create Sharp instance
  let sharpInstance = sharp(buffer);

  // Resize if needed
  if (maxWidth || maxHeight) {
    sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Apply format-specific compression
  let compressedBuffer: Buffer;

  switch (format) {
    case 'webp':
      compressedBuffer = await sharpInstance
        .webp({
          quality,
          effort: 6, // Maximum compression effort
          nearLossless: quality > 90,
        })
        .toBuffer();
      break;

    case 'jpeg':
      compressedBuffer = await sharpInstance
        .jpeg({
          quality,
          progressive: true,
          mozjpeg: true, // Use mozjpeg for better compression
        })
        .toBuffer();
      break;

    case 'png':
      compressedBuffer = await sharpInstance
        .png({
          quality,
          progressive: true,
          compressionLevel: 9, // Maximum compression
          adaptiveFiltering: true,
        })
        .toBuffer();
      break;

    case 'avif':
      compressedBuffer = await sharpInstance
        .avif({
          quality,
          effort: 9, // Maximum compression effort
        })
        .toBuffer();
      break;

    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  // Get final metadata
  const finalMetadata = await getImageMetadata(compressedBuffer);

  return {
    buffer: compressedBuffer,
    originalSize,
    compressedSize: compressedBuffer.length,
    compressionRatio: (1 - compressedBuffer.length / originalSize) * 100,
    format,
    width: finalMetadata.width,
    height: finalMetadata.height,
    quality,
  };
}

/**
 * Smart compression that chooses the best format and settings
 */
export async function smartCompress(
  buffer: Buffer,
  imageType: 'banner' | 'thumbnail' | 'profile' | 'general' = 'general',
  targetSize?: number
): Promise<CompressionResult> {
  const originalMetadata = await getImageMetadata(buffer);
  const originalSize = buffer.length;

  // Get optimal preset
  const preset = getOptimalPreset(imageType, originalSize);

  // Determine best format based on image characteristics
  let optimalFormat: SupportedFormat = preset.format;

  if (originalMetadata.hasAlpha && preset.format === 'webp') {
    // Keep WebP for images with transparency
    optimalFormat = 'webp';
  } else if (originalMetadata.format === 'png' && originalMetadata.hasAlpha) {
    // Use PNG for images with transparency if original was PNG
    optimalFormat = 'png';
  } else if (originalMetadata.format === 'jpeg' || originalMetadata.isOpaque) {
    // Use WebP for opaque images (better compression than JPEG)
    optimalFormat = 'webp';
  }

  // First pass: Sharp compression
  let result = await compressImage(buffer, {
    ...preset,
    format: optimalFormat,
  });

  // If target size is specified and not met, try additional compression
  if (targetSize && result.compressedSize > targetSize) {
    // Try with lower quality
    const lowerQuality = Math.max(preset.quality - 20, 40);
    result = await compressImage(buffer, {
      ...preset,
      quality: lowerQuality,
      format: optimalFormat,
    });
  }

  return result;
}

/**
 * Compress image for banner upload
 */
export async function compressBannerImage(
  buffer: Buffer
): Promise<CompressionResult> {
  return smartCompress(buffer, 'banner', 2 * 1024 * 1024); // Target 2MB max
}

/**
 * Compress image for thumbnail upload
 */
export async function compressThumbnailImage(
  buffer: Buffer
): Promise<CompressionResult> {
  return smartCompress(buffer, 'thumbnail', 500 * 1024); // Target 500KB max
}

/**
 * Compress image for profile upload
 */
export async function compressProfileImage(
  buffer: Buffer
): Promise<CompressionResult> {
  return smartCompress(buffer, 'profile', 1 * 1024 * 1024); // Target 1MB max
}

/**
 * Validate image before compression
 */
export function validateImage(buffer: Buffer): {
  isValid: boolean;
  error?: string;
} {
  // Check file size
  if (buffer.length > FILE_CONFIG.MAX_IMAGE_SIZE) {
    return {
      isValid: false,
      error: `Image size (${(buffer.length / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${FILE_CONFIG.MAX_IMAGE_SIZE / 1024 / 1024}MB)`,
    };
  }

  // Check if it's a valid image by trying to get metadata
  try {
    sharp(buffer).metadata();
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Invalid image format or corrupted file',
    };
  }
}

/**
 * Get compression statistics
 */
export function getCompressionStats(
  originalSize: number,
  compressedSize: number
): {
  sizeReduction: number;
  sizeReductionPercent: number;
  compressionRatio: number;
} {
  const sizeReduction = originalSize - compressedSize;
  const sizeReductionPercent = (sizeReduction / originalSize) * 100;
  const compressionRatio = originalSize / compressedSize;

  return {
    sizeReduction,
    sizeReductionPercent,
    compressionRatio,
  };
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
