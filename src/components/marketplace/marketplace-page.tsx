'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { EmptyState } from '@/components/empty-state';
import { TicketListingDialog } from './ticket-listing-dialog';
import { TicketPurchaseDialog } from './ticket-purchase-dialog';
import { useTickets } from '@/lib/hooks/use-tickets';
import { useWallet } from '@/lib/hooks/use-wallet';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Star,
  Eye,
  Clock,
  ArrowRight,
  Plus,
  ShoppingCart,
  Wallet,
} from 'lucide-react';

interface Listing {
  id: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventImage: string;
  price: string;
  originalPrice: string;
  ticketType: string;
  category: string;
  verified: boolean;
  expiresIn: string;
  sellerAddress: string;
  views: number;
}

export function MarketplacePage() {
  const { isConnected } = useWallet();
  const { listings } = useTickets();

  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [priceRange, setPriceRange] = useState([0, 0.5]);

  // Filter listings based on search query
  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      const matchesSearch =
        !searchQuery ||
        listing.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.eventLocation
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        listing.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [listings, searchQuery]);

  const handlePurchase = (listing: Listing) => {
    setSelectedListing(listing);
    setIsPurchaseDialogOpen(true);
  };

  return (
    <div className='container mx-auto px-6 max-w-6xl py-8'>
      {/* Header */}
      <div className='flex flex-col md:flex-row gap-6 md:items-center justify-between mb-8'>
        <div>
          <h1 className='font-primary text-3xl font-bold text-foreground tracking-tight mb-2'>
            NFT Ticket Marketplace
          </h1>
          <p className='font-secondary text-muted-foreground'>
            Buy and sell event tickets securely on our verified marketplace
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <Button
            className='gap-2 font-secondary rounded-lg'
            onClick={() => setIsSellDialogOpen(true)}
          >
            <Plus className='w-4 h-4' />
            Sell My Ticket
          </Button>

          {isConnected && (
            <Link href='/marketplace/history'>
              <Button
                variant='outline'
                className='gap-2 bg-transparent font-secondary rounded-lg'
              >
                <Eye className='w-4 h-4' />
                Purchase History
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      {isConnected ? (
        <div className='w-full'>
          <div className='grid w-full grid-cols-3 mb-8 rounded-xl border-2 border-border bg-background/50 backdrop-blur-sm p-1 h-12'>
            <Button
              className='font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200'
              onClick={() => setActiveTab('browse')}
              variant={activeTab === 'browse' ? 'default' : 'outline'}
            >
              Browse Marketplace
            </Button>
            <Button
              className='font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200'
              onClick={() => setActiveTab('my-listings')}
              variant={activeTab === 'my-listings' ? 'default' : 'outline'}
            >
              My Listings
            </Button>
            <Button
              className='font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200'
              onClick={() => setActiveTab('watchlist')}
              variant={activeTab === 'watchlist' ? 'default' : 'outline'}
            >
              Watchlist
            </Button>
          </div>

          {/* Browse Tab */}
          <div className='space-y-6'>
            {/* Search and filters */}
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='relative flex-grow'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                <Input
                  placeholder='Search events, categories, or locations...'
                  className='pl-10'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className='flex gap-3'>
                <Button
                  variant='outline'
                  size='sm'
                  className='gap-2'
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className='h-4 w-4' />
                  Filters
                </Button>
                <Button variant='outline' size='sm' className='gap-2'>
                  <ArrowRight className='h-4 w-4' />
                  Sort
                </Button>
              </div>
            </div>

            {/* Filter panel */}
            {showFilters && (
              <Card className='bg-background border-border/50 rounded-xl'>
                <CardContent className='p-6'>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <div className='space-y-3'>
                      <h3 className='font-primary text-sm font-medium'>
                        Price Range (ETH)
                      </h3>
                      <div className='px-2'>
                        <Slider
                          defaultValue={[priceRange[0], priceRange[1]]}
                          max={0.5}
                          step={0.01}
                          onValueChange={value =>
                            setPriceRange(value as [number, number])
                          }
                        />
                      </div>
                      <div className='flex items-center justify-between text-sm pt-2'>
                        <div>{priceRange[0]} ETH</div>
                        <div>{priceRange[1]} ETH</div>
                      </div>
                    </div>

                    <div className='space-y-3'>
                      <h3 className='font-primary text-sm font-medium'>
                        Event Categories
                      </h3>
                      <div className='space-y-2'>
                        {['Tech', 'Conference', 'Music', 'Art', 'Sports'].map(
                          category => (
                            <div
                              key={category}
                              className='flex items-center space-x-2'
                            >
                              <input
                                type='checkbox'
                                id={category}
                                className='h-4 w-4'
                              />
                              <label htmlFor={category} className='text-sm'>
                                {category}
                              </label>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className='space-y-3'>
                      <h3 className='font-primary text-sm font-medium'>
                        Ticket Type
                      </h3>
                      <div className='space-y-2'>
                        {['General', 'VIP', 'Early Bird', 'Premium'].map(
                          type => (
                            <div
                              key={type}
                              className='flex items-center space-x-2'
                            >
                              <input
                                type='checkbox'
                                id={type}
                                className='h-4 w-4'
                              />
                              <label htmlFor={type} className='text-sm'>
                                {type}
                              </label>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='flex justify-end mt-6'>
                    <Button variant='outline' size='sm' className='mr-2'>
                      Reset
                    </Button>
                    <Button size='sm'>Apply Filters</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Featured Listings */}
            <div className='mb-8'>
              <h2 className='font-primary text-2xl font-bold text-foreground mb-4'>
                Featured Listings
              </h2>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {filteredListings.slice(0, 3).map(listing => (
                  <Card
                    key={`featured-${listing.id}`}
                    className='overflow-hidden group rounded-xl border border-primary/30 bg-primary/5 shadow-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1'
                  >
                    <div className='relative'>
                      <Image
                        src={listing.eventImage}
                        alt={listing.eventName}
                        width={400}
                        height={200}
                        className='w-full h-48 object-cover transition-transform duration-300 ease-out group-hover:scale-105'
                      />
                      <Badge className='absolute top-3 right-3 bg-primary/80 text-primary-foreground'>
                        Featured
                      </Badge>
                      {listing.verified && (
                        <Badge className='absolute top-3 left-3 bg-background text-foreground border-border'>
                          <Star className='w-3 h-3 mr-1' /> Verified
                        </Badge>
                      )}
                    </div>
                    <CardContent className='p-5 space-y-4'>
                      <div>
                        <h3 className='font-primary text-lg font-bold text-foreground mb-1'>
                          {listing.eventName}
                        </h3>
                        <div className='flex items-center gap-2 mb-1'>
                          <Calendar className='w-4 h-4 text-muted-foreground' />
                          <span className='text-sm text-muted-foreground'>
                            {new Date(listing.eventDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <MapPin className='w-4 h-4 text-muted-foreground' />
                          <span className='text-sm text-muted-foreground'>
                            {listing.eventLocation}
                          </span>
                        </div>
                      </div>

                      <div className='flex items-center justify-between'>
                        <div>
                          <div className='font-primary text-xl font-bold text-foreground'>
                            {listing.price}
                          </div>
                          {listing.price !== listing.originalPrice && (
                            <div className='text-xs text-muted-foreground'>
                              Original: {listing.originalPrice}
                            </div>
                          )}
                        </div>
                        <Badge
                          variant='outline'
                          className='border-primary/30 text-primary bg-primary/10'
                        >
                          {listing.ticketType}
                        </Badge>
                      </div>

                      <div className='flex items-center justify-between text-sm'>
                        <div className='flex items-center gap-1 text-muted-foreground'>
                          <Clock className='w-4 h-4' />
                          <span>Expires in {listing.expiresIn}</span>
                        </div>
                        <div className='text-muted-foreground'>
                          Seller: {listing.sellerAddress}
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-3 pt-2'>
                        <Button
                          className='w-full gap-2'
                          onClick={() => handlePurchase(listing)}
                        >
                          <ShoppingCart className='w-4 h-4' />
                          Buy Now
                        </Button>
                        <Button variant='outline' className='w-full gap-2'>
                          {/* <CreditCard className="w-4 h-4" /> */}
                          Make Offer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Regular Listings */}
            <h2 className='font-primary text-2xl font-bold text-foreground mb-4'>
              All Listings
            </h2>
            {filteredListings.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {filteredListings.map(listing => (
                  <Card
                    key={listing.id}
                    className='overflow-hidden group rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1'
                  >
                    <div className='relative'>
                      <Image
                        src={listing.eventImage}
                        alt={listing.eventName}
                        width={400}
                        height={200}
                        className='w-full h-48 object-cover transition-transform duration-300 ease-out group-hover:scale-105'
                      />
                      {listing.verified && (
                        <Badge className='absolute top-3 right-3 bg-primary text-primary-foreground'>
                          <Star className='w-3 h-3 mr-1' /> Verified
                        </Badge>
                      )}
                    </div>
                    <CardContent className='p-5 space-y-4'>
                      <div>
                        <h3 className='font-primary text-lg font-bold text-foreground mb-1'>
                          {listing.eventName}
                        </h3>
                        <div className='flex items-center gap-2 mb-1'>
                          <Calendar className='w-4 h-4 text-muted-foreground' />
                          <span className='text-sm text-muted-foreground'>
                            {new Date(listing.eventDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <MapPin className='w-4 h-4 text-muted-foreground' />
                          <span className='text-sm text-muted-foreground'>
                            {listing.eventLocation}
                          </span>
                        </div>
                      </div>

                      <div className='flex items-center justify-between'>
                        <div>
                          <div className='font-primary text-xl font-bold text-foreground'>
                            {listing.price}
                          </div>
                          {listing.price !== listing.originalPrice && (
                            <div className='text-xs text-muted-foreground'>
                              Original: {listing.originalPrice}
                            </div>
                          )}
                        </div>
                        <Badge variant='outline'>{listing.ticketType}</Badge>
                      </div>

                      <div className='flex items-center justify-between text-sm'>
                        <div className='flex items-center gap-1 text-muted-foreground'>
                          <Clock className='w-4 h-4' />
                          <span>Expires in {listing.expiresIn}</span>
                        </div>
                        <div className='text-muted-foreground'>
                          Seller: {listing.sellerAddress}
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-3 pt-2'>
                        <Button
                          className='w-full gap-2'
                          onClick={() => handlePurchase(listing)}
                        >
                          <ShoppingCart className='w-4 h-4' />
                          Buy Now
                        </Button>
                        <Button variant='outline' className='w-full gap-2'>
                          {/* <CreditCard className="w-4 h-4" /> */}
                          Make Offer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                title='No listings found'
                description='Try adjusting your search or filters to find event tickets.'
                action={{
                  label: 'Reset Search',
                  onClick: () => {
                    setSearchQuery('');
                    setShowFilters(false);
                  },
                  icon: <Search className='w-4 h-4' />,
                }}
              />
            )}

            {/* Ticket Listing Dialog */}
            <TicketListingDialog
              open={isSellDialogOpen}
              onOpenChange={setIsSellDialogOpen}
            />

            {/* Ticket Purchase Dialog */}
            <TicketPurchaseDialog
              open={isPurchaseDialogOpen}
              onOpenChange={setIsPurchaseDialogOpen}
              listing={selectedListing}
            />
          </div>
        </div>
      ) : (
        <div className='text-center py-16'>
          <h2 className='font-primary text-2xl font-bold text-foreground mb-4'>
            Connect Your Wallet
          </h2>
          <p className='font-secondary text-muted-foreground mb-6'>
            Please connect your wallet to access the marketplace features.
          </p>
          <Button
            onClick={() =>
              toast.info('Wallet not connected. Please connect your wallet.')
            }
          >
            <Wallet className='w-4 h-4 mr-2' />
            Connect Wallet
          </Button>
        </div>
      )}
    </div>
  );
}
