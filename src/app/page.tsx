import { HeroSection } from '@/components/hero-section';
import FeaturedEvents from '../components/featured-events';
import WhyFestos from '../components/why-festos';

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedEvents />
      <WhyFestos />
    </>
  );
}
