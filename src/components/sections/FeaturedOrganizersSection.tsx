"use client"

import { LogoCarousel } from "@/components/ui/logo-carousel"
import { ChevronRight } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

// Sample partner logos data with image paths
const partnerLogos = [
  {
    name: "Eventbrite",
    id: 1,
    img: "/images/sample.jpg",
  },
  {
    name: "Ticketmaster",
    id: 2,
    img: "/images/sample.jpg",
  },
  {
    name: "LiveNation",
    id: 3,
    img: "/images/sample.jpg",
  },
  {
    name: "AEG Presents",
    id: 4,
    img: "/images/sample.jpg",
  },
  {
    name: "StubHub",
    id: 5,
    img: "/images/sample.jpg",
  },
  {
    name: "SeatGeek",
    id: 6,
    img: "/images/sample.jpg",
  },
];

interface PartnerLogoProps {
  name: string;
  img: string;
}

// Custom logo component to use with the carousel
const PartnerLogo = ({ name, img }: PartnerLogoProps) => (
  <div className="flex flex-col items-center text-center">
    <div className="relative w-16 h-16 rounded-md overflow-hidden card-glass">
      <Image src={img} alt={name} width={64} height={64} className="object-cover" />
    </div>
    <p className="text-white/70 dark:text-black/70 text-xs mt-2 font-azeret-mono">{name}</p>
  </div>
);

export default function FeaturedOrganizersSection() {
  return (
    <section className="relative py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="featured-card bg-black/20 dark:bg-white/20 backdrop-blur-xl p-10 rounded-2xl border border-white/10 dark:border-black/10 relative overflow-hidden">
          {/* Noise overlay for the card */}
          <div className="absolute inset-0 bg-noise opacity-10 mix-blend-overlay pointer-events-none"></div>
          
          {/* Content container */}
          <div className="relative z-10">
            {/* Section Title */}
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl md:text-4xl font-calendas text-white dark:text-black">
                <span className="text-[#ff4b43]">Featured</span> Organizers
              </h2>
              
              <Button variant="glassmorphic" size="sm" className="flex items-center gap-1 group">
                <span>View All</span>
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
            
            {/* Description */}
            <div className="mb-10 text-white/80 dark:text-black/80 text-center max-w-2xl mx-auto">
              <p className="font-azeret-mono text-sm md:text-base">
                Top event organizers and sponsors trusted by millions worldwide. Join the community and create unforgettable experiences.
              </p>
            </div>
            
            {/* Logo Carousel */}
            <div className="flex justify-center mb-16">
              <LogoCarousel logos={partnerLogos} columnCount={3} />
            </div>
            
            {/* Become a Partner CTA */}
            <div className="mt-12 text-center">
              <Button 
                size="lg"
                className="font-azeret-mono"
              >
                Become a Partner
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 