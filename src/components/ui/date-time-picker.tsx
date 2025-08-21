'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  date?: Date;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DateTimePicker({
  date,
  setDate,
  placeholder = 'Pick a date and time',
  className,
  disabled = false,
}: DateTimePickerProps) {
  const [selectedDateTime, setSelectedDateTime] = React.useState<
    Date | undefined
  >(date instanceof Date ? date : undefined);
  const [isOpen, setIsOpen] = React.useState(false);

  // Update local state when prop changes
  React.useEffect(() => {
    setSelectedDateTime(date instanceof Date ? date : undefined);
  }, [date]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Preserve time if it exists, otherwise set to current time
      const currentTime = selectedDateTime || new Date();
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(
        currentTime.getHours(),
        currentTime.getMinutes(),
        currentTime.getSeconds(),
        0
      );
      setSelectedDateTime(newDateTime);
      setDate(newDateTime);
    }
  };

  const handleTimeChange = (type: 'hours' | 'minutes', value: string) => {
    const currentDateTime = selectedDateTime || new Date();
    const newDateTime = new Date(currentDateTime);
    const numValue = parseInt(value, 10);

    if (type === 'hours') {
      newDateTime.setHours(numValue);
    } else if (type === 'minutes') {
      newDateTime.setMinutes(numValue);
    }

    setSelectedDateTime(newDateTime);
    setDate(newDateTime);
  };

  const formatDisplayValue = (date: Date) => {
    return format(date, "PPP 'at' HH:mm");
  };

  const formatShortDisplay = (date: Date) => {
    return format(date, "MMM d, yyyy 'at' HH:mm");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className={cn(
            'w-full justify-between text-left font-normal bg-background border-2 border-border rounded-xl hover:border-primary/50 transition-all duration-200 backdrop-blur-sm h-12 sm:h-14 lg:h-16 px-4 lg:px-6 group',
            !selectedDateTime && 'text-muted-foreground',
            selectedDateTime && 'border-primary/50 bg-primary/5',
            'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            'hover:shadow-sm active:scale-[0.98]',
            className
          )}
          disabled={disabled}
        >
          <div className='flex items-center gap-3 lg:gap-4 flex-1 min-w-0'>
            <CalendarIcon className='h-5 w-5 lg:h-6 lg:w-6 text-primary flex-shrink-0' />
            <div className='flex-1 min-w-0'>
              {selectedDateTime ? (
                <div className='flex flex-col'>
                  <span className='font-semibold text-sm sm:text-base lg:text-lg truncate'>
                    {formatDisplayValue(selectedDateTime)}
                  </span>
                  <span className='text-xs sm:text-sm text-muted-foreground truncate'>
                    {formatShortDisplay(selectedDateTime)}
                  </span>
                </div>
              ) : (
                <span className='text-sm sm:text-base lg:text-lg'>
                  {placeholder}
                </span>
              )}
            </div>
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground transition-transform duration-200 flex-shrink-0',
              isOpen && 'rotate-180'
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-auto p-0 border-2 border-border/50 shadow-xl rounded-xl bg-background/95 backdrop-blur-sm'
        align='start'
        sideOffset={8}
      >
        <div className='p-4 sm:p-6'>
          <div className='space-y-4'>
            {/* Calendar Section */}
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <CalendarIcon className='h-4 w-4 text-primary' />
                <span className='text-sm font-semibold text-foreground'>
                  Select Date
                </span>
              </div>
              <Calendar
                mode='single'
                selected={selectedDateTime}
                onSelect={handleDateSelect}
                disabled={(date: Date) => date < new Date()}
                initialFocus
                className='rounded-xl border border-border/50 shadow-sm'
                classNames={{
                  months: 'flex flex-col sm:flex-row space-y-4 sm:space-y-0',
                  month: 'space-y-4',
                  caption: 'flex justify-center pt-1 relative items-center',
                  caption_label: 'text-sm font-semibold',
                  nav: 'space-x-1 flex items-center',
                  nav_button: cn(
                    'h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-lg border border-border hover:border-primary/50 transition-all duration-200'
                  ),
                  nav_button_previous: 'absolute left-1',
                  nav_button_next: 'absolute right-1',
                  table: 'w-full border-collapse space-y-1',
                  head_row: 'flex',
                  head_cell:
                    'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
                  row: 'flex w-full mt-2',
                  cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                  day: cn(
                    'h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-lg transition-all duration-200 hover:bg-accent hover:text-accent-foreground'
                  ),
                  day_selected:
                    'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-sm',
                  day_today: 'bg-accent text-accent-foreground font-semibold',
                  day_outside:
                    'text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
                  day_disabled:
                    'text-muted-foreground opacity-50 cursor-not-allowed',
                  day_range_middle:
                    'aria-selected:bg-accent aria-selected:text-accent-foreground',
                  day_hidden: 'invisible',
                }}
              />
            </div>

            {/* Time Section */}
            {selectedDateTime && (
              <div className='space-y-3 pt-4 border-t border-border/50'>
                <div className='flex items-center gap-2'>
                  <Clock className='h-4 w-4 text-primary' />
                  <span className='text-sm font-semibold text-foreground'>
                    Select Time
                  </span>
                </div>

                <div className='flex items-center gap-3'>
                  {/* Hours */}
                  <div className='flex-1'>
                    <label className='text-xs text-muted-foreground mb-2 block font-medium'>
                      Hour
                    </label>
                    <Select
                      value={
                        selectedDateTime
                          ? selectedDateTime
                              .getHours()
                              .toString()
                              .padStart(2, '0')
                          : '00'
                      }
                      onValueChange={value => handleTimeChange('hours', value)}
                    >
                      <SelectTrigger className='h-10 sm:h-12 rounded-lg border-2 border-border hover:border-primary/50 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='max-h-48'>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem
                            key={i}
                            value={i.toString().padStart(2, '0')}
                            className='cursor-pointer hover:bg-accent transition-colors duration-150'
                          >
                            {i.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Separator */}
                  <div className='text-lg sm:text-xl font-bold text-muted-foreground pt-6'>
                    :
                  </div>

                  {/* Minutes */}
                  <div className='flex-1'>
                    <label className='text-xs text-muted-foreground mb-2 block font-medium'>
                      Minute
                    </label>
                    <Select
                      value={
                        selectedDateTime
                          ? selectedDateTime
                              .getMinutes()
                              .toString()
                              .padStart(2, '0')
                          : '00'
                      }
                      onValueChange={value =>
                        handleTimeChange('minutes', value)
                      }
                    >
                      <SelectTrigger className='h-10 sm:h-12 rounded-lg border-2 border-border hover:border-primary/50 transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='max-h-48'>
                        {Array.from({ length: 60 }, (_, i) => (
                          <SelectItem
                            key={i}
                            value={i.toString().padStart(2, '0')}
                            className='cursor-pointer hover:bg-accent transition-colors duration-150'
                          >
                            {i.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
