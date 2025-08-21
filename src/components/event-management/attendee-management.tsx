'use client';

import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Download,
  Filter,
  MoreHorizontal,
  Search,
  Mail,
  Send,
  CheckCircle,
  X,
  Clock,
  QrCode,
  Edit,
  Trash2,
  Eye,
  Copy,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { AddAttendeeDialog } from './add-attendee-dialog';
import { toast } from 'sonner';

interface Attendee {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  ticketType: 'General' | 'VIP' | 'Premium';
  purchaseDate: string;
  checkInStatus: 'checked-in' | 'not-checked-in';
  checkInTime: string | null;
  walletAddress: string;
  phone?: string;
  notes?: string;
}

interface AttendeeManagementProps {
  eventId: string;
}

// Enhanced mock attendee data
const initialAttendees: Attendee[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    avatar: null,
    ticketType: 'VIP',
    purchaseDate: '2024-12-15',
    checkInStatus: 'checked-in',
    checkInTime: '2025-01-15T10:15:00',
    walletAddress: '0xF5a2...6b47',
    phone: '+1 (555) 123-4567',
    notes: 'VIP guest - special dietary requirements',
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    avatar: null,
    ticketType: 'General',
    purchaseDate: '2024-12-18',
    checkInStatus: 'checked-in',
    checkInTime: '2025-01-15T10:05:00',
    walletAddress: '0x1234...5678',
    phone: '+1 (555) 234-5678',
  },
  {
    id: '3',
    name: 'Jessica Rodriguez',
    email: 'jessica.r@example.com',
    avatar: null,
    ticketType: 'General',
    purchaseDate: '2024-12-20',
    checkInStatus: 'not-checked-in',
    checkInTime: null,
    walletAddress: '0xabcd...ef12',
  },
  {
    id: '4',
    name: 'Ahmed Khan',
    email: 'ahmed.k@example.com',
    avatar: null,
    ticketType: 'VIP',
    purchaseDate: '2025-01-02',
    checkInStatus: 'checked-in',
    checkInTime: '2025-01-15T09:45:00',
    walletAddress: '0x7890...1234',
    phone: '+1 (555) 345-6789',
  },
  {
    id: '5',
    name: 'Priya Patel',
    email: 'priya.p@example.com',
    avatar: null,
    ticketType: 'General',
    purchaseDate: '2025-01-05',
    checkInStatus: 'not-checked-in',
    checkInTime: null,
    walletAddress: '0x5678...9012',
  },
];

export function AttendeeManagement({ eventId }: AttendeeManagementProps) {
  const [attendees, setAttendees] = useState<Attendee[]>(initialAttendees);
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Memoized filtered attendees
  const filteredAttendees = useMemo(() => {
    return attendees.filter(attendee => {
      // Apply search filter
      const matchesSearch =
        searchQuery === '' ||
        attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attendee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attendee.walletAddress
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (attendee.phone && attendee.phone.includes(searchQuery));

      // Apply status filter
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'checked-in' &&
          attendee.checkInStatus === 'checked-in') ||
        (filterStatus === 'not-checked-in' &&
          attendee.checkInStatus === 'not-checked-in');

      return matchesSearch && matchesStatus;
    });
  }, [attendees, searchQuery, filterStatus]);

  // Memoized statistics
  const stats = useMemo(() => {
    const total = attendees.length;
    const checkedIn = attendees.filter(
      a => a.checkInStatus === 'checked-in'
    ).length;
    const notCheckedIn = total - checkedIn;
    const checkInRate = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

    return { total, checkedIn, notCheckedIn, checkInRate };
  }, [attendees]);

  const toggleSelectAll = useCallback(() => {
    if (selectedAttendees.length === filteredAttendees.length) {
      setSelectedAttendees([]);
    } else {
      setSelectedAttendees(filteredAttendees.map(a => a.id));
    }
  }, [selectedAttendees.length, filteredAttendees]);

  const toggleSelectAttendee = useCallback((id: string) => {
    setSelectedAttendees(prev =>
      prev.includes(id)
        ? prev.filter(attendeeId => attendeeId !== id)
        : [...prev, id]
    );
  }, []);

  const handleAttendeeAdded = useCallback(
    (newAttendee: {
      name: string;
      email: string;
      ticketType: 'General' | 'VIP' | 'Premium';
      walletAddress?: string;
      phone?: string;
      notes?: string;
    }) => {
      const attendee: Attendee = {
        id: Date.now().toString(),
        name: newAttendee.name,
        email: newAttendee.email,
        avatar: null,
        ticketType: newAttendee.ticketType,
        purchaseDate: new Date().toISOString().split('T')[0],
        checkInStatus: 'not-checked-in',
        checkInTime: null,
        walletAddress: newAttendee.walletAddress || 'Not provided',
        phone: newAttendee.phone,
        notes: newAttendee.notes,
      };

      setAttendees(prev => [attendee, ...prev]);
      setSelectedAttendees([]);
    },
    []
  );

  const handleCheckIn = useCallback(async (attendeeId: string) => {
    setIsLoading(true);
    setActionError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAttendees(prev =>
        prev.map(attendee =>
          attendee.id === attendeeId
            ? {
                ...attendee,
                checkInStatus: 'checked-in' as const,
                checkInTime: new Date().toISOString(),
              }
            : attendee
        )
      );
    } catch {
      setActionError('Failed to check in attendee. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDeleteAttendee = useCallback(async (attendeeId: string) => {
    if (!confirm('Are you sure you want to remove this attendee?')) return;

    setIsLoading(true);
    setActionError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAttendees(prev => prev.filter(attendee => attendee.id !== attendeeId));
      setSelectedAttendees(prev => prev.filter(id => id !== attendeeId));
    } catch {
      setActionError('Failed to remove attendee. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  }, []);

  const getAttendeeStatus = useCallback((status: string) => {
    switch (status) {
      case 'checked-in':
        return (
          <Badge className='bg-success/20 text-success border-success/30'>
            <CheckCircle className='w-3 h-3 mr-1' /> Checked In
          </Badge>
        );
      case 'not-checked-in':
        return (
          <Badge variant='outline' className='border-muted-foreground/30'>
            <Clock className='w-3 h-3 mr-1' /> Not Checked In
          </Badge>
        );
      default:
        return null;
    }
  }, []);

  const getTicketTypeBadge = useCallback((type: string) => {
    const variants = {
      VIP: 'default',
      Premium: 'secondary',
      General: 'outline',
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'outline'}>
        {type}
      </Badge>
    );
  }, []);

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h2 className='font-primary text-xl font-bold text-foreground'>
            Guest Management
          </h2>
          <p className='font-secondary text-sm text-muted-foreground'>
            Manage your event attendees, send communications, and track
            check-ins
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-3'>
          <AddAttendeeDialog
            eventId={eventId}
            onAttendeeAdded={handleAttendeeAdded}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' className='gap-2'>
                <Download className='w-4 h-4' />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                onClick={() => {
                  toast.success(
                    "CSV export started. You'll receive it via email."
                  );
                }}
              >
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  toast.success(
                    "Excel export started. You'll receive it via email."
                  );
                }}
              >
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  toast.success(
                    "PDF export started. You'll receive it via email."
                  );
                }}
              >
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size='sm'
                className='gap-2'
                disabled={selectedAttendees.length === 0}
              >
                <Mail className='w-4 h-4' />
                Email Guests ({selectedAttendees.length})
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[600px]'>
              <DialogHeader>
                <DialogTitle>Email Selected Guests</DialogTitle>
              </DialogHeader>
              <div className='space-y-4 py-4'>
                <div>
                  <label className='text-sm font-medium mb-2 block'>
                    Recipients
                  </label>
                  <div className='p-2 border rounded-md bg-muted/20'>
                    <div className='flex items-center gap-2 flex-wrap'>
                      {selectedAttendees.length > 0 ? (
                        <>
                          <Badge className='bg-primary/20 text-primary border-primary/30'>
                            {selectedAttendees.length} selected guests
                          </Badge>
                        </>
                      ) : (
                        <span className='text-sm text-muted-foreground'>
                          No guests selected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className='text-sm font-medium mb-2 block'>
                    Subject
                  </label>
                  <Input placeholder='Enter email subject...' />
                </div>
                <div>
                  <label className='text-sm font-medium mb-2 block'>
                    Message
                  </label>
                  <textarea
                    className='w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                    placeholder='Enter your message...'
                  />
                </div>
              </div>
              <div className='flex justify-end gap-3'>
                <Button
                  variant='outline'
                  onClick={() => setIsEmailDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button className='gap-2'>
                  <Send className='w-4 h-4' />
                  Send Email
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Display */}
      {actionError && (
        <div className='flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg'>
          <AlertCircle className='w-4 h-4 text-destructive flex-shrink-0' />
          <p className='text-sm text-destructive'>{actionError}</p>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setActionError(null)}
            className='ml-auto h-6 w-6 p-0'
          >
            <X className='w-3 h-3' />
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
        <Card className='bg-background border-border/50 rounded-xl hover:shadow-md transition-shadow'>
          <CardContent className='p-6'>
            <div className='font-primary text-2xl font-bold text-foreground'>
              {stats.total}
            </div>
            <div className='font-secondary text-sm text-muted-foreground'>
              Total Registrations
            </div>
          </CardContent>
        </Card>

        <Card className='bg-background border-border/50 rounded-xl hover:shadow-md transition-shadow'>
          <CardContent className='p-6'>
            <div className='font-primary text-2xl font-bold text-success'>
              {stats.checkedIn}
            </div>
            <div className='font-secondary text-sm text-muted-foreground'>
              Checked In
            </div>
          </CardContent>
        </Card>

        <Card className='bg-background border-border/50 rounded-xl hover:shadow-md transition-shadow'>
          <CardContent className='p-6'>
            <div className='font-primary text-2xl font-bold text-foreground'>
              {stats.notCheckedIn}
            </div>
            <div className='font-secondary text-sm text-muted-foreground'>
              Not Checked In
            </div>
          </CardContent>
        </Card>

        <Card className='bg-background border-border/50 rounded-xl hover:shadow-md transition-shadow'>
          <CardContent className='p-6'>
            <div className='font-primary text-2xl font-bold text-foreground'>
              {stats.checkInRate}%
            </div>
            <div className='font-secondary text-sm text-muted-foreground'>
              Check-in Rate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and search */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-grow'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <Input
            placeholder='Search by name, email, wallet, or phone...'
            className='pl-10 rounded-xl'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className='flex items-center gap-3'>
          <Tabs
            value={filterStatus}
            onValueChange={setFilterStatus}
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
                value='checked-in'
                className='rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1 h-8'
              >
                Checked In
              </TabsTrigger>
              <TabsTrigger
                value='not-checked-in'
                className='rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1 h-8'
              >
                Not Checked In
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button variant='outline' size='icon' className='h-9 w-9'>
            <Filter className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Attendee table */}
      <Card className='bg-background border-border/50 rounded-xl overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-muted/30'>
              <tr>
                <th className='px-4 py-3 text-left'>
                  <div className='flex items-center'>
                    <Checkbox
                      checked={
                        selectedAttendees.length === filteredAttendees.length &&
                        filteredAttendees.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                      disabled={isLoading}
                    />
                  </div>
                </th>
                <th className='px-4 py-3 text-left font-medium text-sm'>
                  Attendee
                </th>
                <th className='px-4 py-3 text-left font-medium text-sm'>
                  Ticket Type
                </th>
                <th className='px-4 py-3 text-left font-medium text-sm'>
                  Purchase Date
                </th>
                <th className='px-4 py-3 text-left font-medium text-sm'>
                  Status
                </th>
                <th className='px-4 py-3 text-left font-medium text-sm'>
                  Check-in Time
                </th>
                <th className='px-4 py-3 text-left font-medium text-sm'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {filteredAttendees.map(attendee => (
                <tr
                  key={attendee.id}
                  className='hover:bg-muted/20 transition-colors'
                >
                  <td className='px-4 py-4'>
                    <div className='flex items-center'>
                      <Checkbox
                        checked={selectedAttendees.includes(attendee.id)}
                        onCheckedChange={() =>
                          toggleSelectAttendee(attendee.id)
                        }
                        disabled={isLoading}
                      />
                    </div>
                  </td>
                  <td className='px-4 py-4'>
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-8 w-8'>
                        <AvatarFallback className='bg-primary/10 text-primary text-xs font-bold'>
                          {attendee.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0 flex-1'>
                        <div className='font-medium text-sm truncate'>
                          {attendee.name}
                        </div>
                        <div className='text-xs text-muted-foreground truncate'>
                          {attendee.email}
                        </div>
                        <div className='text-xs text-muted-foreground font-mono truncate'>
                          {attendee.walletAddress}
                        </div>
                        {attendee.phone && (
                          <div className='text-xs text-muted-foreground truncate'>
                            {attendee.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-4'>
                    {getTicketTypeBadge(attendee.ticketType)}
                  </td>
                  <td className='px-4 py-4 text-sm'>
                    {new Date(attendee.purchaseDate).toLocaleDateString()}
                  </td>
                  <td className='px-4 py-4'>
                    {getAttendeeStatus(attendee.checkInStatus)}
                  </td>
                  <td className='px-4 py-4 text-sm'>
                    {attendee.checkInTime
                      ? new Date(attendee.checkInTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </td>
                  <td className='px-4 py-4'>
                    <div className='flex items-center gap-2'>
                      {attendee.checkInStatus !== 'checked-in' && (
                        <Button
                          variant='outline'
                          size='sm'
                          className='gap-1 h-8'
                          onClick={() => handleCheckIn(attendee.id)}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className='w-3 h-3 animate-spin' />
                          ) : (
                            <QrCode className='w-3 h-3' />
                          )}
                          Check In
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                          >
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-48'>
                          <DropdownMenuItem
                            onClick={() => copyToClipboard(attendee.email)}
                          >
                            <Copy className='w-4 h-4 mr-2' />
                            Copy Email
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              copyToClipboard(attendee.walletAddress)
                            }
                          >
                            <Copy className='w-4 h-4 mr-2' />
                            Copy Wallet
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className='w-4 h-4 mr-2' />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className='w-4 h-4 mr-2' />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteAttendee(attendee.id)}
                            className='text-destructive focus:text-destructive'
                          >
                            <Trash2 className='w-4 h-4 mr-2' />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAttendees.length === 0 && (
          <div className='py-12 text-center'>
            <div className='flex flex-col items-center gap-3'>
              <div className='w-12 h-12 bg-muted/20 rounded-full flex items-center justify-center'>
                <Search className='w-6 h-6 text-muted-foreground' />
              </div>
              <div>
                <p className='text-muted-foreground font-medium'>
                  No attendees found
                </p>
                <p className='text-sm text-muted-foreground'>
                  {searchQuery || filterStatus !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Add your first attendee to get started'}
                </p>
              </div>
              {(searchQuery || filterStatus !== 'all') && (
                <Button
                  variant='link'
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                  }}
                >
                  Reset filters
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
