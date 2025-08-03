"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import { FadeIn } from "@/components/ui/fade-in";
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";

interface Filters {
  search: string;
  category: string;
  priceRange: { min: number; max: number };
  hasPOAP: boolean;
  savedOnly: boolean;
  date: Date | undefined;
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onFilterChange: (newFilters: Partial<Filters>) => void;
  onClearFilters: () => void;
}

export function FilterPanel({ isOpen, onClose, filters, onFilterChange, onClearFilters }: FilterPanelProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(filters.date);

  if (!isOpen) return null;

  const handleCategoryClick = (category: string) => {
    onFilterChange({ category: filters.category === category ? "" : category });
  };

  const handlePriceChange = (values: number[]) => {
    onFilterChange({ 
      priceRange: { 
        min: values[0], 
        max: values[1] 
      } 
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    onFilterChange({ date });
  };

  const clearDate = () => {
    setSelectedDate(undefined);
    onFilterChange({ date: undefined });
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 sm:hidden" 
        onClick={onClose}
      />
      
      {/* Filter Panel */}
      <FadeIn 
        variant="left" 
        timing="fast" 
        className="fixed inset-y-0 left-0 z-50 w-full max-w-sm sm:w-80 lg:w-96 bg-background/95 backdrop-blur-md border-r border-border shadow-2xl overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-background/50 backdrop-blur-sm">
            <h3 className="font-primary text-lg sm:text-xl font-bold text-foreground">Filters</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose} 
              className="rounded-lg p-2 hover:bg-accent/20 transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>

          {/* Filter Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Location */}
            <div className="space-y-3">
              <Label className="font-secondary text-sm font-medium text-foreground">📍 Location Radius</Label>
              <Input 
                placeholder="Enter city or distance" 
                className="rounded-xl border-2 border-border bg-background/50 backdrop-blur-sm text-sm focus:border-primary transition-colors h-10 sm:h-11" 
              />
            </div>

            {/* Date Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-secondary text-sm font-medium text-foreground">📅 Date</Label>
                {selectedDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearDate}
                    className="text-xs text-gray hover:text-foreground p-1 rounded-lg hover:bg-accent/20 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              
              {/* Selected Date Display */}
              {selectedDate && (
                <div className="flex items-center gap-3 p-3 sm:p-4 bg-primary/10 border border-primary/20 rounded-xl">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-lg flex-shrink-0">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-secondary text-sm font-semibold text-foreground truncate">
                      {format(selectedDate, "EEEE, MMMM d")}
                    </p>
                    <p className="font-secondary text-xs text-gray">
                      {format(selectedDate, "yyyy")}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Calendar */}
              <div className="border-2 border-border rounded-xl p-3 sm:p-4 bg-background">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  showOutsideDays={true}
                  className="w-full"
                  classNames={{
                    root: "w-full",
                    months: "flex flex-col space-y-4",
                    month: "space-y-4",
                    nav: "flex items-center justify-between",
                    button_previous: "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 border border-border rounded-lg hover:bg-accent/20 transition-all duration-200 flex items-center justify-center",
                    button_next: "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 border border-border rounded-lg hover:bg-accent/20 transition-all duration-200 flex items-center justify-center",
                    caption: "flex justify-center pt-1 relative items-center text-sm font-medium font-secondary text-foreground",
                    caption_label: "text-sm font-medium font-secondary text-foreground",
                    table: "w-full border-collapse space-y-1",
                    weekdays: "flex",
                    weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] font-secondary",
                    week: "flex w-full mt-2",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent/20 hover:text-accent-foreground rounded-lg transition-all duration-200",
                    today: "bg-accent/20 text-accent-foreground font-semibold border border-accent",
                    outside: "text-muted-foreground opacity-50",
                    disabled: "text-muted-foreground opacity-50",
                    hidden: "invisible",
                  }}
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-3">
              <Label className="font-secondary text-sm font-medium text-foreground">🎯 Category</Label>
              <div className="flex flex-wrap gap-2">
                {["Music", "Tech", "Art", "Food", "Sports"].map((category) => (
                  <Button
                    key={category}
                    variant={filters.category === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryClick(category)}
                    className="rounded-xl border-2 border-border hover:border-primary text-xs font-secondary transition-all duration-200 h-8 px-3"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <Label className="font-secondary text-sm font-medium text-foreground">💸 Price Range (ETH)</Label>
              <div className="bg-background/50 backdrop-blur-sm border-2 border-border rounded-xl p-4">
                <Slider
                  defaultValue={[filters.priceRange.min, filters.priceRange.max]}
                  max={1}
                  min={0}
                  step={0.01}
                  value={[filters.priceRange.min, filters.priceRange.max]}
                  onValueChange={handlePriceChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray mt-3">
                  <span className="font-secondary">{filters.priceRange.min.toFixed(2)} ETH</span>
                  <span className="font-secondary">{filters.priceRange.max.toFixed(2)} ETH</span>
                </div>
              </div>
            </div>

            {/* POAP Toggle */}
            <div className="flex items-center justify-between p-3 sm:p-4 bg-background/50 backdrop-blur-sm border-2 border-border rounded-xl">
              <Label className="font-secondary text-sm font-medium text-foreground">🪙 POAP only</Label>
              <Switch 
                checked={filters.hasPOAP}
                onCheckedChange={(checked) => onFilterChange({ hasPOAP: checked })}
              />
            </div>

            {/* Saved Toggle */}
            <div className="flex items-center justify-between p-3 sm:p-4 bg-background/50 backdrop-blur-sm border-2 border-border rounded-xl">
              <Label className="font-secondary text-sm font-medium text-foreground">⭐ Saved only</Label>
              <Switch 
                checked={filters.savedOnly}
                onCheckedChange={(checked) => onFilterChange({ savedOnly: checked })}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 sm:p-6 border-t border-border bg-background/50 backdrop-blur-sm space-y-3">
            <Button 
              className="w-full rounded-xl bg-primary hover:bg-primary/90 font-secondary text-sm py-3 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-primary/20"
            >
              Apply Filters
            </Button>
            <Button 
              variant="outline" 
              onClick={onClearFilters}
              className="w-full rounded-xl border-2 border-border font-secondary text-sm py-3 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
            >
              Clear All
            </Button>
          </div>
        </div>
      </FadeIn>
    </>
  );
}