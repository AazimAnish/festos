'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { MapPin, Navigation, Globe, Shield, Sparkles } from 'lucide-react';
// Default location (India - New Delhi)
const DEFAULT_LOCATION = {
  lat: 28.6139,
  lng: 77.209,
};
import { toast } from 'sonner';

interface LocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationGranted: (coords: { lat: number; lng: number }) => void;
  onLocationDenied: () => void;
}

export function LocationDialog({
  isOpen,
  onClose,
  onLocationGranted,
  onLocationDenied,
}: LocationDialogProps) {
  const [isRequesting, setIsRequesting] = useState(false);

  const requestLocation = async () => {
    setIsRequesting(true);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        }
      );

      onLocationGranted({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      toast.success('📍 Location access granted!', {
        description: "We'll show you events happening near you.",
        duration: 3000,
      });
    } catch (error) {
      console.log('Location access denied or unavailable:', error);
      onLocationDenied();
      toast.error('❌ Location access denied', {
        description: "We'll use the default location instead.",
        duration: 4000,
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleUseDefault = () => {
    onLocationGranted(DEFAULT_LOCATION);
    toast.info('🌍 Using default location (India)', {
      description: 'Showing events in India. You can change this later.',
      duration: 3000,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className='w-[95vw] max-w-lg mx-auto border-0 bg-background/95 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden max-h-[90vh] flex flex-col'
        showCloseButton={false}
      >
        {/* Header - Fixed */}
        <DialogHeader className='relative p-4 sm:p-6 pb-3 flex-shrink-0'>
          {/* Main content */}
          <div className='text-center space-y-3 sm:space-y-4'>
            {/* Icon */}
            <div className='w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center'>
              <Navigation className='w-6 h-6 sm:w-8 sm:h-8 text-primary' />
            </div>

            {/* Title */}
            <div className='space-y-2'>
              <DialogTitle className='font-primary text-xl sm:text-2xl font-bold text-foreground tracking-tight'>
                Enable Location Access
              </DialogTitle>
              <DialogDescription className='font-secondary text-sm sm:text-base text-muted-foreground leading-relaxed max-w-sm mx-auto'>
                Get personalized event recommendations and discover amazing
                fests happening near you
              </DialogDescription>
            </div>

            {/* Badge */}
            <Badge
              variant='secondary'
              className='bg-primary/10 text-primary border-primary/20 px-3 py-1'
            >
              <Sparkles className='w-3 h-3 mr-1' />
              Personalized Experience
            </Badge>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className='flex-1 overflow-y-auto px-4 sm:px-6 space-y-3 sm:space-y-4'>
          {/* Benefits Grid */}
          <div className='grid gap-3 sm:gap-4'>
            {/* Local Events */}
            <div className='bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-3 sm:p-4 border border-primary/20'>
              <div className='flex items-start gap-3'>
                <div className='w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0'>
                  <MapPin className='w-4 h-4 sm:w-5 sm:h-5 text-primary' />
                </div>
                <div className='space-y-1 min-w-0 flex-1'>
                  <h4 className='font-primary font-semibold text-foreground text-sm sm:text-base'>
                    Discover Local Events
                  </h4>
                  <p className='font-secondary text-xs sm:text-sm text-muted-foreground leading-relaxed'>
                    Find the best festivals, meetups, and events happening in
                    your area
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy */}
            <div className='bg-gradient-to-r from-green-500/5 to-green-500/10 rounded-2xl p-3 sm:p-4 border border-green-500/20'>
              <div className='flex items-start gap-3'>
                <div className='w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0'>
                  <Shield className='w-4 h-4 sm:w-5 sm:h-5 text-green-600' />
                </div>
                <div className='space-y-1 min-w-0 flex-1'>
                  <h4 className='font-primary font-semibold text-foreground text-sm sm:text-base'>
                    Privacy First
                  </h4>
                  <p className='font-secondary text-xs sm:text-sm text-muted-foreground leading-relaxed'>
                    Your location is only used to show relevant events and is
                    never shared
                  </p>
                </div>
              </div>
            </div>

            {/* Global Access */}
            <div className='bg-gradient-to-r from-blue-500/5 to-blue-500/10 rounded-2xl p-3 sm:p-4 border border-blue-500/20'>
              <div className='flex items-start gap-3'>
                <div className='w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0'>
                  <Globe className='w-4 h-4 sm:w-5 sm:h-5 text-blue-600' />
                </div>
                <div className='space-y-1 min-w-0 flex-1'>
                  <h4 className='font-primary font-semibold text-foreground text-sm sm:text-base'>
                    Global Access
                  </h4>
                  <p className='font-secondary text-xs sm:text-sm text-muted-foreground leading-relaxed'>
                    Explore events worldwide or stick to your local area -
                    you&apos;re in control
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className='bg-muted/30 rounded-2xl p-3 sm:p-4 border border-border/50'>
            <div className='flex items-start gap-3'>
              <div className='w-5 h-5 sm:w-6 sm:h-6 bg-muted rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5'>
                <Shield className='w-3 h-3 text-muted-foreground' />
              </div>
              <div className='space-y-1'>
                <h5 className='font-secondary font-medium text-foreground text-xs sm:text-sm'>
                  How we use your location
                </h5>
                <p className='font-secondary text-xs text-muted-foreground leading-relaxed'>
                  We use your location to show nearby events and provide
                  distance information. Your exact location is never stored or
                  shared with third parties.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed */}
        <div className='p-4 sm:p-6 pt-3 space-y-2 sm:space-y-3 flex-shrink-0 border-t border-border/50'>
          {/* Primary Action */}
          <Button
            onClick={requestLocation}
            disabled={isRequesting}
            className='w-full font-secondary text-sm sm:text-base px-4 sm:px-6 py-3 sm:py-4 h-auto bg-primary text-primary-foreground rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
          >
            {isRequesting ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-primary-foreground border-t-transparent mr-2 sm:mr-3' />
                <span>Getting Your Location...</span>
              </>
            ) : (
              <>
                <Navigation className='w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3' />
                <span>Allow Location Access</span>
              </>
            )}
          </Button>

          {/* Secondary Action */}
          <Button
            variant='outline'
            onClick={handleUseDefault}
            disabled={isRequesting}
            className='w-full font-secondary text-sm sm:text-base px-4 sm:px-6 py-3 sm:py-4 h-auto border-2 border-border text-foreground rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
          >
            <MapPin className='w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3' />
            <span>Use Default Location (India)</span>
          </Button>

          {/* Skip Option */}
          <button
            onClick={() => {
              onClose();
              toast.info('🌍 Location access skipped', {
                description:
                  'You can enable location access anytime in settings.',
                duration: 3000,
              });
            }}
            disabled={isRequesting}
            className='w-full font-secondary text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed py-2'
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
