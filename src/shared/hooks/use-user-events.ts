'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './use-wallet';
import { useAuthenticatedFetch } from './use-wallet-auth';

export interface UserEvent {
  id: string;
  uniqueId: string;
  title: string;
  description: string;
  location: string;
  price: string;
  image: string;
  joinedCount: number;
  maxCapacity: number;
  hasPOAP: boolean;
  isSaved: boolean;
  category: string;
  date: string;
  startDate: string;
  endDate: string;
  timezone: string;
  visibility: 'public' | 'private' | 'unlisted';
  status: 'pending' | 'confirmed' | 'cancelled' | 'active';
  createdAt: string;
  contractEventId?: number;
  transactionHash?: string;
  contractAddress?: string;
  contractChainId?: number;
}

export function useUserEvents() {
  const { isConnected } = useWallet();
  const authenticatedFetch = useAuthenticatedFetch();
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's created events
  const fetchUserEvents = useCallback(async () => {
    if (!isConnected) {
      setEvents([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch('/api/events/user', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user events');
      }

      const result = await response.json();
      
      if (result.success) {
        setEvents(result.data.events);
      } else {
        throw new Error(result.message || 'Failed to fetch user events');
      }
    } catch (err) {
      setError('Failed to fetch events');
      console.error('Error fetching user events:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, authenticatedFetch]);

  // Get upcoming events
  const getUpcomingEvents = useCallback(() => {
    const now = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate > now && (event.status === 'active' || event.status === 'confirmed');
    });
  }, [events]);

  // Get past events
  const getPastEvents = useCallback(() => {
    const now = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate <= now;
    });
  }, [events]);

  // Get events by status
  const getEventsByStatus = useCallback((status: UserEvent['status']) => {
    return events.filter(event => event.status === status);
  }, [events]);

  // Initialize data
  useEffect(() => {
    fetchUserEvents();
  }, [fetchUserEvents]);

  return {
    events,
    upcomingEvents: getUpcomingEvents(),
    pastEvents: getPastEvents(),
    isLoading,
    error,
    getEventsByStatus,
    refetch: fetchUserEvents,
  };
}