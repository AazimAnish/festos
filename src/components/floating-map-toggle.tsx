"use client"

import { Button } from "@/components/ui/button"
import { Map, Grid3X3 } from "lucide-react"
import { useState } from "react"

interface FloatingMapToggleProps {
  onClick: () => void
  isMapView?: boolean
}

export function FloatingMapToggle({ onClick, isMapView = false }: FloatingMapToggleProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="fixed bottom-8 right-8 z-50 sm:hidden">
      <Button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative h-14 w-14 rounded-xl bg-background/90 backdrop-blur-md border border-border apple-shadow-lg hover:apple-shadow-xl apple-transition hover:scale-105 active:scale-95 p-0"
      >
        {/* Background gradient on hover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 apple-transition" />

        {/* Icon with smooth transition */}
        <div className="relative z-10 flex items-center justify-center">
          {isMapView ? (
            <Grid3X3 className={`h-6 w-6 text-foreground apple-transition ${isHovered ? "scale-110 text-primary" : ""}`} />
          ) : (
            <Map className={`h-6 w-6 text-foreground apple-transition ${isHovered ? "scale-110 text-primary" : ""}`} />
          )}
        </div>

        {/* Tooltip */}
        <div
          className={`absolute bottom-full right-0 mb-3 px-3 py-2 bg-foreground text-background text-sm font-medium rounded-lg apple-shadow whitespace-nowrap apple-transition ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
          }`}
        >
          {isMapView ? "View Grid" : "View on Map"}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground" />
        </div>
      </Button>
    </div>
  )
}
