import { FadeIn } from '@/components/ui/fade-in';
import { ReviewSystem } from '@/components/reviews/review-system';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface UserReviewsPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function UserReviewsPage({
  params,
}: UserReviewsPageProps) {
  const { username } = await params;

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-6 max-w-4xl py-8'>
        <div className='mb-6'>
          <Link href={`/user/${username}`}>
            <Button variant='ghost' className='gap-2 mb-4'>
              <ArrowLeft className='w-4 h-4' />
              Back to Profile
            </Button>
          </Link>
          <h1 className='font-primary text-3xl font-bold text-foreground'>
            {username}&apos;s Reviews
          </h1>
        </div>
        <FadeIn variant='up' timing='normal'>
          <ReviewSystem />
        </FadeIn>
      </div>
    </div>
  );
}
