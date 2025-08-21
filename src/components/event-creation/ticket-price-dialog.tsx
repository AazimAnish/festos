'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface TicketPriceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPrice?: string;
  onSave: (priceAvax: string) => void;
}

export function TicketPriceDialog({
  open,
  onOpenChange,
  initialPrice,
  onSave,
}: TicketPriceDialogProps) {
  const [price, setPrice] = useState<string>(initialPrice || '');

  useEffect(() => {
    setPrice(initialPrice || '');
  }, [initialPrice, open]);

  const handleSave = () => {
    const normalized = String(price || '').trim();
    onSave(normalized);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md rounded-2xl'>
        <DialogHeader>
          <DialogTitle className='text-xl sm:text-2xl lg:text-3xl font-bold text-primary font-primary'>
            Ticket Price
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-4 py-2'>
          <div className='space-y-2'>
            <label className='text-sm text-muted-foreground'>
              Enter amount in AVAX
            </label>
            <div className='flex items-center gap-2'>
              <Input
                type='number'
                inputMode='decimal'
                step='0.001'
                min='0'
                value={price}
                onChange={e => setPrice(e.target.value)}
                className='rounded-lg'
                placeholder='0.00'
              />
              <span className='text-sm font-medium text-muted-foreground'>
                AVAX
              </span>
            </div>
          </div>
          <Button className='w-full rounded-xl' onClick={handleSave}>
            Save Price
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
