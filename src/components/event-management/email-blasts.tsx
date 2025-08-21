'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Plus,
  Send,
  Mail,
  Users,
  Clock,
  CheckCircle,
  Eye,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

interface EmailBlast {
  id: string;
  subject: string;
  content: string;
  recipients: 'all' | 'checked-in' | 'not-checked-in' | 'custom';
  customRecipients?: string[];
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduledAt?: string;
  sentAt?: string;
  recipientCount: number;
  openedCount: number;
  clickedCount: number;
}

interface EmailBlastsProps {
  eventId: string;
}

const mockBlasts: EmailBlast[] = [
  {
    id: '1',
    subject: 'Welcome to ETHIndia 2025! 🎉',
    content:
      "Welcome to ETHIndia 2025! We're excited to have you join us for this incredible blockchain event.",
    recipients: 'all',
    status: 'sent',
    sentAt: '2025-01-10T10:00:00Z',
    recipientCount: 450,
    openedCount: 320,
    clickedCount: 45,
  },
  {
    id: '2',
    subject: 'Event Schedule Update',
    content:
      "We've made some updates to the event schedule. Please check the latest version.",
    recipients: 'all',
    status: 'sent',
    sentAt: '2025-01-12T14:30:00Z',
    recipientCount: 450,
    openedCount: 280,
    clickedCount: 120,
  },
  {
    id: '3',
    subject: 'Reminder: Event Tomorrow!',
    content:
      "Don't forget! ETHIndia 2025 starts tomorrow. Make sure to bring your QR code.",
    recipients: 'all',
    status: 'scheduled',
    scheduledAt: '2025-01-14T09:00:00Z',
    recipientCount: 450,
    openedCount: 0,
    clickedCount: 0,
  },
];

export function EmailBlasts({ eventId }: EmailBlastsProps) {
  const [blasts, setBlasts] = useState<EmailBlast[]>(mockBlasts);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // In a real app, this would fetch event-specific data
  const eventAttendeeCount = 450; // Mock data - would be fetched using eventId
  const checkedInCount = 421; // Mock data - would be fetched using eventId
  const notCheckedInCount = eventAttendeeCount - checkedInCount;
  const [newBlast, setNewBlast] = useState({
    subject: '',
    content: '',
    recipients: 'all' as EmailBlast['recipients'],
    customRecipients: [] as string[],
    scheduledAt: '',
  });

  const createBlast = () => {
    const blast: EmailBlast = {
      id: Date.now().toString(),
      subject: newBlast.subject,
      content: newBlast.content,
      recipients: newBlast.recipients,
      customRecipients: newBlast.customRecipients,
      status: newBlast.scheduledAt ? 'scheduled' : 'draft',
      scheduledAt: newBlast.scheduledAt || undefined,
      recipientCount: eventAttendeeCount, // Dynamic count based on eventId
      openedCount: 0,
      clickedCount: 0,
    };

    setBlasts([blast, ...blasts]);
    setNewBlast({
      subject: '',
      content: '',
      recipients: 'all',
      customRecipients: [],
      scheduledAt: '',
    });
    setIsCreateDialogOpen(false);
    toast.success('Email blast created successfully!');
  };

  const sendBlast = (blastId: string) => {
    setBlasts(
      blasts.map(blast =>
        blast.id === blastId
          ? { ...blast, status: 'sent', sentAt: new Date().toISOString() }
          : blast
      )
    );
    toast.success('Email blast sent successfully!');
  };

  const deleteBlast = (blastId: string) => {
    setBlasts(blasts.filter(blast => blast.id !== blastId));
    toast.success('Email blast deleted');
  };

  const getStatusBadge = (status: EmailBlast['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant='outline'>Draft</Badge>;
      case 'scheduled':
        return <Badge variant='secondary'>Scheduled</Badge>;
      case 'sent':
        return (
          <Badge
            variant='default'
            className='bg-success text-success-foreground'
          >
            Sent
          </Badge>
        );
      case 'failed':
        return <Badge variant='destructive'>Failed</Badge>;
      default:
        return null;
    }
  };

  const getRecipientLabel = (recipients: EmailBlast['recipients']) => {
    switch (recipients) {
      case 'all':
        return 'All Attendees';
      case 'checked-in':
        return 'Checked-in Attendees';
      case 'not-checked-in':
        return 'Not Checked-in';
      case 'custom':
        return 'Custom Recipients';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h2 className='font-primary text-xl font-bold text-foreground'>
            Email Blasts
          </h2>
          <p className='font-secondary text-sm text-muted-foreground'>
            Send updates and announcements to your event attendees (Event ID:{' '}
            {eventId})
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className='gap-2'>
              <Plus className='w-4 h-4' />
              Create New Blast
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>Create Email Blast</DialogTitle>
            </DialogHeader>
            <div className='space-y-4 py-4'>
              <div>
                <Label htmlFor='subject'>Subject</Label>
                <Input
                  id='subject'
                  value={newBlast.subject}
                  onChange={e =>
                    setNewBlast({ ...newBlast, subject: e.target.value })
                  }
                  placeholder='Enter email subject...'
                />
              </div>

              <div>
                <Label htmlFor='recipients'>Recipients</Label>
                <select
                  id='recipients'
                  value={newBlast.recipients}
                  onChange={e =>
                    setNewBlast({
                      ...newBlast,
                      recipients: e.target.value as EmailBlast['recipients'],
                    })
                  }
                  className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                >
                  <option value='all'>
                    All Attendees ({eventAttendeeCount})
                  </option>
                  <option value='checked-in'>
                    Checked-in Attendees ({checkedInCount})
                  </option>
                  <option value='not-checked-in'>
                    Not Checked-in ({notCheckedInCount})
                  </option>
                  <option value='custom'>Custom Recipients</option>
                </select>
              </div>

              <div>
                <Label htmlFor='scheduledAt'>Schedule (Optional)</Label>
                <Input
                  id='scheduledAt'
                  type='datetime-local'
                  value={newBlast.scheduledAt}
                  onChange={e =>
                    setNewBlast({ ...newBlast, scheduledAt: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor='content'>Message</Label>
                <Textarea
                  id='content'
                  value={newBlast.content}
                  onChange={e =>
                    setNewBlast({ ...newBlast, content: e.target.value })
                  }
                  placeholder='Enter your message...'
                  rows={6}
                />
              </div>
            </div>
            <div className='flex justify-end gap-3'>
              <Button
                variant='outline'
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={createBlast} className='gap-2'>
                <Send className='w-4 h-4' />
                {newBlast.scheduledAt ? 'Schedule Blast' : 'Send Now'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-3'>
              <div className='bg-primary/10 p-2 rounded-full'>
                <Mail className='w-5 h-5 text-primary' />
              </div>
              <div>
                <div className='font-primary text-2xl font-bold text-foreground'>
                  {blasts.length}
                </div>
                <div className='font-secondary text-sm text-muted-foreground'>
                  Total Blasts
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-3'>
              <div className='bg-success/10 p-2 rounded-full'>
                <CheckCircle className='w-5 h-5 text-success' />
              </div>
              <div>
                <div className='font-primary text-2xl font-bold text-foreground'>
                  {blasts.filter(b => b.status === 'sent').length}
                </div>
                <div className='font-secondary text-sm text-muted-foreground'>
                  Sent
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-3'>
              <div className='bg-warning/10 p-2 rounded-full'>
                <Clock className='w-5 h-5 text-warning' />
              </div>
              <div>
                <div className='font-primary text-2xl font-bold text-foreground'>
                  {blasts.filter(b => b.status === 'scheduled').length}
                </div>
                <div className='font-secondary text-sm text-muted-foreground'>
                  Scheduled
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-3'>
              <div className='bg-muted/10 p-2 rounded-full'>
                <Users className='w-5 h-5 text-muted-foreground' />
              </div>
              <div>
                <div className='font-primary text-2xl font-bold text-foreground'>
                  450
                </div>
                <div className='font-secondary text-sm text-muted-foreground'>
                  Total Recipients
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blasts List */}
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>Email Blasts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {blasts.map(blast => (
              <div
                key={blast.id}
                className='border rounded-lg p-4 hover:bg-muted/20 transition-colors'
              >
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-2'>
                      <h4 className='font-medium'>{blast.subject}</h4>
                      {getStatusBadge(blast.status)}
                    </div>
                    <p className='text-sm text-muted-foreground line-clamp-2'>
                      {blast.content}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        // View blast details
                        toast.info('Viewing blast details...');
                      }}
                    >
                      <Eye className='w-4 h-4' />
                    </Button>
                    {blast.status === 'draft' && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => sendBlast(blast.id)}
                      >
                        <Send className='w-4 h-4' />
                      </Button>
                    )}
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => deleteBlast(blast.id)}
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>
                </div>

                <div className='flex items-center justify-between text-sm text-muted-foreground'>
                  <div className='flex items-center gap-4'>
                    <span className='flex items-center gap-1'>
                      <Users className='w-3 h-3' />
                      {getRecipientLabel(blast.recipients)}
                    </span>
                    {blast.scheduledAt && (
                      <span className='flex items-center gap-1'>
                        <Clock className='w-3 h-3' />
                        {new Date(blast.scheduledAt).toLocaleDateString()}
                      </span>
                    )}
                    {blast.sentAt && (
                      <span className='flex items-center gap-1'>
                        <CheckCircle className='w-3 h-3' />
                        {new Date(blast.sentAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {blast.status === 'sent' && (
                    <div className='flex items-center gap-4'>
                      <span>{blast.openedCount} opened</span>
                      <span>{blast.clickedCount} clicked</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {blasts.length === 0 && (
              <div className='text-center py-12'>
                <div className='flex flex-col items-center gap-3'>
                  <div className='w-12 h-12 bg-muted/20 rounded-full flex items-center justify-center'>
                    <Mail className='w-6 h-6 text-muted-foreground' />
                  </div>
                  <div>
                    <p className='text-muted-foreground font-medium'>
                      No email blasts yet
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      Create your first email blast to communicate with
                      attendees
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
