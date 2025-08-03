"use client";

import { Button } from "@/components/ui/button";
import { Heart, Users } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import type { SampleEvent } from "@/lib/data/sample-events";

type EventCardProps = Pick<SampleEvent, 'title' | 'location' | 'price' | 'image' | 'joinedCount' | 'hasPOAP' | 'isSaved'>;

export function EventCard({ 
  title, 
  location, 
  price, 
  image, 
  joinedCount, 
  hasPOAP, 
  isSaved = false 
}: EventCardProps) {
  const [saved, setSaved] = useState(isSaved);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(!saved);
  };

  return (
    <div className="group bg-background border-2 border-border rounded-xl overflow-hidden hover:border-primary transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02] w-full h-[280px] sm:h-[320px] lg:h-[340px] flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ height: '60%' }}>
        <Image 
          src={image} 
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={false}
        />
        <Button
          variant="ghost"
          size="sm"
          className={`absolute top-2 sm:top-3 right-2 sm:right-3 rounded-lg p-1.5 sm:p-2 backdrop-blur-sm z-10 ${
            saved ? 'bg-primary/90 text-primary-foreground' : 'bg-background/90 text-foreground'
          }`}
          onClick={handleSaveToggle}
        >
          <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${saved ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col justify-between flex-1">
        <div className="space-y-1 sm:space-y-2 flex-1">
          <h3 className="font-primary text-sm sm:text-base lg:text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">
            {title}
          </h3>
          <p className="font-secondary text-xs sm:text-sm text-gray">
            {location}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-secondary text-sm sm:text-base lg:text-lg font-semibold text-primary">
              {price}
            </div>
            <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{joinedCount} joined</span>
              <span className="sm:hidden">{joinedCount}</span>
            </div>
          </div>

          {hasPOAP && (
            <div className="flex items-center gap-1 text-xs font-medium text-primary">
              <span>🪙</span>
              <span className="hidden sm:inline">POAP enabled</span>
              <span className="sm:hidden">POAP</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}