"use client";

import { EventHeroBanner } from "./event-hero-banner";
import { CreatorProfile } from "./creator-profile";
import { WalletConnectionDialog } from "./registration/wallet-connection-dialog";
import { TicketPreview } from "./ticket-preview";
import { AttendeeList } from "./attendee-list";
import { LocationMap } from "./location-map";
import { SimilarEvents } from "./similar-events";
import { FadeIn } from "@/components/ui/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MapPin, Users, Info, Ticket } from "lucide-react";
import { useState, useEffect } from "react";
import { Loading } from "@/components/ui/loading";
import { extractEventIdFromSlug } from "@/lib/utils";
import Image from "next/image";

interface EventDetailPageProps {
  slug: string;
}

export function EventDetailPage({ slug }: EventDetailPageProps) {
  const [isRegistered] = useState(false); // Mock state - would come from API
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Extract event ID from slug for proper data fetching
  const eventId = extractEventIdFromSlug(slug);

  // Mock data - in real app this would come from API based on eventId
  const eventData = {
    id: eventId,
    title: "ETHIndia 2025 🇮🇳",
    tagline: "The biggest Ethereum hackathon in Asia",
    location: "Bangalore, India",
    address: "Bangalore International Centre, Domlur, Bangalore",
    price: "0.01 ETH",
    image: "/card1.png",
    joinedCount: 421,
    hasPOAP: true,
    isSaved: false,
    category: "Tech",
    date: "2025-01-15",
    time: "10:00 AM - 6:00 PM",
    creator: {
      name: "Web3India",
      avatar: "/card2.png",
      verified: true,
      bio: "Building the future of Web3 in India",
      eventsCount: 12
    },
    registrationForm: [
      { type: "text" as const, label: "Full Name", required: true },
      { type: "email" as const, label: "Email", required: true },
      { type: "text" as const, label: "Twitter Handle", required: false },
      { type: "select" as const, label: "Experience Level", options: ["Beginner", "Intermediate", "Advanced"], required: true }
    ],
    ticketId: "ETH2025-001",
    poapTokenId: "0x1234...5678",
    coordinates: [77.5946, 12.9716] as [number, number],
    similarEvents: [
      { id: 2, title: "Web3 Delhi Summit", location: "New Delhi", price: "0.05 ETH", image: "/card2.png", date: "2025-02-20" },
      { id: 3, title: "Mumbai Blockchain Fest", location: "Mumbai", price: "Free", image: "/card3.png", date: "2025-03-10" },
      { id: 4, title: "Chennai NFT Expo", location: "Chennai", price: "0.1 ETH", image: "/card1.png", date: "2025-04-05" }
    ]
  };

  // Simulate loading and error handling
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Simulate potential error
      if (eventId > 1000) {
        setError("Event not found");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading size="lg" text="Loading event details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="font-primary text-xl font-bold text-foreground">
            {error}
          </h2>
          <p className="font-secondary text-sm text-gray">
            The event you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <FadeIn variant="up" timing="normal">
        <EventHeroBanner event={eventData} />
      </FadeIn>

      {/* Main Content Section */}
      <section className="w-full relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 sm:py-12 lg:py-16">
            
            {/* Two Column Layout for Larger Screens */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
              
              {/* Main Content - Takes 2/3 on large screens */}
              <div className="lg:col-span-2 space-y-8 sm:space-y-10">
                
                {/* Essential Event Info - Always Visible */}
                <FadeIn variant="up" timing="normal">
                  <Card className="border-2 border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-6 sm:p-8 lg:p-10">
                      <div className="space-y-6 sm:space-y-8">
                        {/* Event Details */}
                        <div className="space-y-4 sm:space-y-6">
                          <div className="flex items-center gap-4">
                            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                            <span className="font-secondary text-base sm:text-lg text-foreground">{eventData.location}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                            <span className="font-secondary text-base sm:text-lg text-foreground">{eventData.joinedCount} attending</span>
                          </div>
                        </div>

                        {/* Creator Info - Enhanced */}
                        <div className="flex items-center gap-4 p-4 sm:p-6 bg-muted/10 rounded-xl border border-border">
                          <Image 
                            src={eventData.creator.avatar} 
                            alt={eventData.creator.name} 
                            width={56}
                            height={56}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex-shrink-0 border-2 border-border object-cover" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-secondary text-base sm:text-lg font-medium text-foreground truncate">
                              {eventData.creator.name}
                            </div>
                            <div className="font-tertiary text-sm sm:text-base text-gray">
                              {eventData.creator.eventsCount} events created
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-sm sm:text-base flex-shrink-0">
                            Creator
                          </Badge>
                        </div>

                        {/* Primary Action */}
                        {!isRegistered ? (
                          <WalletConnectionDialog 
                            eventData={{
                              id: eventData.id.toString(),
                              title: eventData.title,
                              price: eventData.price,
                              hasPOAP: eventData.hasPOAP,
                              poapTokenId: eventData.poapTokenId,
                              joinedCount: eventData.joinedCount,
                              location: eventData.location,
                              date: eventData.date,
                              time: eventData.time,
                              image: eventData.image
                            }}
                            registrationForm={eventData.registrationForm}
                          />
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="w-full font-secondary text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-5 h-auto bg-primary text-primary-foreground rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 text-center">
                                🎫 View Ticket
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md sm:max-w-lg">
                              <DialogHeader>
                                <DialogTitle className="font-primary text-lg sm:text-xl font-bold text-foreground">
                                  Your Ticket
                                </DialogTitle>
                              </DialogHeader>
                              <TicketPreview 
                                ticketId={eventData.ticketId}
                                poapTokenId={eventData.poapTokenId}
                                hasPOAP={eventData.hasPOAP}
                              />
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>

                {/* Optional Information - Collapsible */}
                <FadeIn variant="up" timing="normal">
                  <Accordion type="single" collapsible className="w-full space-y-6">
                    {/* Location Details */}
                    <AccordionItem value="location" className="border-2 border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <AccordionTrigger className="px-6 sm:px-8 py-6 sm:py-8 hover:no-underline">
                        <div className="flex items-center gap-4">
                          <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                          <span className="font-secondary text-base sm:text-lg text-foreground">Location Details</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 sm:px-8 pb-6 sm:pb-8">
                        <LocationMap 
                          location={eventData.location}
                          address={eventData.address}
                          coordinates={eventData.coordinates}
                        />
                      </AccordionContent>
                    </AccordionItem>

                    {/* Creator Profile */}
                    <AccordionItem value="creator" className="border-2 border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <AccordionTrigger className="px-6 sm:px-8 py-6 sm:py-8 hover:no-underline">
                        <div className="flex items-center gap-4">
                          <Info className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                          <span className="font-secondary text-base sm:text-lg text-foreground">About Creator</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 sm:px-8 pb-6 sm:pb-8">
                        <CreatorProfile creator={eventData.creator} />
                      </AccordionContent>
                    </AccordionItem>

                    {/* Similar Events */}
                    <AccordionItem value="similar" className="border-2 border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                      <AccordionTrigger className="px-6 sm:px-8 py-6 sm:py-8 hover:no-underline">
                        <div className="flex items-center gap-4">
                          <Ticket className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                          <span className="font-secondary text-base sm:text-lg text-foreground">Similar Events</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 sm:px-8 pb-6 sm:pb-8">
                        <SimilarEvents events={eventData.similarEvents} />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </FadeIn>
              </div>

              {/* Sidebar - Takes 1/3 on large screens */}
              <div className="space-y-8 sm:space-y-10">
                
                {/* Attendees - Always Visible in Sidebar */}
                <FadeIn variant="up" timing="normal">
                  <AttendeeList count={eventData.joinedCount} />
                </FadeIn>

                {/* Event Category Info */}
                <FadeIn variant="up" timing="normal">
                  <Card className="border-2 border-border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-6 sm:p-8">
                      <div className="space-y-6">
                        <h3 className="font-primary text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
                          📊 Event Info
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="font-secondary text-base text-gray">Category</span>
                            <Badge className="bg-primary/10 text-primary border-0 text-sm sm:text-base">
                              {eventData.category}
                            </Badge>
                          </div>
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