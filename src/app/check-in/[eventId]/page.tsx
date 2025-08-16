import { CheckInPage } from "@/components/check-in/check-in-page";

interface CheckInPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function CheckIn({ params }: CheckInPageProps) {
  const { eventId } = await params;
  
  return <CheckInPage eventId={eventId} />;
}
