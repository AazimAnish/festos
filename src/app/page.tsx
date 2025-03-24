"use client";

import Hero from "@/components/sections/Hero"
import DiscoverEventsSection from "@/components/sections/DiscoverEventsSection"
import FeaturedOrganizersSection from "@/components/sections/FeaturedOrganizersSection"
import CallToActionSection from "@/components/sections/CallToActionSection"

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      {/* Hero section */}
      <Hero />
      
      {/* Discover Events Section */}
      <DiscoverEventsSection />
      
      <div className="relative">
        {/* Featured Organizers Section */}
        <FeaturedOrganizersSection />
      </div>
    </div>
  )
}