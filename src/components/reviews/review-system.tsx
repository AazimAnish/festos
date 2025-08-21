'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useWallet } from '@/lib/hooks/use-wallet';
import {
  Star,
  ThumbsUp,
  Flag,
  Search,
  ArrowUpDown,
  Edit,
  CheckCircle,
  Calendar,
  MessageCircle,
} from 'lucide-react';

interface ReviewSystemProps {
  eventId?: string;
  isEventPage?: boolean;
}

// Mock reviews
const mockReviews = [
  {
    id: '1',
    userId: 'user123',
    username: 'Alex Chen',
    avatar: null,
    rating: 5,
    comment:
      "One of the best blockchain events I've attended! Great speakers, well-organized, and amazing networking opportunities. Looking forward to the next one!",
    eventId: 'event1',
    eventName: 'ETHIndia 2025',
    date: '2025-01-16',
    verified: true,
    likes: 24,
    flagged: false,
    replyCount: 2,
    replies: [
      {
        userId: 'organizer1',
        username: 'Event Organizer',
        isOrganizer: true,
        comment:
          "Thank you for your kind words, Alex! We're glad you enjoyed the event. Hope to see you at the next one!",
        date: '2025-01-17',
      },
      {
        userId: 'user456',
        username: 'Sarah Kim',
        comment:
          'Completely agree with your review! The workshops were outstanding.',
        date: '2025-01-18',
      },
    ],
  },
  {
    id: '2',
    userId: 'user456',
    username: 'Sarah Kim',
    avatar: null,
    rating: 4,
    comment:
      'Really enjoyed the panels and workshops. The venue was a bit crowded at times, but otherwise a fantastic event with great content and speakers.',
    eventId: 'event1',
    eventName: 'ETHIndia 2025',
    date: '2025-01-17',
    verified: true,
    likes: 15,
    flagged: false,
    replyCount: 0,
    replies: [],
  },
  {
    id: '3',
    userId: 'user789',
    username: 'Michael Rodriguez',
    avatar: null,
    rating: 3,
    comment:
      'Good content but the event was very crowded and it was hard to network effectively. The tech demos were impressive though, and I made some valuable connections.',
    eventId: 'event1',
    eventName: 'ETHIndia 2025',
    date: '2025-01-18',
    verified: true,
    likes: 8,
    flagged: false,
    replyCount: 1,
    replies: [
      {
        userId: 'organizer1',
        username: 'Event Organizer',
        isOrganizer: true,
        comment:
          'Thank you for your feedback, Michael. We appreciate your comments about the crowding issue and will work on improving this for future events.',
        date: '2025-01-19',
      },
    ],
  },
  {
    id: '4',
    userId: 'user101',
    username: 'Priya Patel',
    avatar: null,
    rating: 5,
    comment:
      'Absolutely phenomenal event! I learned so much from the workshops and made incredible connections. The organization was flawless.',
    eventId: 'event2',
    eventName: 'Web3 Delhi Summit',
    date: '2025-02-21',
    verified: true,
    likes: 32,
    flagged: false,
    replyCount: 0,
    replies: [],
  },
];

// Mock user reviews for user profile page
const mockUserReviews = [
  {
    id: '1',
    userId: 'user123',
    username: 'Alex Chen',
    avatar: null,
    rating: 5,
    comment:
      "One of the best blockchain events I've attended! Great speakers, well-organized, and amazing networking opportunities. Looking forward to the next one!",
    eventId: 'event1',
    eventName: 'ETHIndia 2025',
    date: '2025-01-16',
    verified: true,
    likes: 24,
    flagged: false,
    replyCount: 2,
    replies: [],
  },
  {
    id: '5',
    userId: 'user123',
    username: 'Alex Chen',
    avatar: null,
    rating: 4,
    comment:
      "Very good conference with excellent speakers and networking opportunities. The only downside was the venue's acoustics in some rooms.",
    eventId: 'event3',
    eventName: 'Mumbai Blockchain Fest',
    date: '2025-03-12',
    verified: true,
    likes: 11,
    flagged: false,
    replyCount: 0,
    replies: [],
  },
];

// Event details for submitting a review
const mockEvent = {
  id: 'event1',
  title: 'ETHIndia 2025',
  image: '/card1.png',
  date: '2025-01-15',
};

export function ReviewSystem({
  eventId,
  isEventPage = false,
}: ReviewSystemProps) {
  const { isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<{
    id: string;
    userId: string;
    username: string;
    avatar: string | null;
    rating: number;
    comment: string;
    eventId: string;
    eventName: string;
    date: string;
    verified: boolean;
    likes: number;
    flagged: boolean;
    replyCount: number;
    replies?: Array<{
      userId: string;
      username: string;
      isOrganizer?: boolean;
      comment: string;
      date: string;
    }>;
  } | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Filter reviews based on event ID if provided, otherwise show all reviews
  let filteredReviews = [...mockReviews];

  if (isEventPage && eventId) {
    filteredReviews = mockReviews.filter(review => review.eventId === eventId);
  } else if (!isEventPage) {
    // For user reviews page, show only the current user's reviews
    filteredReviews = mockUserReviews;
  }

  // Apply search filter
  if (searchQuery) {
    filteredReviews = filteredReviews.filter(
      review =>
        review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.eventName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply tab filter
  if (activeTab === 'positive') {
    filteredReviews = filteredReviews.filter(review => review.rating >= 4);
  } else if (activeTab === 'critical') {
    filteredReviews = filteredReviews.filter(review => review.rating <= 3);
  } else if (activeTab === 'replied') {
    filteredReviews = filteredReviews.filter(review => review.replyCount > 0);
  }

  const handleOpenReviewDialog = () => {
    setRating(5);
    setReviewComment('');
    setIsReviewDialogOpen(true);
  };

  const handleSubmitReview = () => {
    // In a real app, this would submit the review to an API
    console.log({
      rating,
      comment: reviewComment,
      eventId,
    });

    setIsReviewDialogOpen(false);

    // Success message would be shown
  };

  const handleOpenReplyDialog = (review: {
    id: string;
    userId: string;
    username: string;
    avatar: string | null;
    rating: number;
    comment: string;
    eventId: string;
    eventName: string;
    date: string;
    verified: boolean;
    likes: number;
    flagged: boolean;
    replyCount: number;
    replies?: Array<{
      userId: string;
      username: string;
      isOrganizer?: boolean;
      comment: string;
      date: string;
    }>;
  }) => {
    setSelectedReview(review);
    setIsReplyDialogOpen(true);
  };

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < count ? 'fill-warning text-warning' : 'fill-muted text-muted'}`}
      />
    ));
  };

  const renderStarInputs = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <button
        key={i}
        type='button'
        onClick={() => setRating(i + 1)}
        className='focus:outline-none'
      >
        <Star
          className={`w-6 h-6 ${i < rating ? 'fill-warning text-warning' : 'fill-muted text-muted'} transition-colors hover:fill-warning/80 hover:text-warning/80`}
        />
      </button>
    ));
  };

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h2 className='font-primary text-2xl font-bold text-foreground'>
            {isEventPage ? 'Event Reviews' : 'My Reviews'}
          </h2>
          <p className='font-secondary text-sm text-muted-foreground'>
            {isEventPage
              ? 'See what attendees are saying about this event'
              : "Reviews you've left for events you've attended"}
          </p>
        </div>
        {isEventPage && isConnected && (
          <Button className='gap-2' onClick={handleOpenReviewDialog}>
            <Edit className='w-4 h-4' />
            Write a Review
          </Button>
        )}
      </div>

      {isEventPage && filteredReviews.length > 0 && (
        <Card className='bg-background border-border/50 rounded-xl'>
          <CardContent className='p-6'>
            <div className='flex flex-col sm:flex-row gap-8 items-start sm:items-center'>
              <div className='flex flex-col items-center text-center'>
                <div className='text-4xl font-primary font-bold text-foreground mb-2'>
                  {(
                    filteredReviews.reduce((acc, r) => acc + r.rating, 0) /
                    filteredReviews.length
                  ).toFixed(1)}
                </div>
                <div className='flex items-center mb-1'>
                  {renderStars(
                    Math.round(
                      filteredReviews.reduce((acc, r) => acc + r.rating, 0) /
                        filteredReviews.length
                    )
                  )}
                </div>
                <div className='text-sm text-muted-foreground'>
                  {filteredReviews.length}{' '}
                  {filteredReviews.length === 1 ? 'review' : 'reviews'}
                </div>
              </div>

              <div className='flex-1 space-y-2'>
                {[5, 4, 3, 2, 1].map(num => {
                  const count = filteredReviews.filter(
                    r => r.rating === num
                  ).length;
                  const percentage = (count / filteredReviews.length) * 100;

                  return (
                    <div key={num} className='flex items-center gap-2'>
                      <div className='flex items-center min-w-[60px]'>
                        <span className='text-sm mr-1'>{num}</span>
                        <Star className='w-4 h-4 fill-warning text-warning' />
                      </div>
                      <div className='flex-1 h-2 bg-muted/40 rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-warning rounded-full'
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className='min-w-[40px] text-right text-sm text-muted-foreground'>
                        {percentage.toFixed(0)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and filters */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-grow'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <Input
            placeholder='Search reviews...'
            className='pl-10'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className='flex items-center gap-3'>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
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
                value='positive'
                className='rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1 h-8'
              >
                Positive
              </TabsTrigger>
              <TabsTrigger
                value='critical'
                className='rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1 h-8'
              >
                Critical
              </TabsTrigger>
              {isEventPage && (
                <TabsTrigger
                  value='replied'
                  className='rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm px-3 py-1 h-8'
                >
                  Replied
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>

          <Button variant='outline' size='icon' className='h-9 w-9'>
            <ArrowUpDown className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Reviews list */}
      {filteredReviews.length > 0 ? (
        <div className='space-y-6'>
          {filteredReviews.map(review => (
            <Card
              key={review.id}
              className='bg-background border-border/50 rounded-xl'
            >
              <CardContent className='p-6'>
                <div className='flex items-start gap-4'>
                  <Avatar className='h-10 w-10'>
                    <AvatarFallback>
                      {review.username
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className='flex-1 min-w-0'>
                    <div className='flex flex-wrap items-center gap-2 mb-2'>
                      <span className='font-primary font-semibold text-foreground'>
                        {review.username}
                      </span>
                      {review.verified && (
                        <Badge
                          variant='outline'
                          className='bg-success/5 border-success/30 text-success text-xs'
                        >
                          <CheckCircle className='w-3 h-3 mr-1' /> Verified
                          Attendee
                        </Badge>
                      )}
                    </div>

                    <div className='flex items-center gap-4 mb-3'>
                      <div className='flex'>{renderStars(review.rating)}</div>

                      <span className='font-secondary text-sm text-muted-foreground flex items-center gap-1'>
                        <Calendar className='w-3 h-3' />
                        {new Date(review.date).toLocaleDateString()}
                      </span>

                      {!isEventPage && (
                        <Badge variant='outline' className='text-xs'>
                          {review.eventName}
                        </Badge>
                      )}
                    </div>

                    <p className='font-secondary text-muted-foreground mb-4 leading-relaxed'>
                      {review.comment}
                    </p>

                    <div className='flex flex-wrap items-center gap-4'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='gap-1 h-8 text-muted-foreground'
                      >
                        <ThumbsUp className='w-3 h-3' />
                        Helpful ({review.likes})
                      </Button>

                      <Button
                        variant='ghost'
                        size='sm'
                        className='gap-1 h-8 text-muted-foreground'
                      >
                        <Flag className='w-3 h-3' />
                        Report
                      </Button>

                      {isEventPage && isConnected && (
                        <Button
                          variant='ghost'
                          size='sm'
                          className='gap-1 h-8 text-muted-foreground'
                          onClick={() => handleOpenReplyDialog(review)}
                        >
                          <MessageCircle className='w-3 h-3' />
                          {review.replyCount > 0
                            ? `Replies (${review.replyCount})`
                            : 'Reply'}
                        </Button>
                      )}
                    </div>

                    {/* Show replies if they exist and it's an event page */}
                    {isEventPage &&
                      review.replies &&
                      review.replies.length > 0 && (
                        <div className='mt-4 pl-4 border-l-2 border-muted space-y-4'>
                          {review.replies.map((reply, i) => (
                            <div key={i} className='space-y-2'>
                              <div className='flex items-center gap-2'>
                                <Avatar className='h-6 w-6'>
                                  <AvatarFallback className='text-xs'>
                                    {reply.username
                                      .split(' ')
                                      .map(n => n[0])
                                      .join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className='flex items-center gap-2'>
                                    <span className='font-medium text-sm'>
                                      {reply.username}
                                    </span>
                                    {reply.isOrganizer && (
                                      <Badge
                                        variant='outline'
                                        className='text-xs'
                                      >
                                        Organizer
                                      </Badge>
                                    )}
                                  </div>
                                  <div className='text-xs text-muted-foreground'>
                                    {new Date(reply.date).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <p className='text-sm text-muted-foreground'>
                                {reply.comment}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className='bg-background border-border/50 rounded-xl'>
          <CardContent className='p-6 text-center'>
            <p className='text-muted-foreground py-6'>
              {searchQuery
                ? 'No reviews match your search criteria'
                : isEventPage
                  ? 'No reviews for this event yet. Be the first to leave a review!'
                  : "You haven't left any reviews yet."}
            </p>
            {isEventPage && isConnected && !searchQuery && (
              <Button onClick={handleOpenReviewDialog}>Write a Review</Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Write Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
          </DialogHeader>

          <div className='space-y-6 py-4'>
            {/* Event info */}
            <div className='flex items-center gap-4'>
              <div className='w-16 h-16 rounded-md relative overflow-hidden bg-muted'>
                <Image
                  src={mockEvent.image}
                  alt={mockEvent.title}
                  fill
                  className='object-cover'
                />
              </div>
              <div>
                <h3 className='font-primary font-medium'>{mockEvent.title}</h3>
                <p className='text-sm text-muted-foreground'>
                  {new Date(mockEvent.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Your Rating</label>
              <div className='flex items-center gap-1'>
                {renderStarInputs()}
              </div>
            </div>

            {/* Review text */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Your Review</label>
              <Textarea
                placeholder='Share your experience with this event...'
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                className='min-h-[120px]'
              />
              <p className='text-xs text-muted-foreground'>
                Your review will be public and associated with your username.
              </p>
            </div>
          </div>

          <div className='flex justify-end gap-3'>
            <Button
              variant='outline'
              onClick={() => setIsReviewDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={!reviewComment.trim()}
              onClick={handleSubmitReview}
            >
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className='sm:max-w-[600px]'>
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
          </DialogHeader>

          {selectedReview && (
            <div className='space-y-6 py-4'>
              {/* Original review */}
              <div className='p-4 rounded-md bg-muted/30'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='font-medium'>{selectedReview.username}</span>
                  <div className='flex'>
                    {renderStars(selectedReview.rating)}
                  </div>
                </div>
                <p className='text-sm text-muted-foreground'>
                  {selectedReview.comment}
                </p>
              </div>

              {/* Reply text */}
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Your Reply</label>
                <Textarea
                  placeholder='Write your reply...'
                  className='min-h-[100px]'
                />
                <p className='text-xs text-muted-foreground'>
                  Your reply will be public and associated with your username.
                </p>
              </div>
            </div>
          )}

          <div className='flex justify-end gap-3'>
            <Button
              variant='outline'
              onClick={() => setIsReplyDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button>Post Reply</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
