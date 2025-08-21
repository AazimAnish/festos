/**
 * Optimized Events Hook
 *
 * This hook provides a clean interface for event-related operations following React best practices.
 * It uses React Query for caching, optimistic updates, and error handling.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  eventService,
  type EventData,
  type EventCreationResult,
} from '@/lib/services/event-service';
import type { CreateEventInput, EventSearchInput } from '@/lib/schemas/event';
import { toast } from 'sonner';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/lib/constants';
import React from 'react'; // Added missing import for React

// Query keys for React Query
export const eventQueryKeys = {
  all: ['events'] as const,
  lists: () => [...eventQueryKeys.all, 'list'] as const,
  list: (filters: EventSearchInput) =>
    [...eventQueryKeys.lists(), filters] as const,
  details: () => [...eventQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventQueryKeys.details(), id] as const,
  bySlug: (slug: string) =>
    [...eventQueryKeys.details(), 'slug', slug] as const,
  byCreator: (creatorId: string) =>
    [...eventQueryKeys.lists(), 'creator', creatorId] as const,
} as const;

/**
 * Hook for creating events
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: CreateEventInput
    ): Promise<EventCreationResult> => {
      return eventService.createEvent(input);
    },
    onSuccess: result => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.details() });

      // Show success message
      toast.success(SUCCESS_MESSAGES.EVENT_CREATED);

      // Log creation details
      console.log('Event created:', {
        eventId: result.eventId,
        createdOn: result.createdOn,
      });
    },
    onError: error => {
      // Show error message
      const errorMessage =
        error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR;
      toast.error(errorMessage);

      console.error('Event creation failed:', error);
    },
  });
}

/**
 * Hook for fetching events with search and filters
 */
export function useEvents(filters: Partial<EventSearchInput> = {}) {
  const defaultFilters: EventSearchInput = {
    page: 1,
    limit: 12,
    ...filters,
  };
  return useQuery({
    queryKey: eventQueryKeys.list(defaultFilters),
    queryFn: async (): Promise<EventData[]> => {
      const query = defaultFilters.query || '';
      const searchFilters = {
        category: defaultFilters.category,
        location: defaultFilters.location,
      };
      return eventService.searchEvents(query, searchFilters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Hook for fetching a single event by ID
 */
export function useEvent(eventId: string) {
  return useQuery({
    queryKey: eventQueryKeys.detail(eventId),
    queryFn: async (): Promise<EventData | null> => {
      return eventService.getEventById(eventId);
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for fetching a single event by slug
 */
export function useEventBySlug(slug: string) {
  return useQuery({
    queryKey: eventQueryKeys.bySlug(slug),
    queryFn: async (): Promise<EventData | null> => {
      return eventService.getEventBySlug(slug);
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for fetching events by creator
 */
export function useEventsByCreator(creatorId: string) {
  return useQuery({
    queryKey: eventQueryKeys.byCreator(creatorId),
    queryFn: async (): Promise<EventData[]> => {
      return eventService.getEventsByCreator(creatorId);
    },
    enabled: !!creatorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for prefetching events
 */
export function usePrefetchEvents() {
  const queryClient = useQueryClient();

  return {
    prefetchEvent: (eventId: string) => {
      queryClient.prefetchQuery({
        queryKey: eventQueryKeys.detail(eventId),
        queryFn: () => eventService.getEventById(eventId),
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchEventBySlug: (slug: string) => {
      queryClient.prefetchQuery({
        queryKey: eventQueryKeys.bySlug(slug),
        queryFn: () => eventService.getEventBySlug(slug),
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchEvents: (filters: Partial<EventSearchInput> = {}) => {
      const defaultFilters: EventSearchInput = {
        page: 1,
        limit: 12,
        ...filters,
      };
      queryClient.prefetchQuery({
        queryKey: eventQueryKeys.list(defaultFilters),
        queryFn: () => {
          const query = defaultFilters.query || '';
          const searchFilters = {
            category: defaultFilters.category,
            location: defaultFilters.location,
          };
          return eventService.searchEvents(query, searchFilters);
        },
        staleTime: 5 * 60 * 1000,
      });
    },
  };
}

/**
 * Hook for managing event cache
 */
export function useEventCache() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.all });
    },
    invalidateLists: () => {
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.lists() });
    },
    invalidateDetails: () => {
      queryClient.invalidateQueries({ queryKey: eventQueryKeys.details() });
    },
    removeEvent: (eventId: string) => {
      queryClient.removeQueries({ queryKey: eventQueryKeys.detail(eventId) });
    },
    updateEvent: (
      eventId: string,
      updater: (oldData: EventData | undefined) => EventData
    ) => {
      queryClient.setQueryData(eventQueryKeys.detail(eventId), updater);
    },
  };
}

/**
 * Hook for event search with debouncing
 */
export function useEventSearch(initialFilters: Partial<EventSearchInput> = {}) {
  const defaultInitialFilters: EventSearchInput = {
    page: 1,
    limit: 12,
    ...initialFilters,
  };

  const [filters, setFilters] = React.useState<EventSearchInput>(
    defaultInitialFilters
  );
  const [debouncedFilters, setDebouncedFilters] =
    React.useState<EventSearchInput>(defaultInitialFilters);

  // Debounce filters to avoid excessive API calls
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  const eventsQuery = useEvents(debouncedFilters);

  return {
    filters,
    setFilters,
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error,
    refetch: eventsQuery.refetch,
  };
}

/**
 * Hook for event creation with form handling
 */
export function useEventCreation() {
  const createEventMutation = useCreateEvent();
  const [isCreating, setIsCreating] = React.useState(false);

  const createEvent = React.useCallback(
    async (input: CreateEventInput) => {
      setIsCreating(true);
      try {
        const result = await createEventMutation.mutateAsync(input);
        return result;
      } finally {
        setIsCreating(false);
      }
    },
    [createEventMutation]
  );

  return {
    createEvent,
    isCreating: isCreating || createEventMutation.isPending,
    error: createEventMutation.error,
    reset: createEventMutation.reset,
  };
}
