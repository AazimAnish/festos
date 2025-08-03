import { useState, useEffect, useCallback } from 'react';
import type { SampleEvent } from '@/lib/data/sample-events';

interface UseEventsOptions {
  category?: string;
  search?: string;
  hasPOAP?: boolean;
  savedOnly?: boolean;
  enabled?: boolean;
}

interface UseEventsReturn {
  events: SampleEvent[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useEvents(options: UseEventsOptions = {}): UseEventsReturn {
  const { category, search, hasPOAP, savedOnly, enabled = true } = options;
  const [events, setEvents] = useState<SampleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (hasPOAP) params.append('hasPOAP', 'true');
      if (savedOnly) params.append('savedOnly', 'true');

      const response = await fetch(`/api/events?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setEvents(data.events);
      } else {
        throw new Error(data.error || 'Failed to fetch events');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching events:', err);
    } finally {
      setIsLoading(false);
    }
  }, [category, search, hasPOAP, savedOnly, enabled]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const refetch = () => {
    fetchEvents();
  };

  return {
    events,
    isLoading,
    error,
    refetch
  };
} 