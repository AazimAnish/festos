import { HeroSection } from '@/shared/components/hero-section';
import FeaturedEvents from '@/features/events/featured-events';
import WhyFestos from '@/shared/components/why-festos';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturedEvents />
      <WhyFestos />
    </div>
  );
}
