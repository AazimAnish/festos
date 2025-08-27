import { useQuery } from '@tanstack/react-query';

// This should match the format expected by SimilarEvents component
export interface SimilarEvent {
  id: number;
  uniqueId?: string; // Lu.ma style unique ID
  title: string;
  location: string;
  price: string;
  image: string;
  date: string;
}

/**
 * Hook for fetching similar events for a given event
 */
export function useSimilarEvents(eventId: string) {
  return useQuery({
    queryKey: ['events', 'similar', eventId],
    queryFn: async (): Promise<SimilarEvent[]> => {
      if (!eventId) return [];
      
      const response = await fetch(`/api/events/similar/${eventId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error(`Failed to fetch similar events: ${response.statusText}`);
      }

      const responseData = await response.json();
      // Map the API response to match the expected format
      return (responseData.data || []).map((event: { id: string; title: string; location: string; price: string; image: string; date: string }) => ({
        id: parseInt(event.id) || Math.floor(Math.random() * 1000), // Convert string id to number
        uniqueId: event.id,
        title: event.title,
        location: event.location,
        price: event.price,
        image: event.image,
        date: event.date,
      }));
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}