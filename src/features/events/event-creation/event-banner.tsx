'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Upload, Camera, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { smartCompress, validateImage, formatFileSize } from '@/shared/utils/image-compression-client';

interface EventBannerProps {
  onImageChange?: (file: File | null) => void;
  initialImage?: string;
}

export function EventBanner({ onImageChange, initialImage }: EventBannerProps) {
  const [bannerImage, setBannerImage] = useState<string>(initialImage || '');
  const [isCompressing, setIsCompressing] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsCompressing(true);

        // Validate file
        const validation = validateImage(file);
        if (!validation.isValid) {
          alert(validation.error);
          return;
        }

        // Compress image
        const compressionResult = await smartCompress(file, 'banner');
        
        // Show compression info
        console.log(
          `Image compressed: ${formatFileSize(compressionResult.originalSize)} → ${formatFileSize(compressionResult.compressedSize)} (${compressionResult.compressionRatio.toFixed(1)}% reduction)`
        );

        // Store compressed file for future use
        
        // Create preview
        const reader = new FileReader();
        reader.onload = e => {
          const result = e.target?.result as string;
          setBannerImage(result);
          onImageChange?.(compressionResult.file);
        };
        reader.readAsDataURL(compressionResult.file);
      } catch (error) {
        console.error('Image compression failed:', error);
        alert('Failed to process image. Please try again.');
      } finally {
        setIsCompressing(false);
      }
    }
  };

  return (
    <div className='relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted border border-border'>
      {bannerImage ? (
        <Image
          src={bannerImage || '/placeholder.svg'}
          alt='Event banner'
          fill
          className='object-cover'
        />
      ) : (
        <div className='flex flex-col items-center justify-center h-full text-muted-foreground'>
          <Camera className='h-12 w-12 mb-4' />
          <p className='text-sm text-center px-4'>
            Add a banner to make your event stand out
          </p>
        </div>
      )}

      <div className='absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center'>
        <label htmlFor='banner-upload'>
          <Button
            variant='secondary'
            size='sm'
            className='rounded-full bg-white/90 hover:bg-white text-black'
            disabled={isCompressing}
            asChild
          >
            <span className='flex items-center gap-2 cursor-pointer'>
              {isCompressing ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Upload className='h-4 w-4' />
              )}
              {isCompressing ? 'Processing...' : (bannerImage ? 'Change' : 'Upload')}
            </span>
          </Button>
        </label>
        <input
          id='banner-upload'
          type='file'
          accept='image/*'
          onChange={handleImageUpload}
          className='hidden'
          disabled={isCompressing}
        />
      </div>
    </div>
  );
}
