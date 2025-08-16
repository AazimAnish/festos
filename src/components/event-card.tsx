"use client"

import type React from "react"
import { Calendar, MapPin, Users, Bookmark, BookmarkCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, memo, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { cn, formatPrice } from "@/lib/utils"

interface EventCardProps {
  id: string | number
  uniqueId?: string // Lu.ma style unique ID
  title: string
  date: string
  location: string
  price: string
  image: string
  category?: string
  joinedCount: number
  isSaved?: boolean
  hasPOAP?: boolean
  description?: string
  organizers?: Array<{
    name: string
    avatar: string
  }>
  status?: "pending" | "confirmed" | "cancelled" | "active"
  variant?: "list" | "grid" | "hero"
}

export const EventCard = memo(function EventCard({
  id,
  uniqueId,
  title,
  date,
  location,
  price,
  image,
  category,
  joinedCount,
  isSaved = false,
  hasPOAP = false,
  status = "confirmed",
  variant = "grid",
}: EventCardProps) {
  const [saved, setSaved] = useState(isSaved)

  const handleSaveToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSaved(!saved)
  }, [saved])

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return {
      day: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      relative: diffDays > 0 ? `${diffDays}d` : diffDays === 0 ? "Today" : "Past",
      isUpcoming: diffDays >= 0,
    }
  }, [])

  const formattedDate = formatDate(date)
  const displayedPrice = price === "Free" ? "Free" : formatPrice(price)

  const getStatusClasses = useCallback((value: string) => {
    if (value === "pending") return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
    if (value === "cancelled") return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
    if (value === "active") return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
  }, [])

  const isGrid = variant === "grid"
  const isHero = variant === "hero"
  const isList = variant === "list"

  // Apple-inspired card sizing and spacing
  const cardClasses = cn(
    "group relative overflow-hidden bg-background border border-border/50 transition-all duration-300 ease-out cursor-pointer",
    // Apple's preferred card styling
    "hover:shadow-apple-md hover:border-border/80",
    // Size variants
    isGrid && "flex flex-col h-full rounded-2xl",
    isHero && "flex flex-col h-full rounded-3xl shadow-apple-lg",
    isList && "flex flex-row h-24 rounded-xl"
  )

  // Apple-inspired image aspect ratios
  const imageClasses = cn(
    "relative overflow-hidden bg-muted",
    isGrid && "w-full aspect-[16/10]", // Better aspect ratio for grid
    isHero && "w-full aspect-[16/10]", // Hero cards same as grid
    isList && "w-24 h-24 flex-shrink-0" // Square for list
  )

  // Content area styling
  const contentClasses = cn(
    "flex flex-col",
    isGrid && "p-4 flex-1",
    isHero && "p-5 flex-1", // More padding for hero
    isList && "p-4 flex-1 justify-center"
  )

  return (
    <Link href={`/${uniqueId || String(id)}`} className="block h-full" prefetch={true}>
      <Card className={cardClasses}>
        {/* Image Container */}
        <div className={imageClasses}>
          <Image
            src={image || "/placeholder.svg?height=400&width=640"}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes={
              isGrid ? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" :
              isHero ? "(max-width: 640px) 80vw, 400px" :
              "96px"
            }
            priority={isHero}
            loading={isHero ? "eager" : "lazy"}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          {/* Date Badge - Apple-inspired floating design */}
          <div className="absolute top-3 left-3">
            <div className="bg-white/95 backdrop-blur-md rounded-xl px-3 py-2 shadow-apple-sm">
              <div className="text-center">
                <div className="font-semibold text-lg text-foreground leading-none">
                  {formattedDate.day}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5">
                  {formattedDate.month}
                </div>
              </div>
            </div>
          </div>

          {/* POAP Badge */}
          {hasPOAP && (
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-primary/90 backdrop-blur-sm text-primary-foreground border-0 shadow-apple-sm">
                <Sparkles className="w-3 h-3 mr-1" />
                POAP
              </Badge>
            </div>
          )}

          {/* Status Badge */}
          {status !== "confirmed" && (
            <div className="absolute top-3 right-3">
              <Badge className={cn("backdrop-blur-sm shadow-apple-sm", getStatusClasses(status))}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>
          )}

          {/* Save Button - Apple-inspired floating action */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveToggle}
            className={cn(
              "absolute top-3 right-3 rounded-full transition-all duration-200 p-0",
              isHero ? "w-10 h-10" : "w-8 h-8",
              "bg-white/90 backdrop-blur-sm hover:bg-white shadow-apple-sm",
              "hover:scale-110 active:scale-95"
            )}
            aria-label={saved ? "Unsave event" : "Save event"}
          >
            {saved ? (
              <BookmarkCheck className={cn(isHero ? "w-5 h-5" : "w-4 h-4", "text-primary")} />
            ) : (
              <Bookmark className={cn(isHero ? "w-5 h-5" : "w-4 h-4", "text-muted-foreground")} />
            )}
          </Button>
        </div>

        {/* Content Area */}
        <div className={contentClasses}>
          {/* Title - Apple-inspired typography */}
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-semibold text-foreground transition-colors duration-200 leading-tight",
                isGrid && "text-base line-clamp-2 group-hover:text-primary",
                isHero && "text-lg line-clamp-2 group-hover:text-primary",
                isList && "text-sm line-clamp-1 group-hover:text-primary"
              )}
            >
              {title}
            </h3>
          </div>

          {/* Meta Information - Apple-inspired spacing */}
          <div className={cn("space-y-2", isGrid && "mt-3", isHero && "mt-4", isList && "mt-2")}>
            {/* Date and Time */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-xs font-medium truncate">
                {formattedDate.weekday}, {formattedDate.time}
              </span>
              {formattedDate.isUpcoming && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5 ml-auto">
                  {formattedDate.relative}
                </Badge>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-xs truncate">{location}</span>
            </div>

            {/* Category (only for grid and hero) */}
            {category && (isGrid || isHero) && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {category}
                </Badge>
              </div>
            )}
          </div>

          {/* Footer - Apple-inspired layout */}
          <div className={cn(
            "flex items-center justify-between",
            isGrid && "mt-4 pt-3 border-t border-border/50",
            isHero && "mt-5 pt-4 border-t border-border/50",
            isList && "mt-2"
          )}>
            {/* Price and Attendees */}
            <div className="flex items-center gap-3">
              <div className={cn(
                "font-semibold text-foreground",
                isGrid && "text-sm",
                isHero && "text-base",
                isList && "text-sm"
              )}>
                {displayedPrice}
              </div>
              
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span className="text-xs">{joinedCount.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Button - Apple-inspired styling */}
            <Button
              size="sm"
              className={cn(
                "rounded-xl font-medium transition-all duration-200",
                isGrid && "h-8 px-3 text-xs bg-accent/40 text-foreground hover:bg-primary hover:text-primary-foreground",
                isHero && "h-9 px-4 text-sm bg-primary text-primary-foreground hover:bg-primary/90",
                isList && "h-7 px-3 text-xs bg-accent/40 text-foreground hover:bg-primary hover:text-primary-foreground"
              )}
            >
              {isList ? "View" : "Get Tickets"}
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  )
})
