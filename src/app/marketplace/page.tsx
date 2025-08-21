import { FadeIn } from '@/components/ui/fade-in';
import { MarketplacePage } from '@/components/marketplace/marketplace-page';

export default function Marketplace() {
  return (
    <div className='min-h-screen bg-background'>
      <FadeIn variant='up' timing='normal'>
        <MarketplacePage />
      </FadeIn>
    </div>
  );
}
