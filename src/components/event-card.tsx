"use client"

import type React from "react"
import { Calendar, MapPin, Users, Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
  variant?: "list" | "grid"
}

export const EventCard = memo(function EventCard({
  id,
  uniqueId,
  title,
  date,
  location,
  price,
  image,
  joinedCount,
  isSaved = false,
  hasPOAP = false,
  organizers = [],
  status = "confirmed",
  variant = "list",
}: EventCardProps) {
  const [saved, setSaved] = useState(isSaved)

  const handleSaveToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSaved(!saved)
  }, [saved])

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString)
    return {
      day: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
      weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
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

  return (
    <Link href={`/${uniqueId || String(id)}`} className="group block h-full" prefetch={true}>
      <Card
        className={cn(
          "relative overflow-hidden border border-border/50 bg-background shadow-sm transition-all duration-200 cursor-pointer",
          isGrid
            ? "flex flex-col h-full hover:shadow-lg hover:border-border"
            : "flex flex-row h-40 hover:shadow-lg hover:scale-[1.01] hover:border-border",
        )}
      >
        {/* Image */}
        <div
          className={cn(
            "relative overflow-hidden",
            isGrid ? "w-full aspect-[4/3]" : "w-40 h-40 flex-shrink-0",
          )}
        >
          <Image
            src={image || "/placeholder.svg?height=160&width=160"}
            alt={title}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            sizes={isGrid ? "(max-width: 768px) 50vw, 20vw" : "160px"}
            priority={false}
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />

          <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/20" />

          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
            <div className="text-center">
              <div className="font-semibold text-lg text-gray-900 leading-none">{formattedDate.day}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide mt-0.5">{formattedDate.month}</div>
            </div>
          </div>

          {hasPOAP && (
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm">
                <span>🪙</span>
                <span>POAP</span>
              </span>
            </div>
          )}

          {status !== "confirmed" && (
            <div className="absolute top-3 right-3">
              <span className={cn("px-2 py-1 rounded-md text-xs font-medium", getStatusClasses(status))}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={cn("flex-1 min-w-0", isGrid ? "p-4 flex flex-col h-full" : "p-6 flex flex-col justify-between")}> 
          {/* Top: Title + Save */}
          <div className={cn("flex items-start justify-between gap-3", isGrid ? "mb-2" : "mb-3")}> 
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "font-semibold text-gray-900 dark:text-white transition-colors duration-200 leading-tight",
                  isGrid ? "text-base line-clamp-2 group-hover:text-primary" : "text-xl line-clamp-2 group-hover:text-primary",
                )}
              >
                {title}
              </h3>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveToggle}
              className={cn(
                "rounded-full transition-all duration-200 p-0 flex-shrink-0",
                isGrid ? "w-8 h-8 hover:bg-accent/20" : "w-9 h-9 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-110",
              )}
              aria-label={saved ? "Unsave event" : "Save event"}
            >
              {saved ? (
                <BookmarkCheck className={cn(isGrid ? "w-4 h-4 text-primary" : "w-5 h-5 text-primary")} />
              ) : (
                <Bookmark className={cn(isGrid ? "w-4 h-4 text-muted-foreground" : "w-5 h-5 text-gray-400")} />
              )}
            </Button>
          </div>

          {/* Meta */}
          <div className={cn("space-y-1.5", isGrid ? "mb-3" : "mb-4")}> 
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className={cn(isGrid ? "w-3.5 h-3.5" : "w-4 h-4", "flex-shrink-0")} />
              <span className={cn(isGrid ? "text-xs" : "text-sm", "font-medium truncate")}>
                {formattedDate.weekday}, {formattedDate.time}
              </span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className={cn(isGrid ? "w-3.5 h-3.5" : "w-4 h-4", "flex-shrink-0")} />
              <span className={cn(isGrid ? "text-xs" : "text-sm", "truncate")}>{location}</span>
            </div>
          </div>

          {/* Organizers (only in list or if exists) */}
          {!isGrid && organizers.length > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex -space-x-2">
                {organizers.slice(0, 3).map((org, index) => (
                  <Image
                    key={index}
                    src={org.avatar || "/placeholder.svg?height=24&width=24"}
                    alt={org.name}
                    width={24}
                    height={24}
                    className="rounded-full border-2 border-white object-cover"
                    loading="lazy"
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground truncate">
                {organizers[0]?.name}
                {organizers.length > 1 && ` +${organizers.length - 1} others`}
              </span>
            </div>
          )}

          {/* Footer */}
          <div className={cn("flex items-center justify-between", isGrid ? "pt-1 mt-auto" : "")}> 
            <div className="flex items-center gap-3">
              <div className={cn("font-semibold text-gray-900 dark:text-white", isGrid ? "text-sm" : "text-lg")}>{displayedPrice}</div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className={cn(isGrid ? "w-3.5 h-3.5" : "w-4 h-4")} />
                <span className={cn(isGrid ? "text-xs" : "text-sm")}>{joinedCount}</span>
              </div>
            </div>

            <Button
              size={isGrid ? "sm" : "sm"}
              className={cn(
                "rounded-lg font-medium transition-all duration-200",
                isGrid
                  ? "h-8 px-3 text-xs bg-accent/40 text-foreground hover:bg-primary hover:text-primary-foreground"
              : "px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-primary-foreground",
              )}
            >
              View
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  )
})
