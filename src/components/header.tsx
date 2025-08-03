"use client";

import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for subtle background change
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    
    // Cleanup
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <FadeIn
      variant="down"
      timing="fast"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "backdrop-blur-md bg-background/95 border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <header className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo - Identity Focus */}
          <FadeIn
            variant="left"
            timing="fast"
            className="flex items-center"
          >
            <Link 
              href="/"
              className="group flex items-center gap-3 transition-all duration-200 hover:scale-105"
            >
              {/* Ticket logo with subtle glow */}
              <div className="relative">
                <Image 
                  src="/ticket.png" 
                  alt="Festos" 
                  width={40}
                  height={40}
                  className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
                />
                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="font-primary text-2xl sm:text-3xl font-bold text-foreground">
                festos
              </span>
            </Link>
          </FadeIn>

          {/* Navigation - Stay Out of the Way */}
          <nav className="hidden sm:flex items-center gap-4 lg:gap-6">
            {/* Passive entry point - low commitment */}
            <FadeIn
              variant="down"
              timing="normal"
              delay={100}
            >
              <Link href="/discover">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground/80 hover:text-foreground transition-colors duration-200 font-secondary"
                >
                  Explore
                </Button>
              </Link>
            </FadeIn>

            {/* High-agency CTA for power users */}
            <FadeIn
              variant="down"
              timing="normal"
              delay={200}
            >
              <Button
                variant="outline"
                size="sm"
                className="border-2 border-border text-foreground hover:border-primary hover:bg-primary/5 transition-all duration-200 font-secondary"
              >
                Create
              </Button>
            </FadeIn>

            {/* Personal onboarding - gives ownership */}
            <FadeIn
              variant="down"
              timing="normal"
              delay={300}
            >
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 font-secondary shadow-sm hover:shadow-md"
              >
                Connect Wallet
              </Button>
            </FadeIn>
          </nav>

          {/* Mobile Menu Button - Minimal on mobile */}
          <div className="sm:hidden">
            <FadeIn
              variant="right"
              timing="fast"
            >
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground/80 hover:text-foreground"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </Button>
            </FadeIn>
          </div>
        </div>
      </header>
    </FadeIn>
  );
} 