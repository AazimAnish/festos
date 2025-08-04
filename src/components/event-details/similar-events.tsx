"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { generateEventSlug } from "@/lib/utils";

interface SimilarEvent {
  id: number;
  title: string;
  location: string;
  price: string;
  image: string;
  date: string;
}

interface SimilarEventsProps {
  events: SimilarEvent[];
}

export function SimilarEvents({ events }: SimilarEventsProps) {
  return (
    <Card className="border-2 border-border rounded-xl overflow-hidden hover:border-primary transition-all duration-200">
      <CardHeader className="pb-4">
        <CardTitle className="font-primary text-lg font-bold text-foreground flex items-center gap-2">
          🎉 Similar Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="w-full">
          <div className="flex space-x-4 pb-4">
            {events.map((event) => (
              <Link key={event.id} href={`/events/${generateEventSlug(event)}`}>
                <div className="w-64 flex-shrink-0 group cursor-pointer">
                  <div className="bg-background border-2 border-border rounded-xl overflow-hidden hover:border-primary transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02]">
                    {/* Image */}
                    <div className="relative h-32 overflow-hidden">
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-background/90 text-foreground border-0 px-2 py-1 text-xs font-medium">
                          {event.price}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <div className="space-y-1">
                        <h3 className="font-primary text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                          {event.title}
                        </h3>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray">
                          <Calendar className="w-3 h-3" />
                          <span className="font-secondary">{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray">
                          <MapPin className="w-3 h-3" />
                          <span className="font-secondary">{event.location}</span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full font-secondary text-xs px-3 py-1.5 h-auto border-2 border-border text-foreground hover:border-primary hover:text-primary transition-all duration-200 rounded-xl"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="text-center pt-2">
          <Link href="/discover">
            <Button
              variant="ghost"
              size="sm"
              className="font-secondary text-xs px-3 py-1.5 h-auto text-primary hover:text-primary/80 rounded-xl"
            >
              View all similar events →
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 