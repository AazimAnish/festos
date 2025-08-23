'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { FadeIn } from '@/shared/components/ui/fade-in';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    // In production, this would send to a service like Sentry
  }, [error]);

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <div className='max-w-md w-full text-center space-y-8'>
        <FadeIn variant='up' timing='normal'>
          <div className='space-y-6'>
            {/* Error Icon */}
            <div className='flex justify-center'>
              <div className='w-20 h-20 bg-error/10 rounded-full flex items-center justify-center'>
                <AlertTriangle className='w-10 h-10 text-error' />
              </div>
            </div>

            {/* Content */}
            <div className='space-y-4'>
              <h1 className='font-primary text-2xl sm:text-3xl font-bold text-foreground'>
                Something went wrong
              </h1>
              <p className='font-secondary text-base text-gray leading-relaxed'>
                We encountered an unexpected error. Please try refreshing the
                page or go back to the homepage.
              </p>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row gap-3 justify-center'>
              <Button
                onClick={reset}
                className='bg-primary hover:bg-primary/90'
              >
                <RefreshCw className='w-4 h-4 mr-2' />
                Try Again
              </Button>

              <Button variant='outline' asChild>
                <Link href='/'>
                  <Home className='w-4 h-4 mr-2' />
                  Go Home
                </Link>
              </Button>
            </div>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
              <details className='text-left'>
                <summary className='cursor-pointer font-secondary text-sm text-gray hover:text-foreground'>
                  Error Details (Development)
                </summary>
                <pre className='mt-2 p-3 bg-muted rounded-lg text-xs overflow-auto'>
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
