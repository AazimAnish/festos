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
    <div className="sticky top-16 sm:top-20 z-30 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
            <Input
              placeholder="Search fests, cities, tags…"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-xl border-2 border-border bg-background font-secondary text-sm sm:text-base focus:border-primary transition-colors w-full h-10 sm:h-11"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Filter Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onFilterToggle}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border hover:border-primary transition-colors font-secondary text-xs sm:text-sm h-10 sm:h-11"
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline ml-2">Filter</span>
            </Button>

            {/* Map Toggle */}
            <Button
              variant={showMap ? "default" : "outline"}
              size="sm"
              onClick={onMapToggle}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-border hover:border-primary transition-colors font-secondary text-xs sm:text-sm h-10 sm:h-11"
            >
              <Map className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline ml-2">Map</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}