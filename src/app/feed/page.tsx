import { FadeIn } from "@/components/ui/fade-in";
import { SocialFeed } from "@/components/social/social-feed";

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-background">
      <FadeIn variant="up" timing="normal">
        <SocialFeed />
      </FadeIn>
    </div>
  );
}

