"use client";

import Hero from "@/components/sections/Hero"
import DiscoverEventsSection from "@/components/sections/DiscoverEventsSection"

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-black to-[#1d0e0d]">
      {/* Hero section */}
      <Hero />
      
      {/* Discover Events Section */}
      <DiscoverEventsSection />
    </div>
  )
}