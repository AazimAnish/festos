import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { EventData } from '@/lib/services/core/interfaces';

// Event listing state
interface EventListingState {
  events: EventData[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
  filters: {
    search: string;
    category: string;
    location: string;
    priceRange: { min: number; max: number };
    hasPOAP: boolean;
    date: Date | undefined;
  };
}

// Event detail state
interface EventDetailState {
  event: EventData | null;
  isLoading: boolean;
  error: string | null;
}

// Combined store
interface EventStore extends EventListingState, EventDetailState {
  // Listing actions
  setEvents: (events: EventData[]) => void;
  setTotal: (total: number) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setHasMore: (hasMore: boolean) => void;
  setListingLoading: (isLoading: boolean) => void;
  setListingError: (error: string | null) => void;
  setFilters: (filters: Partial<EventListingState['filters']>) => void;
  resetFilters: () => void;
  
  // Detail actions
  setEvent: (event: EventData | null) => void;
  setDetailLoading: (isLoading: boolean) => void;
  setDetailError: (error: string | null) => void;
  
  // Combined actions
  reset: () => void;
}

// Initial state
const initialListingState: EventListingState = {
  events: [],
  total: 0,
  page: 1,
  limit: 12,
  hasMore: false,
  isLoading: false,
  error: null,
  filters: {
    search: '',
    category: '',
    location: '',
    priceRange: { min: 0, max: 1000 },
    hasPOAP: false,
    date: undefined,
  },
};

const initialDetailState: EventDetailState = {
  event: null,
  isLoading: false,
  error: null,
};

// Create the store
export const useEventStore = create<EventStore>()(
  devtools(
    (set, _get) => ({
      // Initial state
      ...initialListingState,
      ...initialDetailState,

      // Listing actions
      setEvents: (events) => set({ events }, false, 'setEvents'),
      setTotal: (total) => set({ total }, false, 'setTotal'),
      setPage: (page) => set({ page }, false, 'setPage'),
      setLimit: (limit) => set({ limit }, false, 'setLimit'),
      setHasMore: (hasMore) => set({ hasMore }, false, 'setHasMore'),
      setListingLoading: (isLoading) => set({ isLoading }, false, 'setListingLoading'),
      setListingError: (error) => set({ error }, false, 'setListingError'),
      setFilters: (filters) => 
        set(
          (state) => ({ 
            filters: { ...state.filters, ...filters },
            page: 1 // Reset to first page when filters change
          }), 
          false, 
          'setFilters'
        ),
      resetFilters: () => 
        set(
          { 
            filters: initialListingState.filters,
            page: 1 
          }, 
          false, 
          'resetFilters'
        ),

      // Detail actions
      setEvent: (event) => set({ event }, false, 'setEvent'),
      setDetailLoading: (isLoading) => set({ isLoading }, false, 'setDetailLoading'),
      setDetailError: (error) => set({ error }, false, 'setDetailError'),

      // Combined actions
      reset: () => set({ ...initialListingState, ...initialDetailState }, false, 'reset'),
    }),
    {
      name: 'event-store',
    }
  )
);

// Selectors for better performance
export const useEventListing = () => useEventStore((state) => ({
  events: state.events,
  total: state.total,
  page: state.page,
  limit: state.limit,
  hasMore: state.hasMore,
  isLoading: state.isLoading,
  error: state.error,
  filters: state.filters,
}));

export const useEventListingActions = () => useEventStore((state) => ({
  setEvents: state.setEvents,
  setTotal: state.setTotal,
  setPage: state.setPage,
  setLimit: state.setLimit,
  setHasMore: state.setHasMore,
  setListingLoading: state.setListingLoading,
  setListingError: state.setListingError,
  setFilters: state.setFilters,
  resetFilters: state.resetFilters,
}));

export const useEventDetail = () => useEventStore((state) => ({
  event: state.event,
  isLoading: state.isLoading,
  error: state.error,
}));

export const useEventDetailActions = () => useEventStore((state) => ({
  setEvent: state.setEvent,
  setDetailLoading: state.setDetailLoading,
  setDetailError: state.setDetailError,
}));
