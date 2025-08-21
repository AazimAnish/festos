import { EventManagementPage } from '@/components/event-management/event-management-page';

interface EventBlastsPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function EventBlastsPage({
  params,
}: EventBlastsPageProps) {
  const { eventId } = await params;

  return <EventManagementPage eventId={eventId} activeTab='blasts' />;
}
