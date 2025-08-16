"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import Image from "next/image"
import dynamic from "next/dynamic"

const CustomConnectButton = dynamic(
  () => import("@/components/wallet/connect-button").then((m) => m.CustomConnectButton),
  { ssr: false },
)

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll effect for subtle background change
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)

    // Cleanup
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div
      className={`sticky top-0 z-40 transition-all duration-300 ease-out ${
        isScrolled ? "backdrop-blur-xl bg-background/70 border-b border-border/50 shadow-sm" : "bg-transparent"
      }`}
    >
      <header className="container mx-auto">
        <div className="flex items-center justify-between h-16 lg:h-20 px-4 sm:px-6 lg:px-8">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 lg:w-10 lg:h-10">
              <Image
                src="/ticket.png"
                alt="Festos"
                fill
                className="object-contain transition-transform duration-200 group-hover:scale-110"
                priority
              />
            </div>
            <span className="font-primary font-bold text-xl lg:text-2xl text-foreground tracking-tight">
              Festos
            </span>
          </Link>

          {/* Navigation - Intentional Hierarchy */}
          <nav className="hidden sm:flex items-center gap-4 lg:gap-6">
            {/* Navigation Links - Horizontal Organization */}
            <Link href="/discover" prefetch={true}>
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground hover:text-primary hover:bg-accent transition-all duration-200 ease-out font-secondary rounded-lg px-4 py-2 h-10 lg:h-12 lg:px-6 tracking-tight"
              >
                Explore
              </Button>
            </Link>

            <Link href="/feed" prefetch={true}>
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground hover:text-primary hover:bg-accent transition-all duration-200 ease-out font-secondary rounded-lg px-4 py-2 h-10 lg:h-12 lg:px-6 tracking-tight"
              >
                Social
              </Button>
            </Link>

            <Link href="/dashboard" prefetch={true}>
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground hover:text-primary hover:bg-accent transition-all duration-200 ease-out font-secondary rounded-lg px-4 py-2 h-10 lg:h-12 lg:px-6 tracking-tight"
              >
                Dashboard
              </Button>
            </Link>

            {/* Secondary Action - Creation (Medium Emphasis) */}
            <Link href="/create" prefetch={true}>
              <Button
                size="sm"
                className="font-secondary rounded-lg px-4 lg:px-6 h-10 lg:h-12 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 ease-out hover:scale-105 active:scale-95 tracking-tight"
              >
                Create Event
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0"
              aria-label="Open menu"
            >
              <svg
                className="h-5 w-5"
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
          </div>

          {/* Wallet Connection - Always Visible */}
          <div className="hidden sm:block">
            <CustomConnectButton />
          </div>
        </div>
      </header>
    </div>
  )
}
