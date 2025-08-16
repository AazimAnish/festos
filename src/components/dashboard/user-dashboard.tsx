"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EventCard } from "@/components/event-card"
import { EmptyState } from "@/components/empty-state"
import { useWallet } from "@/lib/hooks/use-wallet"
import { useTickets } from "@/lib/hooks/use-tickets"
import { MOCK_EVENTS } from "@/lib/data/mock-data"
import {
  Calendar,
  Users,
  CheckCircle,
  ExternalLink,
  Plus,
  Filter,
  Search,
  Award,
  Settings,
  TicketIcon,
  QrCode,
  History,
  Activity,
  TrendingUp,
  BarChart3,
  ArrowRight,
  Wallet
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Mock user data - in real app, this would come from wallet/user context or API
const userData = {
  username: "alexchen",
  name: "Alex Chen",
  bio: "Community builder & event organizer passionate about bringing people together through meaningful experiences.",
  avatar: "/card1.png",
  isVerified: true,
  location: "San Francisco, CA",
  joinedDate: "March 2023",
  address: "0x1234...5678",
  stats: {
    upcomingEvents: 3,
    pastEvents: 12,
    eventsCreated: 24,
    eventsAttended: 87,
    poapsCollected: 156,
    averageRating: 4.8,
    totalReviews: 42,
    ticketsOwned: 5,
  },
}

// Dashboard stats configuration
const dashboardStatsConfig = [
  {
    title: "Upcoming Events",
    key: "upcomingEvents" as const,
    icon: Calendar,
    color: "text-primary",
    bgColor: "bg-primary/10",
    href: "#upcoming",
  },
  {
    title: "Past Events",
    key: "pastEvents" as const,
    icon: History,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    href: "#past",
  },
  {
    title: "My Tickets",
    key: "ticketsOwned" as const,
    icon: TicketIcon,
    color: "text-warning",
    bgColor: "bg-warning/10",
    href: "#tickets",
  },
  {
    title: "Events Created",
    key: "eventsCreated" as const,
    icon: Plus,
    color: "text-success",
    bgColor: "bg-success/10",
    href: "#created",
  },
]

// Filter mock events for demonstration purposes
const upcomingEvents = MOCK_EVENTS.slice(0, 3)
const createdEvents = MOCK_EVENTS.slice(0, 4)

export function UserDashboard() {
  const { isConnected } = useWallet()
  const { ownedTickets, getUserListings } = useTickets();
  const [activeTab, setActiveTab] = useState("overview")
  
  // In a real app, we would check if the user is connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-6">
          <div className="space-y-4">
            <h1 className="font-primary text-3xl font-bold text-foreground">
              Connect Your Wallet
            </h1>
            <p className="font-secondary text-muted-foreground">
              Connect your wallet to access your personalized dashboard and manage your events.
            </p>
            <Button size="lg" className="w-full">
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-6xl py-6 sm:py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="font-primary text-3xl font-bold text-foreground tracking-tight mb-2">
            My Dashboard
          </h1>
          <p className="font-secondary text-muted-foreground">
            Manage your events, tickets, and collections
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link href="/create">
            <Button className="gap-2 font-secondary rounded-lg">
              <Plus className="w-4 h-4" />
              Create Event
            </Button>
          </Link>
          <Link href={`/user/${userData.username}`}>
            <Button variant="outline" className="gap-2 bg-transparent font-secondary rounded-lg">
              <Settings className="w-4 h-4" />
              Profile Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {dashboardStatsConfig.map((stat) => (
          <Link href={stat.href} key={stat.title}>
            <Card className="group rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1">
              <CardContent className="p-6">
                <div className={`${stat.bgColor} w-10 h-10 rounded-full flex items-center justify-center mb-4`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className={`font-primary text-2xl font-bold ${stat.color} mb-1`}>
                  {userData.stats[stat.key]}
                </div>
                <div className="font-secondary text-sm text-muted-foreground flex items-center justify-between">
                  {stat.title}
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8 rounded-xl border-2 border-border bg-background/50 backdrop-blur-sm p-1 h-12">
          <TabsTrigger
            className="font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200"
            value="overview"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            className="font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200"
            value="events"
          >
            Events
          </TabsTrigger>
          <TabsTrigger
            className="font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200"
            value="tickets"
          >
            Tickets
          </TabsTrigger>
          <TabsTrigger
            className="font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200"
            value="marketplace"
          >
            Marketplace
          </TabsTrigger>
          <TabsTrigger
            className="font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200"
            value="analytics"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-10">
          {/* Upcoming Events Section */}
          <section id="upcoming" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-primary text-2xl font-bold text-foreground">
                Upcoming Events
              </h2>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setActiveTab("events")}
              >
                View All
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event, i) => (
                  <div
                    key={event.id}
                    className="group transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <EventCard {...event} variant="grid" />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No upcoming events"
                description="You don't have any upcoming events. Start exploring events to join!"
                action={{
                  label: "Explore Events",
                  href: "/discover",
                  icon: <Search className="w-4 h-4" />
                }}
              />
            )}
          </section>

          {/* My Tickets Section */}
          <section id="tickets" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-primary text-2xl font-bold text-foreground">
                My Tickets
              </h2>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setActiveTab("tickets")}
              >
                View All
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>

            {ownedTickets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownedTickets.map((ticket) => (
                  <Card key={ticket.id} className="overflow-hidden group rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1">
                    <div className="relative">
                      <Image
                        src={ticket.eventImage}
                        alt={ticket.eventName}
                        width={400}
                        height={200}
                        className="w-full h-40 object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                      />
                      <Badge 
                        className={`absolute top-3 right-3 ${ticket.status === 'used' ? 'bg-muted text-muted-foreground' : 'bg-success text-success-foreground'}`}
                      >
                        {ticket.status === 'used' ? 'Used' : 'Valid'}
                      </Badge>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-primary text-lg font-bold text-foreground mb-2">
                        {ticket.eventName}
                      </h3>
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-secondary text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(ticket.eventDate).toLocaleDateString()}
                        </div>
                        <Badge variant="outline">{ticket.ticketType}</Badge>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <Button variant="outline" size="sm" className="gap-1">
                          <QrCode className="w-4 h-4" />
                          View Ticket
                        </Button>
                        {ticket.transferable && (
                          <Button variant="outline" size="sm" className="gap-1">
                            <Wallet className="w-4 h-4" />
                            Transfer
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No tickets yet"
                description="You don't have any tickets yet. Start exploring events to join!"
                action={{
                  label: "Explore Events",
                  href: "/discover",
                  icon: <Search className="w-4 h-4" />
                }}
              />
            )}
          </section>
          
          {/* Events I've Created Section */}
          <section id="created" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-primary text-2xl font-bold text-foreground">
                Events I&apos;ve Created
              </h2>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setActiveTab("events")}
              >
                View All
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>

            {createdEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {createdEvents.slice(0, 3).map((event, i) => (
                  <div
                    key={event.id}
                    className="group transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <EventCard {...event} variant="grid" />
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <Link href={`/event/manage/${event.uniqueId}/overview`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Settings className="w-4 h-4" />
                          Manage
                        </Button>
                      </Link>
                      <Link href={`/check-in/${event.uniqueId}`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <QrCode className="w-4 h-4" />
                          Check-in
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No events created"
                description="You haven't created any events yet. Start creating events to build your community!"
                action={{
                  label: "Create Your First Event",
                  href: "/create",
                  icon: <Plus className="w-4 h-4" />
                }}
              />
            )}
          </section>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-10">
          {/* Sub-navigation for events */}
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" className="gap-2">
              <Calendar className="w-4 h-4" />
              Upcoming Events
            </Button>
            <Button variant="outline" className="gap-2">
              <History className="w-4 h-4" />
              Past Events
            </Button>
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Created Events
            </Button>
          </div>

          {/* Upcoming Events */}
          <section className="space-y-6">
            <h2 className="font-primary text-2xl font-bold text-foreground">
              Upcoming Events
            </h2>
            
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event, i) => (
                  <div
                    key={event.id}
                    className="group transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <EventCard {...event} variant="grid" />
                    <div className="mt-3 flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <QrCode className="w-4 h-4" />
                        Check-in
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1">
                        <TicketIcon className="w-4 h-4" />
                        View Ticket
                      </Button>
                      <Button variant="ghost" size="sm" className="ml-auto">
                        <Calendar className="w-4 h-4" />
                        Add to Calendar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No upcoming events"
                description="You don't have any upcoming events. Start exploring events to join!"
                action={{
                  label: "Explore Events",
                  href: "/discover",
                  icon: <Search className="w-4 h-4" />
                }}
              />
            )}
          </section>
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="space-y-8">
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" className="gap-2">
              <TicketIcon className="w-4 h-4" />
              All Tickets
            </Button>
            <Button variant="outline" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Valid Tickets
            </Button>
            <Button variant="outline" className="gap-2">
              <History className="w-4 h-4" />
              Used Tickets
            </Button>
            <Button variant="outline" className="gap-2">
              <Award className="w-4 h-4" />
              POAPs
            </Button>
          </div>

          <h2 className="font-primary text-2xl font-bold text-foreground">
            My Tickets
          </h2>
          
          {ownedTickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ownedTickets.map((ticket) => (
                <Card key={ticket.id} className="overflow-hidden group rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1">
                  <div className="relative">
                    <Image
                      src={ticket.eventImage}
                      alt={ticket.eventName}
                      width={400}
                      height={200}
                      className="w-full h-40 object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                    <Badge 
                      className={`absolute top-3 right-3 ${ticket.status === 'used' ? 'bg-muted text-muted-foreground' : 'bg-success text-success-foreground'}`}
                    >
                      {ticket.status === 'used' ? 'Used' : 'Valid'}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-primary text-lg font-bold text-foreground mb-2">
                      {ticket.eventName}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-secondary text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(ticket.eventDate).toLocaleDateString()}
                      </div>
                      <Badge variant="outline">{ticket.ticketType}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      <Button variant="default" size="sm" className="gap-1">
                        <QrCode className="w-4 h-4" />
                        View Ticket
                      </Button>
                      {ticket.transferable && (
                        <Button variant="outline" size="sm" className="gap-1">
                          <Wallet className="w-4 h-4" />
                          Transfer
                        </Button>
                      )}
                      {ticket.transferable && (
                        <Button variant="outline" size="sm" className="gap-1">
                          <TrendingUp className="w-4 h-4" />
                          Sell
                        </Button>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border">
                      <h4 className="font-primary text-sm font-semibold mb-2">Ticket History</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Minted</span>
                          <span>Jan 1, 2024</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Transferred</span>
                          <span>Jan 15, 2024</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No tickets yet"
              description="You don't have any tickets yet. Start exploring events to join!"
              action={{
                label: "Explore Events",
                href: "/discover",
                icon: <Search className="w-4 h-4" />
              }}
            />
          )}
        </TabsContent>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="space-y-8">
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              My Listings
            </Button>
            <Button variant="outline" className="gap-2">
              <History className="w-4 h-4" />
              Purchase History
            </Button>
            <Button variant="outline" className="gap-2">
              <Activity className="w-4 h-4" />
              Sale History
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="font-primary text-2xl font-bold text-foreground">
              My Marketplace Listings
            </h2>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Listing
            </Button>
          </div>
          
          {getUserListings().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {getUserListings().map((listing) => (
                <Card key={listing.id} className="overflow-hidden group rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1">
                  <div className="relative">
                    <Image
                      src={listing.eventImage}
                      alt={listing.eventName}
                      width={400}
                      height={200}
                      className="w-full h-40 object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                    <Badge 
                      className={`absolute top-3 right-3 ${listing.status === 'sold' ? 'bg-muted text-muted-foreground' : 'bg-success text-success-foreground'}`}
                    >
                      {listing.status === 'sold' ? 'Sold' : 'Active'}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-primary text-lg font-bold text-foreground mb-2">
                      {listing.eventName}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-primary text-lg font-bold text-foreground">
                        {listing.price}
                      </div>
                      <div className="font-secondary text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Listed: {new Date(listing.listedAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="font-secondary text-sm text-muted-foreground">
                        {listing.views} views
                      </div>
                      {listing.status === 'active' && (
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm">
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {listing.status === 'sold' && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Sold On</span>
                          <span>Feb 15, 2024</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No marketplace listings"
              description="You don't have any active listings. List your tickets to sell them on the marketplace."
              action={{
                label: "Create Listing",
                href: "/marketplace",
                icon: <Plus className="w-4 h-4" />
              }}
            />
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-8">
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" className="gap-2">
              <Activity className="w-4 h-4" />
              Event Performance
            </Button>
            <Button variant="outline" className="gap-2">
              <Users className="w-4 h-4" />
              Attendee Stats
            </Button>
            <Button variant="outline" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Revenue
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="font-primary text-2xl font-bold text-foreground">
              Event Analytics
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Last 30 Days
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <CardHeader className="p-0">
                <CardTitle className="text-lg">Event Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-48 border rounded-md flex items-center justify-center bg-muted/30">
                  <p className="text-muted-foreground">Event performance chart will appear here</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="space-y-1">
                    <div className="font-secondary text-sm text-muted-foreground">Total Events</div>
                    <div className="font-primary text-2xl font-bold">{userData.stats.eventsCreated}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-secondary text-sm text-muted-foreground">Total Attendees</div>
                    <div className="font-primary text-2xl font-bold">1,245</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-secondary text-sm text-muted-foreground">Check-in Rate</div>
                    <div className="font-primary text-2xl font-bold">87%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-secondary text-sm text-muted-foreground">Avg. Rating</div>
                    <div className="font-primary text-2xl font-bold">{userData.stats.averageRating}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="p-6 space-y-4">
              <CardHeader className="p-0">
                <CardTitle className="text-lg">Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-48 border rounded-md flex items-center justify-center bg-muted/30">
                  <p className="text-muted-foreground">Revenue chart will appear here</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="space-y-1">
                    <div className="font-secondary text-sm text-muted-foreground">Total Revenue</div>
                    <div className="font-primary text-2xl font-bold">12.5 ETH</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-secondary text-sm text-muted-foreground">Avg. Ticket Price</div>
                    <div className="font-primary text-2xl font-bold">0.05 ETH</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-secondary text-sm text-muted-foreground">Most Profitable Event</div>
                    <div className="font-primary text-lg font-bold truncate">ETHIndia 2025</div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-secondary text-sm text-muted-foreground">Marketplace Sales</div>
                    <div className="font-primary text-2xl font-bold">1.2 ETH</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="p-6">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-lg">Recent Events Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-6">
                {createdEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                    <Image
                      src={event.image}
                      alt={event.title}
                      width={60}
                      height={60}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-primary font-semibold text-foreground truncate">
                        {event.title}
                      </h4>
                      <p className="font-secondary text-sm text-muted-foreground">
                        {event.joinedCount} attendees
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {new Date(event.date).toLocaleDateString()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {event.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-primary font-semibold">{(event.joinedCount * 0.01).toFixed(2)} ETH</div>
                      <div className="text-xs text-muted-foreground">Revenue</div>
                      <Link href={`/event/manage/${event.uniqueId}/insights`}>
                        <Button variant="ghost" size="sm" className="mt-1 gap-1">
                          <BarChart3 className="w-4 h-4" />
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
