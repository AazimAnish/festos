'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import { UserPlus, CheckCircle, Crown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface AttendeeListProps {
  count: number;
}

export function AttendeeList({ count }: AttendeeListProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Mock attendee data
  const attendees = Array.from({ length: Math.min(count, 50) }, (_, i) => ({
    id: i + 1,
    name: `Attendee ${i + 1}`,
    avatar: `/card${(i % 3) + 1}.png`,
    verified: Math.random() > 0.7,
    isCreator: i === 0,
  }));

  // Responsive avatar count
  const maxDisplayAvatars = count > 100 ? 4 : 5;
  const displayAttendees = attendees.slice(0, maxDisplayAvatars);
  const remainingCount = count - displayAttendees.length;

  return (
    <Card className='border-2 border-border rounded-xl overflow-hidden hover:border-primary transition-all duration-200'>
      <CardHeader className='pb-4 px-6 py-6'>
        <CardTitle className='font-primary text-lg font-bold text-foreground flex items-center gap-2'>
          🙋 Attendees
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-6 px-6 pb-6'>
        {/* Main Attendee Button */}
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              className='w-full h-auto p-4 border-2 border-border hover:border-primary transition-all duration-200 group'
            >
              <div className='flex items-center justify-between w-full'>
                {/* Left Content */}
                <div className='flex items-center gap-4 flex-1 min-w-0'>
                  {/* Avatar Stack */}
                  <div className='relative flex-shrink-0'>
                    <div className='flex -space-x-2'>
                      {displayAttendees.map((attendee, index) => (
                        <Avatar
                          key={attendee.id}
                          className='w-9 h-9 border-2 border-background ring-1 ring-border hover:scale-110 transition-transform duration-200'
                          style={{ zIndex: displayAttendees.length - index }}
                        >
                          <AvatarImage
                            src={attendee.avatar}
                            alt={attendee.name}
                          />
                          <AvatarFallback className='bg-primary/10 text-primary text-xs font-bold'>
                            {attendee.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {remainingCount > 0 && (
                        <div className='w-9 h-9 bg-muted/40 border-2 border-background rounded-full flex items-center justify-center ring-1 ring-border'>
                          <span className='text-xs font-bold text-gray'>
                            +{remainingCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Attendee Info */}
                  <div className='text-left flex-1 min-w-0'>
                    <div className='font-secondary text-sm font-semibold text-foreground truncate'>
                      {count.toLocaleString()} attending
                    </div>
                    <div className='font-tertiary text-xs text-gray truncate'>
                      {remainingCount > 0
                        ? `${remainingCount} more people`
                        : 'All attendees shown'}
                    </div>
                  </div>
                </div>

                {/* Right Arrow Icon */}
                <div className='flex-shrink-0 ml-2'>
                  <ChevronRight className='w-4 h-4 text-gray group-hover:translate-x-0.5 transition-transform' />
                </div>
              </div>
            </Button>
          </PopoverTrigger>

          {/* Popover Content */}
          <PopoverContent className='w-80 p-0' align='start'>
            <div className='p-5 border-b border-border'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='font-primary text-lg font-bold text-foreground'>
                  {count.toLocaleString()} Attendees
                </h3>
                <Badge className='bg-primary/10 text-primary border-0'>
                  {count} total
                </Badge>
              </div>
              <p className='font-tertiary text-sm text-gray'>
                People who are going to this event
              </p>
            </div>

            <ScrollArea className='h-80'>
              <div className='p-4'>
                <div className='space-y-2'>
                  {attendees.map(attendee => (
                    <div
                      key={attendee.id}
                      className='flex items-center gap-3 p-3 rounded-lg hover:bg-muted/20 transition-colors cursor-pointer'
                    >
                      {/* Avatar with badges */}
                      <div className='relative'>
                        <Avatar className='w-10 h-10'>
                          <AvatarImage
                            src={attendee.avatar}
                            alt={attendee.name}
                          />
                          <AvatarFallback className='bg-primary/10 text-primary font-bold'>
                            {attendee.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Verification badge */}
                        {attendee.verified && (
                          <div className='absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5'>
                            <CheckCircle className='w-2.5 h-2.5 text-primary-foreground' />
                          </div>
                        )}

                        {/* Creator badge */}
                        {attendee.isCreator && (
                          <div className='absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5'>
                            <Crown className='w-2.5 h-2.5 text-white' />
                          </div>
                        )}
                      </div>

                      {/* Attendee info */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='font-secondary text-sm font-medium text-foreground truncate'>
                            {attendee.name}
                          </span>
                          {attendee.isCreator && (
                            <Badge className='bg-yellow-500/10 text-yellow-600 border-0 px-1.5 py-0.5 text-xs'>
                              Creator
                            </Badge>
                          )}
                        </div>
                        <div className='flex items-center gap-2 text-xs text-gray'>
                          {attendee.verified && (
                            <span className='flex items-center gap-1'>
                              <CheckCircle className='w-3 h-3' />
                              Verified
                            </span>
                          )}
                          <span>#{attendee.id}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>

        <Separator />

        {/* Community Actions */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium text-foreground'>
                🎉 Join the community
              </span>
            </div>
            <Button
              variant='ghost'
              size='sm'
              className='font-secondary text-xs px-3 py-2 h-auto text-primary hover:text-primary/80 hover:bg-primary/5'
            >
              <UserPlus className='w-3 h-3 mr-1' />
              Invite friends
            </Button>
          </div>

          <div className='text-center p-3 bg-muted/20 rounded-lg'>
            <p className='font-tertiary text-xs text-gray'>
              {count > 100
                ? '🔥 This event is popular!'
                : '🌟 Be part of something special'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
