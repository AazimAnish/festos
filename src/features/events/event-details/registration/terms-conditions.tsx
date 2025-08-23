'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { FileText } from 'lucide-react';

interface TermsConditionsProps {
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
}

export const TermsConditions = memo(function TermsConditions({
  termsAccepted,
  onTermsChange,
}: TermsConditionsProps) {
  return (
    <Card className='border-2 border-border bg-background/80 backdrop-blur-sm shadow-lg rounded-3xl'>
      <CardHeader className='pb-4'>
        <CardTitle className='text-base flex items-center space-x-3'>
          <FileText className='h-5 w-5 text-primary' />
          <span className='font-secondary'>Terms & Conditions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='text-sm text-gray space-y-3 max-h-40 overflow-y-auto'>
          <p className='font-secondary'>
            By registering for this event, you agree to:
          </p>
          <ul className='list-disc list-inside space-y-2 text-xs font-secondary'>
            <li>Receive a POAP NFT upon attendance</li>
            <li>Allow your wallet address to be recorded for verification</li>
            <li>Follow event guidelines and community standards</li>
            <li>Grant permission for event photos and recordings</li>
          </ul>
        </div>

        <div className='flex items-center space-x-3 pt-2'>
          <Checkbox
            id='terms'
            checked={termsAccepted}
            onCheckedChange={checked => onTermsChange(checked as boolean)}
          />
          <Label
            htmlFor='terms'
            className='text-sm text-foreground font-secondary'
          >
            I agree to the terms and conditions
          </Label>
        </div>
      </CardContent>
    </Card>
  );
});
