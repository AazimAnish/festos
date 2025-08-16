"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/empty-state";
import { PriceAnalyticsChart } from "@/components/marketplace/price-analytics-chart";
import { WatchlistItem } from "@/components/marketplace/watchlist-item";

import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Filter,
  SlidersHorizontal,
  TicketIcon,
  Calendar,
  ChevronDown,
  Clock,
  ArrowUpDown,
  Tag,
  ShoppingCart,
  CreditCard,
  Wallet,
  ExternalLink,
  Check,
  Timer,
  HelpCircle,
  MapPin,
  Bell
} from "lucide-react";

// Mock ticket listings
const mockListings = [
  {
    id: 1,
    eventName: "ETHIndia 2025 🇮🇳",
    eventDate: "2025-01-15",
    location: "Bangalore, India",
    image: "/card1.png",
    price: "0.25 ETH",
    originalPrice: "0.2 ETH",
    category: "Tech",
    ticketType: "VIP",
    seller: "0xF5a2...6b47",
    listedDate: "2024-12-20",
    expiresIn: "2 days",
    verified: true,
  },
  {
    id: 2,
    eventName: "Web3 Delhi Summit",
    eventDate: "2025-02-20",
    location: "New Delhi, India",
    image: "/card2.png",
    price: "0.15 ETH",
    originalPrice: "0.2 ETH",
    category: "Conference",
    ticketType: "General",
    seller: "0x1234...5678",
    listedDate: "2024-12-25",
    expiresIn: "5 days",
    verified: true,
  },
  {
    id: 3,
    eventName: "Mumbai Blockchain Fest",
    eventDate: "2025-03-10",
    location: "Mumbai, India",
    image: "/card3.png",
    price: "0.05 ETH",
    originalPrice: "0.05 ETH",
    category: "Tech",
    ticketType: "Early Bird",
    seller: "0xabcd...ef12",
    listedDate: "2024-12-28",
    expiresIn: "7 days",
    verified: false,
  },
  {
    id: 4,
    eventName: "Chennai NFT Expo",
    eventDate: "2025-04-05",
    location: "Chennai, India",
    image: "/card1.png",
    price: "0.08 ETH",
    originalPrice: "0.1 ETH",
    category: "Art",
    ticketType: "General",
    seller: "0x7890...1234",
    listedDate: "2025-01-02",
    expiresIn: "14 days",
    verified: true,
  },
];

// Mock user listings
const mockUserListings = [
  {
    id: 1,
    eventName: "ETHIndia 2025 🇮🇳",
    eventDate: "2025-01-15",
    image: "/card1.png",
    price: "0.25 ETH",
    originalPrice: "0.2 ETH",
    listedDate: "2024-12-20",
    status: "active",
    views: 45,
  },
  {
    id: 2,
    eventName: "Web3 Delhi Summit",
    eventDate: "2025-02-20",
    image: "/card2.png",
    price: "0.15 ETH",
    originalPrice: "0.2 ETH",
    listedDate: "2024-12-25",
    status: "sold",
    soldDate: "2025-01-03",
    soldPrice: "0.15 ETH",
    views: 87,
  }
];

// Mock watchlist items
const mockWatchlistItems = [
  {
    id: 1,
    eventName: "ETHIndia 2025 🇮🇳",
    eventDate: "2025-01-15",
    location: "Bangalore, India",
    image: "/card1.png",
    currentPrice: "0.25 ETH",
    priceNum: 0.25,
    previousPrice: "0.2 ETH",
    priceChange: 25, // percentage
    ticketType: "VIP",
    expiresIn: "2 days",
    addedOn: "2024-12-15",
  },
  {
    id: 2,
    eventName: "Web3 Delhi Summit",
    eventDate: "2025-02-20",
    location: "New Delhi, India",
    image: "/card2.png",
    currentPrice: "0.15 ETH",
    priceNum: 0.15,
    previousPrice: "0.2 ETH",
    priceChange: -25, // percentage
    ticketType: "General",
    expiresIn: "5 days",
    addedOn: "2024-12-18",
  },
  {
    id: 3,
    eventName: "Mumbai Blockchain Fest",
    eventDate: "2025-03-10",
    location: "Mumbai, India",
    image: "/card3.png",
    currentPrice: "0.05 ETH",
    priceNum: 0.05,
    previousPrice: "0.05 ETH",
    priceChange: 0, // percentage
    ticketType: "Early Bird",
    expiresIn: "7 days",
    addedOn: "2024-12-20",
  },
];

export function MarketplacePage() {
  // Wallet connection would be used for transactions in a real app
  const [activeTab, setActiveTab] = useState("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<{
    id: number;
    eventName: string;
    eventDate: string;
    location: string;
    image: string;
    price: string;
    originalPrice: string;
    category: string;
    ticketType: string;
    seller: string;
    listedDate: string;
    expiresIn: string;
    verified: boolean;
  } | null>(null);
  const [priceRange, setPriceRange] = useState([0, 0.5]);
  const [watchlistItems, setWatchlistItems] = useState(mockWatchlistItems);
  
  // Filter functionality would be implemented in a real app
  const filteredListings = mockListings.filter(listing => 
    listing.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handlePurchase = (listing: {
    id: number;
    eventName: string;
    eventDate: string;
    location: string;
    image: string;
    price: string;
    originalPrice: string;
    category: string;
    ticketType: string;
    seller: string;
    listedDate: string;
    expiresIn: string;
    verified: boolean;
  }) => {
    setSelectedListing(listing);
    setIsPurchaseDialogOpen(true);
  };
  
  // Watchlist handlers
  const handleRemoveFromWatchlist = (id: number) => {
    setWatchlistItems(items => items.filter(item => item.id !== id));
  };
  
  const handleWatchlistPurchase = (id: number) => {
    // Find the corresponding listing
    const watchItem = watchlistItems.find(item => item.id === id);
    if (!watchItem) return;
    
    // Find matching listing in the regular listings
    const matchingListing = mockListings.find(listing => 
      listing.eventName === watchItem.eventName && listing.eventDate === watchItem.eventDate
    );
    
    if (matchingListing) {
      handlePurchase(matchingListing);
    }
    
    // In a real app, this would use the actual listing data
  };

  return (
    <div className="container mx-auto px-6 max-w-6xl py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between mb-8">
        <div>
          <h1 className="font-primary text-3xl font-bold text-foreground tracking-tight mb-2">
            NFT Ticket Marketplace
          </h1>
          <p className="font-secondary text-muted-foreground">
            Buy and sell event tickets securely on our verified marketplace
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isSellDialogOpen} onOpenChange={setIsSellDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 font-secondary rounded-lg">
                <TicketIcon className="w-4 h-4" />
                Sell My Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>List Your Ticket for Sale</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Select Ticket to Sell</Label>
                  <div className="border rounded-md p-2">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 relative rounded-md overflow-hidden">
                          <Image src="/ticket.png" alt="Ticket" fill className="object-cover" />
                        </div>
                        <div>
                          <h3 className="font-primary font-medium">ETHIndia 2025</h3>
                          <p className="text-xs text-muted-foreground">VIP Ticket • Jan 15, 2025</p>
                        </div>
                      </div>
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Listing Price (ETH)</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="0.25" min="0" step="0.01" className="w-32" />
                    <span className="text-sm text-muted-foreground">Original price: 0.2 ETH</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Listing Duration</Label>
                  <div className="flex gap-3 flex-wrap">
                    <Button variant="outline" size="sm" className="bg-primary/5 border-primary/30">3 Days</Button>
                    <Button variant="outline" size="sm">7 Days</Button>
                    <Button variant="outline" size="sm">14 Days</Button>
                    <Button variant="outline" size="sm">30 Days</Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="auto-accept" />
                  <Label htmlFor="auto-accept">Auto-accept offers within 5% of listing price</Label>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Platform Fee (2.5%)</span>
                    <span className="text-sm">0.00625 ETH</span>
                  </div>
                  <div className="flex items-center justify-between font-medium">
                    <span>You&apos;ll Receive</span>
                    <span>0.24375 ETH</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsSellDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="gap-2">
                  <Tag className="w-4 h-4" />
                  List Ticket for Sale
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Link href="/marketplace/history">
            <Button variant="outline" className="gap-2 bg-transparent font-secondary rounded-lg">
              <Clock className="w-4 h-4" />
              Purchase History
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 rounded-xl border-2 border-border bg-background/50 backdrop-blur-sm p-1 h-12">
          <TabsTrigger
            className="font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200"
            value="browse"
          >
            Browse Marketplace
          </TabsTrigger>
          <TabsTrigger
            className="font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200"
            value="my-listings"
          >
            My Listings
          </TabsTrigger>
          <TabsTrigger
            className="font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200"
            value="watchlist"
          >
            Watchlist
          </TabsTrigger>
        </TabsList>

        {/* Browse Tab */}
        <TabsContent value="browse" className="space-y-6">
          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search events, categories, or locations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Sort
              </Button>
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <Card className="bg-background border-border/50 rounded-xl">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-primary text-sm font-medium">Price Range (ETH)</h3>
                    <div className="px-2">
                      <Slider
                        defaultValue={[priceRange[0], priceRange[1]]}
                        max={0.5}
                        step={0.01}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2">
                      <div>{priceRange[0]} ETH</div>
                      <div>{priceRange[1]} ETH</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-primary text-sm font-medium">Event Categories</h3>
                    <div className="space-y-2">
                      {["Tech", "Conference", "Music", "Art", "Sports"].map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <input type="checkbox" id={category} className="h-4 w-4" />
                          <label htmlFor={category} className="text-sm">{category}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-primary text-sm font-medium">Ticket Type</h3>
                    <div className="space-y-2">
                      {["General", "VIP", "Early Bird", "Premium"].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <input type="checkbox" id={type} className="h-4 w-4" />
                          <label htmlFor={type} className="text-sm">{type}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button variant="outline" size="sm" className="mr-2">Reset</Button>
                  <Button size="sm">Apply Filters</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Featured Listings */}
          <div className="mb-8">
            <h2 className="font-primary text-2xl font-bold text-foreground mb-4">Featured Listings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredListings.slice(0, 3).map((listing) => (
                <Card key={`featured-${listing.id}`} className="overflow-hidden group rounded-xl border border-primary/30 bg-primary/5 shadow-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1">
                  <div className="relative">
                    <Image
                      src={listing.image}
                      alt={listing.eventName}
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                    <Badge className="absolute top-3 right-3 bg-primary/80 text-primary-foreground">
                      Featured
                    </Badge>
                    {listing.verified && (
                      <Badge className="absolute top-3 left-3 bg-background text-foreground border-border">
                        <Check className="w-3 h-3 mr-1" /> Verified
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-5 space-y-4">
                    <div>
                      <h3 className="font-primary text-lg font-bold text-foreground mb-1">
                        {listing.eventName}
                      </h3>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(listing.eventDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{listing.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-primary text-xl font-bold text-foreground">
                          {listing.price}
                        </div>
                        {listing.price !== listing.originalPrice && (
                          <div className="text-xs text-muted-foreground">
                            Original: {listing.originalPrice}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
                        {listing.ticketType}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Timer className="w-4 h-4" />
                        <span>Expires in {listing.expiresIn}</span>
                      </div>
                      <div className="text-muted-foreground">
                        Seller: {listing.seller}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Button 
                        className="w-full gap-2" 
                        onClick={() => handlePurchase(listing)}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Buy Now
                      </Button>
                      <Button variant="outline" className="w-full gap-2">
                        <CreditCard className="w-4 h-4" />
                        Make Offer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Regular Listings */}
          <h2 className="font-primary text-2xl font-bold text-foreground mb-4">All Listings</h2>
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden group rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1">
                  <div className="relative">
                    <Image
                      src={listing.image}
                      alt={listing.eventName}
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                    {listing.verified && (
                      <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                        <Check className="w-3 h-3 mr-1" /> Verified
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-5 space-y-4">
                    <div>
                      <h3 className="font-primary text-lg font-bold text-foreground mb-1">
                        {listing.eventName}
                      </h3>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(listing.eventDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{listing.location}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-primary text-xl font-bold text-foreground">
                          {listing.price}
                        </div>
                        {listing.price !== listing.originalPrice && (
                          <div className="text-xs text-muted-foreground">
                            Original: {listing.originalPrice}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline">
                        {listing.ticketType}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Timer className="w-4 h-4" />
                        <span>Expires in {listing.expiresIn}</span>
                      </div>
                      <div className="text-muted-foreground">
                        Seller: {listing.seller}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Button 
                        className="w-full gap-2" 
                        onClick={() => handlePurchase(listing)}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Buy Now
                      </Button>
                      <Button variant="outline" className="w-full gap-2">
                        <CreditCard className="w-4 h-4" />
                        Make Offer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No listings found"
              description="Try adjusting your search or filters to find event tickets."
              action={{
                label: "Reset Search",
                onClick: () => {
                  setSearchQuery("");
                  setShowFilters(false);
                },
                icon: <Search className="w-4 h-4" />
              }}
            />
          )}
          
          {/* Purchase dialog */}
          <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Confirm Purchase</DialogTitle>
              </DialogHeader>
              {selectedListing && (
                <div className="space-y-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 relative rounded-md overflow-hidden">
                      <Image src={selectedListing.image} alt={selectedListing.eventName} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-primary text-lg font-medium">{selectedListing.eventName}</h3>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(selectedListing.eventDate).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge variant="outline">
                        {selectedListing.ticketType}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-md space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ticket Price</span>
                      <span className="font-medium">{selectedListing.price}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Service Fee (3%)</span>
                      <span className="text-sm">
                        {(parseFloat(selectedListing.price) * 0.03).toFixed(2)} ETH
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="font-medium">Total</span>
                      <span className="font-primary text-lg font-bold">
                        {(parseFloat(selectedListing.price) * 1.03).toFixed(2)} ETH
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-muted/10 p-4 rounded-md text-sm">
                    <div className="flex items-start gap-2">
                      <HelpCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-muted-foreground">
                        This purchase is secured by our escrow system. The ticket will be transferred to your wallet immediately after payment. You can verify ticket authenticity with the event organizer.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsPurchaseDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="gap-2">
                  <Wallet className="w-4 h-4" />
                  Complete Purchase
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* My Listings Tab */}
        <TabsContent value="my-listings" className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <h2 className="font-primary text-2xl font-bold text-foreground">My Listings</h2>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpDown className="w-4 h-4" />
                Sort
              </Button>
            </div>
          </div>
          
          <Card className="bg-background border-border/50 rounded-xl">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">Active Listings</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {mockUserListings.filter(l => l.status === "active").length > 0 ? (
                <div className="space-y-6">
                  {mockUserListings.filter(l => l.status === "active").map((listing) => (
                    <div key={listing.id} className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg bg-muted/30">
                      <div className="relative w-full sm:w-40 h-32 rounded-md overflow-hidden">
                        <Image
                          src={listing.image}
                          alt={listing.eventName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-primary text-lg font-bold mb-1">{listing.eventName}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(listing.eventDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 items-center mb-3">
                          <Badge variant="outline" className="bg-success/10 border-success/30 text-success">
                            Active
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Listed on {new Date(listing.listedDate).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {listing.views} views
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Current Price</span>
                            <div className="font-primary text-xl font-bold">{listing.price}</div>
                            {listing.price !== listing.originalPrice && (
                              <div className="text-xs text-muted-foreground">
                                Original: {listing.originalPrice}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm">Edit Listing</Button>
                            <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">Cancel Listing</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You don&apos;t have any active listings</p>
                  <Button variant="link" onClick={() => setIsSellDialogOpen(true)}>
                    Create your first listing
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-background border-border/50 rounded-xl">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">Sales History</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {mockUserListings.filter(l => l.status === "sold").length > 0 ? (
                <div className="space-y-6">
                  {mockUserListings.filter(l => l.status === "sold").map((listing: {
                    id: number;
                    eventName: string;
                    eventDate: string;
                    image: string;
                    price: string;
                    originalPrice: string;
                    listedDate: string;
                    status: string;
                    soldDate?: string;
                    soldPrice?: string;
                    views: number;
                  }) => (
                    <div key={listing.id} className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg bg-muted/30">
                      <div className="relative w-full sm:w-40 h-32 rounded-md overflow-hidden">
                        <Image
                          src={listing.image}
                          alt={listing.eventName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-primary text-lg font-bold mb-1">{listing.eventName}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(listing.eventDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 items-center mb-3">
                          <Badge className="bg-muted text-muted-foreground">
                            Sold
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Listed on {new Date(listing.listedDate).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Sold on {listing.soldDate ? new Date(listing.soldDate).toLocaleDateString() : 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Listed Price</span>
                            <div className="font-primary text-lg font-medium line-through text-muted-foreground">{listing.price}</div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-xs text-muted-foreground">Sold For</span>
                            <div className="font-primary text-xl font-bold">{listing.soldPrice}</div>
                          </div>
                          <Button variant="outline" size="sm" className="ml-auto gap-2">
                            <ExternalLink className="w-4 h-4" />
                            View Transaction
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You haven&apos;t sold any tickets yet</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-background border-border/50 rounded-xl">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">Price Analytics</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <PriceAnalyticsChart timeFrame="30d" />
              
              <div className="mt-6 p-4 bg-muted/20 rounded-lg border border-border/50">
                <h4 className="font-primary text-sm font-medium mb-3">Market Insights</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Event tickets are showing an average sell time of <span className="font-medium text-foreground">3.2 days</span> with 
                  a <span className="font-medium text-foreground">100%</span> success rate. 
                  Tech category events have the highest demand with prices trending upward by <span className="font-medium text-success">8%</span> this month.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Watchlist Tab */}
        <TabsContent value="watchlist" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
            <div>
              <h2 className="font-primary text-2xl font-bold text-foreground">My Watchlist</h2>
              <p className="font-secondary text-muted-foreground">
                Track price changes and get notified about your favorite events
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpDown className="w-4 h-4" />
                Sort by Price
              </Button>
            </div>
          </div>
          
          {watchlistItems.length > 0 ? (
            <div className="space-y-4">
              <Card className="bg-muted/20 p-4 rounded-xl border border-primary/30">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-primary font-medium text-base mb-1">Price Alerts Active</h3>
                    <p className="text-sm text-muted-foreground">
                      You&apos;ll be notified when prices drop by 10% or more on your watchlist items.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0">
                    Settings
                  </Button>
                </div>
              </Card>
              
              <PriceAnalyticsChart 
                timeFrame="7d" 
                title="Watchlist Price Trends" 
                showControls={true}
              />
              
              <div className="mt-8 space-y-4">
                <h3 className="font-primary text-xl font-semibold">Watched Items</h3>
                {watchlistItems.map(item => (
                  <WatchlistItem 
                    key={item.id}
                    {...item}
                    onRemove={handleRemoveFromWatchlist}
                    onPurchase={handleWatchlistPurchase}
                  />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title="Your watchlist is empty"
              description="Add items to your watchlist to monitor price changes and get notified when prices drop."
              action={{
                label: "Browse Marketplace",
                onClick: () => setActiveTab("browse"),
                icon: <Search className="w-4 h-4" />
              }}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
