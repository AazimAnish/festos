"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Twitter, 
  Instagram, 
  Github, 
  ExternalLink,
  Shield,
  Users,
  Sparkles
} from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
            
            {/* Brand Section */}
            <div className="sm:col-span-2 lg:col-span-1 space-y-4">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative w-8 h-8">
                  <Image
                    src="/ticket.png"
                    alt="Festos"
                    fill
                    className="object-contain transition-transform duration-200 group-hover:scale-110"
                  />
                </div>
                <span className="font-primary font-bold text-xl text-foreground tracking-tight">
                  Festos
                </span>
              </Link>
              
              <p className="font-secondary text-sm text-muted-foreground leading-relaxed">
                For the culture. On the chain. Create fests that live forever.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 micro-interaction"
                  asChild
                >
                  <a 
                    href="https://twitter.com/festos" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="Follow us on Twitter"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 micro-interaction"
                  asChild
                >
                  <a 
                    href="https://instagram.com/festos" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="Follow us on Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 micro-interaction"
                  asChild
                >
                  <a 
                    href="https://github.com/festos" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="View our GitHub"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h3 className="font-secondary font-semibold text-foreground text-sm">
                Product
              </h3>
              <nav className="space-y-3">
                <Link 
                  href="/discover" 
                  className="block font-secondary text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Discover Events
                </Link>
                <Link 
                  href="/create" 
                  className="block font-secondary text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Create Event
                </Link>
                <Link 
                  href="/feed" 
                  className="block font-secondary text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Social Feed
                </Link>
                <Link 
                  href="/marketplace" 
                  className="block font-secondary text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Marketplace
                </Link>
              </nav>
            </div>

            {/* Community Links */}
            <div className="space-y-4">
              <h3 className="font-secondary font-semibold text-foreground text-sm">
                Community
              </h3>
              <nav className="space-y-3">
                <Link 
                  href="/dashboard" 
                  className="block font-secondary text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/poaps" 
                  className="block font-secondary text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  POAPs
                </Link>
                <Link 
                  href="/feed" 
                  className="block font-secondary text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Social
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-secondary text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 justify-start"
                  asChild
                >
                  <a 
                    href="https://discord.gg/festos" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Discord
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </nav>
            </div>

            {/* Support Links */}
            <div className="space-y-4">
              <h3 className="font-secondary font-semibold text-foreground text-sm">
                Support
              </h3>
              <nav className="space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-secondary text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 justify-start"
                  asChild
                >
                  <a 
                    href="mailto:hello@festos.io" 
                    className="flex items-center gap-2"
                  >
                    Contact Us
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-secondary text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 justify-start"
                  asChild
                >
                  <a 
                    href="https://docs.festos.io" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Documentation
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-secondary text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 justify-start"
                  asChild
                >
                  <a 
                    href="https://status.festos.io" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Status
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <Separator className="bg-border/50" />
        <div className="py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Copyright */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-secondary">
                © {currentYear} Festos. All rights reserved.
              </span>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                              <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-secondary text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
                  asChild
                >
                  <Link href="/privacy">
                    Privacy Policy
                  </Link>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-secondary text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
                  asChild
                >
                  <Link href="/terms">
                    Terms of Service
                  </Link>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-secondary text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
                  asChild
                >
                  <Link href="/cookies">
                    Cookie Policy
                  </Link>
                </Button>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 pt-6 border-t border-border/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span className="font-secondary">Secure by Design</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span className="font-secondary">Community Driven</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              <span className="font-secondary">Web3 Native</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
