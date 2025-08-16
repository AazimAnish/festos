"use client"

import { useEffect, useRef, useState } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { Button } from "@/components/ui/button"
import { X, Navigation } from "lucide-react"
import { FadeIn } from "@/components/ui/fade-in"
import { EmptyState } from "./empty-state"
import { LocationDialog } from "@/components/ui/location-dialog"
import { Loading } from "@/components/ui/loading"
import type { SampleEvent } from "@/lib/data/mock-data"
import { DEFAULT_LOCATION } from "@/lib/data/mock-data"
import { toast } from "sonner"

interface MapViewProps {
  events: SampleEvent[]
  isOpen: boolean
  onClose: () => void
  onClearFilters?: () => void
}

export function MapView({ events, isOpen, onClose, onClearFilters }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [showLocationDialog, setShowLocationDialog] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !mapContainer.current) return

    // Show location dialog on first open if no user location is set
    if (!userLocation && !mapError) {
      setShowLocationDialog(true)
      return
    }

    try {
      // Initialize map with MapLibre
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "© OpenStreetMap contributors",
            },
          },
          layers: [
            {
              id: "osm-tiles",
              type: "raster",
              source: "osm",
              minzoom: 0,
              maxzoom: 22,
            },
          ],
        },
        center: userLocation ? [userLocation.lng, userLocation.lat] : [DEFAULT_LOCATION.lng, DEFAULT_LOCATION.lat], // Use user location or default
        zoom: 8,
        attributionControl: false,
      })
    } catch (error) {
      setMapError("Failed to initialize map")
      console.error("Map initialization error:", error)
      return
    }

    map.current.on("load", () => {
      setMapLoaded(true)

      // Add user location marker
      if (userLocation) {
        const userMarkerEl = document.createElement("div")
        userMarkerEl.className = "user-location-marker"
        userMarkerEl.innerHTML = `
          <div class="relative">
            <div class="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-background animate-pulse">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="absolute -top-1 -left-1 -right-1 -bottom-1 bg-primary/20 rounded-full animate-ping"></div>
          </div>
        `

        new maplibregl.Marker(userMarkerEl).setLngLat([userLocation.lng, userLocation.lat]).addTo(map.current!)
      }

      // Add event markers with improved UI
      events.forEach((event) => {
        // TODO: Get coordinates from event data or API
        // For now, use a simple algorithm to generate coordinates
        const coordinates: [number, number] = [
          DEFAULT_LOCATION.lng + event.id * 0.1,
          DEFAULT_LOCATION.lat + event.id * 0.1,
        ]

        // Create marker element with improved design
        const markerEl = document.createElement("div")
        markerEl.className = "event-marker"
        markerEl.innerHTML = `
          <div class="relative group cursor-pointer">
            <div class="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-xl w-12 h-12 flex flex-col items-center justify-center text-xs font-bold shadow-lg border-2 border-background hover:scale-110 transition-all duration-200 hover:shadow-xl">
              <div class="text-lg">${event.joinedCount > 500 ? "🔥" : event.joinedCount > 200 ? "⚡" : "🎉"}</div>
              <div class="text-[10px] font-secondary">${event.joinedCount > 1000 ? "1k+" : event.joinedCount}</div>
            </div>
            <div class="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-background border-2 border-border rounded-lg px-3 py-2 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-10 min-w-[200px]">
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <svg class="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-xs font-secondary text-foreground">${event.location}</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  <span class="text-xs font-secondary text-muted-foreground">${event.joinedCount} joined</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-xs font-secondary text-muted-foreground">${new Date(event.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        `

        // Add marker to map with improved popup
        new maplibregl.Marker(markerEl)
          .setLngLat(coordinates)
          .setPopup(
            new maplibregl.Popup({
              offset: 25,
              className: "event-popup",
            }).setHTML(`
                <div class="p-4 max-w-sm space-y-4">
                  <div class="space-y-3">
                    <div class="flex items-start justify-between">
                      <h3 class="font-primary text-base font-bold text-foreground leading-tight">${event.title}</h3>
                      <div class="flex items-center gap-1 text-xs text-muted-foreground bg-accent/10 px-2 py-1 rounded-full">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                        </svg>
                        <span>${event.joinedCount}</span>
                      </div>
                    </div>
                    
                    <div class="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                      </svg>
                      <span class="font-secondary">${event.location}</span>
                    </div>
                    
                    <div class="flex items-center gap-2 text-sm text-muted-foreground">
                      <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                      </svg>
                      <span class="font-secondary">${new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}</span>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between pt-2 border-t border-border">
                    <div class="font-secondary text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                      ${event.price}
                    </div>
                    <div class="flex items-center gap-2">
                      ${event.hasPOAP ? '<span class="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">🪙 POAP</span>' : ""}
                      <span class="inline-flex items-center gap-1 text-xs font-medium bg-accent/10 text-accent-foreground px-2 py-1 rounded-full">${event.category}</span>
                    </div>
                  </div>
                </div>
              `),
          )
          .addTo(map.current!)
      })
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [isOpen, events, userLocation, mapError])

  useEffect(() => {
    if (userLocation) {
      map.current?.setCenter([userLocation.lng, userLocation.lat]);
    }
  }, [userLocation, mapError]);

  const handleLocationGranted = (coords: { lat: number; lng: number }) => {
    setUserLocation(coords)
    setShowLocationDialog(false)
    toast.success("📍 Location access granted! Showing events near you.", {
      description: "We'll use your location to show personalized event recommendations.",
      duration: 4000,
    })
  }

  const handleLocationDenied = () => {
    // Default to India (New Delhi)
    setUserLocation(DEFAULT_LOCATION)
    setShowLocationDialog(false)
    toast.info("🌍 Using default location (India)", {
      description: "You can change your location later in settings.",
      duration: 4000,
    })
  }

  if (!isOpen) return null

  return (
    <>
      {/* Location Dialog */}
      <LocationDialog
        isOpen={showLocationDialog}
        onClose={() => setShowLocationDialog(false)}
        onLocationGranted={handleLocationGranted}
        onLocationDenied={handleLocationDenied}
      />

      {/* Mobile Overlay */}
      <div className="fixed inset-0 bg-foreground/50 z-40 sm:hidden" onClick={onClose} />

      {/* Map Container */}
      <FadeIn variant="scale" timing="fast" className="fixed inset-0 z-50 bg-background">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-md border-b border-border p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Navigation className="w-5 h-5 text-primary" />
              <div>
                <h2 className="font-primary text-lg font-bold text-foreground tracking-tight">Map View</h2>
                <p className="font-secondary text-sm text-muted-foreground tracking-tight">
                  {events.length} events nearby
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-lg p-2">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Map, Error, or Empty State */}
        {mapError ? (
          <div className="w-full h-full flex items-center justify-center" style={{ marginTop: "80px" }}>
            <div className="text-center space-y-4">
              <h2 className="font-primary text-xl font-bold text-foreground tracking-tight">Map Error</h2>
              <p className="font-secondary text-sm text-muted-foreground tracking-tight">{mapError}</p>
              <Button onClick={() => setMapError(null)} className="bg-primary hover:bg-primary/90">
                Try Again
              </Button>
            </div>
          </div>
        ) : events.length > 0 ? (
          <>
            <div ref={mapContainer} className="w-full h-full" style={{ marginTop: "80px" }} />

            {/* Loading State */}
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <Loading size="lg" text="Loading map..." />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ marginTop: "80px" }}>
            <EmptyState
              title="No events on map"
              description="Try adjusting your filters to see events in your area"
              action={
                onClearFilters
                  ? {
                      label: "Clear Filters",
                      href: "#",
                      icon: <span>🗑️</span>,
                    }
                  : undefined
              }
              secondaryAction={{
                label: "Create a Fest",
                href: "/create",
                icon: <span>🎉</span>,
              }}
            />
          </div>
        )}
      </FadeIn>
    </>
  )
}
