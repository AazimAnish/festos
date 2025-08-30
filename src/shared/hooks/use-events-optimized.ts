/**
 * Optimized Events Hook
 *
 * This hook provides a clean interface for event-related operations following React best practices.
 * It uses React Query for caching, optimistic updates, and error handling.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type EventData,
  type EventCreationResult,
} from '@/lib/services/core/interfaces';
import { getEventsByCreatorFromAvalanche } from '@/lib/contracts/avalanche-client';
import type { CreateEventInput, EventSearchInput } from '@/lib/schemas/event';
import { toast } from 'sonner';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/lib/constants';
import { useAuthenticatedFetch } from './use-wallet-auth';
import React from 'react';

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
  const authenticatedFetch = useAuthenticatedFetch();

  return useMutation({
    mutationFn: async (
      input: CreateEventInput
    ): Promise<EventCreationResult> => {
      const response = await authenticatedFetch('/api/events/create', {
        method: 'POST',
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }

      const responseData = await response.json();
      const data = responseData.data; // API returns { success: true, data: result, metadata: {...} }
      return {
        success: true,
        eventId: data.eventId,
        slug: data.slug || data.eventId,
        contractEventId: data.contractEventId,
        transactionHash: data.transactionHash,
        ipfsMetadataUrl: data.ipfsMetadataUrl,
        ipfsImageUrl: data.ipfsImageUrl,
        contractChainId: data.contractChainId,
        contractAddress: data.contractAddress,
        createdOn: data.createdOn,
      };
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
    queryFn: async (): Promise<{
      events: EventData[];
      total: number;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
      filters: {
        applied: EventSearchInput;
        available: {
          categories: string[];
          locations: string[];
          priceRanges: { min: number; max: number };
        };
      };
    }> => {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (defaultFilters.query) params.append('query', defaultFilters.query);
      if (defaultFilters.category) params.append('category', defaultFilters.category);
      if (defaultFilters.location) params.append('location', defaultFilters.location);
      if (defaultFilters.startDate) params.append('startDate', defaultFilters.startDate);
      if (defaultFilters.endDate) params.append('endDate', defaultFilters.endDate);
      if (defaultFilters.priceRange) {
        params.append('priceRange', JSON.stringify(defaultFilters.priceRange));
      }
      if (defaultFilters.tags) {
        defaultFilters.tags.forEach(tag => params.append('tags', tag));
      }
      params.append('page', defaultFilters.page.toString());
      params.append('limit', defaultFilters.limit.toString());
      
      // Add blockchain parameter if needed
      if (defaultFilters.includeBlockchain) {
        params.append('includeBlockchain', 'true');
      }

      const response = await fetch(`/api/events/list?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      const responseData = await response.json();
      return responseData; // API returns object with events, pagination, and filters
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
      const response = await fetch(`/api/events/${eventId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch event: ${response.statusText}`);
      }

      const responseData = await response.json();
      return responseData.data; // API returns { success: true, data: result, metadata: {...} }
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
      const response = await fetch(`/api/events/slug/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch event: ${response.statusText}`);
      }

      const responseData = await response.json();
      return responseData.data; // API returns { success: true, data: result, metadata: {...} }
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
      const events = await getEventsByCreatorFromAvalanche(creatorId as `0x${string}`, 0n, 100n, true);
      // Convert blockchain events to EventData format
      return events.map(event => ({
        id: event.eventId.toString(),
        title: event.title,
        description: event.description,
        location: event.location,
        startDate: new Date(Number(event.startTime) * 1000).toISOString(),
        endDate: new Date(Number(event.endTime) * 1000).toISOString(),
        maxCapacity: Number(event.maxCapacity),
        ticketPrice: event.ticketPrice.toString(),
        requireApproval: event.requireApproval,
        hasPOAP: event.hasPOAP,
        poapMetadata: event.poapMetadata,
        visibility: 'public', // Default to public since blockchain doesn't store this
        timezone: 'UTC', // Default to UTC since blockchain doesn't store this
        bannerImage: undefined,
        category: undefined,
        tags: undefined,
        creatorId: event.creator,
        status: event.isActive ? 'active' : 'inactive',
        contractEventId: Number(event.eventId),
        contractAddress: undefined,
        contractChainId: undefined,
        ipfsMetadataUrl: undefined,
        ipfsImageUrl: undefined,
        storageProvider: 'blockchain',
        createdAt: new Date(Number(event.createdAt) * 1000).toISOString(),
        updatedAt: new Date(Number(event.updatedAt) * 1000).toISOString(),
      }));
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
        queryFn: async () => {
          const response = await fetch(`/api/events/${eventId}`);
          if (!response.ok) return null;
          const responseData = await response.json();
          return responseData.data; // API returns { success: true, data: result, metadata: {...} }
        },
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchEventBySlug: (slug: string) => {
      queryClient.prefetchQuery({
        queryKey: eventQueryKeys.bySlug(slug),
        queryFn: async () => {
          const response = await fetch(`/api/events/slug/${slug}`);
          if (!response.ok) return null;
          const responseData = await response.json();
          return responseData.data; // API returns { success: true, data: result, metadata: {...} }
        },
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
        queryFn: async () => {
          const params = new URLSearchParams();
          
          if (defaultFilters.query) params.append('query', defaultFilters.query);
          if (defaultFilters.category) params.append('category', defaultFilters.category);
          if (defaultFilters.location) params.append('location', defaultFilters.location);
          if (defaultFilters.startDate) params.append('startDate', defaultFilters.startDate);
          if (defaultFilters.endDate) params.append('endDate', defaultFilters.endDate);
          if (defaultFilters.priceRange) {
            params.append('priceRange', JSON.stringify(defaultFilters.priceRange));
          }
          if (defaultFilters.tags) {
            defaultFilters.tags.forEach(tag => params.append('tags', tag));
          }
          params.append('page', defaultFilters.page.toString());
          params.append('limit', defaultFilters.limit.toString());
          
          if (defaultFilters.includeBlockchain) {
            params.append('includeBlockchain', 'true');
          }

          const response = await fetch(`/api/events/list?${params.toString()}`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch events: ${response.statusText}`);
          }

          const responseData = await response.json();
          return responseData; // API returns events, pagination and filters
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
    events: eventsQuery.data?.events || [],
    pagination: eventsQuery.data?.pagination,
    availableFilters: eventsQuery.data?.filters?.available,
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