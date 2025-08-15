"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { ChevronDown, Calendar, TrendingUp, MapPin, DollarSign, FileText, Filter } from "lucide-react"
import { EventCard } from "./event-card"
import { EmptyState } from "./empty-state"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { SampleEvent } from "@/lib/data/sample-events"

interface EventsGridProps {
  events: SampleEvent[]
  onClearFilters?: () => void
}

type SortOption = {
  value: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

export function EventsGrid({ events, onClearFilters }: EventsGridProps) {
  const [sortBy, setSortBy] = useState("date")

  const sortOptions: SortOption[] = [
    { value: "date", label: "Date", icon: Calendar },
    { value: "popular", label: "Popular", icon: TrendingUp },
    { value: "distance", label: "Distance", icon: MapPin },
    { value: "price", label: "Price", icon: DollarSign },
    { value: "name", label: "Name", icon: FileText },
  ]

  const currentSort = sortOptions.find((option) => option.value === sortBy) || sortOptions[0]
  const CurrentIcon = currentSort.icon

  // Sort events based on current sort option
  const sortedEvents = useMemo(() => {
    const sorted = [...events]

    switch (sortBy) {
      case "date":
        return sorted.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      case "popular":
        return sorted.sort((a, b) => b.joinedCount - a.joinedCount)
      case "price":
        return sorted.sort((a, b) => {
          const aPrice = a.price === "Free" ? 0 : Number.parseFloat(a.price.split(" ")[0])
          const bPrice = b.price === "Free" ? 0 : Number.parseFloat(b.price.split(" ")[0])
          return aPrice - bPrice
        })
      case "name":
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      default:
        return sorted
    }
  }, [events, sortBy])

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10">
      <div className="mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="font-primary font-bold text-4xl md:text-5xl text-foreground mb-4 tracking-tight">
            Discover Events
          </h2>
          <div className="flex items-center gap-4">
            {events.length > 0 ? (
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                {events.length} {events.length === 1 ? "event" : "events"}
              </span>
            ) : (
              <p className="font-secondary text-lg text-muted-foreground">No events found</p>
            )}
          </div>
        </div>

        {/* Enhanced Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-12 px-6 rounded-xl border-2 border-border bg-background hover:border-primary hover:bg-primary/5 text-foreground hover:text-primary font-medium apple-transition hover:scale-105 active:scale-95"
            >
              <CurrentIcon className="w-5 h-5 mr-3" />
              <span>Sort by: {currentSort.label}</span>
              <ChevronDown className="w-4 h-4 ml-3 apple-transition group-data-[state=open]:rotate-180" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-64 rounded-xl border border-border bg-background/95 backdrop-blur-md apple-shadow-lg p-2"
          >
            {sortOptions.map((option) => {
              const Icon = option.icon
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer apple-transition font-medium ${
                    sortBy === option.value ? "bg-primary/10 text-primary" : "hover:bg-accent/20 text-foreground"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-md apple-transition ${
                      sortBy === option.value ? "bg-primary text-primary-foreground" : "bg-accent/20 text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{option.label}</span>
                  {sortBy === option.value && <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Events Grid */}
      {sortedEvents.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 items-stretch">
          {sortedEvents.map((event, index) => (
            <div
              key={event.id}
              className="transition-all duration-200 hover:scale-[1.01] h-full"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <EventCard {...event} variant="grid" />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No events found"
          description="Try adjusting your filters or search terms to find more events"
          action={
            onClearFilters
              ? {
                  label: "Clear All Filters",
                  href: "#",
                  icon: <Filter className="w-4 h-4" />,
                }
              : undefined
          }
          secondaryAction={{
            label: "Create an Event",
            href: "/create",
            icon: <span>✨</span>,
          }}
        />
      )}
    </div>
  )
}
