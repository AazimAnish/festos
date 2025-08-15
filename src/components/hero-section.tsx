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
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 xl:gap-20 items-center">
            
            {/* Left Side - Content */}
            <FadeIn
              variant="left"
              timing="normal"
              className="order-2 lg:order-1 flex flex-col justify-center"
            >
              <div className="responsive-spacing text-center lg:text-left">
                
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
                  className="responsive-spacing"
                >
                  <h1 className="font-primary text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] text-foreground tracking-tight">
                    For the culture.<br />
                    On the <span className="text-primary">chain.</span>
                  </h1>
                  <p className="font-tertiary text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-lg mx-auto lg:mx-0 text-muted-foreground leading-relaxed tracking-tight">
                    Create fests that live forever.
                  </p>
                </FadeIn>

                {/* Action Buttons */}
                <FadeIn
                  variant="up"
                  timing="hero-buttons"
                  className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center lg:justify-start pt-4 lg:pt-8"
                >
                  <Link href="/create">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto font-secondary text-base lg:text-lg px-8 lg:px-12 py-4 lg:py-6 h-auto bg-primary text-primary-foreground rounded-xl transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg tracking-tight"
                    >
                      🎉 Throw a Fest
                    </Button>
                  </Link>
                  <Link href="/discover">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto font-secondary text-base lg:text-lg px-8 lg:px-12 py-4 lg:py-6 h-auto border-2 border-border text-foreground rounded-xl transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:bg-accent tracking-tight"
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
              className="order-1 lg:order-2 flex justify-center lg:justify-end items-center relative py-8 lg:py-12 xl:py-16"
            >
              {/* Gradient Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-primary/40 blur-3xl rounded-full scale-100 sm:scale-110 lg:scale-125 xl:scale-150 opacity-60" />

              {/* Card Container */}
              <FadeIn
                variant="scale"
                timing="hero-card"
                className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px] xl:max-w-[440px] 2xl:max-w-[480px] relative z-10"
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