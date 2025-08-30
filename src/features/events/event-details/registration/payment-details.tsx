'use client';

import { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { CreditCard } from 'lucide-react';

interface PaymentDetailsProps {
  eventPrice: string;
  gasEstimate: string;
}

export const PaymentDetails = memo(function PaymentDetails({
  eventPrice,
  gasEstimate,
}: PaymentDetailsProps) {
  const total = useMemo(() => {
    return eventPrice === 'Free' ? gasEstimate + ' AVAX' : eventPrice;
  }, [eventPrice, gasEstimate]);

  return (
    <Card className='border-2 border-border bg-background/80 backdrop-blur-sm shadow-lg rounded-3xl'>
      <CardHeader className='pb-4'>
        <CardTitle className='text-base flex items-center space-x-3'>
          <CreditCard className='h-5 w-5 text-primary' />
          <span className='font-secondary'>Payment Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-3'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-gray font-secondary'>Event Price</span>
            <span className='font-medium text-foreground font-secondary'>
              {eventPrice}
            </span>
          </div>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-gray font-secondary'>
              Gas Fee (estimated)
            </span>
            <span className='font-medium text-foreground font-secondary'>
              {gasEstimate} AVAX
            </span>
          </div>
        </div>
        <Separator />
        <div className='flex items-center justify-between font-semibold'>
          <span className='font-secondary'>Total</span>
          <span className='text-primary font-secondary'>{total}</span>
        </div>
      </CardContent>
    </Card>
  );
});
