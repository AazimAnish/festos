'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
}

// Generate time options (every 15 minutes)
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = new Date();
      time.setHours(hour, minute, 0, 0);
      times.push({
        value: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        label: format(time, 'h:mm a'),
      });
    }
  }
  return times;
};

const timeOptions = generateTimeOptions();

export function DateTimePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateTimePickerProps) {
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [startTimeOpen, setStartTimeOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [endTimeOpen, setEndTimeOpen] = useState(false);

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date && startDate) {
      // Preserve the time when changing date
      const newDate = new Date(date);
      newDate.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0);
      onStartDateChange(newDate);
    } else {
      onStartDateChange(date);
    }
    setStartDateOpen(false);
  };

  const handleStartTimeSelect = (timeValue: string) => {
    const [hours, minutes] = timeValue.split(':').map(Number);
    const newDate = startDate ? new Date(startDate) : new Date();
    newDate.setHours(hours, minutes, 0, 0);
    onStartDateChange(newDate);
    setStartTimeOpen(false);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date && endDate) {
      // Preserve the time when changing date
      const newDate = new Date(date);
      newDate.setHours(endDate.getHours(), endDate.getMinutes(), 0, 0);
      onEndDateChange(newDate);
    } else {
      onEndDateChange(date);
    }
    setEndDateOpen(false);
  };

  const handleEndTimeSelect = (timeValue: string) => {
    const [hours, minutes] = timeValue.split(':').map(Number);
    const newDate = endDate ? new Date(endDate) : new Date();
    newDate.setHours(hours, minutes, 0, 0);
    onEndDateChange(newDate);
    setEndTimeOpen(false);
  };

  const getTimeValue = (date: Date | undefined) => {
    if (!date) return undefined;
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className='space-y-3'>
      {/* Start Date & Time */}
      <div className='flex rounded-xl border border-border overflow-hidden'>
        <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='ghost'
              className={cn(
                'flex-1 h-12 rounded-none justify-start gap-3 border-r border-border',
                !startDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className='h-4 w-4' />
              <span className='text-sm'>
                {startDate ? format(startDate, 'MMM d, yyyy') : 'Start date'}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar
              mode='single'
              selected={startDate}
              onSelect={handleStartDateSelect}
              disabled={date =>
                date < new Date(new Date().setHours(0, 0, 0, 0))
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover open={startTimeOpen} onOpenChange={setStartTimeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='ghost'
              className={cn(
                'flex-1 h-12 rounded-none justify-start gap-3',
                !startDate && 'text-muted-foreground'
              )}
            >
              <Clock className='h-4 w-4' />
              <span className='text-sm'>
                {startDate ? format(startDate, 'h:mm a') : 'Start time'}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-32 p-0' align='start'>
            <div className='max-h-60 overflow-y-auto p-1'>
              {timeOptions.map(time => (
                <Button
                  key={time.value}
                  variant='ghost'
                  className={cn(
                    'w-full justify-center h-8 px-2 text-sm',
                    getTimeValue(startDate) === time.value && 'bg-accent'
                  )}
                  onClick={() => handleStartTimeSelect(time.value)}
                >
                  {time.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* End Date & Time */}
      <div className='flex rounded-xl border border-border overflow-hidden'>
        <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='ghost'
              className={cn(
                'flex-1 h-12 rounded-none justify-start gap-3 border-r border-border',
                !endDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className='h-4 w-4' />
              <span className='text-sm'>
                {endDate ? format(endDate, 'MMM d, yyyy') : 'End date'}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <Calendar
              mode='single'
              selected={endDate}
              onSelect={handleEndDateSelect}
              disabled={date => {
                const today = new Date(new Date().setHours(0, 0, 0, 0));
                const startDateOnly = startDate
                  ? new Date(
                      startDate.getFullYear(),
                      startDate.getMonth(),
                      startDate.getDate()
                    )
                  : today;
                return (
                  date.getTime() <
                  Math.max(today.getTime(), startDateOnly.getTime())
                );
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover open={endTimeOpen} onOpenChange={setEndTimeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='ghost'
              className={cn(
                'flex-1 h-12 rounded-none justify-start gap-3',
                !endDate && 'text-muted-foreground'
              )}
            >
              <Clock className='h-4 w-4' />
              <span className='text-sm'>
                {endDate ? format(endDate, 'h:mm a') : 'End time'}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-32 p-0' align='start'>
            <div className='max-h-60 overflow-y-auto p-1'>
              {timeOptions.map(time => (
                <Button
                  key={time.value}
                  variant='ghost'
                  className={cn(
                    'w-full justify-center h-8 px-2 text-sm',
                    getTimeValue(endDate) === time.value && 'bg-accent'
                  )}
                  onClick={() => handleEndTimeSelect(time.value)}
                >
                  {time.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
