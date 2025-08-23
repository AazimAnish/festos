'use client';

import { memo, useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Calendar, Share2, Users, Globe, Rocket } from 'lucide-react';
import { ConfettiFireworks } from '@/shared/components/ui/confetti-fireworks';
import Link from 'next/link';

interface EventCreationSuccessProps {
  eventData: {
    title: string;
    date: string;
    location: string;
    uniqueId: string;
  };
  onClose: () => void;
}

export const EventCreationSuccess = memo(function EventCreationSuccess({
  eventData,
  onClose,
}: EventCreationSuccessProps) {
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

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/${eventData.uniqueId}`;
    if (navigator.share) {
      navigator.share({
        title: eventData.title,
        text: `Check out this amazing event: ${eventData.title}`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      // You could add a toast notification here
    }
  };

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-6'>
      <div className='max-w-2xl w-full space-y-8 text-center'>
        {/* Confetti Fireworks */}
        <ConfettiFireworks trigger={showConfetti} duration={4000} />

        {/* Success Message */}
        <div className='space-y-4'>
          <h1 className='font-primary text-3xl sm:text-4xl font-bold text-foreground'>
            Event Created Successfully! 🎉
          </h1>
          <p className='font-secondary text-lg text-muted-foreground'>
            Your event is now live and ready to welcome attendees
          </p>
        </div>

        {/* Event Details Card */}
        <Card className='border-2 border-primary/20 bg-primary/5 backdrop-blur-sm rounded-3xl'>
          <CardContent className='p-8'>
            <div className='space-y-6'>
              {/* Event Title */}
              <div>
                <h2 className='font-primary text-2xl font-bold text-foreground mb-2'>
                  {eventData.title}
                </h2>
                <Badge
                  variant='secondary'
                  className='bg-success/10 text-success border-success/20 px-3 py-1 rounded-3xl'
                >
                  <Globe className='w-3 h-3 mr-1' />
                  Live
                </Badge>
              </div>

              {/* Event Details */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-left'>
                <div className='flex items-center gap-3 p-3 bg-background/50 rounded-xl'>
                  <Calendar className='h-5 w-5 text-primary' />
                  <div>
                    <div className='text-sm text-muted-foreground'>Date</div>
                    <div className='font-medium'>{eventData.date}</div>
                  </div>
                </div>

                <div className='flex items-center gap-3 p-3 bg-background/50 rounded-xl'>
                  <Users className='h-5 w-5 text-primary' />
                  <div>
                    <div className='text-sm text-muted-foreground'>
                      Location
                    </div>
                    <div className='font-medium'>{eventData.location}</div>
                  </div>
                </div>
              </div>

              {/* Event URL */}
              <div className='p-4 bg-muted/30 rounded-xl'>
                <div className='text-sm text-muted-foreground mb-2'>
                  Event URL
                </div>
                <div className='font-mono text-sm bg-background p-2 rounded-lg border'>
                  {`${window.location.origin}/${eventData.uniqueId}`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4'>
          <Button
            onClick={handleShare}
            variant='outline'
            className='flex-1 font-secondary border-2 border-foreground text-foreground hover:border-primary hover:bg-primary/5 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-primary/20 rounded-xl px-6 py-4 h-auto text-base'
          >
            <Share2 className='h-4 w-4 mr-2' />
            Share Event
          </Button>

          <Link href={`/${eventData.uniqueId}`} className='flex-1'>
            <Button className='w-full font-secondary bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-primary/20 rounded-xl px-6 py-4 h-auto text-base'>
              <Rocket className='h-4 w-4 mr-2' />
              View Event
            </Button>
          </Link>
        </div>

        {/* Additional Actions */}
        <div className='flex flex-col sm:flex-row gap-4'>
          <Link
            href={`/event/manage/${eventData.uniqueId}/overview`}
            className='flex-1'
          >
            <Button
              variant='outline'
              className='w-full font-secondary border-border text-foreground hover:bg-muted transition-all duration-200 hover:scale-105 active:scale-95 rounded-xl px-6 py-4 h-auto text-base'
            >
              <Users className='h-4 w-4 mr-2' />
              Manage Event
            </Button>
          </Link>

          <Button
            onClick={onClose}
            variant='ghost'
            className='flex-1 font-secondary text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 active:scale-95 rounded-xl px-6 py-4 h-auto text-base'
          >
            Create Another Event
          </Button>
        </div>

        {/* Encouraging Message */}
        <div className='pt-4 border-t border-border/50'>
          <p className='text-sm text-muted-foreground'>
            🚀 Your event is now live! Start promoting it to reach your
            audience.
          </p>
        </div>
      </div>
    </div>
  );
});
