import { FadeIn } from '@/components/ui/fade-in';
import { POAPCollection } from '@/components/poap/poap-collection';

interface UserPOAPsPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function UserPOAPsPage({ params }: UserPOAPsPageProps) {
  const { username } = await params;

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-6 max-w-6xl py-8'>
        <FadeIn variant='up' timing='normal'>
          <POAPCollection username={username} />
        </FadeIn>
      </div>
    </div>
  );
}
