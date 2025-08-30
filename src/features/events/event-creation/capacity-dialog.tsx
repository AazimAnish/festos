'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

interface CapacityDialogProps {
  value: string;
  onChange: (value: string) => void;
}

export function CapacityDialog({ value, onChange }: CapacityDialogProps) {
  const [open, setOpen] = useState(false);
  const [maxCapacity, setMaxCapacity] = useState(50);

  const handleSetLimit = () => {
    onChange(`${maxCapacity}`);
    setOpen(false);
  };

  const handleRemoveLimit = () => {
    onChange('unlimited');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='rounded-lg bg-transparent'
        >
          {value === 'unlimited' ? 'Unlimited' : `${value} people`}
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md rounded-2xl'>
        <DialogHeader>
          <DialogTitle className='text-xl sm:text-2xl lg:text-3xl font-bold text-primary font-primary'>
            Capacity Settings
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-6 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='capacity'>Maximum Capacity</Label>
            <Input
              id='capacity'
              type='number'
              min='1'
              value={maxCapacity}
              onChange={e => setMaxCapacity(Number(e.target.value))}
              className='rounded-xl'
              placeholder='Enter maximum number of attendees'
            />
            <p className='text-sm text-muted-foreground'>
              Set the maximum number of people who can register for your event.
            </p>
          </div>

          <div className='flex gap-3 pt-4'>
            <Button
              variant='outline'
              onClick={handleRemoveLimit}
              className='flex-1 rounded-xl bg-transparent'
            >
              Remove Limit
            </Button>
            <Button onClick={handleSetLimit} className='flex-1 rounded-xl'>
              Set Limit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
