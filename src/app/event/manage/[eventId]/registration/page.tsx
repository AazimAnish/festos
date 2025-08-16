import { EventManagementPage } from "@/components/event-management/event-management-page";

interface EventRegistrationPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function EventRegistrationPage({ params }: EventRegistrationPageProps) {
  const { eventId } = await params;
  
  return <EventManagementPage eventId={eventId} activeTab="registration" />;
}
