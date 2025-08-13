"use client";

import { useState, useMemo } from "react";
import { ChevronDown, Calendar, TrendingUp, MapPin, DollarSign, FileText, Filter } from "lucide-react";
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
    <div className="container mx-auto apple-section">
      {/* Header Section */}
      <div className="mb-8 lg:mb-12 xl:mb-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 lg:gap-8">
        <div className="responsive-spacing">
          <h2 className="font-primary text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground tracking-tight">
            Discover Fests
          </h2>
          <div className="flex items-center gap-4 lg:gap-6">
            {events.length > 0 ? (
              <span className="inline-flex items-center px-4 lg:px-6 py-2 lg:py-3 rounded-full text-sm lg:text-base font-medium bg-primary/10 text-primary border border-primary/20 shadow-sm tracking-tight">
                {events.length} {events.length === 1 ? 'event' : 'events'}
              </span>
            ) : (
              <p className="font-secondary text-base lg:text-lg text-muted-foreground tracking-tight">
                No events found
              </p>
            )}
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto h-12 lg:h-14 px-6 lg:px-8 py-3 lg:py-4 rounded-xl border border-border bg-background hover:border-primary hover:bg-accent transition-all duration-200 ease-out font-secondary text-sm lg:text-base shadow-sm tracking-tight"
            >
              <CurrentIcon className="w-4 h-4 lg:w-5 lg:h-5 mr-3 text-muted-foreground" />
              <span className="text-foreground">Sort by: {currentSort.label}</span>
              <ChevronDown className="w-4 h-4 lg:w-5 lg:h-5 ml-3 text-muted-foreground transition-transform duration-200 ease-out group-data-[state=open]:rotate-180" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            sideOffset={8}
            className="w-full sm:w-56 lg:w-64 rounded-xl border border-border bg-background/95 backdrop-blur-xl shadow-lg p-2 lg:p-3"
          >
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`flex items-center gap-3 px-4 lg:px-6 py-3 lg:py-4 rounded-lg cursor-pointer transition-all duration-200 ease-out font-secondary text-sm lg:text-base tracking-tight ${
                    sortBy === option.value 
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
                      : "hover:bg-accent/20 text-foreground hover:text-accent-foreground"
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-lg transition-all duration-200 ease-out ${
                    sortBy === option.value 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-accent/20 text-accent-foreground"
                  }`}>
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <span className="font-medium">{option.label}</span>
                  {sortBy === option.value && (
                    <div className="ml-auto w-2 h-2 lg:w-3 lg:h-3 bg-primary rounded-full"></div>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Events Grid or Empty State */}
      {sortedEvents.length > 0 ? (
        <div className="apple-grid-4">
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
          action={onClearFilters ? {
            label: "Clear All Filters",
            href: "#",
            icon: <Filter className="w-4 h-4" />
          } : undefined}
          secondaryAction={{
            label: "Create a Fest",
            href: "/create",
            icon: <span>🎉</span>
          }}
        />
      )}
    </div>
  );
}