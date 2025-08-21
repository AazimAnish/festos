'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Twitter, Share2, Copy } from 'lucide-react';
import { useState } from 'react';

interface SocialSharingProps {
  event: {
    title: string;
    hasPOAP: boolean;
    date: string;
    location: string;
  };
}

export function SocialSharing({ event }: SocialSharingProps) {
  const [includePOAP, setIncludePOAP] = useState(true);
  const [copied, setCopied] = useState(false);

  const shareText = `🎉 I'm going to ${event.title} on ${event.date} in ${event.location}! ${includePOAP && event.hasPOAP ? '🪙 POAP enabled!' : ''} #Web3 #Festos`;

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className='border-2 border-border rounded-xl overflow-hidden hover:border-primary transition-all duration-200'>
      <CardHeader className='pb-4'>
        <CardTitle className='font-primary text-xl font-bold text-foreground flex items-center gap-2'>
          🔊 Tell the chain you&apos;re going
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-4'>
          {/* Share Preview */}
          <div className='p-4 bg-muted/20 rounded-lg border border-border'>
            <div className='flex items-start gap-3'>
              <div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0'>
                <Share2 className='w-5 h-5 text-primary' />
              </div>
              <div className='flex-1 space-y-2'>
                <p className='font-tertiary text-sm text-foreground leading-relaxed'>
                  {shareText}
                </p>
                <div className='flex items-center gap-2'>
                  <Badge className='bg-primary/10 text-primary border-0 px-2 py-1 text-xs'>
                    {event.hasPOAP ? '🪙 POAP' : '🎟️ Event'}
                  </Badge>
                  <span className='text-xs text-gray'>via Festos</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* POAP Toggle */}
          {event.hasPOAP && (
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <Label className='font-secondary text-sm font-medium text-foreground'>
                  Include POAP preview
                </Label>
                <p className='font-tertiary text-xs text-gray'>
                  Show your POAP badge in the share
                </p>
              </div>
              <Switch
                checked={includePOAP}
                onCheckedChange={setIncludePOAP}
                className='data-[state=checked]:bg-primary'
              />
            </div>
          )}

          {/* Share Actions */}
          <div className='space-y-3'>
            <Button
              onClick={handleTwitterShare}
              className='w-full font-secondary text-sm px-4 py-3 h-auto bg-info text-info-foreground rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-info/90 hover:shadow-lg hover:shadow-info/20'
            >
              <Twitter className='w-4 h-4 mr-2' />
              Share on Twitter
            </Button>

            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={handleCopyShare}
                className='flex-1 font-secondary text-sm px-4 py-2 h-auto border-2 border-border text-foreground hover:border-primary hover:text-primary transition-all duration-200'
              >
                <Copy className='w-4 h-4 mr-2' />
                {copied ? 'Copied!' : 'Copy Text'}
              </Button>
              <Button
                variant='outline'
                className='flex-1 font-secondary text-sm px-4 py-2 h-auto border-2 border-border text-foreground hover:border-primary hover:text-primary transition-all duration-200'
              >
                <Share2 className='w-4 h-4 mr-2' />
                More Options
              </Button>
            </div>
          </div>

          {/* Social Proof */}
          <div className='text-center'>
            <p className='font-tertiary text-xs text-gray'>
              🚀 Share to build the community
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
