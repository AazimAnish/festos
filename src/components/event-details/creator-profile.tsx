'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ExternalLink } from 'lucide-react';

interface CreatorProfileProps {
  creator: {
    name: string;
    avatar: string;
    verified: boolean;
    bio: string;
    eventsCount: number;
  };
}

export function CreatorProfile({ creator }: CreatorProfileProps) {
  return (
    <Card className='border-2 border-border rounded-xl overflow-hidden hover:border-primary transition-all duration-200'>
      <CardContent className='p-6'>
        <div className='flex items-start gap-4'>
          {/* Avatar */}
          <div className='relative'>
            <Avatar className='w-16 h-16 border-2 border-border'>
              <AvatarImage src={creator.avatar} alt={creator.name} />
              <AvatarFallback className='bg-primary/10 text-primary font-bold text-lg'>
                {creator.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {creator.verified && (
              <div className='absolute -bottom-1 -right-1 bg-primary rounded-full p-1'>
                <CheckCircle className='w-4 h-4 text-primary-foreground' />
              </div>
            )}
          </div>

          {/* Content */}
          <div className='flex-1 space-y-3'>
            <div className='flex items-center gap-2'>
              <h3 className='font-primary text-xl font-bold text-foreground'>
                {creator.name}
              </h3>
              {creator.verified && (
                <Badge
                  variant='secondary'
                  className='bg-primary/10 text-primary border-0 px-2 py-1 text-xs'
                >
                  ✅ verified
                </Badge>
              )}
            </div>

            <p className='font-tertiary text-gray text-sm leading-relaxed'>
              {creator.bio}
            </p>

            <div className='flex items-center gap-2 text-sm text-gray'>
              <span>🎉</span>
              <span>{creator.eventsCount} fests created</span>
            </div>
          </div>
        </div>

        {/* View All Fests Button - Centered and Prominent */}
        <div className='mt-6 pt-4 border-t border-border'>
          <Button
            variant='outline'
            className='w-full font-secondary text-sm px-4 py-2 h-auto border-2 border-border text-foreground hover:border-primary hover:text-primary transition-all duration-200 hover:scale-105 rounded-xl'
          >
            <span>View all fests</span>
            <ExternalLink className='w-4 h-4 ml-2' />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
