"use client";

import { Button } from "@/components/ui/button";
import { CardSwipe } from "@/components/ui/card-swipe";
import { FadeIn } from "@/components/ui/fade-in";
import { AvalancheBadge } from "@/components/ui/avalanche-badge";
import GridBackground from "@/components/ui/grid-background";
import Link from "next/link";

const CARD_IMAGES = [
  { src: "/card1.png", alt: "Event 1" },
  { src: "/card2.png", alt: "Event 2" },
  { src: "/card3.png", alt: "Event 3" },
  { src: "/card1.png", alt: "Event 4" },
  { src: "/card2.png", alt: "Event 5" },
  { src: "/card3.png", alt: "Event 6" },
  { src: "/card1.png", alt: "Event 7" },
  { src: "/card2.png", alt: "Event 8" },
  { src: "/card3.png", alt: "Event 9" },
];

export function HeroSection() {
  return (
    <div className="min-h-screen bg-background flex items-center relative">
      <GridBackground />
      <section className="w-full relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 xl:gap-20 items-center">
            
            {/* Left Side - Content */}
            <FadeIn
              variant="left"
              timing="normal"
              className="order-2 lg:order-1 flex flex-col justify-center"
            >
              <div className="space-y-6 sm:space-y-8 lg:space-y-10 xl:space-y-12 text-center lg:text-left">
                
                {/* Avalanche Badge */}
                <FadeIn
                  variant="up"
                  timing="hero-badge"
                  className="flex justify-center lg:justify-start"
                >
                  <AvalancheBadge />
                </FadeIn>
                
                {/* Hero Text */}
                <FadeIn
                  variant="up"
                  timing="hero-text"
                  className="space-y-4 sm:space-y-6 lg:space-y-8"
                >
                  <h1 className="font-primary text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] text-foreground tracking-tight">
                    For the culture.<br />
                    On the <span className="text-primary">chain.</span>
                  </h1>
                  <p className="font-tertiary text-base sm:text-lg md:text-xl lg:text-2xl max-w-lg mx-auto lg:mx-0 text-gray leading-relaxed">
                    Create fests that live forever.
                  </p>
                </FadeIn>

                {/* Action Buttons */}
                <FadeIn
                  variant="up"
                  timing="hero-buttons"
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-2"
                >
                  <Button
                    size="lg"
                    className="font-secondary text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto bg-primary text-primary-foreground rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                  >
                    🎉 Throw a Fest
                  </Button>
                  <Link href="/discover">
                    <Button
                      variant="outline"
                      size="lg"
                      className="font-secondary text-sm sm:text-base md:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto border-2 border-foreground text-foreground rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 hover:border-foreground hover:shadow-lg hover:shadow-primary/20"
                    >
                      🎟️ Explore Fests
                    </Button>
                  </Link>
                </FadeIn>
                
              </div>
            </FadeIn>

            {/* Right Side - Card Swipe */}
            <FadeIn
              variant="right"
              timing="normal"
              className="order-1 lg:order-2 flex justify-center lg:justify-end items-center relative py-6 sm:py-8 lg:py-0"
            >
              {/* Gradient Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-primary/40 blur-3xl rounded-full scale-100 sm:scale-110 lg:scale-125 xl:scale-150 opacity-60" />

              {/* Card Container */}
              <FadeIn
                variant="scale"
                timing="hero-card"
                className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px] xl:max-w-[440px] relative z-10"
              >
                <CardSwipe
                  images={CARD_IMAGES}
                  autoplayDelay={2000}
                  slideShadows={false}
                />
              </FadeIn>
            </FadeIn>
            
          </div>
        </div>
      </section>
    </div>
  );
}