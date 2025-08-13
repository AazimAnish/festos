"use client";

import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import Link from "next/link";

export function DiscoverHero() {
  return (
    <div className="bg-background pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 lg:pb-20">
      <div className="container mx-auto">
        <FadeIn
          variant="up"
          timing="normal"
          className="text-center responsive-spacing"
        >
          <h1 className="font-primary text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-foreground tracking-tight">
            Fests near you. <span className="text-primary">Or far.</span>
          </h1>
          <p className="font-tertiary text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-lg mx-auto text-muted-foreground leading-relaxed tracking-tight">
            Tap in. On-chain.
          </p>
          
          <FadeIn
            variant="up"
            timing="hero-buttons"
            className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center pt-6 lg:pt-8"
          >
            <Button
              size="lg"
              className="w-full sm:w-auto font-secondary text-base lg:text-lg px-8 lg:px-12 py-4 lg:py-6 h-auto bg-primary text-primary-foreground rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg tracking-tight"
            >
              🧭 Explore Map
            </Button>
            <Link href="/create">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto font-secondary text-base lg:text-lg px-8 lg:px-12 py-4 lg:py-6 h-auto border-2 border-border text-foreground rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:bg-accent tracking-tight"
              >
                📤 Throw a Fest
              </Button>
            </Link>
          </FadeIn>
        </FadeIn>
      </div>
    </div>
  );
}
