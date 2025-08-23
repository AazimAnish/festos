'use client';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Slider } from '@/shared/components/ui/slider';
import { FadeIn } from '@/shared/components/ui/fade-in';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

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

export function FilterPanel({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onClearFilters,
}: FilterPanelProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    filters.date
  );

  // Synchronize selectedDate with filters.date
  useEffect(() => {
    setSelectedDate(filters.date);
  }, [filters.date]);

  if (!isOpen) return null;

  const handleCategoryClick = (category: string) => {
    onFilterChange({ category: filters.category === category ? '' : category });
  };

  const handlePriceChange = (values: number[]) => {
    onFilterChange({
      priceRange: {
        min: values[0],
        max: values[1],
      },
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
        className='fixed inset-0 bg-black/50 z-40 sm:hidden'
        onClick={onClose}
      />

      {/* Filter Panel */}
      <FadeIn
        variant='left'
        timing='fast'
        className='fixed inset-y-0 left-0 z-50 w-full max-w-sm sm:w-80 lg:w-96 xl:w-[420px] bg-background/95 backdrop-blur-md border-r border-border shadow-2xl overflow-y-auto'
      >
        <div className='flex flex-col h-full'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 sm:p-6 lg:p-8 border-b border-border bg-background/50 backdrop-blur-sm'>
            <h3 className='font-primary text-lg sm:text-xl lg:text-2xl font-bold text-foreground tracking-tight'>
              Filters
            </h3>
            <Button
              variant='ghost'
              size='sm'
              onClick={onClose}
              className='rounded-lg p-2 lg:p-3 hover:bg-accent/20 transition-colors'
            >
              <X className='w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6' />
            </Button>
          </div>

          {/* Filter Content */}
          <div className='flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 responsive-spacing'>
            {/* Location */}
            <div className='responsive-spacing'>
              <Label className='font-secondary text-sm lg:text-base font-medium text-foreground tracking-tight'>
                📍 Location Radius
              </Label>
              <Input
                placeholder='Enter city or distance'
                className='rounded-xl border-2 border-border bg-background/50 backdrop-blur-sm text-sm lg:text-base focus:border-primary transition-colors h-10 sm:h-12 lg:h-14'
              />
            </div>

            {/* Date Section */}
            <div className='responsive-spacing'>
              <div className='flex items-center justify-between'>
                <Label className='font-secondary text-sm lg:text-base font-medium text-foreground tracking-tight'>
                  📅 Date
                </Label>
                {selectedDate && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={clearDate}
                    className='text-xs lg:text-sm text-muted-foreground hover:text-foreground p-1 lg:p-2 rounded-lg hover:bg-accent/20 transition-colors'
                  >
                    <X className='w-3 h-3 lg:w-4 lg:h-4' />
                  </Button>
                )}
              </div>

              {/* Selected Date Display */}
              {selectedDate && (
                <div className='flex items-center gap-3 lg:gap-4 p-3 sm:p-4 lg:p-6 bg-primary/10 border border-primary/20 rounded-xl'>
                  <div className='flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-primary text-primary-foreground rounded-lg flex-shrink-0'>
                    <CalendarIcon className='w-4 h-4 lg:w-5 lg:h-5' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='font-secondary text-sm lg:text-base font-semibold text-foreground truncate tracking-tight'>
                      {format(selectedDate, 'EEEE, MMMM d')}
                    </p>
                    <p className='font-secondary text-xs lg:text-sm text-muted-foreground tracking-tight'>
                      {format(selectedDate, 'yyyy')}
                    </p>
                  </div>
                </div>
              )}

              {/* Calendar */}
              <div className='border-2 border-border rounded-xl p-3 sm:p-4 lg:p-6 bg-background'>
                <DayPicker
                  mode='single'
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  showOutsideDays={true}
                  className='w-full'
                  classNames={{
                    root: 'w-full',
                    months: 'flex flex-col space-y-4',
                    month: 'space-y-4',
                    nav: 'flex items-center justify-between',
                    caption:
                      'flex justify-center pt-1 relative items-center text-sm font-medium',
                    caption_label: 'text-sm font-medium',
                    table: 'w-full border-collapse space-y-1',
                    weekdays: 'flex',
                    weekday:
                      'text-muted-foreground rounded-md w-9 font-normal text-xs',
                    week: 'flex w-full mt-2',
                    day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent/20 hover:text-accent-foreground rounded-lg transition-all duration-200',
                    today:
                      'bg-accent/20 text-accent-foreground font-semibold border border-accent',
                    outside: 'text-muted-foreground opacity-50',
                    disabled: 'text-muted-foreground opacity-50',
                    hidden: 'invisible',
                  }}
                />
              </div>
            </div>

            {/* Category */}
            <div className='responsive-spacing'>
              <Label className='font-secondary text-sm lg:text-base font-medium text-foreground tracking-tight'>
                🎯 Category
              </Label>
              <div className='flex flex-wrap gap-2 lg:gap-3'>
                {['Music', 'Tech', 'Art', 'Food', 'Sports'].map(category => (
                  <Button
                    key={category}
                    variant={
                      filters.category === category ? 'default' : 'outline'
                    }
                    size='sm'
                    onClick={() => handleCategoryClick(category)}
                    className='rounded-xl border-2 border-border hover:border-primary text-xs lg:text-sm font-secondary transition-all duration-200 h-8 lg:h-10 px-3 lg:px-4 tracking-tight'
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className='responsive-spacing'>
              <Label className='font-secondary text-sm lg:text-base font-medium text-foreground tracking-tight'>
                💸 Price Range (ETH)
              </Label>
              <div className='bg-background/50 backdrop-blur-sm border-2 border-border rounded-xl p-4 lg:p-6'>
                <Slider
                  defaultValue={[
                    filters.priceRange.min,
                    filters.priceRange.max,
                  ]}
                  max={1}
                  min={0}
                  step={0.01}
                  value={[filters.priceRange.min, filters.priceRange.max]}
                  onValueChange={handlePriceChange}
                  className='w-full'
                />
                <div className='flex justify-between text-xs lg:text-sm text-muted-foreground mt-3 lg:mt-4'>
                  <span className='font-secondary tracking-tight'>
                    {filters.priceRange.min.toFixed(2)} ETH
                  </span>
                  <span className='font-secondary tracking-tight'>
                    {filters.priceRange.max.toFixed(2)} ETH
                  </span>
                </div>
              </div>
            </div>

            {/* POAP Toggle */}
            <div className='flex items-center justify-between p-3 sm:p-4 lg:p-6 bg-background/50 backdrop-blur-sm border-2 border-border rounded-xl'>
              <Label className='font-secondary text-sm lg:text-base font-medium text-foreground tracking-tight'>
                🪙 POAP only
              </Label>
              <Switch
                checked={filters.hasPOAP}
                onCheckedChange={checked =>
                  onFilterChange({ hasPOAP: checked })
                }
              />
            </div>

            {/* Saved Toggle */}
            <div className='flex items-center justify-between p-3 sm:p-4 lg:p-6 bg-background/50 backdrop-blur-sm border-2 border-border rounded-xl'>
              <Label className='font-secondary text-sm lg:text-base font-medium text-foreground tracking-tight'>
                ⭐ Saved only
              </Label>
              <Switch
                checked={filters.savedOnly}
                onCheckedChange={checked =>
                  onFilterChange({ savedOnly: checked })
                }
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className='p-4 sm:p-6 lg:p-8 border-t border-border bg-background/50 backdrop-blur-sm responsive-spacing'>
            <Button className='w-full rounded-xl bg-primary hover:bg-primary/90 font-secondary text-sm lg:text-base py-3 lg:py-4 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-primary/20 tracking-tight'>
              Apply Filters
            </Button>
            <Button
              variant='outline'
              onClick={onClearFilters}
              className='w-full rounded-xl border-2 border-border font-secondary text-sm lg:text-base py-3 lg:py-4 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg tracking-tight bg-transparent'
            >
              Clear All
            </Button>
          </div>
        </div>
      </FadeIn>
    </>
  );
}
