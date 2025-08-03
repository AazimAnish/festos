"use client";

import { useState, useMemo } from "react";
import { ChevronDown, Calendar, TrendingUp, MapPin, DollarSign, FileText } from "lucide-react";
import { EventCard } from "./event-card";
import { EmptyState } from "./empty-state";
import { FadeIn } from "@/components/ui/fade-in";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SampleEvent } from "@/lib/data/sample-events";

interface EventsGridProps {
  events: SampleEvent[];
  onClearFilters?: () => void;
}

type SortOption = {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function EventsGrid({ events, onClearFilters }: EventsGridProps) {
  const [sortBy, setSortBy] = useState("date");

  const sortOptions: SortOption[] = [
    { value: "date", label: "Date", icon: Calendar },
    { value: "popular", label: "Popular", icon: TrendingUp },
    { value: "distance", label: "Distance", icon: MapPin },
    { value: "price", label: "Price", icon: DollarSign },
    { value: "name", label: "Name", icon: FileText },
  ];

  const currentSort = sortOptions.find(option => option.value === sortBy) || sortOptions[0];
  const CurrentIcon = currentSort.icon;

  // Sort events based on current sort option
  const sortedEvents = useMemo(() => {
    const sorted = [...events];
    
    switch (sortBy) {
      case "date":
        return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case "popular":
        return sorted.sort((a, b) => b.joinedCount - a.joinedCount);
      case "price":
        return sorted.sort((a, b) => {
          const aPrice = a.price === "Free" ? 0 : parseFloat(a.price.split(" ")[0]);
          const bPrice = b.price === "Free" ? 0 : parseFloat(b.price.split(" ")[0]);
          return aPrice - bPrice;
        });
      case "name":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  }, [events, sortBy]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-3">
          <h2 className="font-primary text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            Discover Fests
          </h2>
          <div className="flex items-center gap-3">
            {events.length > 0 ? (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 shadow-sm">
                {events.length} {events.length === 1 ? 'event' : 'events'}
              </span>
            ) : (
              <p className="font-secondary text-sm sm:text-base text-gray">
                No events found
              </p>
            )}
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border-2 border-border bg-background/50 backdrop-blur-sm hover:border-primary hover:bg-background/80 transition-all duration-200 font-secondary text-xs sm:text-sm shadow-sm hover:shadow-md"
            >
              <CurrentIcon className="w-4 h-4 mr-2 text-gray" />
              <span className="text-foreground">Sort by: {currentSort.label}</span>
              <ChevronDown className="w-4 h-4 ml-2 text-gray transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            sideOffset={8}
            className="w-full sm:w-56 rounded-xl border-2 border-border bg-background/95 backdrop-blur-md shadow-2xl p-2"
          >
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 font-secondary text-sm ${
                    sortBy === option.value 
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
                      : "hover:bg-accent/20 text-foreground hover:text-accent-foreground"
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                    sortBy === option.value 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-accent/20 text-accent-foreground"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{option.label}</span>
                  {sortBy === option.value && (
                    <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Events Grid or Empty State */}
      {sortedEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr">
          {sortedEvents.map((event, index) => (
            <FadeIn
              key={event.id}
              variant="up"
              timing="normal"
              className="w-full"
              delay={index * 0.1}
            >
              <EventCard {...event} />
            </FadeIn>
          ))}
        </div>
      ) : (
        <EmptyState 
          title="No fests found"
          description="Try adjusting your filters or search terms to find more events"
          actionText="Clear All Filters"
          onAction={onClearFilters}
          icon="🎭"
        />
      )}
    </div>
  );
}