import { FadeIn } from '@/shared/components/ui/fade-in';
import { MarketplacePage } from '@/features/marketplace/marketplace-page';

export default function Marketplace() {
  return (
    <div className='min-h-screen bg-background'>
      <FadeIn variant='up' timing='normal'>
        <MarketplacePage />
      </FadeIn>
    </div>
  );
}
