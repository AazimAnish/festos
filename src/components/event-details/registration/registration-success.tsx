"use client";

import { memo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calendar, Gift } from "lucide-react";
import { ConfettiFireworks } from "@/components/ui/confetti-fireworks";
import type { EventData } from "@/types/registration";

interface RegistrationSuccessProps {
  eventData: EventData;
  onDownloadCalendar: () => void;
  onClose: () => void;
}

export const RegistrationSuccess = memo(function RegistrationSuccess({ 
  eventData, 
  onDownloadCalendar, 
  onClose 
}: RegistrationSuccessProps) {
  // Trigger confetti automatically when component mounts
  const [showConfetti] = useState(true);

  // Ensure confetti triggers immediately when component mounts
  useEffect(() => {
    // Small delay to ensure component is fully rendered
    const timer = setTimeout(() => {
      // The confetti will trigger automatically due to showConfetti being true
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8 text-center">
      {/* Confetti Fireworks */}
      <ConfettiFireworks trigger={showConfetti} duration={3000} />
      
      <div className="flex justify-center">
        <div className="relative">
          <CheckCircle className="h-16 w-16 text-primary drop-shadow-lg" />
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-primary text-2xl font-bold text-foreground">Registration Complete!</h3>
        <p className="font-secondary text-base text-gray">You&apos;re all set for {eventData.title}</p>
      </div>
      
      <Card className="border-2 border-primary/20 bg-primary/5 backdrop-blur-sm rounded-3xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gift className="h-6 w-6 text-primary" />
              <span className="font-secondary text-base font-medium text-foreground">POAP NFT</span>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 rounded-3xl">
              Claimed
            </Badge>
          </div>
          <p className="text-sm text-gray mt-3 font-mono">
            Token ID: {eventData.poapTokenId || "0x1234...5678"}
          </p>
        </CardContent>
      </Card>

      <div className="flex space-x-4">
        <Button 
          onClick={onDownloadCalendar}
          variant="outline" 
          className="flex-1 font-secondary border-2 border-foreground text-foreground hover:border-primary hover:bg-primary/5 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-primary/20 rounded-xl px-6 py-4 h-auto text-base"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Add to Calendar
        </Button>
        <Button 
          onClick={onClose}
          className="flex-1 font-secondary bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-primary/20 rounded-xl px-6 py-4 h-auto text-base"
        >
          Done
        </Button>
      </div>
    </div>
  );
}); 