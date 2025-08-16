import { redirect } from "next/navigation";

interface ManageEventPageProps {
  params: Promise<{
    eventId: string;
  }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function ManageEventPage({ params, searchParams }: ManageEventPageProps) {
  const { eventId } = await params;
  const { tab } = await searchParams;
  
  // If a specific tab is requested, redirect to the tab-specific page
  if (tab) {
    redirect(`/event/manage/${eventId}/${tab}`);
  }
  
  // Default to overview tab
  redirect(`/event/manage/${eventId}/overview`);
}
