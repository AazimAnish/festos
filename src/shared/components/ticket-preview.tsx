'use client';

import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { QrCode, ExternalLink, Calendar, MapPin, Wallet, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface TicketPreviewProps {
  ticket: {
    id: string;
    tokenId: string;
    eventName: string;
    eventDate: string;
    eventLocation: string;
    eventImage: string;
    ticketType: string;
    originalPrice: string;
    status: 'valid' | 'used' | 'expired' | 'pending' | 'transferred';
    transferable: boolean;
    mintedAt: string;
    transactionHash?: string;
    contractAddress?: string;
    contractChainId?: number;
  };
  showDetails?: boolean;
}

export function TicketPreview({ ticket, showDetails = false }: TicketPreviewProps) {
  const [isQrOpen, setIsQrOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-success text-success-foreground';
      case 'used':
        return 'bg-muted text-muted-foreground';
      case 'expired':
        return 'bg-destructive text-destructive-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'transferred':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="overflow-hidden group rounded-xl border border-border/50 bg-background shadow-sm hover:shadow-lg hover:border-border transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1">
      <div className="relative">
        <Image
          src={ticket.eventImage || '/default-event.jpg'}
          alt={ticket.eventName}
          width={400}
          height={200}
          className="w-full h-40 object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
        <Badge className={`absolute top-3 right-3 ${getStatusColor(ticket.status)}`}>
          {ticket.status === 'used' ? 'Used' : ticket.status === 'valid' ? 'Valid' : ticket.status === 'pending' ? 'Pending' : 'Expired'}
        </Badge>
      </div>
      
      <CardContent className="p-5">
        <div className="space-y-3">
          <div>
            <h3 className="font-primary font-semibold text-foreground text-lg line-clamp-2">
              {ticket.eventName}
            </h3>
            <p className="text-sm text-muted-foreground">
              {ticket.ticketType} Ticket
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(ticket.eventDate)} at {formatTime(ticket.eventDate)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{ticket.eventLocation}</span>
            </div>

            {showDetails && (
              <>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wallet className="w-4 h-4" />
                  <span>Token ID: {ticket.tokenId}</span>
                </div>
                
                {ticket.transactionHash && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4" />
                    <span>Tx: {ticket.transactionHash.slice(0, 8)}...{ticket.transactionHash.slice(-6)}</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <QrCode className="w-4 h-4" />
                  View QR
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Ticket QR Code</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Scan this QR code at the event entrance
                  </p>
                  <div className="text-xs text-muted-foreground text-center">
                    <p>Event: {ticket.eventName}</p>
                    <p>Token ID: {ticket.tokenId}</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {ticket.transferable && (
              <Button variant="outline" size="sm" className="gap-1">
                <ExternalLink className="w-4 h-4" />
                Transfer
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

