import { EventDetailPage } from '@/features/events/event-details/event-detail-page';
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

  // Pass the uniqueId directly since events use UUIDs
  return <EventDetailPage uniqueId={uniqueId} />;
}
