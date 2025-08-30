/**
 * Client-Side Image Compression Utilities
 *
 * This file contains utilities for compressing images on the client side.
 * It uses browser APIs and can be safely used in React components.
 */

/**
 * Compression quality presets for different use cases
 */
export const COMPRESSION_PRESETS = {
  // Banner images - high quality, moderate compression
  BANNER: {
    quality: 0.85,
    maxWidth: 1920,
    maxHeight: 1080,
    format: 'webp' as const,
  },
  // Thumbnail images - moderate quality, high compression
  THUMBNAIL: {
    quality: 0.75,
    maxWidth: 400,
    maxHeight: 300,
    format: 'webp' as const,
  },
  // Profile images - high quality, moderate compression
  PROFILE: {
    quality: 0.80,
    maxWidth: 512,
    maxHeight: 512,
    format: 'webp' as const,
  },
  // General images - balanced quality and compression
  GENERAL: {
    quality: 0.80,
    maxWidth: 1200,
    maxHeight: 800,
    format: 'webp' as const,
  },
  // Maximum compression for storage optimization
  MAXIMUM: {
    quality: 0.60,
    maxWidth: 800,
    maxHeight: 600,
    format: 'webp' as const,
  },
} as const;

/**
 * Supported image formats
 */
export type SupportedFormat = 'jpeg' | 'png' | 'webp';

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
}

/**
 * Compression result
 */
export interface CompressionResult {
  file: File;
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
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  metadata?: ImageMetadata;
}

/**
 * Validate image file
 */
export function validateImage(file: File): ValidationResult {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return {
      isValid: false,
      error: 'File must be an image',
    };
  }

  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return {
      isValid: false,
      error: 'Image file size must be less than 10MB',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Get image dimensions
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Compress image using Canvas API
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const preset = COMPRESSION_PRESETS.BANNER; // Default to banner preset
  const quality = options.quality ?? preset.quality;
  const maxWidth = options.maxWidth ?? preset.maxWidth;
  const maxHeight = options.maxHeight ?? preset.maxHeight;
  const format = options.format ?? preset.format;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Create new file
            const compressedFile = new File([blob], file.name, {
              type: `image/${format}`,
              lastModified: Date.now(),
            });

            const compressionRatio = (1 - compressedFile.size / file.size) * 100;

            resolve({
              file: compressedFile,
              originalSize: file.size,
              compressedSize: compressedFile.size,
              compressionRatio,
              format,
              width,
              height,
              quality,
            });
          },
          `image/${format}`,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Smart compress image with automatic format selection
 */
export async function smartCompress(
  file: File,
  imageType: 'banner' | 'thumbnail' | 'profile' | 'general' = 'general'
): Promise<CompressionResult> {
  // Select preset based on image type
  const preset = COMPRESSION_PRESETS[imageType.toUpperCase() as keyof typeof COMPRESSION_PRESETS] || COMPRESSION_PRESETS.GENERAL;

  // Validate image first
  const validation = validateImage(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Get original dimensions for reference
  await getImageDimensions(file);

  // Compress image
  const result = await compressImage(file, {
    quality: preset.quality,
    maxWidth: preset.maxWidth,
    maxHeight: preset.maxHeight,
    format: preset.format,
  });

  return result;
}

/**
 * Get compression statistics
 */
export function getCompressionStats(originalSize: number, compressedSize: number) {
  const sizeReduction = originalSize - compressedSize;
  const sizeReductionPercent = (sizeReduction / originalSize) * 100;

  return {
    originalSize,
    compressedSize,
    sizeReduction,
    sizeReductionPercent,
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
