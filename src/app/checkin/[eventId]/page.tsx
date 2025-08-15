"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Camera, Search, User, Clock, Gift, Scan } from "lucide-react"

interface Attendee {
  id: string
  name: string
  email: string
  ticketType: string
  checkedIn: boolean
  checkedInAt?: string
}

// Mock data for demonstration
const mockAttendees: Attendee[] = [
  { id: "1", name: "Sarah Chen", email: "sarah@example.com", ticketType: "VIP", checkedIn: false },
  {
    id: "2",
    name: "Alex Rodriguez",
    email: "alex@example.com",
    ticketType: "General",
    checkedIn: true,
    checkedInAt: "2024-01-15T10:30:00Z",
  },
  { id: "3", name: "Jordan Kim", email: "jordan@example.com", ticketType: "Early Bird", checkedIn: false },
]

interface CheckInPageProps {
  params: Promise<{ eventId: string }>
}

export default function CheckInTerminal({ params }: CheckInPageProps) {
  const [eventId, setEventId] = useState<string>("")
  const [mode, setMode] = useState<"scanner" | "manual" | "search">("scanner")
  const [manualCode, setManualCode] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    status: "success" | "error" | null
    attendee?: Attendee
    message?: string
  }>({ status: null })
  const [filteredAttendees, setFilteredAttendees] = useState<Attendee[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)

  // Extract eventId from params
  useEffect(() => {
    const getEventId = async () => {
      const { eventId } = await params
      setEventId(eventId)
    }
    getEventId()
  }, [params])

  // Filter attendees based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = mockAttendees.filter(
        (attendee) =>
          attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          attendee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          attendee.id.includes(searchQuery),
      )
      setFilteredAttendees(filtered)
    } else {
      setFilteredAttendees([])
    }
  }, [searchQuery])

  // Initialize camera for scanner mode
  useEffect(() => {
    const videoElement = videoRef.current
    
    if (mode === "scanner" && videoElement) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          if (videoElement) {
            videoElement.srcObject = stream
          }
        })
        .catch(() => {
          // Fallback to any available camera
          navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((stream) => {
              if (videoElement) {
                videoElement.srcObject = stream
              }
            })
            .catch(console.error)
        })
    }

    return () => {
      if (videoElement?.srcObject) {
        const stream = videoElement.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [mode])

  const handleCheckIn = (attendeeId: string) => {
    const attendee = mockAttendees.find((a) => a.id === attendeeId)

    if (!attendee) {
      setValidationResult({
        status: "error",
        message: "Attendee not found",
      })
      return
    }

    if (attendee.checkedIn) {
      setValidationResult({
        status: "error",
        attendee,
        message: "Already checked in",
      })
      return
    }

    // Simulate successful check-in
    attendee.checkedIn = true
    attendee.checkedInAt = new Date().toISOString()

    setValidationResult({
      status: "success",
      attendee,
      message: "Check-in successful!",
    })

    // Clear form
    setManualCode("")
    setSearchQuery("")

    // Auto-clear result after 3 seconds
    setTimeout(() => {
      setValidationResult({ status: null })
    }, 3000)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) {
      handleCheckIn(manualCode.trim())
    }
  }

  const simulateQRScan = () => {
    setIsScanning(true)
    // Simulate QR code detection
    setTimeout(() => {
      setIsScanning(false)
      handleCheckIn("1") // Simulate scanning Sarah's ticket
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="apple-flex-between p-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold">Event Check-in</h1>
          <p className="text-muted-foreground font-mono">Event ID: {eventId}</p>
        </div>
        <div className="apple-flex gap-2">
          <Badge variant="secondary" className="font-mono">
            <Clock className="w-3 h-3 mr-1" />
            {new Date().toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto p-6">
        {/* Mode Selection */}
        <div className="apple-flex gap-2 mb-8">
          <Button
            variant={mode === "scanner" ? "default" : "outline"}
            onClick={() => setMode("scanner")}
            className="btn-apple"
          >
            <Camera className="w-4 h-4 mr-2" />
            Scanner
          </Button>
          <Button
            variant={mode === "manual" ? "default" : "outline"}
            onClick={() => setMode("manual")}
            className="btn-apple"
          >
            <Scan className="w-4 h-4 mr-2" />
            Manual Entry
          </Button>
          <Button
            variant={mode === "search" ? "default" : "outline"}
            onClick={() => setMode("search")}
            className="btn-apple"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>

        <div className="apple-grid-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {mode === "scanner" && (
              <Card className="layer-2 overflow-hidden">
                <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

                  {/* Scanner Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="w-48 h-48 border-2 border-primary rounded-lg relative">
                        {/* Corner guides */}
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />

                        {/* Scanning line animation */}
                        {isScanning && (
                          <div
                            className="absolute inset-x-0 top-0 h-0.5 bg-primary animate-pulse"
                            style={{ animation: "scan 2s linear infinite" }}
                          />
                        )}
                      </div>

                      <p className="text-white text-center mt-4 font-mono">
                        {isScanning ? "Scanning..." : "Position QR code in frame"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <Button onClick={simulateQRScan} disabled={isScanning} className="w-full btn-apple">
                    {isScanning ? "Scanning..." : "Simulate QR Scan"}
                  </Button>
                </div>
              </Card>
            )}

            {mode === "manual" && (
              <Card className="layer-2 p-6">
                <h3 className="text-lg font-semibold mb-4">Manual Entry</h3>
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 font-mono">Ticket Code or Attendee ID</label>
                    <Input
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="Enter ticket code..."
                      className="focus-apple"
                    />
                  </div>
                  <Button type="submit" className="w-full btn-apple">
                    Check In
                  </Button>
                </form>
              </Card>
            )}

            {mode === "search" && (
              <Card className="layer-2 p-6">
                <h3 className="text-lg font-semibold mb-4">Search Attendees</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 font-mono">Search by name, email, or ID</label>
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Start typing to search..."
                      className="focus-apple"
                    />
                  </div>

                  {filteredAttendees.length > 0 && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {filteredAttendees.map((attendee) => (
                        <div
                          key={attendee.id}
                          className="flex items-center justify-between p-3 border border-border rounded-lg micro-interaction"
                        >
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{attendee.name}</p>
                              <p className="text-sm text-muted-foreground font-mono">{attendee.email}</p>
                            </div>
                          </div>
                          <div className="apple-flex gap-2">
                            <Badge variant="outline">{attendee.ticketType}</Badge>
                            {attendee.checkedIn ? (
                              <Badge variant="secondary" className="bg-success text-success-foreground">
                                Checked In
                              </Badge>
                            ) : (
                              <Button size="sm" onClick={() => handleCheckIn(attendee.id)} className="btn-apple">
                                Check In
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {validationResult.status && (
              <Card
                className={`layer-3 p-6 ${
                  validationResult.status === "success" ? "border-success bg-success/5" : "border-error bg-error/5"
                }`}
              >
                <div className="apple-flex-center mb-4">
                  {validationResult.status === "success" ? (
                    <CheckCircle className="w-12 h-12 text-success" />
                  ) : (
                    <XCircle className="w-12 h-12 text-error" />
                  )}
                </div>

                <div className="text-center space-y-3">
                  <h3
                    className={`text-lg font-semibold ${
                      validationResult.status === "success" ? "text-success" : "text-error"
                    }`}
                  >
                    {validationResult.message}
                  </h3>

                  {validationResult.attendee && (
                    <div className="space-y-2">
                      <p className="font-medium">{validationResult.attendee.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">{validationResult.attendee.email}</p>
                      <div className="apple-flex-center gap-2">
                        <Badge variant="outline">{validationResult.attendee.ticketType}</Badge>
                        {validationResult.status === "success" && (
                          <Badge className="bg-success text-success-foreground">
                            <Gift className="w-3 h-3 mr-1" />
                            POAP Eligible
                          </Badge>
                        )}
                      </div>

                      {validationResult.attendee.checkedInAt && (
                        <p className="text-xs text-muted-foreground font-mono">
                          Checked in: {new Date(validationResult.attendee.checkedInAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Instructions */}
            <Card className="layer-1 p-6">
              <h3 className="text-lg font-semibold mb-4">Instructions</h3>
              <div className="space-y-3 text-sm font-mono">
                <div className="apple-flex gap-2">
                  <Camera className="w-4 h-4 text-primary mt-0.5" />
                  <p>Use Scanner for QR codes on tickets</p>
                </div>
                <div className="apple-flex gap-2">
                  <Scan className="w-4 h-4 text-primary mt-0.5" />
                  <p>Manual Entry for ticket codes or IDs</p>
                </div>
                <div className="apple-flex gap-2">
                  <Search className="w-4 h-4 text-primary mt-0.5" />
                  <p>Search to find attendees by name</p>
                </div>
                <div className="apple-flex gap-2">
                  <Gift className="w-4 h-4 text-primary mt-0.5" />
                  <p>Successful check-ins receive POAP rewards</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: calc(100% - 2px); }
          100% { top: 0; }
        }
      `}</style>
    </div>
  )
}
