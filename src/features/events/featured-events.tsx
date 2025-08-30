'use client';

import { useState } from 'react';
import Link from 'next/link';
// Mock events data - replace with real API data
const FEATURED_EVENTS = [
  {
    id: 1,
    uniqueId: 'fpvxrdl3',
    title: 'ETHIndia 2025 🇮🇳',
    location: 'Bangalore, India',
    price: '0.01 AVAX',
    image: '/card1.png',
    joinedCount: 421,
    hasPOAP: true,
    isSaved: false,
    category: 'Tech',
    date: '2025-01-15',
  },
  {
    id: 2,
    uniqueId: 'web3delhi',
    title: 'Web3 Delhi Summit',
    location: 'New Delhi, India',
    price: '0.05 AVAX',
    image: '/card2.png',
    joinedCount: 1200,
    hasPOAP: true,
    isSaved: true,
    category: 'Tech',
    date: '2025-02-20',
  },
  {
    id: 3,
    uniqueId: 'mumbaiblock',
    title: 'Mumbai Blockchain Fest',
    location: 'Mumbai, India',
    price: 'Free',
    image: '/card3.png',
    joinedCount: 89,
    hasPOAP: false,
    isSaved: false,
    category: 'Music',
    date: '2025-03-10',
  },
];
import { EventCard } from './event-card';
import { Button } from '@/shared/components/ui/button';
import { FadeIn } from '@/shared/components/ui/fade-in';
import { Badge } from '@/shared/components/ui/badge';
import {
  Calendar,
  MapPin,
  Sparkles,
  Ticket,
  MapPinned,
  Zap,
} from 'lucide-react';

const eventFilters = [
  { id: 'all', label: 'All Events', icon: Calendar, active: true },
  { id: 'ticketed', label: 'Ticketed Events', icon: Ticket, active: false },
  { id: 'poap', label: 'Events for You', icon: Sparkles, active: false },
  { id: 'near', label: 'Events Near You', icon: MapPinned, active: false },
  { id: 'trending', label: 'Trending Now', icon: Zap, active: false },
];

export default function FeaturedEvents() {
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Filter events based on active filter
  const filteredEvents = FEATURED_EVENTS.filter(event => {
    switch (activeFilter) {
      case 'ticketed':
        return event.price !== 'Free';
      case 'poap':
        return event.hasPOAP;
      case 'near':
        return event.location.includes('India');
      case 'trending':
        return event.joinedCount > 500;
      default:
        return true;
    }
  });



  // Take only the first 4 events for display
  const displayEvents = filteredEvents.slice(0, 4);

  return (
    <section className='w-full bg-background apple-section relative overflow-hidden'>
      {/* Subtle background gradient */}
      <div className='absolute inset-0 bg-gradient-to-b from-transparent via-muted/5 to-transparent' />

      <div className='container mx-auto relative z-10'>
        <FadeIn variant='up' timing='normal' className='space-y-8'>
          {/* Section Header */}
          <div className='flex flex-col items-start space-y-4'>
            <Badge className='px-4 py-1.5 bg-primary/10 text-primary border-none text-sm'>
              Trending Now
            </Badge>

            <div className='flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-6'>
              <h2 className='font-primary font-bold text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight'>
                Events You&apos;ll <span className='text-primary'>Love</span>
              </h2>

              <Button
                variant='outline'
                className='h-11 px-6 rounded-xl font-medium border-2 hover:bg-primary/5 hover:border-primary hover:text-primary text-foreground apple-transition hover:scale-105 active:scale-95'
                asChild
              >
                <Link href='/discover'>See All Events</Link>
              </Button>
            </div>
          </div>

          {/* Event Filters - Apple-inspired interactive pill buttons */}
          <div className='flex flex-wrap gap-2 sm:gap-3 pb-2 overflow-x-auto scrollbar-hide'>
            {eventFilters.map(filter => {
              const Icon = filter.icon;
              const isActive = activeFilter === filter.id;

              return (
                <Button
                  key={filter.id}
                  variant='ghost'
                  size='sm'
                  onClick={() => setActiveFilter(filter.id)}
                  className={`
                    rounded-full h-9 sm:h-10 px-3 sm:px-5 transition-all duration-200 ease-out
                    border font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0
                    ${
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground shadow-apple-sm'
                        : 'bg-accent/30 text-foreground border-border hover:bg-primary/10 hover:text-primary hover:border-primary/20'
                    }
                    hover:scale-105 active:scale-95
                  `}
                >
                  <Icon
                    className={`w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 ${isActive ? '' : ''}`}
                  />
                  {filter.label}
                </Button>
              );
            })}
          </div>

          {/* Events Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
            {displayEvents.map((event, index) => (
              <div
                key={event.id}
                className='transition-all duration-200 hover:scale-[1.01] h-full'
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <EventCard {...event} variant='grid' />
              </div>
            ))}
          </div>

          {/* Empty State */}
          {displayEvents.length === 0 && (
            <div className='flex flex-col items-center justify-center py-16 px-4 text-center'>
              <MapPin className='w-12 h-12 text-muted-foreground mb-4' />
              <h3 className='text-xl font-medium text-foreground mb-2'>
                No events found
              </h3>
              <p className='text-muted-foreground max-w-md'>
                We couldn&apos;t find any events matching your current filter.
                Try another category or check back later.
              </p>
              <Button
                className='mt-6 bg-primary text-primary-foreground hover:bg-primary/90'
                onClick={() => setActiveFilter('all')}
              >
                See All Events
              </Button>
            </div>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
