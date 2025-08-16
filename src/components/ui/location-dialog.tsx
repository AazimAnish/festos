"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Globe } from "lucide-react";
import { DEFAULT_LOCATION } from "@/lib/data/mock-data";

interface LocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationGranted: (coords: { lat: number; lng: number }) => void;
  onLocationDenied: () => void;
}

export function LocationDialog({ isOpen, onClose, onLocationGranted, onLocationDenied }: LocationDialogProps) {
  const [isRequesting, setIsRequesting] = useState(false);

  const requestLocation = async () => {
    setIsRequesting(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      onLocationGranted({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    } catch {
      console.log("Location access denied or unavailable");
      onLocationDenied();
    } finally {
      setIsRequesting(false);
    }
  };

  const handleUseDefault = () => {
    // Default to India (New Delhi coordinates)
    onLocationGranted(DEFAULT_LOCATION);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto border-2 border-border bg-background shadow-2xl">
        <DialogHeader className="space-y-4 pb-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-full flex-shrink-0">
              <Navigation className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-2 min-w-0 flex-1">
              <DialogTitle className="font-primary text-lg sm:text-xl font-bold text-foreground leading-tight">
                Enable Location Access
              </DialogTitle>
              <DialogDescription className="font-secondary text-sm sm:text-base text-gray leading-relaxed">
                Get personalized event recommendations near you
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pb-6">
          <div className="bg-accent/10 rounded-xl p-4 sm:p-5 space-y-3 border border-accent/20">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-2 min-w-0 flex-1">
                <h4 className="font-secondary font-semibold text-foreground text-sm sm:text-base">
                  Discover Local Events
                </h4>
                <p className="font-secondary text-xs sm:text-sm text-gray leading-relaxed">
                  We&apos;ll show you events happening in your area and help you find the best fests nearby.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-accent/10 rounded-xl p-4 sm:p-5 space-y-3 border border-accent/20">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-2 min-w-0 flex-1">
                <h4 className="font-secondary font-semibold text-foreground text-sm sm:text-base">
                  Privacy First
                </h4>
                <p className="font-secondary text-xs sm:text-sm text-gray leading-relaxed">
                  Your location is only used to show relevant events and is never shared with third parties.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleUseDefault}
            disabled={isRequesting}
            className="w-full sm:w-auto font-secondary text-sm sm:text-base px-4 sm:px-6 py-3 h-auto border-2 border-foreground text-foreground rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 hover:border-foreground hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="whitespace-nowrap">Use Default Location</span>
          </Button>
          <Button
            onClick={requestLocation}
            disabled={isRequesting}
            className="w-full sm:w-auto font-secondary text-sm sm:text-base px-4 sm:px-6 py-3 h-auto bg-primary text-primary-foreground rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRequesting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2 flex-shrink-0" />
                <span className="whitespace-nowrap">Getting Location...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="whitespace-nowrap">Allow Location Access</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 