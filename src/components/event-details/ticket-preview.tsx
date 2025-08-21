'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Copy, Download, QrCode } from 'lucide-react';
import { useState } from 'react';

interface TicketPreviewProps {
  ticketId: string;
  poapTokenId: string;
  hasPOAP: boolean;
}

export function TicketPreview({
  ticketId,
  poapTokenId,
  hasPOAP,
}: TicketPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className='space-y-6'>
      <Tabs defaultValue='ticket' className='w-full'>
        <TabsList className='grid w-full grid-cols-2 bg-muted/20 border-2 border-border'>
          <TabsTrigger
            value='ticket'
            className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
          >
            🎟️ Ticket
          </TabsTrigger>
          {hasPOAP && (
            <TabsTrigger
              value='poap'
              className='data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
            >
              🪙 POAP
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value='ticket' className='space-y-4 pt-4'>
          <div className='space-y-4'>
            {/* QR Code */}
            <div className='flex justify-center'>
              <div className='bg-white p-4 rounded-lg border-2 border-border'>
                <div className='w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center'>
                  <QrCode className='w-16 h-16 text-gray-400' />
                </div>
              </div>
            </div>

            {/* Ticket Info */}
            <div className='space-y-3'>
              <div className='flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border'>
                <span className='font-secondary text-sm text-gray'>
                  Ticket ID
                </span>
                <div className='flex items-center gap-2'>
                  <span className='font-mono text-sm font-medium text-foreground'>
                    {ticketId}
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-6 w-6 p-0'
                          onClick={() => handleCopy(ticketId)}
                        >
                          <Copy className='w-3 h-3' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{copied ? 'Copied!' : 'Copy ticket ID'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className='flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border'>
                <span className='font-secondary text-sm text-gray'>Status</span>
                <Badge className='bg-success/10 text-success border-0 px-2 py-1 text-xs'>
                  Confirmed
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='flex-1 font-secondary text-xs'
              >
                <Download className='w-3 h-3 mr-1' />
                Download
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='flex-1 font-secondary text-xs'
              >
                <QrCode className='w-3 h-3 mr-1' />
                Show QR
              </Button>
            </div>
          </div>
        </TabsContent>

        {hasPOAP && (
          <TabsContent value='poap' className='space-y-4 pt-4'>
            <div className='space-y-4'>
              {/* POAP NFT Preview */}
              <div className='flex justify-center'>
                <div className='relative'>
                  <div className='w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/40 rounded-lg border-2 border-primary/30 flex items-center justify-center'>
                    <span className='text-4xl'>🪙</span>
                  </div>
                  <Badge className='absolute -top-2 -right-2 bg-primary text-primary-foreground border-0 px-2 py-1 text-xs'>
                    POAP NFT
                  </Badge>
                </div>
              </div>

              {/* POAP Info */}
              <div className='space-y-3'>
                <div className='flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border'>
                  <span className='font-secondary text-sm text-gray'>
                    Token ID
                  </span>
                  <div className='flex items-center gap-2'>
                    <span className='font-mono text-sm font-medium text-foreground'>
                      {poapTokenId}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-6 w-6 p-0'
                            onClick={() => handleCopy(poapTokenId)}
                          >
                            <Copy className='w-3 h-3' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{copied ? 'Copied!' : 'Copy token ID'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <div className='flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border'>
                  <span className='font-secondary text-sm text-gray'>
                    Network
                  </span>
                  <Badge className='bg-info/10 text-info border-0 px-2 py-1 text-xs'>
                    Polygon
                  </Badge>
                </div>

                <div className='flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border'>
                  <span className='font-secondary text-sm text-gray'>
                    Collection
                  </span>
                  <span className='font-secondary text-sm font-medium text-foreground'>
                    ETHIndia 2025
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex-1 font-secondary text-xs'
                >
                  <Download className='w-3 h-3 mr-1' />
                  View on POAP
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  className='flex-1 font-secondary text-xs'
                >
                  <Copy className='w-3 h-3 mr-1' />
                  Share
                </Button>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
