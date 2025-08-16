"use client"

import { Search, Filter, Map, Grid3X3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchFilterBarProps {
  onFilterToggle: () => void
  searchValue: string
  onSearchChange: (value: string) => void
  showMap: boolean
  onMapToggle: () => void
}

export function SearchFilterBar({
  onFilterToggle,
  searchValue,
  onSearchChange,
  showMap,
  onMapToggle,
}: SearchFilterBarProps) {
  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Enhanced Search Bar */}
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary apple-transition" />
            <Input
              placeholder="Find events, venues, or experiences…"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 pr-4 h-12 rounded-xl border-2 border-border bg-background/50 font-secondary text-base focus:border-primary focus:bg-background focus:ring-0 apple-transition placeholder:text-muted-foreground"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Filter Button */}
            <Button
              variant="outline"
              onClick={onFilterToggle}
              className="h-10 sm:h-12 px-4 sm:px-6 rounded-xl border-2 border-border bg-background hover:border-primary hover:bg-primary/5 text-foreground hover:text-primary font-medium apple-transition hover:scale-105 active:scale-95"
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </Button>

            {/* Map Toggle */}
            <Button
              variant={showMap ? "default" : "outline"}
              onClick={onMapToggle}
              className={`h-10 sm:h-12 px-4 sm:px-6 rounded-xl font-medium apple-transition hover:scale-105 active:scale-95 ${
                showMap
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground apple-shadow"
                  : "border-2 border-border bg-background hover:border-primary hover:bg-primary/5 text-foreground hover:text-primary"
              }`}
            >
              {showMap ? <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" /> : <Map className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />}
              <span className="hidden sm:inline">{showMap ? "Grid" : "Map"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
