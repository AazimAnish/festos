'use client';

import type React from 'react';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Upload, Camera } from 'lucide-react';
import Image from 'next/image';

export function EventBanner() {
  const [bannerImage, setBannerImage] = useState<string>();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        setBannerImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
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
            asChild
          >
            <span className='flex items-center gap-2 cursor-pointer'>
              <Upload className='h-4 w-4' />
              {bannerImage ? 'Change' : 'Upload'}
            </span>
          </Button>
        </label>
        <input
          id='banner-upload'
          type='file'
          accept='image/*'
          onChange={handleImageUpload}
          className='hidden'
        />
      </div>
    </div>
  );
}
