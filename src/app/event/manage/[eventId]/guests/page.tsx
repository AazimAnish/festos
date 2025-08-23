import { EventManagementPage } from '@/features/events/event-management/event-management-page';

interface EventGuestsPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function EventGuestsPage({
  params,
}: EventGuestsPageProps) {
  const { eventId } = await params;

  return <EventManagementPage eventId={eventId} activeTab='guests' />;
}
