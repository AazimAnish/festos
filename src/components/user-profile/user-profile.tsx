"use client"

import { useState } from "react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageCircle,
  UserPlus,
  MapPin,
  Calendar,
  Star,
  ExternalLink,
  Instagram,
  Twitter,
  Globe,
  ChevronDown,
  CheckCircle,
  Award,
} from "lucide-react"
import { EventCard } from "@/components/event-card"
import { EmptyState } from "@/components/empty-state"
import { SAMPLE_EVENTS } from "@/lib/data/sample-events"

// Mock data following the specification
const userData = {
  username: "alexchen",
  name: "Alex Chen",
  bio: "Community builder & event organizer passionate about bringing people together through meaningful experiences.",
  avatar: "/card1.png",
  isVerified: true,
  location: "San Francisco, CA",
  joinedDate: "March 2023",
  socialLinks: [
    { platform: "Twitter", url: "https://twitter.com/alexchen", icon: Twitter },
    { platform: "Instagram", url: "https://instagram.com/alexchen", icon: Instagram },
    { platform: "Website", url: "https://alexchen.dev", icon: Globe },
  ],
  stats: {
    eventsCreated: 24,
    eventsAttended: 87,
    poapsCollected: 156,
    averageRating: 4.8,
    totalReviews: 42,
  },
}

const mockPOAPs = [
  {
    id: 1,
    name: "ETH Denver 2024",
    image: "/greek_sculpture_1.png",
    rarity: "rare",
    date: "2024-02-28",
  },
  {
    id: 2,
    name: "DevCon VI Attendee",
    image: "/greek_sculpture_2.png",
    rarity: "common",
    date: "2024-01-15",
  },
  {
    id: 3,
    name: "Web3 Summit Speaker",
    image: "/greek_sculpture_3.png",
    rarity: "legendary",
    date: "2024-03-10",
  },
  {
    id: 4,
    name: "NFT.NYC Early Bird",
    image: "/greek_sculpture_4.png",
    rarity: "uncommon",
    date: "2024-04-02",
  },
]

const mockReviews = [
  {
    id: 1,
    reviewer: "Sarah Kim",
    rating: 5,
    comment:
      "Alex organized an incredible Web3 meetup. Great speakers, perfect venue, and amazing networking opportunities!",
    event: "Web3 Builders Meetup",
    date: "2024-01-16",
  },
  {
    id: 2,
    reviewer: "Michael Rodriguez",
    rating: 5,
    comment: "Outstanding event management. Everything was well-coordinated and the content was top-notch.",
    event: "Startup Pitch Night",
    date: "2024-01-09",
  },
]

export function UserProfile() {
  const [showAllSocials, setShowAllSocials] = useState(false)
  const [activeTab, setActiveTab] = useState("created")

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="apple-section-sm bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-24 h-24 sm:w-32 sm:h-32 layer-2 ring-4 ring-background rounded-lg">
                <AvatarImage src={userData.avatar || "/card1.png"} alt={userData.name} />
                <AvatarFallback className="text-2xl font-semibold">
                  {userData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {userData.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-1.5 layer-1">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div>
				<div className="flex items-center gap-3 mb-2">
					<h1 className="font-primary text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{userData.name}</h1>
                  {userData.isVerified && (
						<Badge variant="secondary" className="gap-1 rounded-lg">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </Badge>
                  )}
                </div>
				<p className="font-secondary text-muted-foreground text-lg leading-relaxed mb-3">{userData.bio}</p>
                <div className="font-secondary flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {userData.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {userData.joinedDate}
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {userData.socialLinks.slice(0, showAllSocials ? undefined : 2).map((social) => (
                    <Button
                      key={social.platform}
                      variant="outline"
                      size="sm"
                      className="gap-2 micro-interaction bg-transparent font-secondary"
                      asChild
                    >
                      <a href={social.url} target="_blank" rel="noopener noreferrer">
                        <social.icon className="w-4 h-4" />
                        {social.platform}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  ))}
                  {userData.socialLinks.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllSocials(!showAllSocials)}
                      className="gap-1 font-secondary"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${showAllSocials ? "rotate-180" : ""}`} />
                      {showAllSocials ? "Less" : "More"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button className="btn-apple gap-2 font-secondary rounded-lg">
                  <UserPlus className="w-4 h-4" />
                  Follow
                </Button>
                <Button variant="outline" className="btn-apple gap-2 bg-transparent font-secondary rounded-lg">
                  <MessageCircle className="w-4 h-4" />
                  Message
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
			<div className="apple-grid-4 mt-8">
				<Card className="group rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="font-primary text-3xl font-bold text-primary mb-2">{userData.stats.eventsCreated}</div>
                <div className="font-secondary text-sm text-muted-foreground">Events Created</div>
              </CardContent>
            </Card>
				<Card className="group rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="font-primary text-3xl font-bold text-secondary mb-2">{userData.stats.eventsAttended}</div>
                <div className="font-secondary text-sm text-muted-foreground">Events Attended</div>
              </CardContent>
            </Card>
				<Card className="group rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="font-primary text-3xl font-bold text-warning mb-2">{userData.stats.poapsCollected}</div>
                <div className="font-secondary text-sm text-muted-foreground">POAPs Collected</div>
              </CardContent>
            </Card>
				<Card className="group rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-6 h-6 fill-warning text-warning drop-shadow-sm" />
                  <span className="font-primary text-3xl font-bold">{userData.stats.averageRating}</span>
                </div>
                <div className="font-secondary text-sm text-muted-foreground">Avg Rating ({userData.stats.totalReviews} reviews)</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Activity Tabs */}
      <div className="apple-section">
        <div className="container mx-auto px-6 max-w-4xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
			<TabsList className="grid w-full grid-cols-4 mb-8 rounded-xl border-2 border-border bg-background/50 backdrop-blur-sm p-1 h-12">
				<TabsTrigger className="font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 flex items-center justify-center" value="created">Created Events</TabsTrigger>
				<TabsTrigger className="font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 flex items-center justify-center" value="attended">Attended Events</TabsTrigger>
				<TabsTrigger className="font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 flex items-center justify-center" value="poaps">POAP Collection</TabsTrigger>
				<TabsTrigger className="font-secondary rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 flex items-center justify-center" value="reviews">Reviews</TabsTrigger>
			</TabsList>

            <TabsContent value="created" className="space-y-8">
			  {SAMPLE_EVENTS.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{SAMPLE_EVENTS.map((event, index) => (
						<div
							key={event.id}
							className="group transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1"
							style={{ animationDelay: `${index * 0.05}s` }}
						>
							<EventCard {...event} variant="grid" />
						</div>
					))}
				</div>
			  ) : (
				<EmptyState title="No created events" description="When you create events, they'll show up here." />
			  )}
            </TabsContent>

            <TabsContent value="attended" className="space-y-8">
			  {SAMPLE_EVENTS.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{SAMPLE_EVENTS.map((event, index) => (
						<div
							key={event.id}
							className="group transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1"
							style={{ animationDelay: `${index * 0.05}s` }}
						>
							<EventCard {...event} variant="grid" />
						</div>
					))}
				</div>
			  ) : (
				<EmptyState title="No attended events" description="Events you join will appear here." />
			  )}
            </TabsContent>

            <TabsContent value="poaps" className="space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {mockPOAPs.map((poap) => (
					<Card key={poap.id} className="group overflow-hidden rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1">
                    <div className="aspect-square relative overflow-hidden">
                      <Image
                        src={poap.image || "/card1.png"}
                        alt={poap.name}
                        fill
                        className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                      <div className="absolute top-3 right-3">
                        <Badge
                          variant={
                            poap.rarity === "legendary"
                              ? "default"
                              : poap.rarity === "rare"
                                ? "secondary"
                                : poap.rarity === "uncommon"
                                  ? "outline"
                                  : "secondary"
                          }
                          className={
                            poap.rarity === "legendary"
                              ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg"
                              : poap.rarity === "rare"
                                ? "bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg"
                                : poap.rarity === "uncommon"
                                  ? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg"
                                  : ""
                          }
                        >
                          <Award className="w-3 h-3 mr-1" />
                          {poap.rarity}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                       <h4 className="font-primary font-semibold text-sm mb-2 text-foreground line-clamp-2">{poap.name}</h4>
                       <div className="font-secondary text-xs text-muted-foreground flex items-center gap-1">
                         <Calendar className="w-3 h-3" />
                         {new Date(poap.date).toLocaleDateString()}
                       </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-8">
              <div className="space-y-6">
                {mockReviews.map((review) => (
					<Card key={review.id} className="group rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out hover:scale-[1.01]">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-5">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {review.reviewer
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                             <span className="font-primary font-semibold text-foreground">{review.reviewer}</span>
                            <div className="flex items-center">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-warning text-warning drop-shadow-sm" />
                              ))}
                            </div>
                            <span className="font-secondary text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                           <p className="font-secondary text-muted-foreground mb-4 leading-relaxed">{review.comment}</p>
                           <Badge variant="outline" className="font-secondary text-xs bg-accent/20 border-accent/30">
                            {review.event}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
