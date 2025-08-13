"use client";

import { Button } from "@/components/ui/button";
import { Heart, Users } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SampleEvent } from "@/lib/data/sample-events";
import { generateEventSlug } from "@/lib/utils";

type EventCardProps = Pick<SampleEvent, 'id' | 'title' | 'location' | 'price' | 'image' | 'joinedCount' | 'hasPOAP' | 'isSaved'>;

export function EventCard({ 
  id,
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
    <Link href={`/events/${generateEventSlug({ id, title })}`} className="block">
      <div className="group bg-background border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 ease-out hover:shadow-lg hover:scale-[1.02] w-full h-[280px] sm:h-[320px] lg:h-[360px] xl:h-[380px] flex flex-col cursor-pointer">
        {/* Image */}
        <div className="relative overflow-hidden flex-shrink-0" style={{ height: '60%' }}>
          <Image 
            src={image} 
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={false}
          />
          <Button
            variant="ghost"
            size="sm"
            className={`absolute top-3 right-3 lg:top-4 lg:right-4 rounded-lg p-2 lg:p-3 backdrop-blur-sm z-10 transition-all duration-200 ease-out hover:scale-110 ${
              saved ? 'bg-primary/90 text-primary-foreground hover:bg-primary' : 'bg-background/90 text-foreground hover:bg-background/95'
            }`}
            onClick={handleSaveToggle}
          >
            <Heart className={`w-4 h-4 lg:w-5 lg:h-5 ${saved ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6 flex flex-col justify-between flex-1">
          <div className="responsive-spacing flex-1">
            <h3 className="font-primary text-base lg:text-lg xl:text-xl font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200 ease-out leading-tight tracking-tight">
              {title}
            </h3>
            <p className="font-secondary text-sm lg:text-base text-muted-foreground tracking-tight">
              {location}
            </p>
          </div>

          <div className="responsive-spacing">
            <div className="flex items-center justify-between">
              <div className="font-secondary text-base lg:text-lg xl:text-xl font-semibold text-primary tracking-tight">
                {price}
              </div>
              <div className="flex items-center gap-2 text-sm lg:text-base text-muted-foreground">
                <Users className="w-4 h-4 lg:w-5 lg:h-5" />
                <span className="hidden sm:inline tracking-tight">{joinedCount} joined</span>
                <span className="sm:hidden tracking-tight">{joinedCount}</span>
              </div>
            </div>

            {hasPOAP && (
              <div className="flex items-center gap-2 text-sm lg:text-base font-medium text-primary tracking-tight">
                <span>🪙</span>
                <span className="hidden sm:inline">POAP enabled</span>
                <span className="sm:hidden">POAP</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}