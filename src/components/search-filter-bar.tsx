"use client";

import { Search, Filter, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchFilterBarProps {
  onFilterToggle: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  showMap: boolean;
  onMapToggle: () => void;
}

export function SearchFilterBar({ 
  onFilterToggle, 
  searchValue, 
  onSearchChange, 
  showMap, 
  onMapToggle 
}: SearchFilterBarProps) {
  return (
    <div className="sticky top-16 sm:top-20 lg:top-24 z-30 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 lg:gap-6 py-4 lg:py-6">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 pointer-events-none transition-colors duration-200 ease-out" />
            <Input
              placeholder="Search fests, cities, tags…"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 sm:pl-12 lg:pl-16 pr-4 lg:pr-6 py-3 lg:py-4 rounded-xl border border-border bg-background font-secondary text-sm sm:text-base lg:text-lg focus:border-primary transition-all duration-200 ease-out w-full h-12 lg:h-14 shadow-sm tracking-tight"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 lg:gap-4 w-full sm:w-auto">
            {/* Filter Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onFilterToggle}
              className="flex-1 sm:flex-none px-4 lg:px-6 py-3 lg:py-4 rounded-xl border border-border hover:border-primary hover:bg-accent transition-all duration-200 ease-out font-secondary text-sm lg:text-base h-12 lg:h-14 shadow-sm tracking-tight"
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              <span className="hidden sm:inline ml-2 lg:ml-3">Filter</span>
            </Button>

            {/* Map Toggle */}
            <Button
              variant={showMap ? "default" : "outline"}
              size="sm"
              onClick={onMapToggle}
              className="flex-1 sm:flex-none px-4 lg:px-6 py-3 lg:py-4 rounded-xl border border-border hover:border-primary hover:bg-accent transition-all duration-200 ease-out font-secondary text-sm lg:text-base h-12 lg:h-14 shadow-sm tracking-tight"
            >
              <Map className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              <span className="hidden sm:inline ml-2 lg:ml-3">Map</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}