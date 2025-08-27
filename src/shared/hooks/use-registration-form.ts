import { useQuery } from '@tanstack/react-query';
import type { FormField } from '@/shared/types/registration';

/**
 * Hook for fetching registration form fields for an event
 */
export function useRegistrationForm(eventId: string) {
  return useQuery({
    queryKey: ['registration', 'form', eventId],
    queryFn: async (): Promise<FormField[]> => {
      // For now, return a default form structure since we don't have an API for this yet
      // In the future, this would fetch custom form fields from an API
      return [
        { type: 'text', label: 'Full Name', required: true },
        { type: 'email', label: 'Email', required: true },
        { type: 'text', label: 'Discord Username', required: false },
        {
          type: 'select',
          label: 'Experience Level',
          options: ['Beginner', 'Intermediate', 'Advanced'],
          required: false,
        },
      ];
    },
    enabled: !!eventId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}