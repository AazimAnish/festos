import { EventManagementPage } from '@/components/event-management/event-management-page';

interface EventOverviewPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function EventOverviewPage({
  params,
}: EventOverviewPageProps) {
  const { eventId } = await params;

  return <EventManagementPage eventId={eventId} activeTab='overview' />;
}
