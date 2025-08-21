'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FadeIn } from '@/components/ui/fade-in';
import { Loading } from '@/components/ui/loading';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { QrCodeGenerator } from '@/components/check-in/qr-code-generator';
import {
  ArrowLeft,
  Search,
  QrCode,
  Check,
  X,
  UserPlus,
  RefreshCw,
  Settings,
} from 'lucide-react';

// Dynamically import the QR scanner component to prevent SSR issues
const QrScanner = dynamic(() => import('react-qr-scanner'), {
  ssr: false,
  loading: () => (
    <div className='aspect-square max-w-md mx-auto border-2 border-dashed border-border flex items-center justify-center'>
      <div className='text-center space-y-4'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
        <p className='font-secondary text-sm text-muted-foreground'>
          Loading camera...
        </p>
      </div>
    </div>
  ),
});

interface CheckInPageProps {
  eventId: string;
}

export function CheckInPage({ eventId }: CheckInPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);

  // Mock event data - in a real app, this would be fetched from an API
  const eventData = {
    id: eventId,
    title: 'ETHIndia 2025 🇮🇳',
    date: 'Jan 15, 2025',
    time: '10:00 AM - 6:00 PM',
    location: 'Bangalore, India',
    image: '/card1.png',
    totalAttendees: 450,
    checkedInAttendees: 325,
  };

  // Mock attendees data
  const attendees = [
    {
      id: 1,
      name: 'Alex Chen',
      email: 'alex@example.com',
      checkedIn: true,
      ticketType: 'General Admission',
      ticketId: 'TICKET-001',
    },
    {
      id: 2,
      name: 'Sarah Kim',
      email: 'sarah@example.com',
      checkedIn: false,
      ticketType: 'VIP',
      ticketId: 'TICKET-002',
    },
    {
      id: 3,
      name: 'Michael Rodriguez',
      email: 'michael@example.com',
      checkedIn: true,
      ticketType: 'General Admission',
      ticketId: 'TICKET-003',
    },
    {
      id: 4,
      name: 'Emily Johnson',
      email: 'emily@example.com',
      checkedIn: false,
      ticketType: 'General Admission',
      ticketId: 'TICKET-004',
    },
    {
      id: 5,
      name: 'David Lee',
      email: 'david@example.com',
      checkedIn: false,
      ticketType: 'VIP',
      ticketId: 'TICKET-005',
    },
  ];

  const [scanError, setScanError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [foundAttendee, setFoundAttendee] = useState<
    (typeof attendees)[0] | null
  >(null);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Handle QR scan result
  const handleScan = (data: string | null) => {
    if (!data) return;

    try {
      // Parse the QR data - in a real app this would be more robust
      // and would validate signatures or other security measures
      const ticketData = JSON.parse(data);

      if (ticketData && ticketData.ticketId) {
        // Find the matching attendee by ticket ID
        const matchedAttendee = attendees.find(
          attendee => attendee.ticketId === ticketData.ticketId
        );

        if (matchedAttendee) {
          setFoundAttendee(matchedAttendee);
          setScanSuccess(true);
          setScanError(null);

          // Auto-check in the attendee if they're not already checked in
          if (!matchedAttendee.checkedIn) {
            toggleCheckIn(matchedAttendee.id);
          }

          toast.success(`Found: ${matchedAttendee.name}`, {
            description: matchedAttendee.checkedIn
              ? 'Already checked in'
              : 'Successfully checked in',
          });

          // Hide scanner after successful scan
          setTimeout(() => {
            setShowScanner(false);
          }, 2000);
        } else {
          setScanError(
            'Invalid ticket ID. This ticket is not registered for this event.'
          );
          toast.error('Invalid ticket', {
            description: 'This ticket is not registered for this event.',
          });
        }
      } else {
        setScanError('Invalid QR code format.');
        toast.error('Invalid QR code', {
          description:
            "The scanned code doesn't contain valid ticket information.",
        });
      }
    } catch {
      setScanError('Failed to parse QR code data.');
      toast.error('Invalid QR code', {
        description: 'Could not read the ticket information.',
      });
    }
  };

  const handleScanError = (err: Error) => {
    setScanError(`Camera error: ${err.message}`);
    console.error('QR Scanner error:', err);
    toast.error('Camera error', {
      description: 'Please check camera permissions and try again.',
    });
  };

  const filteredAttendees = attendees.filter(
    attendee =>
      attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCheckIn = (attendeeId: number) => {
    // In a real app, this would update the database
    console.log(`Toggling check-in for attendee ${attendeeId}`);

    // Update local state for demonstration purposes
    const updatedAttendees = attendees.map(attendee => {
      if (attendee.id === attendeeId) {
        // Toggle the check-in status
        return { ...attendee, checkedIn: !attendee.checkedIn };
      }
      return attendee;
    });

    // Mock API success
    setTimeout(() => {
      // In a real app, we would update the state with the response from the API
      if (updatedAttendees.find(a => a.id === attendeeId)?.checkedIn) {
        toast.success('Attendee checked in successfully');
        // Update the event stats (would normally come from API)
        eventData.checkedInAttendees += 1;
      } else {
        toast.info('Attendee check-in status reverted');
        // Update the event stats (would normally come from API)
        eventData.checkedInAttendees -= 1;
      }
    }, 500);
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <Loading size='lg' text='Loading check-in...' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-30'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <Link
                href={`/event/manage/${eventId}`}
                className='hover:opacity-80 transition-opacity'
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
                  />
                </div>
                <div>
                  <h1 className='font-primary text-lg font-bold text-foreground'>
                    {eventData.title} - Check-in
                  </h1>
                  <p className='font-secondary text-xs text-muted-foreground'>
                    {eventData.date} • {eventData.time}
                  </p>
                </div>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='gap-1.5'
                onClick={() => setShowScanner(!showScanner)}
              >
                <QrCode className='h-4 w-4' />
                <span>{showScanner ? 'Hide Scanner' : 'Show Scanner'}</span>
              </Button>

              <Button variant='outline' size='sm' className='gap-1.5'>
                <RefreshCw className='h-4 w-4' />
                <span>Refresh</span>
              </Button>

              <Button variant='default' size='sm' className='gap-1.5'>
                <UserPlus className='h-4 w-4' />
                <span>Add Attendee</span>
              </Button>

              <Button
                variant='ghost'
                size='sm'
                className='gap-1.5 border border-dashed border-muted-foreground/30 bg-muted/50'
                onClick={() => setShowDevTools(!showDevTools)}
              >
                <Settings className='h-4 w-4' />
                <span>Dev Tools</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='container mx-auto px-4 py-8'>
        <FadeIn variant='up' timing='normal'>
          {/* Stats */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8'>
            <Card className='p-6 space-y-2'>
              <h3 className='font-secondary text-sm text-muted-foreground'>
                Total Attendees
              </h3>
              <p className='font-primary text-2xl font-bold text-foreground'>
                {eventData.totalAttendees}
              </p>
            </Card>
            <Card className='p-6 space-y-2'>
              <h3 className='font-secondary text-sm text-muted-foreground'>
                Checked In
              </h3>
              <p className='font-primary text-2xl font-bold text-foreground'>
                {eventData.checkedInAttendees}
              </p>
            </Card>
            <Card className='p-6 space-y-2'>
              <h3 className='font-secondary text-sm text-muted-foreground'>
                Remaining
              </h3>
              <p className='font-primary text-2xl font-bold text-foreground'>
                {eventData.totalAttendees - eventData.checkedInAttendees}
              </p>
            </Card>
          </div>

          {/* QR Scanner */}
          {showScanner && (
            <div className='mb-8'>
              <Card className='p-6'>
                <div className='max-w-md mx-auto'>
                  {scanError && !scanSuccess && (
                    <div className='mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-center'>
                      <p className='font-secondary text-sm text-destructive'>
                        {scanError}
                      </p>
                    </div>
                  )}

                  {scanSuccess && foundAttendee && (
                    <div className='mb-4 p-4 bg-success/10 border border-success/20 rounded-lg'>
                      <div className='flex items-center gap-3'>
                        <div className='bg-success/20 w-10 h-10 rounded-full flex items-center justify-center'>
                          <Check className='text-success w-5 h-5' />
                        </div>
                        <div>
                          <h4 className='font-primary text-base font-semibold text-foreground'>
                            {foundAttendee.name}
                          </h4>
                          <p className='font-secondary text-xs text-muted-foreground'>
                            {foundAttendee.email}
                          </p>
                        </div>
                        <div className='ml-auto'>
                          <span
                            className={`px-2 py-1 rounded-md text-xs ${foundAttendee.checkedIn ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}
                          >
                            {foundAttendee.checkedIn
                              ? 'Checked In'
                              : 'Not Checked In'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className='relative'>
                    {/* Camera permission note */}
                    <div className='absolute top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm p-2 rounded-t-lg'>
                      <p className='font-secondary text-xs text-center text-muted-foreground'>
                        Camera access required. Please allow permissions when
                        prompted.
                      </p>
                    </div>

                    {/* QR Scanner Component */}
                    <QrScanner
                      delay={500}
                      onError={handleScanError}
                      onScan={handleScan}
                      style={{
                        width: '100%',
                        borderRadius: '0.5rem',
                        overflow: 'hidden',
                      }}
                      constraints={{
                        video: { facingMode: 'environment' },
                      }}
                    />

                    {/* Control overlay at the bottom */}
                    <div className='absolute bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm p-2 rounded-b-lg'>
                      <div className='flex items-center justify-between'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setShowScanner(false)}
                          className='text-xs'
                        >
                          Cancel
                        </Button>
                        <p className='text-xs text-muted-foreground'>
                          Scanning for QR codes...
                        </p>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => {
                            setScanSuccess(false);
                            setFoundAttendee(null);
                            setScanError(null);
                          }}
                          className='text-xs'
                        >
                          <RefreshCw className='h-3 w-3 mr-1' />
                          Reset
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className='mt-4 text-center'>
                    <p className='font-secondary text-sm text-muted-foreground'>
                      Point your camera at a ticket QR code to scan
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Search */}
          <div className='mb-8'>
            <div className='relative max-w-md'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
              <Input
                placeholder='Search by name or email...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>

          {/* Developer Tools - QR Generator */}
          {showDevTools && (
            <div className='mb-8'>
              <div className='border-2 border-yellow-500/30 rounded-lg p-4 bg-yellow-500/10 mb-4'>
                <p className='font-secondary text-sm text-center text-yellow-600'>
                  Developer tools: Use this QR generator to test the check-in
                  scanning functionality
                </p>
              </div>
              <QrCodeGenerator
                mockTickets={attendees.map(a => ({
                  id: a.id,
                  ticketId: a.ticketId,
                  name: a.name,
                }))}
              />
            </div>
          )}

          {/* Attendees List */}
          <div className='space-y-4'>
            <h2 className='font-primary text-xl font-bold text-foreground'>
              Attendees
            </h2>

            <div className='border border-border rounded-lg overflow-hidden'>
              <table className='w-full'>
                <thead className='bg-muted/30'>
                  <tr>
                    <th className='px-4 py-3 text-left font-primary text-sm font-bold text-foreground'>
                      Name
                    </th>
                    <th className='px-4 py-3 text-left font-primary text-sm font-bold text-foreground'>
                      Email
                    </th>
                    <th className='px-4 py-3 text-left font-primary text-sm font-bold text-foreground'>
                      Ticket Type
                    </th>
                    <th className='px-4 py-3 text-right font-primary text-sm font-bold text-foreground'>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendees.map(attendee => (
                    <tr key={attendee.id} className='border-t border-border'>
                      <td className='px-4 py-3 font-secondary text-sm'>
                        {attendee.name}
                      </td>
                      <td className='px-4 py-3 font-secondary text-sm text-muted-foreground'>
                        {attendee.email}
                      </td>
                      <td className='px-4 py-3 font-secondary text-sm'>
                        {attendee.ticketType}
                      </td>
                      <td className='px-4 py-3 text-right'>
                        <Button
                          variant={attendee.checkedIn ? 'default' : 'outline'}
                          size='sm'
                          className={`gap-1.5 ${
                            attendee.checkedIn
                              ? 'bg-green-600 hover:bg-green-700'
                              : ''
                          }`}
                          onClick={() => toggleCheckIn(attendee.id)}
                        >
                          {attendee.checkedIn ? (
                            <>
                              <Check className='h-4 w-4' />
                              <span>Checked In</span>
                            </>
                          ) : (
                            <>
                              <X className='h-4 w-4' />
                              <span>Not Checked In</span>
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredAttendees.length === 0 && (
              <div className='text-center py-8'>
                <p className='font-secondary text-sm text-muted-foreground'>
                  No attendees found matching your search.
                </p>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
