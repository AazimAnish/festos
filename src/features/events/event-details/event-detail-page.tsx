'use client';

import { EventHeroBanner } from './event-hero-banner';
import { CreatorProfile } from './creator-profile';
import { WalletConnectionDialog } from './registration/wallet-connection-dialog';
import { TicketPreview } from './ticket-preview';
import { AttendeeList } from './attendee-list';
import { LocationMap } from './location-map';
import { SimilarEvents } from './similar-events';
import { FadeIn } from '@/shared/components/ui/fade-in';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { MapPin, Users, Info, Ticket, QrCode, Calendar, Clock } from 'lucide-react';
import { useState } from 'react';
import { Loading } from '@/shared/components/ui/loading';
import { useEvent } from '@/shared/hooks/use-events-optimized';
import { useWallet } from '@/shared/hooks/use-wallet';
import { useSimilarEvents } from '@/shared/hooks/use-similar-events';
import { useRegistrationForm } from '@/shared/hooks/use-registration-form';
import Image from 'next/image';
import { format } from 'date-fns';

interface EventDetailPageProps {
  slug?: string;
  uniqueId?: string;
}

export function EventDetailPage({
  slug,
  uniqueId,
}: EventDetailPageProps) {
  const [isRegistered] = useState(false); // TODO: Implement registration check
  const { address: userWalletAddress } = useWallet();

  // Use uniqueId directly for fetching event data
  const eventId = uniqueId || slug;

  // Always call hooks in the same order, regardless of conditions
  const { data: eventData, isLoading, error } = useEvent(eventId || '');
  const { data: similarEvents = [] } = useSimilarEvents(eventId || '');
  const { data: registrationForm = [] } = useRegistrationForm(eventId || '');

  // Loading state
  if (isLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Loading size='lg' text='Loading event details...' />
      </div>
    );
  }

  // Error state
  if (error || !eventData) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center space-y-4'>
          <h2 className='font-primary text-xl font-bold text-foreground'>
            Event not found
          </h2>
          <p className='font-secondary text-sm text-gray'>
            The event you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
        </div>
      </div>
    );
  }

  // Format dates for display
  const startDate = new Date(eventData.startDate);
  const endDate = new Date(eventData.endDate);
  const formattedStartDate = format(startDate, 'MMMM d, yyyy');
  const formattedStartTime = format(startDate, 'h:mm a');
  const formattedEndTime = format(endDate, 'h:mm a');

  // Check if user is the creator
  const isCreator = userWalletAddress?.toLowerCase() === eventData.creatorId?.toLowerCase();

  return (
    <div className='min-h-screen bg-background'>
      {/* Hero Banner */}
      <FadeIn variant='up' timing='normal'>
        <EventHeroBanner 
          event={{
            title: eventData.title,
            tagline: eventData.description,
            price: eventData.ticketPrice,
            image: eventData.ipfsImageUrl || eventData.bannerImage || '/card1.png',
            hasPOAP: eventData.hasPOAP,
            isSaved: false, // TODO: Implement save functionality
            date: formattedStartDate,
            time: `${formattedStartTime} - ${formattedEndTime}`,
          }} 
        />
      </FadeIn>

      {/* Main Content Section */}
      <section className='w-full relative'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='py-8 sm:py-12 lg:py-16'>
            {/* Two Column Layout for Larger Screens */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12'>
              {/* Main Content - Takes 2/3 on large screens */}
              <div className='lg:col-span-2 space-y-8 sm:space-y-10'>
                {/* Essential Event Info - Always Visible */}
                <FadeIn variant='up' timing='normal'>
                  <Card className='border-2 border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300'>
                    <CardContent className='p-6 sm:p-8 lg:p-10'>
                      <div className='space-y-6 sm:space-y-8'>
                        {/* Event Details */}
                        <div className='space-y-4 sm:space-y-6'>
                          <div className='flex items-center gap-4'>
                            <MapPin className='w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0' />
                            <span className='font-secondary text-base sm:text-lg text-foreground'>
                              {eventData.location}
                            </span>
                          </div>
                          <div className='flex items-center gap-4'>
                            <Calendar className='w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0' />
                            <span className='font-secondary text-base sm:text-lg text-foreground'>
                              {formattedStartDate}
                            </span>
                          </div>
                          <div className='flex items-center gap-4'>
                            <Clock className='w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0' />
                            <span className='font-secondary text-base sm:text-lg text-foreground'>
                              {formattedStartTime} - {formattedEndTime}
                            </span>
                          </div>
                          <div className='flex items-center gap-4'>
                            <Users className='w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0' />
                            <span className='font-secondary text-base sm:text-lg text-foreground'>
                              Max Capacity: {eventData.maxCapacity}
                            </span>
                          </div>
                        </div>

                        {/* Creator Info - Enhanced */}
                        <div className='flex items-center gap-4 p-4 sm:p-6 bg-muted/10 rounded-xl border border-border'>
                          <Image
                            src='/card2.png' // TODO: Add creator avatar to EventData
                            alt={eventData.creatorId?.slice(0, 8) || 'Unknown Creator'}
                            width={56}
                            height={56}
                            className='w-12 h-12 sm:w-14 sm:h-14 rounded-full flex-shrink-0 border-2 border-border object-cover'
                          />
                          <div className='flex-1 min-w-0'>
                            <div className='font-secondary text-base sm:text-lg font-medium text-foreground truncate'>
                              {eventData.creatorId?.slice(0, 8) || 'Unknown Creator'}
                            </div>
                            <div className='font-tertiary text-sm sm:text-base text-gray'>
                              Event Creator
                            </div>
                          </div>
                          <Badge
                            variant='secondary'
                            className='bg-primary/10 text-primary border-0 text-sm sm:text-base flex-shrink-0'
                          >
                            Creator
                          </Badge>
                        </div>

                        {/* Primary Action */}
                        {!isRegistered ? (
                          <WalletConnectionDialog
                            eventData={{
                              id: eventData.id,
                              title: eventData.title,
                              price: eventData.ticketPrice,
                              hasPOAP: eventData.hasPOAP,
                              poapTokenId: eventData.poapMetadata || '',
                              joinedCount: 0, // TODO: Implement attendee count
                              location: eventData.location,
                              date: formattedStartDate,
                              time: `${formattedStartTime} - ${formattedEndTime}`,
                              image: eventData.bannerImage || '/card1.png',
                            }}
                            registrationForm={registrationForm}
                          />
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className='w-full font-secondary text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-5 h-auto bg-primary text-primary-foreground rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 text-center'>
                                🎫 View Ticket
                              </Button>
                            </DialogTrigger>
                            <DialogContent className='max-w-md sm:max-w-lg'>
                              <DialogHeader>
                                <DialogTitle className='font-primary text-lg sm:text-xl font-bold text-foreground'>
                                  Your Ticket
                                </DialogTitle>
                              </DialogHeader>
                              <TicketPreview
                                ticketId={`TICKET-${eventData.id.slice(0, 8)}`}
                                poapTokenId={eventData.poapMetadata || '0x1234...5678'}
                                hasPOAP={eventData.hasPOAP}
                              />
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>

                {/* Organizer Check-in Section - Only show for creators */}
                {isCreator && (
                  <FadeIn variant='up' timing='normal'>
                    <Card className='border-2 border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300'>
                      <CardContent className='p-6 sm:p-8'>
                        <div className='space-y-6'>
                          <h3 className='font-primary text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3'>
                            <QrCode className='w-6 h-6 text-primary' />
                            Organizer Tools
                          </h3>
                          <p className='font-secondary text-base text-gray'>
                            Manage event check-ins and attendee verification
                          </p>
                          <div className='flex flex-col sm:flex-row gap-4'>
                            <Button
                              asChild
                              className='font-secondary text-sm px-6 py-3 h-auto border-2 border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-200 rounded-xl'
                            >
                              <a href={`/check-in/${eventData.id}`}>
                                <QrCode className='w-4 h-4 mr-2' />
                                Open Check-in Terminal
                              </a>
                            </Button>
                            <Button
                              variant='outline'
                              className='font-secondary text-sm px-6 py-3 h-auto border-2 border-border text-foreground hover:border-primary hover:text-primary transition-all duration-200 rounded-xl'
                            >
                              <Users className='w-4 h-4 mr-2' />
                              View Attendee List
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </FadeIn>
                )}

                {/* Optional Information - Collapsible */}
                <FadeIn variant='up' timing='normal'>
                  <Accordion
                    type='single'
                    collapsible
                    className='w-full space-y-6'
                  >
                    {/* Event Description */}
                    <AccordionItem
                      value='description'
                      className='border-2 border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300'
                    >
                      <AccordionTrigger className='px-6 sm:px-8 py-6 sm:py-8 hover:no-underline'>
                        <div className='flex items-center gap-4'>
                          <Info className='w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0' />
                          <span className='font-secondary text-base sm:text-lg text-foreground'>
                            Event Description
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className='px-6 sm:px-8 pb-6 sm:pb-8'>
                        <div className='prose prose-sm max-w-none'>
                          <p className='font-secondary text-base text-foreground leading-relaxed'>
                            {eventData.description}
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Location Details */}
                    <AccordionItem
                      value='location'
                      className='border-2 border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300'
                    >
                      <AccordionTrigger className='px-6 sm:px-8 py-6 sm:py-8 hover:no-underline'>
                        <div className='flex items-center gap-4'>
                          <MapPin className='w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0' />
                          <span className='font-secondary text-base sm:text-lg text-foreground'>
                            Location Details
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className='px-6 sm:px-8 pb-6 sm:pb-8'>
                        <LocationMap
                          location={eventData.location}
                          address={eventData.location} // TODO: Add address field to EventData
                          coordinates={[0, 0] as [number, number]} // TODO: Add coordinates to EventData
                        />
                      </AccordionContent>
                    </AccordionItem>

                    {/* Creator Profile */}
                    <AccordionItem
                      value='creator'
                      className='border-2 border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300'
                    >
                      <AccordionTrigger className='px-6 sm:px-8 py-6 sm:py-8 hover:no-underline'>
                        <div className='flex items-center gap-4'>
                          <Info className='w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0' />
                          <span className='font-secondary text-base sm:text-lg text-foreground'>
                            About Creator
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className='px-6 sm:px-8 pb-6 sm:pb-8'>
                        <CreatorProfile 
                          creator={{
                            name: eventData.creatorId?.slice(0, 8) || 'Unknown Creator',
                            avatar: '/card2.png', // TODO: Add creator avatar to EventData
                            verified: true,
                            bio: 'Event creator on the blockchain',
                            eventsCount: 1,
                          }} 
                        />
                      </AccordionContent>
                    </AccordionItem>

                    {/* Similar Events */}
                    <AccordionItem
                      value='similar'
                      className='border-2 border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300'
                    >
                      <AccordionTrigger className='px-6 sm:px-8 py-6 sm:py-8 hover:no-underline'>
                        <div className='flex items-center gap-4'>
                          <Ticket className='w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0' />
                          <span className='font-secondary text-base sm:text-lg text-foreground'>
                            Similar Events
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className='px-6 sm:px-8 pb-6 sm:pb-8'>
                        <SimilarEvents events={similarEvents} />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </FadeIn>
              </div>

              {/* Sidebar - Takes 1/3 on large screens */}
              <div className='space-y-8 sm:space-y-10'>
                {/* Attendees - Always Visible in Sidebar */}
                <FadeIn variant='up' timing='normal'>
                  <AttendeeList count={0} /> {/* TODO: Implement attendee count */}
                </FadeIn>

                {/* Event Category Info */}
                <FadeIn variant='up' timing='normal'>
                  <Card className='border-2 border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300'>
                    <CardContent className='p-6 sm:p-8'>
                      <div className='space-y-6'>
                        <h3 className='font-primary text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3'>
                          📊 Event Info
                        </h3>
                        <div className='space-y-4'>
                          <div className='flex items-center justify-between'>
                            <span className='font-secondary text-base text-gray'>
                              Category
                            </span>
                            <Badge className='bg-primary/10 text-primary border-0 text-sm sm:text-base'>
                              {eventData.category || 'General'}
                            </Badge>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='font-secondary text-base text-gray'>
                              Price
                            </span>
                            <Badge className='bg-green-100 text-green-800 border-0 text-sm sm:text-base'>
                              {eventData.ticketPrice}
                            </Badge>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='font-secondary text-base text-gray'>
                              Approval Required
                            </span>
                            <Badge className={`border-0 text-sm sm:text-base ${
                              eventData.requireApproval 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {eventData.requireApproval ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                          {eventData.hasPOAP && (
                            <div className='flex items-center justify-between'>
                              <span className='font-secondary text-base text-gray'>
                                POAP
                              </span>
                              <Badge className='bg-purple-100 text-purple-800 border-0 text-sm sm:text-base'>
                                Available
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
