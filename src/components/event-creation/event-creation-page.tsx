"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Ticket, Gift, Globe, Lock, Pencil } from "lucide-react"
import { EventBanner } from "@/components/event-creation/event-banner"
import { DateTimePicker } from "@/components/event-creation/date-time-picker"
import { LocationPicker } from "@/components/event-creation/location-picker"
import { CapacityDialog } from "@/components/event-creation/capacity-dialog"
import { POPDialog } from "@/components/event-creation/pop-dialog"
import { TicketPriceDialog } from "@/components/event-creation/ticket-price-dialog"

export function EventCreationPage() {
  type PopConfig = {
    popImage?: string
    recipientsMode: "all" | "random" | "top"
    recipientsCount?: number
    deliveryTime: string
  }
  const [eventName, setEventName] = useState("")
  const [visibility, setVisibility] = useState("public")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [timezone, setTimezone] = useState("America/New_York")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [ticketType, setTicketType] = useState("free")
  const [ticketPrice, setTicketPrice] = useState("")
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false)
  const [requireApproval, setRequireApproval] = useState(false)
  const [capacity, setCapacity] = useState("unlimited")
  const [popEnabled, setPopEnabled] = useState(false)
  const [popConfig, setPopConfig] = useState<PopConfig | null>(null)
  const [isPopDialogOpen, setIsPopDialogOpen] = useState(false)
  const popSummary = popConfig
    ? popConfig.recipientsMode === "all"
      ? "All attendees"
      : `${popConfig.recipientsMode === "random" ? "Random" : "Top"} ${popConfig.recipientsCount ?? 1}`
    : undefined

  const handlePopToggle = (enabled: boolean) => {
    if (enabled) {
      if (popConfig) {
        setPopEnabled(true)
      } else {
        setPopEnabled(true)
        setIsPopDialogOpen(true)
      }
    } else {
      // Turning POP off should clear any saved configuration
      setPopEnabled(false)
      setPopConfig(null)
      setIsPopDialogOpen(false)
    }
  }

  const handlePopDialogOpenChange = (open: boolean) => {
    setIsPopDialogOpen(open)
    if (!open && !popConfig) {
      setPopEnabled(false)
    }
  }

  const handlePopSave = (config: PopConfig) => {
    setPopConfig(config)
    setPopEnabled(true)
    setIsPopDialogOpen(false)
  }

  const handleTicketTypeChange = (value: string) => {
    setTicketType(value)
    if (value === "paid") {
      setIsTicketDialogOpen(true)
    } else {
      setTicketPrice("")
      setIsTicketDialogOpen(false)
    }
  }

  const handleTicketPriceSave = (priceAvax: string) => {
    setTicketPrice(priceAvax)
    setIsTicketDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1">
            <Input
              placeholder="Event name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold border-none shadow-none h-auto bg-transparent placeholder:text-muted-foreground focus-visible:ring-0 font-primary leading-[1.05] tracking-tight text-primary"
            />
          </div>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger className="w-32 h-9 rounded-lg border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Public
                </div>
              </SelectItem>
              <SelectItem value="private">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Private
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Banner */}
          <div className="lg:col-span-1">
            <EventBanner />
          </div>

          {/* Right Column - Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date & Time */}
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3">
                <DateTimePicker
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                />
              </div>
              <div className="col-span-1">
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="h-12 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">EST</SelectItem>
                    <SelectItem value="America/Los_Angeles">PST</SelectItem>
                    <SelectItem value="Europe/London">GMT</SelectItem>
                    <SelectItem value="Asia/Tokyo">JST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <LocationPicker value={location} onChange={setLocation} onlyOffline={Boolean(startDate)} />

            {/* Description */}
            <div>
              <Textarea
                placeholder="Add event description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-32 rounded-xl border-border resize-none"
              />
            </div>

            {/* Event Options */}
            <Card className="rounded-xl border-border">
              <CardContent className="p-6 space-y-6">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary font-primary">Event Options</h3>

                {/* Ticket Options */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Ticket className="h-5 w-5 text-muted-foreground" />
                      <Label className="text-base">Tickets</Label>
                    </div>
                    <Select value={ticketType} onValueChange={handleTicketTypeChange}>
                      <SelectTrigger className="w-24 h-9 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {ticketType === "paid" && (
                    <div className="ml-8 flex items-center gap-2">
                      {ticketPrice ? (
                        <span className="text-sm text-muted-foreground">{ticketPrice} AVAX</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">No price set</span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => setIsTicketDialogOpen(true)}
                      >
                        {ticketPrice ? "Edit" : "Set price"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Require Approval */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <Label className="text-base">Require approval</Label>
                  </div>
                  <Switch checked={requireApproval} onCheckedChange={setRequireApproval} />
                </div>

                {/* Capacity Settings */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <Label className="text-base">Capacity</Label>
                  </div>
                  <CapacityDialog value={capacity} onChange={setCapacity} />
                </div>

                {/* POP Option */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Gift className="h-5 w-5 text-muted-foreground" />
                      <Label className="text-base">Proof of Presence (POP)</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      {popConfig && (
                        <span className="text-sm text-muted-foreground">{popSummary}</span>
                      )}
                      {popConfig && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Edit POP"
                          className="rounded-lg text-muted-foreground hover:text-foreground"
                          onClick={() => { setPopEnabled(true); setIsPopDialogOpen(true) }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      <Switch checked={popEnabled} onCheckedChange={handlePopToggle} />
                    </div>
                  </div>
                  <POPDialog
                    open={isPopDialogOpen}
                    onOpenChange={handlePopDialogOpenChange}
                    onSave={handlePopSave}
                    trigger={null}
                    initialImage={popConfig?.popImage}
                    initialRecipientsMode={popConfig?.recipientsMode}
                    initialRecipientsCount={popConfig?.recipientsCount}
                    initialDeliveryTime={popConfig?.deliveryTime}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 h-12 rounded-xl bg-transparent">
                Save Draft
              </Button>
              <Button className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90">Create Event</Button>
            </div>
          </div>
        </div>
      </div>
      <TicketPriceDialog
        open={isTicketDialogOpen}
        onOpenChange={setIsTicketDialogOpen}
        initialPrice={ticketPrice}
        onSave={handleTicketPriceSave}
      />
    </div>
  )
}
