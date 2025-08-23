import { redirect } from 'next/navigation';
import { extractEventIdFromSlug } from '@/shared/utils/event-helpers';

export default async function EventDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Extract event ID from slug and redirect to new unique ID format
  try {
    const eventId = extractEventIdFromSlug(slug);
    // In a real app, you would look up the unique ID from the database
    // For now, we'll use a simple mapping or redirect to the ID-based URL
    redirect(`/${eventId}`);
  } catch {
    // If slug parsing fails, redirect to discover page
    redirect('/discover');
  }
}
