import { FadeIn } from '@/shared/components/ui/fade-in';
import { SocialFeed } from '@/features/dashboard/social/social-feed';

export default function FeedPage() {
  return (
    <div className='min-h-screen bg-background'>
      <FadeIn variant='up' timing='normal'>
        <SocialFeed />
      </FadeIn>
    </div>
  );
}
