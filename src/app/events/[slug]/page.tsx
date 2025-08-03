import { EventDetailPage } from "@/components/event-details/event-detail-page";

interface EventDetailProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EventDetail({ params }: EventDetailProps) {
  const { slug } = await params;
  return <EventDetailPage slug={slug} />;
} 