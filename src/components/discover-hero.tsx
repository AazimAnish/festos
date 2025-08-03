"use client";

import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";

export function DiscoverHero() {
  return (
    <div className="bg-background pt-16 sm:pt-20 pb-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn
          variant="up"
          timing="normal"
          className="text-center space-y-6 sm:space-y-8"
        >
          <h1 className="font-primary text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] text-foreground tracking-tight">
            Fests near you. <span className="text-primary">Or far.</span>
          </h1>
          <p className="font-tertiary text-base sm:text-lg md:text-xl lg:text-2xl max-w-lg mx-auto text-gray leading-relaxed">
            Tap in. On-chain.
          </p>
          
          <FadeIn
            variant="up"
            timing="hero-buttons"
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4"
          >
            <Button
              size="lg"
              className="font-secondary text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto bg-primary text-primary-foreground rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
            >
              🧭 Explore Map
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="font-secondary text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto border-2 border-foreground text-foreground rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 hover:border-foreground hover:shadow-lg hover:shadow-primary/20"
            >
              📤 Throw a Fest
            </Button>
          </FadeIn>
        </FadeIn>
      </div>
    </div>
  );
}
