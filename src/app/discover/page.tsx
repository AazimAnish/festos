"use client";

import { useState, useMemo } from "react";
import { DiscoverHero } from "@/components/discover-hero";
import { SearchFilterBar } from "@/components/search-filter-bar";
import { FilterPanel } from "@/components/filter-panel";
import { EventsGrid } from "@/components/events-grid";
import { FloatingMapToggle } from "@/components/floating-map-toggle";
import { MapView } from "@/components/map-view";
import { SAMPLE_EVENTS } from "@/lib/data/sample-events";

interface Filters {
  search: string;
  category: string;
  priceRange: { min: number; max: number };
  hasPOAP: boolean;
  savedOnly: boolean;
  date: Date | undefined;
}

export default function DiscoverPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "",
    priceRange: { min: 0, max: 1 },
    hasPOAP: false,
    savedOnly: false,
    date: undefined
  });

  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    return SAMPLE_EVENTS.filter(event => {
      // Search filter
      if (filters.search && !event.title.toLowerCase().includes(filters.search.toLowerCase()) &&
          !event.location.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Category filter
      if (filters.category && event.category !== filters.category) {
        return false;
      }

      // POAP filter
      if (filters.hasPOAP && !event.hasPOAP) {
        return false;
      }

      // Saved only filter
      if (filters.savedOnly && !event.isSaved) {
        return false;
      }

      // Price range filter
      if (filters.priceRange.min > 0 || filters.priceRange.max < 1) {
        const eventPrice = event.price === "Free" ? 0 : parseFloat(event.price.split(" ")[0]);
        
        if (eventPrice < filters.priceRange.min || eventPrice > filters.priceRange.max) {
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
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      priceRange: { min: 0, max: 1 },
      hasPOAP: false,
      savedOnly: false,
      date: undefined
    });
  };

  const handleMapToggle = () => {
    setShowMap(!showMap);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <DiscoverHero />
      
      {/* Search and Filter Bar */}
      <SearchFilterBar 
        onFilterToggle={() => setIsFilterOpen(true)}
        searchValue={filters.search}
        onSearchChange={(value) => handleFilterChange({ search: value })}
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
      <div className={`transition-all duration-300 ${isFilterOpen ? 'sm:ml-80 lg:ml-96' : ''}`}>
        {/* Events Grid */}
        <EventsGrid 
          events={filteredEvents} 
          onClearFilters={clearFilters}
        />
        
        {/* Map View */}
        <MapView 
          events={filteredEvents}
          isOpen={showMap}
          onClose={() => setShowMap(false)}
          onClearFilters={clearFilters}
        />
      </div>
      
      {/* Floating Map Toggle */}
      <FloatingMapToggle onClick={handleMapToggle} />
    </div>
  );
}