"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Sparkles } from "lucide-react";
import type { EventData } from "@/types/registration";

interface EventSummaryProps {
  eventData: EventData;
}

export const EventSummary = memo(function EventSummary({ eventData }: EventSummaryProps) {
  return (
    <Card className="border-2 border-border bg-background/80 backdrop-blur-sm overflow-hidden shadow-lg rounded-3xl">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-4 flex-1">
            <h3 className="font-primary text-xl font-bold text-foreground leading-tight">
              {eventData.title}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="font-secondary">{eventData.location}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span className="font-secondary">{eventData.date} • {eventData.time}</span>
              </div>
            </div>
          </div>
          <div className="text-right space-y-2">
            <div className="font-secondary text-xl font-bold text-primary">
              {eventData.price}
            </div>
            <div className="flex items-center justify-end space-x-2 text-sm text-gray">
              <Users className="h-4 w-4" />
              <span className="font-secondary">{eventData.joinedCount} attending</span>
            </div>
          </div>
        </div>
        
        {eventData.hasPOAP && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-secondary text-sm font-medium text-foreground">POAP NFT Included</span>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 rounded-3xl">
                Free NFT
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}); 