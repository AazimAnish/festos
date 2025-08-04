"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { MapPin, ExternalLink, Navigation } from "lucide-react";
import { useState } from "react";

interface LocationMapProps {
  location: string;
  address: string;
  coordinates: [number, number];
}

export function LocationMap({ location, address, coordinates }: LocationMapProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenMaps = () => {
    const [lng, lat] = coordinates;
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <Card className="border-2 border-border rounded-xl overflow-hidden hover:border-primary transition-all duration-200">
      <CardHeader className="pb-4">
        <CardTitle className="font-primary text-xl font-bold text-foreground flex items-center gap-2">
          📍 Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="font-primary text-lg font-bold text-foreground">
                {location}
              </h3>
              <p className="font-tertiary text-sm text-gray leading-relaxed">
                {address}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start font-secondary text-sm border-2 border-border hover:border-primary transition-all duration-200 rounded-xl"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  View on Map
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="font-primary text-xl font-bold text-foreground">
                    📍 {location}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-muted/20 rounded-lg p-4 border border-border">
                    <p className="font-tertiary text-sm text-gray mb-2">
                      {address}
                    </p>
                    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 font-secondary text-sm">
                        Map preview would be here
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleOpenMaps}
                      className="flex-1 font-secondary text-sm px-4 py-2 h-auto bg-primary text-primary-foreground rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-primary/90"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in Google Maps
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 font-secondary text-sm px-4 py-2 h-auto border-2 border-border text-foreground rounded-xl transition-all duration-200 hover:border-primary hover:text-primary"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenMaps}
                className="flex-1 font-secondary text-xs px-3 py-2 h-auto border-2 border-border text-foreground hover:border-primary hover:text-primary transition-all duration-200 rounded-xl"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Google Maps
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 font-secondary text-xs px-3 py-2 h-auto border-2 border-border text-foreground hover:border-primary hover:text-primary transition-all duration-200 rounded-xl"
              >
                <Navigation className="w-3 h-3 mr-1" />
                Directions
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 