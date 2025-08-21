'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/empty-state';
import { FadeIn } from '@/components/ui/fade-in';
import { useWallet } from '@/lib/hooks/use-wallet';
import {
  Search,
  Grid,
  List,
  Award,
  Share2,
  Calendar,
  Info,
  ExternalLink,
  Instagram,
  Twitter,
  Facebook,
  Copy,
  Check,
  Trophy,
  CalendarDays,
} from 'lucide-react';
import { POAPCard3D } from '@/components/poap/poap-card-3d';
import { POAPCalendarView } from '@/components/poap/poap-calendar-view';
import { POAPTrophyRoom } from '@/components/poap/poap-trophy-room';
import Image from 'next/image';

interface POAPCollectionProps {
  username?: string;
}

// Mock POAPs
const mockPOAPs = [
  {
    id: 1,
    name: 'ETH Denver 2024',
    image: '/greek_sculpture_1.png',
    rarity: 'rare',
    date: '2024-02-28',
    event: 'ETH Denver 2024',
    description:
      'This POAP was awarded to attendees of ETH Denver 2024, one of the largest Ethereum hackathons in the world.',
    totalMinted: 2500,
    attributes: [
      { trait: 'Event Type', value: 'Hackathon' },
      { trait: 'Location', value: 'Denver, USA' },
      { trait: 'Year', value: '2024' },
    ],
    mintNumber: 458,
  },
  {
    id: 2,
    name: 'DevCon VI Attendee',
    image: '/greek_sculpture_2.png',
    rarity: 'common',
    date: '2024-01-15',
    event: 'DevCon VI',
    description:
      'Official POAP for all attendees of DevCon VI in Colombia, the annual Ethereum developers conference.',
    totalMinted: 8500,
    attributes: [
      { trait: 'Event Type', value: 'Conference' },
      { trait: 'Location', value: 'Bogota, Colombia' },
      { trait: 'Year', value: '2024' },
    ],
    mintNumber: 1245,
  },
  {
    id: 3,
    name: 'Web3 Summit Speaker',
    image: '/greek_sculpture_3.png',
    rarity: 'legendary',
    date: '2024-03-10',
    event: 'Web3 Summit 2024',
    description:
      'Exclusive POAP awarded only to speakers at the 2024 Web3 Summit in Berlin.',
    totalMinted: 85,
    attributes: [
      { trait: 'Event Type', value: 'Speaker' },
      { trait: 'Location', value: 'Berlin, Germany' },
      { trait: 'Year', value: '2024' },
    ],
    mintNumber: 23,
  },
  {
    id: 4,
    name: 'NFT.NYC Early Bird',
    image: '/greek_sculpture_4.png',
    rarity: 'uncommon',
    date: '2024-04-02',
    event: 'NFT.NYC 2024',
    description:
      "POAP for early bird ticket holders to NFT.NYC 2024, the world's leading NFT event.",
    totalMinted: 1200,
    attributes: [
      { trait: 'Event Type', value: 'Conference' },
      { trait: 'Location', value: 'New York, USA' },
      { trait: 'Year', value: '2024' },
    ],
    mintNumber: 78,
  },
  {
    id: 5,
    name: 'ETHIndia 2023 Hacker',
    image: '/greek_sculpture_5.png',
    rarity: 'rare',
    date: '2023-12-08',
    event: 'ETHIndia 2023',
    description:
      "POAP awarded to all hackers who participated in ETHIndia 2023, Asia's biggest Ethereum hackathon.",
    totalMinted: 3000,
    attributes: [
      { trait: 'Event Type', value: 'Hackathon' },
      { trait: 'Location', value: 'Bangalore, India' },
      { trait: 'Year', value: '2023' },
    ],
    mintNumber: 1502,
  },
  {
    id: 6,
    name: 'Avalanche Summit Winner',
    image: '/greek_sculpture_6.png',
    rarity: 'legendary',
    date: '2024-02-15',
    event: 'Avalanche Summit II',
    description:
      'Exclusive POAP awarded only to winners of the Avalanche Summit II hackathon.',
    totalMinted: 50,
    attributes: [
      { trait: 'Event Type', value: 'Hackathon Winner' },
      { trait: 'Location', value: 'Barcelona, Spain' },
      { trait: 'Year', value: '2024' },
    ],
    mintNumber: 7,
  },
  {
    id: 7,
    name: 'ETH Amsterdam Attendee',
    image: '/greek_sculpture_7.png',
    rarity: 'common',
    date: '2024-04-20',
    event: 'ETH Amsterdam',
    description:
      'POAP for all attendees of ETH Amsterdam 2024, a premier Ethereum community event.',
    totalMinted: 5000,
    attributes: [
      { trait: 'Event Type', value: 'Conference' },
      { trait: 'Location', value: 'Amsterdam, Netherlands' },
      { trait: 'Year', value: '2024' },
    ],
    mintNumber: 2145,
  },
  {
    id: 8,
    name: 'Token2049 VIP',
    image: '/greek_sculpture_8.png',
    rarity: 'rare',
    date: '2023-09-18',
    event: 'Token2049 Singapore',
    description:
      "Exclusive POAP for VIP attendees of Token2049 Singapore, one of Asia's premier crypto events.",
    totalMinted: 500,
    attributes: [
      { trait: 'Event Type', value: 'Conference' },
      { trait: 'Location', value: 'Singapore' },
      { trait: 'Year', value: '2023' },
    ],
    mintNumber: 122,
  },
  {
    id: 9,
    name: 'NFT Paris 2024',
    image: '/greek_sculpture_9.png',
    rarity: 'common',
    date: '2024-02-24',
    event: 'NFT Paris',
    description:
      "POAP awarded to all attendees of NFT Paris 2024, Europe's largest NFT event.",
    totalMinted: 4500,
    attributes: [
      { trait: 'Event Type', value: 'Conference' },
      { trait: 'Location', value: 'Paris, France' },
      { trait: 'Year', value: '2024' },
    ],
    mintNumber: 3012,
  },
  {
    id: 10,
    name: 'ETHGlobal London Winner',
    image: '/greek_sculpture_10.png',
    rarity: 'legendary',
    date: '2024-03-15',
    event: 'ETHGlobal London',
    description:
      'Exclusive POAP awarded only to winners of the ETHGlobal London hackathon.',
    totalMinted: 40,
    attributes: [
      { trait: 'Event Type', value: 'Hackathon Winner' },
      { trait: 'Location', value: 'London, UK' },
      { trait: 'Year', value: '2024' },
    ],
    mintNumber: 12,
  },
];

// Helper function to calculate rarity percentage
const calculateRarity = (mintNumber: number, totalMinted: number) => {
  const percentage = (mintNumber / totalMinted) * 100;
  return Math.min(percentage, 100).toFixed(1);
};

// Helper function to get badge color for rarity
const getRarityStyles = (rarity: string) => {
  switch (rarity) {
    case 'legendary':
      return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg';
    case 'rare':
      return 'bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg';
    case 'uncommon':
      return 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg';
    default:
      return 'bg-gradient-to-r from-gray-400 to-slate-500 text-white shadow-lg';
  }
};

export function POAPCollection({ username }: POAPCollectionProps) {
  const { isConnected } = useWallet();
  const [displayMode, setDisplayMode] = useState<'grid' | 'list' | 'calendar'>(
    'grid'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRarity, setFilterRarity] = useState<string | null>(null);
  const [selectedPOAP, setSelectedPOAP] = useState<{
    id: number;
    name: string;
    event: string;
    rarity: string;
    image: string;
    date: string;
    description: string;
    totalMinted: number;
    attributes: Array<{ trait: string; value: string }>;
    mintNumber: number;
  } | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isTrophyRoomOpen, setIsTrophyRoomOpen] = useState(false);

  // If no wallet is connected and no username is provided, show connect wallet prompt
  const isPersonalView = !username;

  if (isPersonalView && !isConnected) {
    return (
      <div className='text-center space-y-6 max-w-md mx-auto px-6'>
        <div className='space-y-4'>
          <h1 className='font-primary text-3xl font-bold text-foreground'>
            Connect Your Wallet
          </h1>
          <p className='font-secondary text-muted-foreground'>
            Connect your wallet to view your POAP collection.
          </p>
          <Button size='lg' className='w-full'>
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  // Filter POAPs based on search and rarity
  const filteredPOAPs = mockPOAPs.filter(poap => {
    const matchesSearch =
      searchQuery === '' ||
      poap.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poap.event.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRarity = filterRarity === null || poap.rarity === filterRarity;

    return matchesSearch && matchesRarity;
  });

  // Handler for opening details dialog
  const handleOpenDetails = (poap: {
    id: number;
    name: string;
    event: string;
    rarity: string;
    image: string;
    date: string;
    description: string;
    totalMinted: number;
    attributes: Array<{ trait: string; value: string }>;
    mintNumber: number;
  }) => {
    setSelectedPOAP(poap);
    setIsDetailDialogOpen(true);
  };

  // Handler for opening share dialog
  const handleShare = (poap: {
    id: number;
    name: string;
    event: string;
    rarity: string;
    image: string;
    date: string;
    description: string;
    totalMinted: number;
    attributes: Array<{ trait: string; value: string }>;
    mintNumber: number;
  }) => {
    setSelectedPOAP(poap);
    setIsShareDialogOpen(true);
  };

  // Handler for copying link
  const handleCopyLink = () => {
    if (selectedPOAP) {
      navigator.clipboard.writeText(
        `https://festos.io/poap/${selectedPOAP.id}`
      );
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
    }
  };

  const collectionStats = {
    total: mockPOAPs.length,
    legendary: mockPOAPs.filter(p => p.rarity === 'legendary').length,
    rare: mockPOAPs.filter(p => p.rarity === 'rare').length,
    uncommon: mockPOAPs.filter(p => p.rarity === 'uncommon').length,
    common: mockPOAPs.filter(p => p.rarity === 'common').length,
  };

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h2 className='font-primary text-2xl font-bold text-foreground'>
            {isPersonalView ? 'My POAP Collection' : `${username}'s POAPs`}
          </h2>
          <p className='font-secondary text-sm text-muted-foreground'>
            Proof of Attendance Protocol tokens collected from events
          </p>
        </div>
        <div className='flex items-center gap-3 flex-wrap justify-end'>
          <Tabs
            value={displayMode}
            onValueChange={value =>
              setDisplayMode(value as 'grid' | 'list' | 'calendar')
            }
            className='border rounded-lg p-1 bg-muted/10'
          >
            <TabsList className='bg-transparent'>
              <TabsTrigger
                value='grid'
                className='rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm h-8 w-8 p-0'
                aria-label='Grid View'
              >
                <Grid className='h-4 w-4' />
              </TabsTrigger>
              <TabsTrigger
                value='list'
                className='rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm h-8 w-8 p-0'
                aria-label='List View'
              >
                <List className='h-4 w-4' />
              </TabsTrigger>
              <TabsTrigger
                value='calendar'
                className='rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm h-8 w-8 p-0'
                aria-label='Calendar View'
              >
                <CalendarDays className='h-4 w-4' />
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant='outline'
            size='sm'
            className='gap-2'
            onClick={() => {
              // Show trophy room if there are legendary POAPs
              const legendaryPoaps = mockPOAPs.filter(
                poap => poap.rarity === 'legendary'
              );
              if (legendaryPoaps.length > 0) {
                setIsTrophyRoomOpen(true);
              }
            }}
          >
            <Trophy className='w-4 h-4' />
            Trophy Room
          </Button>
          <Button variant='outline' size='sm' className='gap-2'>
            <Award className='w-4 h-4' />
            By Rarity
          </Button>
        </div>
      </div>

      {/* Collection Stats */}
      <div className='grid grid-cols-2 sm:grid-cols-5 gap-4'>
        <Card className='bg-background border-border/50 rounded-xl'>
          <CardContent className='p-4 text-center'>
            <div className='font-primary text-2xl font-bold text-foreground mb-1'>
              {collectionStats.total}
            </div>
            <div className='font-secondary text-xs text-muted-foreground'>
              Total POAPs
            </div>
          </CardContent>
        </Card>

        <Card className='bg-background border-border/50 rounded-xl'>
          <CardContent className='p-4 text-center'>
            <div className='font-primary text-2xl font-bold text-yellow-500 mb-1'>
              {collectionStats.legendary}
            </div>
            <div className='font-secondary text-xs text-muted-foreground'>
              Legendary
            </div>
          </CardContent>
        </Card>

        <Card className='bg-background border-border/50 rounded-xl'>
          <CardContent className='p-4 text-center'>
            <div className='font-primary text-2xl font-bold text-purple-500 mb-1'>
              {collectionStats.rare}
            </div>
            <div className='font-secondary text-xs text-muted-foreground'>
              Rare
            </div>
          </CardContent>
        </Card>

        <Card className='bg-background border-border/50 rounded-xl'>
          <CardContent className='p-4 text-center'>
            <div className='font-primary text-2xl font-bold text-blue-500 mb-1'>
              {collectionStats.uncommon}
            </div>
            <div className='font-secondary text-xs text-muted-foreground'>
              Uncommon
            </div>
          </CardContent>
        </Card>

        <Card className='bg-background border-border/50 rounded-xl'>
          <CardContent className='p-4 text-center'>
            <div className='font-primary text-2xl font-bold text-gray-500 mb-1'>
              {collectionStats.common}
            </div>
            <div className='font-secondary text-xs text-muted-foreground'>
              Common
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and filters */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-grow'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <Input
            placeholder='Search by name or event...'
            className='pl-10'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className='flex items-center gap-3'>
          <Tabs
            value={filterRarity || 'all'}
            onValueChange={value =>
              setFilterRarity(value === 'all' ? null : value)
            }
            className='border rounded-lg p-1 bg-muted/10'
          >
            <TabsList className='bg-transparent'>
              <TabsTrigger
                value='all'
                className='rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1 h-8'
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value='legendary'
                className='rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1 h-8'
              >
                Legendary
              </TabsTrigger>
              <TabsTrigger
                value='rare'
                className='rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1 h-8'
              >
                Rare
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* POAPs Collection */}
      {filteredPOAPs.length > 0 ? (
        <FadeIn variant='up' timing='normal'>
          {displayMode === 'calendar' ? (
            <POAPCalendarView
              poaps={filteredPOAPs}
              onOpenDetails={handleOpenDetails}
              onShare={handleShare}
            />
          ) : displayMode === 'grid' ? (
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
              {filteredPOAPs.map(poap => (
                <POAPCard3D
                  key={poap.id}
                  poap={poap}
                  onOpenDetails={handleOpenDetails}
                  onShare={handleShare}
                />
              ))}
            </div>
          ) : (
            <div className='space-y-4'>
              {filteredPOAPs.map(poap => (
                <Card
                  key={poap.id}
                  className='overflow-hidden rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out hover:scale-[1.01]'
                >
                  <div className='flex flex-col sm:flex-row'>
                    <div className='sm:w-32 h-32 relative'>
                      <Image
                        src={poap.image}
                        alt={poap.name}
                        fill
                        className='object-cover'
                      />
                    </div>
                    <CardContent className='p-4 flex-1'>
                      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2'>
                        <div className='flex-1'>
                          <h4 className='font-primary font-semibold text-foreground'>
                            {poap.name}
                          </h4>
                          <div className='font-secondary text-xs text-muted-foreground flex items-center gap-1'>
                            <Calendar className='w-3 h-3' />
                            {new Date(poap.date).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge className={getRarityStyles(poap.rarity)}>
                          <Award className='w-3 h-3 mr-1' />
                          {poap.rarity}
                        </Badge>
                      </div>

                      <p className='text-sm text-muted-foreground line-clamp-2 mb-3'>
                        {poap.description}
                      </p>

                      <div className='flex items-center justify-between text-xs'>
                        <div className='flex items-center gap-4'>
                          <span>
                            <span className='text-muted-foreground mr-1'>
                              Mint:
                            </span>
                            #{poap.mintNumber}/{poap.totalMinted}
                          </span>
                          <span>
                            <span className='text-muted-foreground mr-1'>
                              Rarity:
                            </span>
                            {calculateRarity(poap.mintNumber, poap.totalMinted)}
                            %
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            className='gap-1'
                            onClick={() => handleOpenDetails(poap)}
                          >
                            <Info className='w-3 h-3' />
                            Details
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            className='gap-1'
                            onClick={() => handleShare(poap)}
                          >
                            <Share2 className='w-3 h-3' />
                            Share
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </FadeIn>
      ) : (
        <EmptyState
          title='No POAPs found'
          description={
            searchQuery || filterRarity
              ? 'Try adjusting your search or filters.'
              : isPersonalView
                ? "You haven't collected any POAPs yet. Attend events to earn POAPs!"
                : `${username} hasn't collected any POAPs yet.`
          }
          action={
            searchQuery || filterRarity
              ? {
                  label: 'Reset filters',
                  onClick: () => {
                    setSearchQuery('');
                    setFilterRarity(null);
                  },
                }
              : isPersonalView
                ? {
                    label: 'Discover Events',
                    href: '/discover',
                    icon: <Search className='w-4 h-4' />,
                  }
                : undefined
          }
        />
      )}

      {/* POAP Details Dialog */}
      {selectedPOAP && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className='sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                <span>{selectedPOAP.name}</span>
                <Badge className={getRarityStyles(selectedPOAP.rarity)}>
                  {selectedPOAP.rarity}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='relative aspect-square rounded-lg overflow-hidden'>
                <Image
                  src={selectedPOAP.image}
                  alt={selectedPOAP.name}
                  fill
                  className='object-cover'
                />
              </div>

              <div className='space-y-4'>
                <div>
                  <h3 className='text-lg font-semibold mb-1'>
                    {selectedPOAP.event}
                  </h3>
                  <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                    <Calendar className='w-4 h-4' />
                    {new Date(selectedPOAP.date).toLocaleDateString()}
                  </div>
                </div>

                <p className='text-sm text-muted-foreground'>
                  {selectedPOAP.description}
                </p>

                <div className='space-y-1'>
                  <div className='text-sm font-medium'>Rarity & Mint</div>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>Mint Number</span>
                    <span className='font-medium'>
                      #{selectedPOAP.mintNumber}
                    </span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>Total Minted</span>
                    <span>{selectedPOAP.totalMinted}</span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground'>Rarity Score</span>
                    <span className='font-medium'>
                      {calculateRarity(
                        selectedPOAP.mintNumber,
                        selectedPOAP.totalMinted
                      )}
                      %
                    </span>
                  </div>
                </div>

                <div className='border-t border-border pt-4'>
                  <div className='text-sm font-medium mb-2'>Attributes</div>
                  <div className='grid grid-cols-2 gap-2'>
                    {selectedPOAP.attributes.map(
                      (attr: { trait: string; value: string }, i: number) => (
                        <div
                          key={i}
                          className='bg-muted/30 rounded-md p-2 text-sm'
                        >
                          <div className='text-muted-foreground text-xs'>
                            {attr.trait}
                          </div>
                          <div className='font-medium'>{attr.value}</div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className='flex justify-end gap-3 mt-4'>
              <Button
                variant='outline'
                className='gap-2'
                onClick={() => {
                  setIsDetailDialogOpen(false);
                  handleShare(selectedPOAP);
                }}
              >
                <Share2 className='w-4 h-4' />
                Share
              </Button>
              <a
                href={`https://poap.xyz/scan/${selectedPOAP.id}`}
                target='_blank'
                rel='noopener noreferrer'
              >
                <Button className='gap-2'>
                  <ExternalLink className='w-4 h-4' />
                  View on POAP.xyz
                </Button>
              </a>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Share POAP Dialog */}
      {selectedPOAP && (
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent className='sm:max-w-[400px]'>
            <DialogHeader>
              <DialogTitle>Share this POAP</DialogTitle>
            </DialogHeader>
            <div className='space-y-6'>
              <div className='flex justify-center'>
                <div className='relative w-48 h-48 rounded-lg overflow-hidden'>
                  <Image
                    src={selectedPOAP.image}
                    alt={selectedPOAP.name}
                    fill
                    className='object-cover'
                  />
                </div>
              </div>

              <div className='text-center'>
                <h3 className='font-primary font-semibold text-lg mb-1'>
                  {selectedPOAP.name}
                </h3>
                <p className='text-sm text-muted-foreground'>
                  {selectedPOAP.event}
                </p>
              </div>

              <div className='flex flex-col gap-3'>
                <div className='grid grid-cols-4 gap-3'>
                  <Button
                    variant='outline'
                    size='icon'
                    className='h-12 w-full rounded-xl'
                  >
                    <Twitter className='h-5 w-5' />
                  </Button>
                  <Button
                    variant='outline'
                    size='icon'
                    className='h-12 w-full rounded-xl'
                  >
                    <Facebook className='h-5 w-5' />
                  </Button>
                  <Button
                    variant='outline'
                    size='icon'
                    className='h-12 w-full rounded-xl'
                  >
                    <Instagram className='h-5 w-5' />
                  </Button>
                  <Button
                    variant='outline'
                    size='icon'
                    className='h-12 w-full rounded-xl relative'
                    onClick={handleCopyLink}
                  >
                    {isLinkCopied ? (
                      <Check className='h-5 w-5 text-success' />
                    ) : (
                      <Copy className='h-5 w-5' />
                    )}
                  </Button>
                </div>

                <div className='relative'>
                  <Input
                    value={`https://festos.io/poap/${selectedPOAP.id}`}
                    readOnly
                    className='pr-24'
                  />
                  <Button
                    className='absolute right-1 top-1 h-8'
                    onClick={handleCopyLink}
                  >
                    {isLinkCopied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Trophy Room Modal */}
      {isTrophyRoomOpen && (
        <POAPTrophyRoom
          poaps={mockPOAPs}
          onClose={() => setIsTrophyRoomOpen(false)}
          onSelectPOAP={poap => {
            setSelectedPOAP(poap);
            setIsTrophyRoomOpen(false);
            setIsDetailDialogOpen(true);
          }}
        />
      )}
    </div>
  );
}
