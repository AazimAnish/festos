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
import { Switch } from '@/shared/components/ui/switch';

interface CapacityDialogProps {
  value: string;
  onChange: (value: string) => void;
}

export function CapacityDialog({ value, onChange }: CapacityDialogProps) {
  const [maxCapacity, setMaxCapacity] = useState(50);
  const [autoClose, setAutoClose] = useState(false);
  const [onlyApproved, setOnlyApproved] = useState(false);
  const [waitlist, setWaitlist] = useState(false);

  const handleSetLimit = () => {
    onChange(`${maxCapacity} people`);
  };

  const handleRemoveLimit = () => {
    onChange('unlimited');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='rounded-lg bg-transparent'
        >
          {value === 'unlimited' ? 'Unlimited' : value}
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
              value={maxCapacity}
              onChange={e => setMaxCapacity(Number(e.target.value))}
              className='rounded-xl'
            />
          </div>

          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label>Auto-close registration when full</Label>
              <Switch checked={autoClose} onCheckedChange={setAutoClose} />
            </div>

            <div className='flex items-center justify-between'>
              <Label>Only approved guests count</Label>
              <Switch
                checked={onlyApproved}
                onCheckedChange={setOnlyApproved}
              />
            </div>

            <div className='flex items-center justify-between'>
              <Label>Overcapacity waitlist</Label>
              <Switch checked={waitlist} onCheckedChange={setWaitlist} />
            </div>
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
