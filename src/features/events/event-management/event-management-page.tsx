'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Loading } from '@/shared/components/ui/loading';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  TrendingUp,
  Share2,
  Edit,
  QrCode,
  Globe,
  MessageCircle,
  Twitter,
  Copy,
} from 'lucide-react';

interface EventManagementPageProps {
  eventId: string;
  activeTab: string;
}

export function EventManagementPage({
  eventId,
  activeTab,
}: EventManagementPageProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Mock event data - in a real app, this would be fetched from an API
  const eventData = {
    id: eventId,
    title: 'ETHIndia 2025 🇮🇳',
    date: 'Jan 15, 2025',
    time: '10:00 AM - 6:00 PM',
    location: 'Bangalore, India',
    image: '/card1.png',
    attendees: 421,
    capacity: 500,
    registrations: 450,
            revenue: '4.5 AVAX',
  };

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleShare = async (platform: 'whatsapp' | 'twitter' | 'copy') => {
    const eventUrl = `${window.location.origin}/${eventId}`;
    const eventTitle = eventData.title;
    const eventDate = eventData.date;
    const eventLocation = eventData.location;

    let shareUrl = '';
    let shareText = '';

    switch (platform) {
      case 'whatsapp':
        shareText = `🎉 Join me at ${eventTitle}! 🇮🇳\n\n📅 ${eventDate}\n📍 ${eventLocation}\n\n🚀 Experience the future of blockchain events with amazing speakers, workshops, and networking opportunities!\n\n🔗 ${eventUrl}\n\n#ETHIndia #Blockchain #Web3 #Festos`;
        shareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(shareUrl, '_blank');
        toast.success('Opening WhatsApp...');
        break;

      case 'twitter':
        shareText = `🎉 Excited to attend ${eventTitle}! 🇮🇳\n\n📅 ${eventDate}\n📍 ${eventLocation}\n\n🚀 Join me for an incredible blockchain experience!\n\n🔗 ${eventUrl}\n\n#ETHIndia #Blockchain #Web3 #Festos`;
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(shareUrl, '_blank');
        toast.success('Opening Twitter...');
        break;

      case 'copy':
        try {
          await navigator.clipboard.writeText(eventUrl);
          toast.success('Event link copied to clipboard!');
        } catch {
          toast.error('Failed to copy link');
        }
        break;
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Loading size='lg' text='Loading event management...' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-30'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <Link
                href={`/${eventId}`}
                className='hover:opacity-80 transition-opacity'
                prefetch={true}
              >
                <Button variant='ghost' size='icon' className='h-9 w-9'>
                  <ArrowLeft className='h-5 w-5' />
                </Button>
              </Link>

              <div className='flex items-center gap-3'>
                <div className='relative h-10 w-10 rounded-md overflow-hidden'>
                  <Image
                    src={eventData.image}
                    alt={eventData.title}
                    fill
                    className='object-cover'
                    loading='lazy'
                  />
                </div>
                <div>
                  <h1 className='font-primary text-lg font-semibold text-foreground'>
                    {eventData.title}
                  </h1>
                  <p className='font-secondary text-sm text-muted-foreground'>
                    Event Management
                  </p>
                </div>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Link href={`/check-in/${eventId}`} prefetch={true}>
                <Button variant='outline' size='sm' className='gap-1.5'>
                  <QrCode className='h-4 w-4' />
                  <span>Check-in</span>
                </Button>
              </Link>

              <Link href={`/${eventId}`} target='_blank' prefetch={true}>
                <Button variant='outline' size='sm' className='gap-1.5'>
                  <Globe className='h-4 w-4' />
                  <span>View</span>
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm' className='gap-1.5'>
                    <Share2 className='h-4 w-4' />
                    <span>Share</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48'>
                  <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
                    <MessageCircle className='w-4 h-4 mr-2' />
                    Share on WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('twitter')}>
                    <Twitter className='w-4 h-4 mr-2' />
                    Share on Twitter
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleShare('copy')}>
                    <Copy className='w-4 h-4 mr-2' />
                    Copy Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link href={`/create?edit=${eventId}`} prefetch={true}>
                <Button variant='default' size='sm' className='gap-1.5'>
                  <Edit className='h-4 w-4' />
                  <span>Edit</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <Tabs value={activeTab} className='space-y-8'>
          <TabsList className='grid w-full grid-cols-4 rounded-xl border-2 border-border bg-background/50 backdrop-blur-sm p-1 h-12'>
            <TabsTrigger
              value='overview'
              asChild
              className='font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200'
            >
              <Link href={`/event/manage/${eventId}/overview`} prefetch={true}>
                Overview
              </Link>
            </TabsTrigger>
            <TabsTrigger
              value='guests'
              asChild
              className='font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200'
            >
              <Link href={`/event/manage/${eventId}/guests`} prefetch={true}>
                Guests
              </Link>
            </TabsTrigger>
            <TabsTrigger
              value='blasts'
              asChild
              className='font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200'
            >
              <Link href={`/event/manage/${eventId}/blasts`} prefetch={true}>
                Email Blasts
              </Link>
            </TabsTrigger>
            <TabsTrigger
              value='insights'
              asChild
              className='font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200'
            >
              <Link href={`/event/manage/${eventId}/insights`} prefetch={true}>
                Insights
              </Link>
            </TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-8'>
            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
              <Card className='rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <CardTitle className='text-sm font-medium text-muted-foreground'>
                      Total Registrations
                    </CardTitle>
                    <Users className='h-4 w-4 text-muted-foreground' />
                  </div>
                  <div className='text-2xl font-bold text-foreground'>
                    {eventData.registrations}
                  </div>
                  <p className='text-xs text-muted-foreground mt-2'>
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className='rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <CardTitle className='text-sm font-medium text-muted-foreground'>
                      Attendees
                    </CardTitle>
                    <TrendingUp className='h-4 w-4 text-muted-foreground' />
                  </div>
                  <div className='text-2xl font-bold text-foreground'>
                    {eventData.attendees}
                  </div>
                  <p className='text-xs text-muted-foreground mt-2'>
                    {Math.round(
                      (eventData.attendees / eventData.capacity) * 100
                    )}
                    % capacity
                  </p>
                </CardContent>
              </Card>

              <Card className='rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <CardTitle className='text-sm font-medium text-muted-foreground'>
                      Revenue
                    </CardTitle>
                    <DollarSign className='h-4 w-4 text-muted-foreground' />
                  </div>
                  <div className='text-2xl font-bold text-foreground'>
                    {eventData.revenue}
                  </div>
                  <p className='text-xs text-muted-foreground mt-2'>
                    +12.5% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className='rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <CardTitle className='text-sm font-medium text-muted-foreground'>
                      Capacity
                    </CardTitle>
                    <Calendar className='h-4 w-4 text-muted-foreground' />
                  </div>
                  <div className='text-2xl font-bold text-foreground'>
                    {eventData.capacity}
                  </div>
                  <p className='text-xs text-muted-foreground mt-2'>
                    Maximum attendees
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Event Details */}
            <Card className='rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out'>
              <CardHeader className='p-6 pb-4'>
                <CardTitle className='text-xl font-bold text-foreground'>
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6 pt-0 space-y-4'>
                <div className='flex items-center gap-3'>
                  <Calendar className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm text-foreground'>
                    {eventData.date} at {eventData.time}
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <MapPin className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm text-foreground'>
                    {eventData.location}
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <Badge
                    variant='secondary'
                    className='bg-primary/10 text-primary border-primary/20'
                  >
                    Active
                  </Badge>
                  <span className='text-sm text-muted-foreground'>
                    Event is live and accepting registrations
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='guests' className='space-y-8'>
            <Card className='rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out'>
              <CardHeader className='p-6 pb-4'>
                <CardTitle className='text-xl font-bold text-foreground'>
                  Guest Management
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6 pt-0'>
                <p className='text-muted-foreground'>
                  Guest management features will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='blasts' className='space-y-8'>
            <Card className='rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out'>
              <CardHeader className='p-6 pb-4'>
                <CardTitle className='text-xl font-bold text-foreground'>
                  Email Blasts
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6 pt-0'>
                <p className='text-muted-foreground'>
                  Email blast features will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='insights' className='space-y-8'>
            <Card className='rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out'>
              <CardHeader className='p-6 pb-4'>
                <CardTitle className='text-xl font-bold text-foreground'>
                  Event Insights
                </CardTitle>
              </CardHeader>
              <CardContent className='p-6 pt-0'>
                <p className='text-muted-foreground'>
                  Analytics and insights will be displayed here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
