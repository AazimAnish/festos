import { EventDetailPage } from '@/components/event-details/event-detail-page';
import { extractEventIdFromUniqueId } from '@/lib/utils';
import { notFound } from 'next/navigation';

interface EventPageProps {
  params: Promise<{
    uniqueId: string;
  }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { uniqueId } = await params;

  // Check if this is a system route that shouldn't be treated as an event
  const systemRoutes = ['discover', 'create', 'event', 'check-in', 'user'];
  if (systemRoutes.includes(uniqueId)) {
    return notFound();
  }

  // Extract event ID from unique ID for proper data fetching
  const eventId = extractEventIdFromUniqueId(uniqueId);

  return <EventDetailPage uniqueId={uniqueId} eventId={eventId} />;
}
