'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { MapPin, Video, Building } from 'lucide-react';
import {
  CommandDialog,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';

interface LocationPickerProps {
  value: string;
  onChange: (value: string) => void;
  onlyOffline?: boolean;
}

export function LocationPicker({
  value,
  onChange,
  onlyOffline = false,
}: LocationPickerProps) {
  const [open, setOpen] = useState(false);

  const recentLocations = [
    'Conference Room A, Tech Hub',
    'Main Auditorium, City Center',
    'Rooftop Terrace, Downtown',
  ];

  const virtualOptions = [
    'Google Meet',
    'Zoom',
    'Microsoft Teams',
    'Custom Link',
  ];

  const handleSelect = (location: string) => {
    onChange(location);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant='outline'
        className='w-full h-12 rounded-xl justify-start gap-3 text-left bg-transparent'
        onClick={() => setOpen(true)}
      >
        <MapPin className='h-4 w-4 text-muted-foreground' />
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {value || 'Add event location'}
        </span>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title='Search location'
        description='Type to search a location'
      >
        <Command>
          <CommandInput placeholder='Search locations...' />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup
              heading={
                <span className='flex items-center gap-2'>
                  <Building className='h-4 w-4' /> Offline
                </span>
              }
            >
              {recentLocations.map(location => (
                <CommandItem
                  key={location}
                  onSelect={() => handleSelect(location)}
                >
                  {location}
                </CommandItem>
              ))}
            </CommandGroup>
            {!onlyOffline && (
              <CommandGroup
                heading={
                  <span className='flex items-center gap-2'>
                    <Video className='h-4 w-4' /> Virtual
                  </span>
                }
              >
                {virtualOptions.map(option => (
                  <CommandItem
                    key={option}
                    onSelect={() => handleSelect(option)}
                  >
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
