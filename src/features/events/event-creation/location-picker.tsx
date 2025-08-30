'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/shared/components/ui/button';
import { MapPin, Video, Building, Loader2 } from 'lucide-react';
import {
  CommandDialog,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command';

// Places result interface (supports both Google Places and OpenStreetMap)
interface PlaceResult {
  place_id: string;
  formatted_address: string;
  name: string;
  types: string[];
  lat?: number;
  lon?: number;
}

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
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Search places using Places API (Google Places or OpenStreetMap fallback)
  const searchPlaces = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setPlaces([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Generate a session token for Google Places API (if available)
      const sessionToken = Math.random().toString(36).substring(2, 15);
      
      const response = await fetch(
        `/api/places/search?query=${encodeURIComponent(query)}&sessiontoken=${sessionToken}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search places');
      }

      const result = await response.json();
      
      if (result.success) {
        setPlaces(result.data);
      } else {
        throw new Error(result.message || 'Failed to search places');
      }
    } catch (err) {
      console.error('Error searching places:', err);
      setError('Failed to search locations. Please try again.');
      setPlaces([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchPlaces(searchQuery);
      } else {
        setPlaces([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchPlaces]);

  const handleSelect = (location: string) => {
    onChange(location);
    setOpen(false);
    setSearchQuery('');
    setPlaces([]);
    setError(null);
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
          <CommandInput 
            placeholder='Search locations...' 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isLoading && (
              <div className='flex items-center justify-center p-4'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span className='ml-2'>Searching locations...</span>
              </div>
            )}
            
            {!isLoading && searchQuery && places.length === 0 && !error && (
              <CommandEmpty>No results found for "{searchQuery}".</CommandEmpty>
            )}
            
            {error && (
              <div className='flex items-center justify-center p-4 text-destructive'>
                <span className='text-sm'>{error}</span>
              </div>
            )}
            
            {!isLoading && searchQuery === '' && (
              <CommandEmpty>Start typing to search for locations.</CommandEmpty>
            )}
            
            {places.length > 0 && (
              <CommandGroup
                heading={
                  <span className='flex items-center gap-2'>
                    <MapPin className='h-4 w-4' /> Search Results
                  </span>
                }
              >
                {places.map(place => (
                  <CommandItem
                    key={place.place_id}
                    onSelect={() => handleSelect(place.formatted_address)}
                  >
                    <div className='flex flex-col'>
                      <span className='font-medium'>{place.name}</span>
                      <span className='text-sm text-muted-foreground'>
                        {place.formatted_address}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            
            {searchQuery === '' && (
              <>
                <CommandGroup
                  heading={
                    <span className='flex items-center gap-2'>
                      <Building className='h-4 w-4' /> Recent Locations
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
              </>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
