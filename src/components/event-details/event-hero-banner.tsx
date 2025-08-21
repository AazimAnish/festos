'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Share2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';

interface EventHeroBannerProps {
  event: {
    title: string;
    tagline: string;
    image: string;
    hasPOAP: boolean;
    isSaved: boolean;
    price: string;
    date: string;
    time: string;
  };
}

export function EventHeroBanner({ event }: EventHeroBannerProps) {
  const [saved, setSaved] = useState(event.isSaved);

  const handleSaveToggle = () => {
    setSaved(!saved);
  };

  return (
    <div className='relative w-full h-[70vh] min-h-[500px] overflow-hidden'>
      {/* Background Image */}
      <Image
        src={event.image}
        alt={event.title}
        fill
        className='object-cover'
        priority
        sizes='100vw'
        placeholder='blur'
        blurDataURL='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
      />

      {/* Enhanced Gradient Overlay */}
      <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent' />

      {/* Top Actions - Back, Share and Wishlist */}
      <div className='absolute top-0 left-0 right-0 p-6 sm:p-8 lg:p-12 z-30'>
        <div className='flex items-center justify-between w-full'>
          {/* Back Button - Top Left */}
          <div className='flex items-center'>
            <Link href='/discover' prefetch={true}>
              <button
                className='flex items-center gap-2 px-4 py-2 bg-background/90 text-foreground hover:bg-background/95 backdrop-blur-sm border border-border/20 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105'
                type='button'
              >
                <ArrowLeft className='w-4 h-4' />
                <span className='font-secondary text-sm'>Back</span>
              </button>
            </Link>
          </div>

          {/* Action Buttons - Top Right */}
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              className='bg-background/90 text-foreground hover:bg-background/95 backdrop-blur-sm border border-border/20 rounded-xl'
              onClick={handleSaveToggle}
            >
              <Heart
                className={`w-4 h-4 ${saved ? 'fill-current text-primary' : ''}`}
              />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='bg-background/90 text-foreground hover:bg-background/95 backdrop-blur-sm border border-border/20 rounded-xl'
            >
              <Share2 className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Content */}
      <div className='absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-12'>
        <div className='space-y-6 sm:space-y-8'>
          {/* Top Row - Badges */}
          <div className='flex items-center gap-3 flex-wrap'>
            {event.hasPOAP && (
              <Badge className='bg-primary/90 text-primary-foreground border-0 px-4 py-2 text-sm font-medium backdrop-blur-sm'>
                🪙 POAP enabled
              </Badge>
            )}
            <Badge
              variant='secondary'
              className='bg-background/90 text-foreground border-0 px-4 py-2 text-sm font-medium backdrop-blur-sm'
            >
              {event.price}
            </Badge>
          </div>

          {/* Event Info */}
          <div className='space-y-4'>
            <h1 className='font-primary text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight tracking-tight'>
              {event.title}
            </h1>
            <p className='font-tertiary text-xl sm:text-2xl lg:text-3xl text-white/90 max-w-3xl leading-relaxed'>
              {event.tagline}
            </p>
          </div>

          {/* Date and Time */}
          <div className='flex items-center gap-6 text-white/90'>
            <div className='flex items-center gap-3'>
              <span className='text-2xl'>📅</span>
              <span className='font-secondary text-lg sm:text-xl'>
                {event.date}
              </span>
            </div>
            <div className='flex items-center gap-3'>
              <span className='text-2xl'>🕐</span>
              <span className='font-secondary text-lg sm:text-xl'>
                {event.time}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
