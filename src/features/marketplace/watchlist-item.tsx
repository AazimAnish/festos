'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import Image from 'next/image';
import {
  Calendar,
  MapPin,
  Bell,
  BellOff,
  ArrowUp,
  ArrowDown,
  ShoppingCart,
  Eye,
} from 'lucide-react';

interface WatchlistItemProps {
  id: number;
  eventName: string;
  eventDate: string;
  location: string;
  image: string;
  currentPrice: string;
  priceNum: number;
  previousPrice: string;
  priceChange: number; // percentage
  ticketType: string;
  expiresIn: string;
  addedOn: string;
  onRemove: (id: number) => void;
  onPurchase: (id: number) => void;
}

export function WatchlistItem({
  id,
  eventName,
  eventDate,
  location,
  image,
  currentPrice,
  previousPrice,
  priceChange,
  ticketType,
  expiresIn,
  addedOn,
  onRemove,
  onPurchase,
}: WatchlistItemProps) {
  const [notifications, setNotifications] = useState(true);
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className='overflow-hidden group rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out'>
      <CardContent className='p-0'>
        <div className='flex flex-col sm:flex-row'>
          {/* Image */}
          <div className='relative w-full sm:w-32 h-32'>
            <Image src={image} alt={eventName} fill className='object-cover' />
            <Badge
              variant='outline'
              className='absolute top-3 left-3 bg-background/80 backdrop-blur-sm'
            >
              {ticketType}
            </Badge>
          </div>

          {/* Content */}
          <div className='flex-1 p-4'>
            {/* Header row with name and buttons */}
            <div className='flex flex-wrap justify-between gap-2 mb-2'>
              <h3 className='font-primary text-base font-bold text-foreground'>
                {eventName}
              </h3>
              <div className='flex items-center gap-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 w-8 p-0'
                  onClick={() => setNotifications(!notifications)}
                >
                  {notifications ? (
                    <Bell className='h-4 w-4 text-primary' />
                  ) : (
                    <BellOff className='h-4 w-4 text-muted-foreground' />
                  )}
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-8 w-8 p-0 text-muted-foreground hover:text-foreground'
                  onClick={() => onRemove(id)}
                >
                  <Eye className='h-4 w-4' />
                </Button>
              </div>
            </div>

            {/* Info row */}
            <div className='flex flex-wrap items-center gap-4 mb-3'>
              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                <Calendar className='w-3.5 h-3.5' />
                <span>{new Date(eventDate).toLocaleDateString()}</span>
              </div>
              <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                <MapPin className='w-3.5 h-3.5' />
                <span>{location}</span>
              </div>
            </div>

            {/* Price info */}
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div className='space-y-1'>
                <div className='text-xs text-muted-foreground'>
                  Current Price
                </div>
                <div className='font-primary text-lg font-bold'>
                  {currentPrice}
                </div>
                <div className='flex items-center gap-1'>
                  {priceChange > 0 ? (
                    <>
                      <ArrowUp className='w-3 h-3 text-success' />
                      <span className='text-xs text-success'>
                        +{priceChange}% from {previousPrice}
                      </span>
                    </>
                  ) : priceChange < 0 ? (
                    <>
                      <ArrowDown className='w-3 h-3 text-destructive' />
                      <span className='text-xs text-destructive'>
                        {priceChange}% from {previousPrice}
                      </span>
                    </>
                  ) : (
                    <span className='text-xs text-muted-foreground'>
                      No change from {previousPrice}
                    </span>
                  )}
                </div>
              </div>
              <Button
                size='sm'
                className='gap-1'
                onClick={() => onPurchase(id)}
              >
                <ShoppingCart className='w-3.5 h-3.5' />
                Buy Now
              </Button>
            </div>

            {/* Additional details (expandable) */}
            {expanded && (
              <div className='mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground grid grid-cols-2 gap-x-8 gap-y-2'>
                <div>
                  <span className='block font-medium text-foreground'>
                    Added to Watchlist
                  </span>
                  <span>{new Date(addedOn).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className='block font-medium text-foreground'>
                    Listing Expires
                  </span>
                  <span>In {expiresIn}</span>
                </div>
                <div className='col-span-2 mt-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='w-full text-xs h-7'
                    onClick={() => onRemove(id)}
                  >
                    Remove from Watchlist
                  </Button>
                </div>
              </div>
            )}

            {/* Expand/collapse button */}
            <div className='mt-3 text-center'>
              <Button
                variant='ghost'
                size='sm'
                className='w-full h-6 text-xs text-muted-foreground hover:text-foreground'
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Show less' : 'Show more'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
