import { EventDetailPage } from "@/components/event-details/event-detail-page";

export default async function EventDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <EventDetailPage slug={slug} />;
}