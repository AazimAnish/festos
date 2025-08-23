import { FadeIn } from '@/shared/components/ui/fade-in';
import { POAPCollection } from '@/features/dashboard/poap/poap-collection';

export default function POAPsPage() {
  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-6 max-w-6xl py-8'>
        <FadeIn variant='up' timing='normal'>
          <POAPCollection />
        </FadeIn>
      </div>
    </div>
  );
}
