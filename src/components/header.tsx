"use client";

import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { CustomConnectButton } from "@/components/wallet/connect-button";

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
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-out ${
        isScrolled
          ? "backdrop-blur-xl bg-background/95 border-b border-border/50 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <header className="container mx-auto">
        <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24">
          
          {/* Logo - Identity Focus */}
          <FadeIn
            variant="left"
            timing="fast"
            className="flex items-center"
          >
            <Link 
              href="/"
              className="group flex items-center gap-3 transition-all duration-200 ease-out hover:scale-[1.02]"
            >
              {/* Ticket logo with subtle glow */}
              <div className="relative">
                <Image 
                  src="/ticket.png" 
                  alt="Festos" 
                  width={40}
                  height={40}
                  className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 object-contain transition-transform duration-200 ease-out group-hover:scale-105"
                />
                {/* Subtle glow effect on hover */}
                <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" />
              </div>
              <span className="font-primary text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
                festos
              </span>
            </Link>
          </FadeIn>

          {/* Navigation - Intentional Hierarchy */}
          <nav className="hidden sm:flex items-center gap-4 lg:gap-6">
            {/* Tertiary Action - Discovery (Subtle) */}
            <FadeIn
              variant="down"
              timing="normal"
              delay={100}
            >
              <Link href="/discover">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:text-primary hover:bg-accent transition-all duration-200 ease-out font-secondary rounded-lg px-4 py-2 h-10 lg:h-12 lg:px-6 tracking-tight"
                >
                  Explore
                </Button>
              </Link>
            </FadeIn>

            {/* Secondary Action - Creation (Medium Emphasis) */}
            <FadeIn
              variant="down"
              timing="normal"
              delay={200}
            >
              <Link href="/create">
                <Button
                  variant="outline"
                  size="sm"
                  className="border border-border text-foreground hover:border-primary hover:bg-accent transition-all duration-200 ease-out font-secondary rounded-lg px-4 py-2 h-10 lg:h-12 lg:px-6 tracking-tight"
                >
                  Create
                </Button>
              </Link>
            </FadeIn>

            {/* Primary Action - Wallet Connection (High Emphasis) */}
            <FadeIn
              variant="down"
              timing="normal"
              delay={300}
            >
              <div className="relative">
                <CustomConnectButton />
                {/* Subtle glow effect for primary action */}
                <div className="absolute inset-0 bg-primary/10 rounded-lg blur-xl opacity-0 hover:opacity-100 transition-opacity duration-300 ease-out pointer-events-none" />
              </div>
            </FadeIn>
          </nav>

          {/* Mobile - Simplified for Focus */}
          <div className="sm:hidden">
            <FadeIn
              variant="right"
              timing="fast"
            >
              <CustomConnectButton />
            </FadeIn>
          </div>
        </div>
      </header>
    </FadeIn>
  );
} 