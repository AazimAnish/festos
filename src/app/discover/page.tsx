'use client';

import { useState, useMemo } from 'react';
import { DiscoverHero } from '@/features/events/discover-hero';
import { SearchFilterBar } from '@/features/events/search-filter-bar';
import { FilterPanel } from '@/features/events/filter-panel';
import { EventsGrid } from '@/features/events/events-grid';
import { FloatingMapToggle } from '@/features/events/floating-map-toggle';
import { MapView } from '@/features/events/map-view';
import { Loading } from '@/shared/components/ui/loading';
import { ErrorBoundary } from '@/shared/components/ui/error-boundary';
import { useEvents } from '@/shared/hooks/use-events-optimized';
import type { EventData } from '@/lib/services/core/interfaces';

interface Filters {
  search: string;
  category: string;
  priceRange: { min: number; max: number };
  hasPOAP: boolean;
  savedOnly: boolean;
  date: Date | undefined;
}

// Convert EventData to the format expected by EventsGrid
function convertEventDataToGridFormat(event: EventData) {
  return {
    id: event.id,
    uniqueId: event.id, // Use id as uniqueId since slug might be null
    title: event.title,
    date: event.startDate,
    location: event.location,
    price: event.ticketPrice === '0' ? 'Free' : `${event.ticketPrice} AVAX`,
    image: event.bannerImage || '/card1.png', // Fallback image
    category: event.category || 'General',
    joinedCount: 0, // This would come from ticket count in the future
    isSaved: false, // This would come from user preferences
    hasPOAP: event.hasPOAP,
    description: event.description,
    status: event.status as 'pending' | 'confirmed' | 'cancelled' | 'active',
  };
}

// Loading component for the events section
function EventsLoading() {
  return (
    <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10'>
      <Loading size='lg' text='Loading events...' />
    </div>
  );
}

// Error fallback for events section
function EventsError() {
  return (
    <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10'>
      <div className='text-center space-y-4'>
        <h2 className='font-primary text-xl font-bold text-foreground'>
          Failed to load events
        </h2>
        <p className='font-secondary text-sm text-gray'>
          Please try refreshing the page or check your connection.
        </p>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    priceRange: { min: 0, max: 1 },
    hasPOAP: false,
    savedOnly: false,
    date: undefined,
  });

  // Fetch real events from API
  const { data: eventsResponse, isLoading, error } = useEvents({
    query: filters.search,
    category: filters.category,
    page: 1,
    limit: 50, // Show more events initially
    includeBlockchain: true, // Include blockchain events
  });



  // Convert API response to grid format and apply client-side filters
  const filteredEvents = useMemo(() => {
    if (!eventsResponse?.events) {
      return [];
    }

    const events = eventsResponse.events.map(convertEventDataToGridFormat);

    return events.filter(event => {
      // POAP filter
      if (filters.hasPOAP && !event.hasPOAP) {
        return false;
      }

      // Saved only filter (client-side only for now)
      if (filters.savedOnly && !event.isSaved) {
        return false;
      }

      // Price range filter
      if (filters.priceRange.min > 0 || filters.priceRange.max < 1) {
        const eventPrice =
          event.price === 'Free'
            ? 0
            : Number.parseFloat(event.price.split(' ')[0]);

        if (
          eventPrice < filters.priceRange.min ||
          eventPrice > filters.priceRange.max
        ) {
          return false;
        }
      }

      // Date filter
      if (filters.date) {
        const eventDate = new Date(event.date);
        const filterDate = filters.date;

        // Check if event is on the selected date
        if (eventDate.toDateString() !== filterDate.toDateString()) {
          return false;
        }
      }

      return true;
    });
  }, [eventsResponse, filters]);

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      priceRange: { min: 0, max: 1 },
      hasPOAP: false,
      savedOnly: false,
      date: undefined,
    });
  };

  const handleMapToggle = () => {
    setShowMap(!showMap);
  };

  return (
    <div className='min-h-screen bg-background'>
      {/* Hero Section */}
      <DiscoverHero />

      {/* Search and Filter Bar */}
      <SearchFilterBar
        onFilterToggle={() => setIsFilterOpen(true)}
        searchValue={filters.search}
        onSearchChange={value => handleFilterChange({ search: value })}
        showMap={showMap}
        onMapToggle={handleMapToggle}
      />

      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${isFilterOpen ? 'sm:ml-80 lg:ml-96' : ''}`}
      >
        {/* Events Grid with Error Boundary */}
        <ErrorBoundary fallback={<EventsError />}>
          {isLoading ? (
            <EventsLoading />
          ) : error ? (
            <EventsError />
          ) : (
            <EventsGrid events={filteredEvents} onClearFilters={clearFilters} />
          )}
        </ErrorBoundary>

        {/* Map View with Error Boundary */}
        <ErrorBoundary fallback={<EventsError />}>
          <MapView
            events={filteredEvents}
            isOpen={showMap}
            onClose={() => setShowMap(false)}
            onClearFilters={clearFilters}
          />
        </ErrorBoundary>
      </div>

      {/* Floating Map Toggle */}
      <FloatingMapToggle onClick={handleMapToggle} />
    </div>
  );
}
