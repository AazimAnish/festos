'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Ticket, Download, Copy } from 'lucide-react';
import QRCode from 'qrcode';
import { toast } from 'sonner';

interface QrCodeGeneratorProps {
  mockTickets?: Array<{
    id: number;
    ticketId: string;
    name: string;
  }>;
}

export function QrCodeGenerator({ mockTickets }: QrCodeGeneratorProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<string>('');
  const [customTicketId, setCustomTicketId] = useState<string>('TICKET-001');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Default mock tickets if none provided
  const defaultMockTickets = [
    { id: 1, ticketId: 'TICKET-001', name: 'Alex Chen' },
    { id: 2, ticketId: 'TICKET-002', name: 'Sarah Kim' },
    { id: 3, ticketId: 'TICKET-003', name: 'Michael Rodriguez' },
    { id: 4, ticketId: 'TICKET-004', name: 'Emily Johnson' },
    { id: 5, ticketId: 'TICKET-005', name: 'David Lee' },
  ];

  const tickets = mockTickets || defaultMockTickets;

  // Generate QR code based on selected ticket or custom input
  const generateQrCode = useCallback(async () => {
    setIsLoading(true);

    try {
      // Create the ticket data object
      const ticketData = {
        ticketId: selectedTicket === 'custom' ? customTicketId : selectedTicket,
        timestamp: new Date().toISOString(),
        type: 'event_ticket',
      };

      // Convert to JSON string
      const ticketDataString = JSON.stringify(ticketData);

      // Generate QR code as data URL
      const url = await QRCode.toDataURL(ticketDataString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000FF',
          light: '#FFFFFFFF',
        },
      });

      setQrDataUrl(url);
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
      setIsLoading(false);
    }
  }, [selectedTicket, customTicketId]);

  // Generate QR code when selected ticket changes
  useEffect(() => {
    if (selectedTicket && selectedTicket !== 'custom') {
      generateQrCode();
    }
  }, [selectedTicket, generateQrCode]);

  // Copy QR code to clipboard
  const copyQrToClipboard = async () => {
    try {
      if (qrDataUrl) {
        // Fetch the image as a blob
        const response = await fetch(qrDataUrl);
        const blob = await response.blob();

        // Create a ClipboardItem
        const item = new ClipboardItem({ [blob.type]: blob });

        // Write to clipboard
        await navigator.clipboard.write([item]);

        toast.success('QR code copied to clipboard');
      }
    } catch (error) {
      console.error('Error copying QR code:', error);
      toast.error('Failed to copy QR code');
    }
  };

  // Download QR code
  const downloadQrCode = () => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = `ticket-qr-${selectedTicket === 'custom' ? customTicketId : selectedTicket}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className='border-border'>
      <CardContent className='pt-6 space-y-6'>
        <div className='flex items-center gap-2'>
          <Ticket className='h-5 w-5 text-primary' />
          <h3 className='font-primary text-lg font-semibold'>
            QR Code Generator
          </h3>
        </div>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='ticket-select'>Select Ticket</Label>
            <Select value={selectedTicket} onValueChange={setSelectedTicket}>
              <SelectTrigger id='ticket-select'>
                <SelectValue placeholder='Select a ticket' />
              </SelectTrigger>
              <SelectContent>
                {tickets.map(ticket => (
                  <SelectItem key={ticket.ticketId} value={ticket.ticketId}>
                    {ticket.name} ({ticket.ticketId})
                  </SelectItem>
                ))}
                <SelectItem value='custom'>Custom Ticket ID</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedTicket === 'custom' && (
            <div className='space-y-2'>
              <Label htmlFor='custom-ticket-id'>Custom Ticket ID</Label>
              <div className='flex gap-2'>
                <Input
                  id='custom-ticket-id'
                  value={customTicketId}
                  onChange={e => setCustomTicketId(e.target.value)}
                  className='flex-1'
                  placeholder='Enter custom ticket ID'
                />
                <Button
                  onClick={generateQrCode}
                  disabled={isLoading || !customTicketId.trim()}
                >
                  Generate
                </Button>
              </div>
            </div>
          )}

          {/* QR Code Display */}
          <div className='pt-4'>
            {qrDataUrl ? (
              <div className='space-y-4'>
                <div className='flex justify-center'>
                  <div className='border-2 border-border rounded-lg p-4 bg-background inline-block'>
                    <Image
                      src={qrDataUrl}
                      alt='Ticket QR Code'
                      width={250}
                      height={250}
                      className='w-full max-w-[250px] h-auto'
                    />
                  </div>
                </div>

                <div className='flex gap-3 justify-center pt-2'>
                  <Button
                    variant='outline'
                    onClick={copyQrToClipboard}
                    className='gap-1.5'
                    size='sm'
                  >
                    <Copy className='h-4 w-4' />
                    Copy
                  </Button>

                  <Button
                    onClick={downloadQrCode}
                    className='gap-1.5'
                    size='sm'
                  >
                    <Download className='h-4 w-4' />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className='border-2 border-dashed border-border rounded-lg p-8 text-center'>
                <Ticket className='h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-3' />
                <p className='text-sm text-muted-foreground'>
                  {isLoading
                    ? 'Generating QR code...'
                    : 'Select a ticket to generate a QR code'}
                </p>
              </div>
            )}
          </div>

          <div className='pt-2 text-xs text-muted-foreground'>
            <p className='text-center'>
              Use this QR code with the check-in scanner to test the check-in
              process
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
