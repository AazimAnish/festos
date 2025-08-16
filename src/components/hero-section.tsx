"use client";

import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { AvalancheBadge } from "@/components/ui/avalanche-badge";
import GridBackground from "@/components/ui/grid-background";
import Link from "next/link";
import CardSwipeDemo from "@/components/card-swipe-demo";
import { SAMPLE_EVENTS } from "@/lib/data/sample-events";

export function HeroSection() {
  return (
    <div className="min-h-screen bg-background flex items-center relative">
      <GridBackground />
      <section className="w-full relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[80vh] py-8 lg:py-12 xl:py-16">
            
            {/* Left Side - Content */}
            <FadeIn
              variant="left"
              timing="normal"
              className="order-2 lg:order-1 flex flex-col justify-center space-y-8"
            >
              {/* Badge */}
              <div className="flex items-center gap-3">
                <AvalancheBadge />
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="font-primary font-black text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-foreground tracking-tight leading-[0.9]">
                  Own Your <span className="text-primary">Moments.</span>
                  <br />
                  Own Your <span className="text-primary">Tickets.</span>
                </h1>
                
                <p className="font-secondary text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
                  No scams. No paper. Just <span className="text-primary font-medium">real tickets</span> and memories you&apos;ll keep forever.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="font-secondary text-lg px-8 py-6 h-auto bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 ease-out hover:scale-105 active:scale-95 tracking-tight rounded-xl"
                  asChild
                >
                  <Link href="/create">
                    Create Event
                  </Link>
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="font-secondary text-lg px-8 py-6 h-auto border-2 border-border text-foreground hover:border-primary hover:text-primary transition-all duration-200 ease-out hover:scale-105 active:scale-95 tracking-tight rounded-xl"
                  asChild
                >
                  <Link href="/discover">
                    Get Ticket
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 lg:gap-8 pt-6 sm:pt-8">
                <div className="text-center min-w-[80px] sm:min-w-[100px]">
                  <div className="font-primary font-bold text-xl sm:text-2xl lg:text-3xl text-foreground">
                    {SAMPLE_EVENTS.length}+
                  </div>
                  <div className="font-secondary text-xs sm:text-sm text-muted-foreground">
                    Events Created
                  </div>
                </div>
                
                <div className="text-center min-w-[80px] sm:min-w-[100px]">
                  <div className="font-primary font-bold text-xl sm:text-2xl lg:text-3xl text-foreground">
                    {SAMPLE_EVENTS.reduce((acc, event) => acc + event.joinedCount, 0).toLocaleString()}+
                  </div>
                  <div className="font-secondary text-xs sm:text-sm text-muted-foreground">
                    Tickets Sold
                  </div>
                </div>
                
                <div className="text-center min-w-[80px] sm:min-w-[100px]">
                  <div className="font-primary font-bold text-xl sm:text-2xl lg:text-3xl text-foreground">
                    {SAMPLE_EVENTS.filter(event => event.hasPOAP).length}+
                  </div>
                  <div className="font-secondary text-xs sm:text-sm text-muted-foreground">
                    Memories Kept
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Right Side - Event Cards Swipe */}
            <FadeIn
              variant="right"
              timing="normal"
              className="order-1 lg:order-2 flex justify-center lg:justify-end items-center relative py-8 lg:py-12 xl:py-16"
            >
              {/* Gradient Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-primary/40 blur-3xl rounded-full scale-100 sm:scale-110 lg:scale-125 xl:scale-150 opacity-60" />

              {/* Event Cards Container */}
              <div className="w-full max-w-[320px] sm:max-w-[360px] md:max-w-[400px] lg:max-w-[440px] xl:max-w-[480px] 2xl:max-w-[520px] relative z-10">
                <CardSwipeDemo />
              </div>
            </FadeIn>
            
          </div>
        </div>
      </section>
    </div>
  );
}