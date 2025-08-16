import { FadeIn } from "@/components/ui/fade-in";
import { ReviewSystem } from "@/components/reviews/review-system";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface EventReviewsPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function EventReviewsPage({ params }: EventReviewsPageProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 max-w-4xl py-8">
        <div className="mb-6">
          <Link href={`/events/${slug}`}>
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Event
            </Button>
          </Link>
        </div>
        <FadeIn variant="up" timing="normal">
          <ReviewSystem eventId={slug} isEventPage />
        </FadeIn>
      </div>
    </div>
  );
}

