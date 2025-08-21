'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@/lib/hooks/use-wallet';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  ThumbsUp,
  MessageCircle,
  Share2,
  MapPin,
  Users,
  Search,
  Plus,
  UserPlus,
  TicketIcon,
  CheckCircle,
} from 'lucide-react';

// TypeScript interfaces for feed items
interface User {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  isVerified: boolean;
}

interface Event {
  id: string;
  title: string;
  date: string;
  image: string;
  location: string;
  attendees: number;
}

interface Review {
  rating: number;
  comment: string;
}

interface POAP {
  id: string;
  name: string;
  image: string;
  rarity: string;
}

interface BaseFeedItem {
  id: string;
  user: User;
  timestamp: string;
  likes: number;
  comments: number;
}

interface EventCreatedFeedItem extends BaseFeedItem {
  type: 'event_created';
  event: Event;
}

interface EventAttendingFeedItem extends BaseFeedItem {
  type: 'event_attending';
  event: Event;
}

interface EventReviewFeedItem extends BaseFeedItem {
  type: 'event_review';
  event: Event;
  review: Review;
}

interface POAPClaimedFeedItem extends BaseFeedItem {
  type: 'poap_claimed';
  event: Event;
  poap: POAP;
}

interface TicketPurchasedFeedItem extends BaseFeedItem {
  type: 'ticket_purchased';
  event: Event;
}

type FeedItem =
  | EventCreatedFeedItem
  | EventAttendingFeedItem
  | EventReviewFeedItem
  | POAPClaimedFeedItem
  | TicketPurchasedFeedItem;

// Mock social feed activities
const mockFeedItems: FeedItem[] = [
  {
    id: '1',
    type: 'event_created',
    user: {
      id: 'user123',
      username: 'alexchen',
      name: 'Alex Chen',
      avatar: null,
      isVerified: true,
    },
    event: {
      id: 'event1',
      title: 'ETHIndia 2025',
      date: '2025-01-15',
      image: '/card1.png',
      location: 'Bangalore, India',
      attendees: 421,
    },
    timestamp: '2024-12-01T10:30:00',
    likes: 32,
    comments: 8,
  },
  {
    id: '2',
    type: 'event_attending',
    user: {
      id: 'user456',
      username: 'sarah_kim',
      name: 'Sarah Kim',
      avatar: null,
      isVerified: false,
    },
    event: {
      id: 'event1',
      title: 'ETHIndia 2025',
      date: '2025-01-15',
      image: '/card1.png',
      location: 'Bangalore, India',
      attendees: 421,
    },
    timestamp: '2024-12-02T15:45:00',
    likes: 24,
    comments: 3,
  },
  {
    id: '3',
    type: 'event_review',
    user: {
      id: 'user789',
      username: 'michael_r',
      name: 'Michael Rodriguez',
      avatar: null,
      isVerified: true,
    },
    event: {
      id: 'event2',
      title: 'Web3 Delhi Summit',
      date: '2025-02-20',
      image: '/card2.png',
      location: 'New Delhi, India',
      attendees: 1200,
    },
    review: {
      rating: 5,
      comment:
        "One of the best blockchain events I've attended! Great speakers and organization.",
    },
    timestamp: '2024-12-03T09:15:00',
    likes: 47,
    comments: 12,
  },
  {
    id: '4',
    type: 'poap_claimed',
    user: {
      id: 'user101',
      username: 'priya_p',
      name: 'Priya Patel',
      avatar: null,
      isVerified: true,
    },
    event: {
      id: 'event3',
      title: 'Mumbai Blockchain Fest',
      date: '2025-03-10',
      image: '/card3.png',
      location: 'Mumbai, India',
      attendees: 89,
    },
    poap: {
      id: 'poap1',
      name: 'Mumbai Blockchain Fest Attendee',
      image: '/greek_sculpture_5.png',
      rarity: 'rare',
    },
    timestamp: '2024-12-04T14:20:00',
    likes: 56,
    comments: 5,
  },
  {
    id: '5',
    type: 'ticket_purchased',
    user: {
      id: 'user111',
      username: 'ahmed_k',
      name: 'Ahmed Khan',
      avatar: null,
      isVerified: false,
    },
    event: {
      id: 'event4',
      title: 'Chennai NFT Expo',
      date: '2025-04-05',
      image: '/card1.png',
      location: 'Chennai, India',
      attendees: 567,
    },
    timestamp: '2024-12-05T11:10:00',
    likes: 18,
    comments: 2,
  },
];

// Mock suggested accounts to follow
const mockSuggestedAccounts = [
  {
    id: 'user123',
    username: 'alexchen',
    name: 'Alex Chen',
    avatar: null,
    bio: 'Community builder & event organizer',
    isVerified: true,
    mutualConnections: 5,
  },
  {
    id: 'user456',
    username: 'sarah_kim',
    name: 'Sarah Kim',
    avatar: null,
    bio: 'Web3 developer and hackathon enthusiast',
    isVerified: false,
    mutualConnections: 3,
  },
  {
    id: 'user789',
    username: 'michael_r',
    name: 'Michael Rodriguez',
    avatar: null,
    bio: 'Blockchain researcher and speaker',
    isVerified: true,
    mutualConnections: 8,
  },
];

// Mock upcoming events
const mockUpcomingEvents = [
  {
    id: 'event1',
    title: 'ETHIndia 2025',
    date: '2025-01-15',
    image: '/card1.png',
    location: 'Bangalore, India',
    attendees: 421,
  },
  {
    id: 'event2',
    title: 'Web3 Delhi Summit',
    date: '2025-02-20',
    image: '/card2.png',
    location: 'New Delhi, India',
    attendees: 1200,
  },
  {
    id: 'event3',
    title: 'Mumbai Blockchain Fest',
    date: '2025-03-10',
    image: '/card3.png',
    location: 'Mumbai, India',
    attendees: 89,
  },
];

export function SocialFeed() {
  const { isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState('for-you');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isConnected) {
    return (
      <div className='text-center space-y-6 max-w-md mx-auto px-6'>
        <div className='space-y-4'>
          <h1 className='font-primary text-3xl font-bold text-foreground'>
            Connect Your Wallet
          </h1>
          <p className='font-secondary text-muted-foreground'>
            Connect your wallet to see your personalized social feed and
            interact with other users.
          </p>
          <Button size='lg' className='w-full'>
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  const getFeedContent = () => {
    // In a real app, this would filter based on active tab
    // For this demo, we'll just return all items
    return mockFeedItems;
  };

  const renderFeedItem = (item: FeedItem) => {
    switch (item.type) {
      case 'event_created':
        return (
          <Card
            key={item.id}
            className='bg-background border-border/50 rounded-xl'
          >
            <CardContent className='p-6'>
              <div className='flex items-start gap-4 mb-4'>
                <Link href={`/user/${item.user.username}`}>
                  <Avatar className='h-10 w-10'>
                    <AvatarFallback>
                      {item.user.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <Link
                      href={`/user/${item.user.username}`}
                      className='font-primary font-semibold hover:underline'
                    >
                      {item.user.name}
                    </Link>
                    <span className='text-muted-foreground text-sm'>
                      created a new event
                    </span>
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              <Link href={`/events/${item.event.id}`} className='block'>
                <div className='rounded-xl overflow-hidden mb-4'>
                  <div className='relative h-48 w-full'>
                    <Image
                      src={item.event.image}
                      alt={item.event.title}
                      fill
                      className='object-cover'
                    />
                  </div>
                </div>

                <h3 className='font-primary text-lg font-bold mb-2'>
                  {item.event.title}
                </h3>

                <div className='flex items-center gap-6 mb-4'>
                  <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                    <Calendar className='w-4 h-4' />
                    {new Date(item.event.date).toLocaleDateString()}
                  </div>
                  <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                    <MapPin className='w-4 h-4' />
                    {item.event.location}
                  </div>
                  <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                    <Users className='w-4 h-4' />
                    {item.event.attendees} attending
                  </div>
                </div>
              </Link>

              <div className='flex items-center justify-between pt-2 border-t border-border'>
                <div className='flex items-center gap-6'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='gap-1 text-muted-foreground'
                  >
                    <ThumbsUp className='w-4 h-4' />
                    {item.likes}
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='gap-1 text-muted-foreground'
                  >
                    <MessageCircle className='w-4 h-4' />
                    {item.comments}
                  </Button>
                </div>
                <Button variant='ghost' size='sm' className='gap-1'>
                  <Share2 className='w-4 h-4' />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'event_attending':
        return (
          <Card
            key={item.id}
            className='bg-background border-border/50 rounded-xl'
          >
            <CardContent className='p-6'>
              <div className='flex items-start gap-4 mb-4'>
                <Link href={`/user/${item.user.username}`}>
                  <Avatar className='h-10 w-10'>
                    <AvatarFallback>
                      {item.user.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <Link
                      href={`/user/${item.user.username}`}
                      className='font-primary font-semibold hover:underline'
                    >
                      {item.user.name}
                    </Link>
                    <span className='text-muted-foreground text-sm'>
                      is attending
                    </span>
                    <Link
                      href={`/events/${item.event.id}`}
                      className='font-medium hover:underline'
                    >
                      {item.event.title}
                    </Link>
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              <Link href={`/events/${item.event.id}`} className='block'>
                <div className='rounded-xl overflow-hidden mb-4'>
                  <div className='relative h-40 w-full'>
                    <Image
                      src={item.event.image}
                      alt={item.event.title}
                      fill
                      className='object-cover'
                    />
                  </div>
                </div>
              </Link>

              <div className='flex items-center gap-6 mb-4'>
                <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                  <Calendar className='w-4 h-4' />
                  {new Date(item.event.date).toLocaleDateString()}
                </div>
                <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                  <MapPin className='w-4 h-4' />
                  {item.event.location}
                </div>
              </div>

              <div className='flex items-center justify-between pt-2 border-t border-border'>
                <div className='flex items-center gap-6'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='gap-1 text-muted-foreground'
                  >
                    <ThumbsUp className='w-4 h-4' />
                    {item.likes}
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='gap-1 text-muted-foreground'
                  >
                    <MessageCircle className='w-4 h-4' />
                    {item.comments}
                  </Button>
                </div>
                <Button variant='outline' size='sm' className='gap-1'>
                  <TicketIcon className='w-4 h-4' />
                  Get Tickets
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'event_review':
        return (
          <Card
            key={item.id}
            className='bg-background border-border/50 rounded-xl'
          >
            <CardContent className='p-6'>
              <div className='flex items-start gap-4 mb-4'>
                <Link href={`/user/${item.user.username}`}>
                  <Avatar className='h-10 w-10'>
                    <AvatarFallback>
                      {item.user.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <Link
                      href={`/user/${item.user.username}`}
                      className='font-primary font-semibold hover:underline'
                    >
                      {item.user.name}
                    </Link>
                    <span className='text-muted-foreground text-sm'>
                      reviewed
                    </span>
                    <Link
                      href={`/events/${item.event.id}`}
                      className='font-medium hover:underline'
                    >
                      {item.event.title}
                    </Link>
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className='bg-muted/30 rounded-xl p-4 mb-4'>
                <div className='flex mb-2'>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < item.review.rating
                          ? 'fill-warning text-warning'
                          : 'fill-muted text-muted'
                      }`}
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                    >
                      <path d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' />
                    </svg>
                  ))}
                </div>
                <p className='text-sm text-muted-foreground'>
                  {item.review.comment}
                </p>
              </div>

              <Link href={`/events/${item.event.id}`} className='block mb-3'>
                <div className='flex items-center gap-4'>
                  <div className='w-16 h-16 relative rounded-md overflow-hidden'>
                    <Image
                      src={item.event.image}
                      alt={item.event.title}
                      fill
                      className='object-cover'
                    />
                  </div>
                  <div>
                    <h3 className='font-primary font-medium'>
                      {item.event.title}
                    </h3>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <Calendar className='w-3 h-3' />
                      {new Date(item.event.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>

              <div className='flex items-center justify-between pt-2 border-t border-border'>
                <div className='flex items-center gap-6'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='gap-1 text-muted-foreground'
                  >
                    <ThumbsUp className='w-4 h-4' />
                    {item.likes}
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='gap-1 text-muted-foreground'
                  >
                    <MessageCircle className='w-4 h-4' />
                    {item.comments}
                  </Button>
                </div>
                <Button variant='ghost' size='sm' className='gap-1'>
                  <Share2 className='w-4 h-4' />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'poap_claimed':
        return (
          <Card
            key={item.id}
            className='bg-background border-border/50 rounded-xl'
          >
            <CardContent className='p-6'>
              <div className='flex items-start gap-4 mb-4'>
                <Link href={`/user/${item.user.username}`}>
                  <Avatar className='h-10 w-10'>
                    <AvatarFallback>
                      {item.user.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <Link
                      href={`/user/${item.user.username}`}
                      className='font-primary font-semibold hover:underline'
                    >
                      {item.user.name}
                    </Link>
                    <span className='text-muted-foreground text-sm'>
                      claimed a POAP for attending
                    </span>
                    <Link
                      href={`/events/${item.event.id}`}
                      className='font-medium hover:underline'
                    >
                      {item.event.title}
                    </Link>
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className='flex justify-center mb-4'>
                <div className='w-40 h-40 relative'>
                  <Image
                    src={item.poap.image}
                    alt={item.poap.name}
                    fill
                    className='object-contain'
                  />
                  <div className='absolute top-0 right-0'>
                    <Badge
                      className={`bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg`}
                    >
                      {item.poap.rarity}
                    </Badge>
                  </div>
                </div>
              </div>

              <h3 className='font-primary text-center text-lg font-bold mb-4'>
                {item.poap.name}
              </h3>

              <div className='flex items-center justify-between pt-2 border-t border-border'>
                <div className='flex items-center gap-6'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='gap-1 text-muted-foreground'
                  >
                    <ThumbsUp className='w-4 h-4' />
                    {item.likes}
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='gap-1 text-muted-foreground'
                  >
                    <MessageCircle className='w-4 h-4' />
                    {item.comments}
                  </Button>
                </div>
                <Link href='/poaps'>
                  <Button variant='ghost' size='sm' className='gap-1'>
                    <Plus className='w-4 h-4' />
                    View Collection
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );

      case 'ticket_purchased':
        return (
          <Card
            key={item.id}
            className='bg-background border-border/50 rounded-xl'
          >
            <CardContent className='p-6'>
              <div className='flex items-start gap-4 mb-4'>
                <Link href={`/user/${item.user.username}`}>
                  <Avatar className='h-10 w-10'>
                    <AvatarFallback>
                      {item.user.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                </Link>

                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <Link
                      href={`/user/${item.user.username}`}
                      className='font-primary font-semibold hover:underline'
                    >
                      {item.user.name}
                    </Link>
                    <span className='text-muted-foreground text-sm'>
                      purchased tickets for
                    </span>
                    <Link
                      href={`/events/${item.event.id}`}
                      className='font-medium hover:underline'
                    >
                      {item.event.title}
                    </Link>
                  </div>
                  <div className='text-xs text-muted-foreground'>
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              <Link href={`/events/${item.event.id}`} className='block'>
                <div className='flex items-center gap-4'>
                  <div className='w-16 h-16 relative rounded-md overflow-hidden'>
                    <Image
                      src={item.event.image}
                      alt={item.event.title}
                      fill
                      className='object-cover'
                    />
                  </div>
                  <div>
                    <h3 className='font-primary font-medium'>
                      {item.event.title}
                    </h3>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <Calendar className='w-3 h-3' />
                      {new Date(item.event.date).toLocaleDateString()}
                    </div>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <MapPin className='w-3 h-3' />
                      {item.event.location}
                    </div>
                  </div>
                </div>
              </Link>

              <div className='flex items-center justify-between pt-4 mt-4 border-t border-border'>
                <div className='flex items-center gap-6'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='gap-1 text-muted-foreground'
                  >
                    <ThumbsUp className='w-4 h-4' />
                    {item.likes}
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='gap-1 text-muted-foreground'
                  >
                    <MessageCircle className='w-4 h-4' />
                    {item.comments}
                  </Button>
                </div>
                <Button variant='ghost' size='sm' className='gap-1'>
                  <Share2 className='w-4 h-4' />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className='container mx-auto px-6 max-w-6xl py-8'>
      {/* Header */}
      <div className='flex flex-col md:flex-row gap-6 md:items-center justify-between mb-8'>
        <div>
          <h1 className='font-primary text-3xl font-bold text-foreground tracking-tight mb-2'>
            Social Feed
          </h1>
          <p className='font-secondary text-muted-foreground'>
            See what&apos;s happening in your web3 events community
          </p>
        </div>
      </div>

      {/* Main content with sidebar */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Main feed */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Feed tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='grid w-full grid-cols-3 mb-6 rounded-xl border-2 border-border bg-background/50 backdrop-blur-sm p-1 h-12'>
              <TabsTrigger
                className='font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200'
                value='for-you'
              >
                For You
              </TabsTrigger>
              <TabsTrigger
                className='font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200'
                value='following'
              >
                Following
              </TabsTrigger>
              <TabsTrigger
                className='font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200'
                value='trending'
              >
                Trending
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Feed content */}
          <div className='space-y-6'>
            {getFeedContent().map(item => renderFeedItem(item))}
          </div>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Search */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
            <Input
              placeholder='Search events, users...'
              className='pl-10'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Suggested accounts */}
          <Card className='bg-background border-border/50 rounded-xl'>
            <CardHeader className='pb-0'>
              <CardTitle className='text-lg'>Who to Follow</CardTitle>
            </CardHeader>
            <CardContent className='p-6'>
              <div className='space-y-4'>
                {mockSuggestedAccounts.map(account => (
                  <div
                    key={account.id}
                    className='flex items-center justify-between'
                  >
                    <div className='flex items-center gap-3'>
                      <Link href={`/user/${account.username}`}>
                        <Avatar className='h-10 w-10'>
                          <AvatarFallback>
                            {account.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div>
                        <div className='flex items-center gap-1'>
                          <Link
                            href={`/user/${account.username}`}
                            className='font-primary font-semibold text-sm hover:underline'
                          >
                            {account.name}
                          </Link>
                          {account.isVerified && (
                            <CheckCircle className='w-3 h-3 text-success' />
                          )}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          @{account.username}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          {account.mutualConnections} mutual connections
                        </div>
                      </div>
                    </div>
                    <Button variant='outline' size='sm' className='h-8 gap-1'>
                      <UserPlus className='w-3 h-3' />
                      <span>Follow</span>
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant='link' size='sm' className='mt-2 mx-auto block'>
                View More
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming events */}
          <Card className='bg-background border-border/50 rounded-xl'>
            <CardHeader className='pb-0'>
              <CardTitle className='text-lg'>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className='p-6'>
              <div className='space-y-4'>
                {mockUpcomingEvents.map(event => (
                  <Link
                    href={`/events/${event.id}`}
                    key={event.id}
                    className='block hover:bg-muted/20 p-2 rounded-md -mx-2'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='w-14 h-14 relative rounded-md overflow-hidden'>
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className='object-cover'
                        />
                      </div>
                      <div>
                        <div className='font-primary font-medium text-sm'>
                          {event.title}
                        </div>
                        <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                          <Calendar className='w-3 h-3' />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                          <Users className='w-3 h-3' />
                          {event.attendees} attending
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Button variant='link' size='sm' className='mt-2 mx-auto block'>
                View More
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
