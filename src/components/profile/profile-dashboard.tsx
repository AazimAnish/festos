'use client';

import { useState, useEffect } from 'react';
import { FadeIn } from '@/shared/components/ui/fade-in';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { EventCard } from '@/features/events/event-card';
import { EmptyState } from '@/shared/components/empty-state';
import { Loading } from '@/shared/components/ui/loading';
import { useWallet } from '@/shared/hooks/use-wallet';
import { useWalletProfile } from '@/shared/hooks/use-wallet-profile';
// Mock events data - replace with real API data
const SAMPLE_EVENTS = [
  {
    id: 1,
    uniqueId: 'fpvxrdl3',
    title: 'ETHIndia 2025 🇮🇳',
    location: 'Bangalore, India',
            price: '0.01 AVAX',
    image: '/card1.png',
    joinedCount: 421,
    hasPOAP: true,
    isSaved: false,
    category: 'Tech',
    date: '2025-01-15',
  },
  {
    id: 2,
    uniqueId: 'web3delhi',
    title: 'Web3 Delhi Summit',
    location: 'New Delhi, India',
            price: '0.05 AVAX',
    image: '/card2.png',
    joinedCount: 1200,
    hasPOAP: true,
    isSaved: true,
    category: 'Tech',
    date: '2025-02-20',
  },
  {
    id: 3,
    uniqueId: 'mumbaiblock',
    title: 'Mumbai Blockchain Fest',
    location: 'Mumbai, India',
    price: 'Free',
    image: '/card3.png',
    joinedCount: 89,
    hasPOAP: false,
    isSaved: false,
    category: 'Music',
    date: '2025-03-10',
  },
];
import {
  Calendar,
  MapPin,
  Users,
  Star,
  CheckCircle,
  ExternalLink,
  Plus,
  Filter,
  Search,
  Award,
  Settings,
  MessageCircle,
  UserPlus,
  Instagram,
  Twitter,
  Globe,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Mock user data - in real app, this would come from wallet/user context or API
const userData = {
  username: 'alexchen',
  name: 'Alex Chen',
  bio: 'Community builder & event organizer passionate about bringing people together through meaningful experiences.',
  avatar: '/card1.png',
  isVerified: true,
  location: 'San Francisco, CA',
  joinedDate: 'March 2023',
  address: '0x1234...5678',
  socialLinks: [
    { platform: 'Twitter', url: 'https://twitter.com/alexchen', icon: Twitter },
    {
      platform: 'Instagram',
      url: 'https://instagram.com/alexchen',
      icon: Instagram,
    },
    { platform: 'Website', url: 'https://alexchen.dev', icon: Globe },
  ],
  stats: {
    upcomingEvents: 3,
    eventsCreated: 24,
    eventsAttended: 87,
    poapsCollected: 156,
    averageRating: 4.8,
    totalReviews: 42,
  },
};

// Mock POAPs
const mockPOAPs = [
  {
    id: 1,
    name: 'ETH Denver 2024',
    image: '/greek_sculpture_1.png',
    rarity: 'rare',
    date: '2024-02-28',
  },
  {
    id: 2,
    name: 'DevCon VI Attendee',
    image: '/greek_sculpture_2.png',
    rarity: 'common',
    date: '2024-01-15',
  },
  {
    id: 3,
    name: 'Web3 Summit Speaker',
    image: '/greek_sculpture_3.png',
    rarity: 'legendary',
    date: '2024-03-10',
  },
  {
    id: 4,
    name: 'NFT.NYC Early Bird',
    image: '/greek_sculpture_4.png',
    rarity: 'uncommon',
    date: '2024-04-02',
  },
];

// Mock reviews
const mockReviews = [
  {
    id: 1,
    reviewer: 'Sarah Kim',
    rating: 5,
    comment:
      'Alex organized an incredible Web3 meetup. Great speakers, perfect venue, and amazing networking opportunities!',
    event: 'Web3 Builders Meetup',
    date: '2024-01-16',
  },
  {
    id: 2,
    reviewer: 'Michael Rodriguez',
    rating: 5,
    comment:
      'Outstanding event management. Everything was well-coordinated and the content was top-notch.',
    event: 'Startup Pitch Night',
    date: '2024-01-09',
  },
];

// Dashboard stats configuration
const dashboardStatsConfig = [
  {
    title: 'Upcoming Events',
    key: 'upcomingEvents' as const,
    icon: Calendar,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    title: 'Events Created',
    key: 'eventsCreated' as const,
    icon: Plus,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
  },
  {
    title: 'Events Attended',
    key: 'eventsAttended' as const,
    icon: Users,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    title: 'POAPs Collected',
    key: 'poapsCollected' as const,
    icon: Award,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
];

interface ProfileDashboardProps {
  username: string;
}

export function ProfileDashboard({ username }: ProfileDashboardProps) {
  const { isConnected } = useWallet();
  const { profile } = useWalletProfile();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAllSocials, setShowAllSocials] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // In a real app, we would fetch data based on the current user or a specific user
  // For now, we'll use mock data
  const user = userData;

  // Determine if this is a personal view by comparing with connected wallet's profile
  const isPersonalView = profile?.username === username;

  // Effect to simulate loading user data when username changes
  useEffect(() => {
    if (username) {
      // Simulate fetching user data
      setIsLoading(true);

      // In a real app, we would fetch user data by username from an API
      console.log(`Fetching data for user: ${username}`);

      // Simulate API response delay
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [username]);

  // If this is a personal view but the user is not connected, show connect wallet screen
  if (isPersonalView && !isConnected) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center space-y-6 max-w-md mx-auto px-6'>
          <FadeIn variant='up' timing='normal'>
            <div className='space-y-4'>
              <h1 className='font-primary text-3xl font-bold text-foreground'>
                Connect Your Wallet
              </h1>
              <p className='font-secondary text-muted-foreground'>
                Connect your wallet to access your personalized profile and
                manage your events.
              </p>
              <Button size='lg' className='w-full'>
                Connect Wallet
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  // Show loading state while fetching user data
  if (isLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Loading size='lg' text='Loading profile...' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Header Section */}
      <div className='apple-section-sm bg-gradient-to-b from-muted/30 to-background'>
        <div className='container mx-auto px-6 max-w-4xl'>
          <div className='flex flex-col sm:flex-row gap-6 sm:gap-8 items-start'>
            {/* Avatar */}
            <div className='relative'>
              <Avatar className='w-24 h-24 sm:w-32 sm:h-32 layer-2 ring-4 ring-background rounded-lg'>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className='text-2xl font-semibold'>
                  {user.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              {user.isVerified && (
                <div className='absolute -bottom-1 -right-1 bg-success rounded-full p-1.5 layer-1'>
                  <CheckCircle className='w-4 h-4 text-white' />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className='flex-1 space-y-4'>
              <div>
                <div className='flex items-center gap-3 mb-2'>
                  <h1 className='font-primary text-3xl sm:text-4xl font-bold tracking-tight text-foreground'>
                    {isPersonalView ? 'My Profile' : user.name}
                  </h1>
                  {user.isVerified && (
                    <Badge variant='secondary' className='gap-1 rounded-lg'>
                      <CheckCircle className='w-3 h-3' />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className='font-secondary text-muted-foreground text-lg leading-relaxed mb-3'>
                  {user.bio}
                </p>
                <div className='font-secondary flex items-center gap-4 text-sm text-muted-foreground'>
                  <div className='flex items-center gap-1'>
                    <MapPin className='w-4 h-4' />
                    {user.location}
                  </div>
                  <div className='flex items-center gap-1'>
                    <Calendar className='w-4 h-4' />
                    Joined {user.joinedDate}
                  </div>
                  {isPersonalView && profile?.address && (
                    <div className='flex items-center gap-1'>
                      <span className='font-mono text-muted-foreground'>
                        {profile.address.slice(0, 6)}...
                        {profile.address.slice(-4)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div className='space-y-2'>
                <div className='flex flex-wrap gap-2'>
                  {user.socialLinks
                    .slice(0, showAllSocials ? undefined : 2)
                    .map(social => (
                      <Button
                        key={social.platform}
                        variant='outline'
                        size='sm'
                        className='gap-2 micro-interaction bg-transparent font-secondary'
                        asChild
                      >
                        <a
                          href={social.url}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          <social.icon className='w-4 h-4' />
                          {social.platform}
                          <ExternalLink className='w-3 h-3' />
                        </a>
                      </Button>
                    ))}
                  {user.socialLinks.length > 2 && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setShowAllSocials(!showAllSocials)}
                      className='gap-1 font-secondary'
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${showAllSocials ? 'rotate-180' : ''}`}
                      />
                      {showAllSocials ? 'Less' : 'More'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-3'>
                {isPersonalView ? (
                  <>
                    <Link href='/create'>
                      <Button className='btn-apple gap-2 font-secondary rounded-lg'>
                        <Plus className='w-4 h-4' />
                        Create Event
                      </Button>
                    </Link>
                    <Button
                      variant='outline'
                      className='btn-apple gap-2 bg-transparent font-secondary rounded-lg'
                    >
                      <Settings className='w-4 h-4' />
                      Settings
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className='btn-apple gap-2 font-secondary rounded-lg'>
                      <UserPlus className='w-4 h-4' />
                      Follow
                    </Button>
                    <Button
                      variant='outline'
                      className='btn-apple gap-2 bg-transparent font-secondary rounded-lg'
                    >
                      <MessageCircle className='w-4 h-4' />
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className='apple-grid-4 mt-8'>
            {dashboardStatsConfig.map(stat => (
              <Card
                key={stat.title}
                className='group rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1'
              >
                <CardContent className='p-6 text-center'>
                  <div
                    className={`font-primary text-3xl font-bold ${stat.color} mb-2`}
                  >
                    {user.stats[stat.key]}
                  </div>
                  <div className='font-secondary text-sm text-muted-foreground'>
                    {stat.title}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className='apple-section'>
        <div className='container mx-auto px-6 max-w-4xl'>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='grid w-full grid-cols-5 mb-8 rounded-xl border-2 border-border bg-background/50 backdrop-blur-sm p-1 h-12'>
              <TabsTrigger
                className='font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 flex items-center justify-center'
                value='overview'
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                className='font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 flex items-center justify-center'
                value='created'
              >
                Created
              </TabsTrigger>
              <TabsTrigger
                className='font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 flex items-center justify-center'
                value='attending'
              >
                Attending
              </TabsTrigger>
              <TabsTrigger
                className='font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 flex items-center justify-center'
                value='poaps'
              >
                POAPs
              </TabsTrigger>
              <TabsTrigger
                className='font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 flex items-center justify-center'
                value='reviews'
              >
                Reviews
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value='overview' className='space-y-8'>
              <FadeIn variant='up' timing='normal'>
                {/* Upcoming Events Section */}
                <div className='space-y-6'>
                  <div className='flex items-center justify-between'>
                    <h2 className='font-primary text-2xl font-bold text-foreground'>
                      Upcoming Events
                    </h2>
                    <Button
                      variant='outline'
                      size='sm'
                      className='gap-2'
                      onClick={() => setActiveTab('attending')}
                    >
                      View All
                      <ExternalLink className='w-4 h-4' />
                    </Button>
                  </div>

                  {SAMPLE_EVENTS.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                      {SAMPLE_EVENTS.slice(0, 3).map((event, i) => (
                        <div
                          key={event.id}
                          className='group transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1'
                          style={{ animationDelay: `${i * 0.05}s` }}
                        >
                          <EventCard {...event} variant='grid' />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title='No upcoming events'
                      description="You don't have any upcoming events. Start exploring events to join!"
                      action={{
                        label: 'Explore Events',
                        href: '/discover',
                        icon: <Search className='w-4 h-4' />,
                      }}
                    />
                  )}
                </div>

                {/* Recent Activity Section */}
                <div className='space-y-6'>
                  <h2 className='font-primary text-2xl font-bold text-foreground'>
                    Recent Activity
                  </h2>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <Card className='rounded-xl border border-border/50 bg-background shadow-sm'>
                      <CardHeader>
                        <CardTitle className='font-primary text-lg'>
                          Events Created
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {SAMPLE_EVENTS.length > 0 ? (
                          <div className='space-y-4'>
                            {SAMPLE_EVENTS.slice(0, 3).map(event => (
                              <div
                                key={event.id}
                                className='flex items-center gap-4 p-3 rounded-lg bg-muted/30'
                              >
                                <Image
                                  src={event.image}
                                  alt={event.title}
                                  width={48}
                                  height={48}
                                  className='w-12 h-12 rounded-lg object-cover'
                                />
                                <div className='flex-1 min-w-0'>
                                  <h4 className='font-primary font-semibold text-sm text-foreground truncate'>
                                    {event.title}
                                  </h4>
                                  <p className='font-secondary text-xs text-muted-foreground'>
                                    {event.joinedCount} attendees
                                  </p>
                                </div>
                                <Badge variant='outline' className='text-xs'>
                                  Active
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className='font-secondary text-muted-foreground text-center py-8'>
                            No events created yet
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card className='rounded-xl border border-border/50 bg-background shadow-sm'>
                      <CardHeader>
                        <CardTitle className='font-primary text-lg'>
                          Recent POAPs
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {mockPOAPs.length > 0 ? (
                          <div className='space-y-4'>
                            {mockPOAPs.slice(0, 3).map(poap => (
                              <div
                                key={poap.id}
                                className='flex items-center gap-4 p-3 rounded-lg bg-muted/30'
                              >
                                <Image
                                  src={poap.image}
                                  alt={poap.name}
                                  width={48}
                                  height={48}
                                  className='w-12 h-12 rounded-lg object-cover'
                                />
                                <div className='flex-1 min-w-0'>
                                  <h4 className='font-primary font-semibold text-sm text-foreground truncate'>
                                    {poap.name}
                                  </h4>
                                  <p className='font-secondary text-xs text-muted-foreground'>
                                    {new Date(poap.date).toLocaleDateString()}
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    poap.rarity === 'legendary'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                  className='text-xs'
                                >
                                  {poap.rarity}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className='font-secondary text-muted-foreground text-center py-8'>
                            No POAPs collected yet
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </FadeIn>
            </TabsContent>

            {/* Created Events Tab */}
            <TabsContent value='created' className='space-y-8'>
              <FadeIn variant='up' timing='normal'>
                <div className='flex items-center justify-between'>
                  <h2 className='font-primary text-2xl font-bold text-foreground'>
                    {isPersonalView
                      ? 'Events I&apos;ve Created'
                      : `${user.name}&apos;s Events`}
                  </h2>
                  {isPersonalView && (
                    <Link href='/create'>
                      <Button className='gap-2'>
                        <Plus className='w-4 h-4' />
                        Create New Event
                      </Button>
                    </Link>
                  )}
                </div>

                {SAMPLE_EVENTS.length > 0 ? (
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {SAMPLE_EVENTS.map((event, i) => (
                      <div
                        key={event.id}
                        className='group transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1'
                        style={{ animationDelay: `${i * 0.05}s` }}
                      >
                        <EventCard {...event} variant='grid' />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title='No events created'
                    description={
                      isPersonalView
                        ? 'You haven&apos;t created any events yet. Start creating events to build your community!'
                        : `${user.name} hasn&apos;t created any events yet.`
                    }
                    action={
                      isPersonalView
                        ? {
                            label: 'Create Your First Event',
                            href: '/create',
                            icon: <Plus className='w-4 h-4' />,
                          }
                        : undefined
                    }
                  />
                )}
              </FadeIn>
            </TabsContent>

            {/* Attending Events Tab */}
            <TabsContent value='attending' className='space-y-8'>
              <FadeIn variant='up' timing='normal'>
                <div className='flex items-center justify-between'>
                  <h2 className='font-primary text-2xl font-bold text-foreground'>
                    {isPersonalView
                      ? 'Events I&apos;m Attending'
                      : `Events ${user.name} is Attending`}
                  </h2>
                  <div className='flex gap-2'>
                    <Button variant='outline' size='sm' className='gap-2'>
                      <Filter className='w-4 h-4' />
                      Filter
                    </Button>
                    <Button variant='outline' size='sm' className='gap-2'>
                      <Search className='w-4 h-4' />
                      Search
                    </Button>
                  </div>
                </div>

                {SAMPLE_EVENTS.length > 0 ? (
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {SAMPLE_EVENTS.map((event, i) => (
                      <div
                        key={event.id}
                        className='group transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1'
                        style={{ animationDelay: `${i * 0.05}s` }}
                      >
                        <EventCard {...event} variant='grid' />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title='No events to attend'
                    description={
                      isPersonalView
                        ? 'You haven&apos;t joined any events yet. Start exploring to find events that interest you!'
                        : `${user.name} hasn&apos;t joined any events yet.`
                    }
                    action={
                      isPersonalView
                        ? {
                            label: 'Explore Events',
                            href: '/discover',
                            icon: <Search className='w-4 h-4' />,
                          }
                        : undefined
                    }
                  />
                )}
              </FadeIn>
            </TabsContent>

            {/* POAPs Tab */}
            <TabsContent value='poaps' className='space-y-8'>
              <FadeIn variant='up' timing='normal'>
                <h2 className='font-primary text-2xl font-bold text-foreground mb-6'>
                  {isPersonalView
                    ? 'My POAP Collection'
                    : `${user.name}'s POAPs`}
                </h2>

                <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
                  {mockPOAPs.map(poap => (
                    <Card
                      key={poap.id}
                      className='group overflow-hidden rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1'
                    >
                      <div className='aspect-square relative overflow-hidden'>
                        <Image
                          src={poap.image}
                          alt={poap.name}
                          fill
                          className='object-cover transition-transform duration-300 ease-out group-hover:scale-105'
                          sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent' />
                        <div className='absolute top-3 right-3'>
                          <Badge
                            variant={
                              poap.rarity === 'legendary'
                                ? 'default'
                                : poap.rarity === 'rare'
                                  ? 'secondary'
                                  : poap.rarity === 'uncommon'
                                    ? 'outline'
                                    : 'secondary'
                            }
                            className={
                              poap.rarity === 'legendary'
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                                : poap.rarity === 'rare'
                                  ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg'
                                  : poap.rarity === 'uncommon'
                                    ? 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg'
                                    : ''
                            }
                          >
                            <Award className='w-3 h-3 mr-1' />
                            {poap.rarity}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className='p-4'>
                        <h4 className='font-primary font-semibold text-sm mb-2 text-foreground line-clamp-2'>
                          {poap.name}
                        </h4>
                        <div className='font-secondary text-xs text-muted-foreground flex items-center gap-1'>
                          <Calendar className='w-3 h-3' />
                          {new Date(poap.date).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </FadeIn>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value='reviews' className='space-y-8'>
              <FadeIn variant='up' timing='normal'>
                <h2 className='font-primary text-2xl font-bold text-foreground mb-6'>
                  {isPersonalView ? 'My Reviews' : `Reviews for ${user.name}`}
                </h2>

                <div className='space-y-6'>
                  {mockReviews.map(review => (
                    <Card
                      key={review.id}
                      className='group rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out hover:scale-[1.01]'
                    >
                      <CardContent className='p-6'>
                        <div className='flex items-start gap-5'>
                          <Avatar className='w-10 h-10'>
                            <AvatarFallback>
                              {review.reviewer
                                .split(' ')
                                .map(n => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center gap-3 mb-3'>
                              <span className='font-primary font-semibold text-foreground'>
                                {review.reviewer}
                              </span>
                              <div className='flex items-center'>
                                {Array.from({ length: review.rating }).map(
                                  (_, i) => (
                                    <Star
                                      key={i}
                                      className='w-4 h-4 fill-warning text-warning drop-shadow-sm'
                                    />
                                  )
                                )}
                              </div>
                              <span className='font-secondary text-sm text-muted-foreground flex items-center gap-1'>
                                <Calendar className='w-3 h-3' />
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className='font-secondary text-muted-foreground mb-4 leading-relaxed'>
                              {review.comment}
                            </p>
                            <Badge
                              variant='outline'
                              className='font-secondary text-xs bg-accent/20 border-accent/30'
                            >
                              {review.event}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </FadeIn>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
