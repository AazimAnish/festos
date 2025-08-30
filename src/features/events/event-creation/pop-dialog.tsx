'use client';

import type React from 'react';

import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Upload, ImageIcon } from 'lucide-react';
import Image from 'next/image';

type PopConfig = {
  popImage?: string;
  recipientsMode: 'all';
  deliveryTime: 'after';
};

interface POPDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (config: PopConfig) => void;
  trigger?: React.ReactNode | null;
  initialImage?: string;
}

export function POPDialog({
  open,
  onOpenChange,
  onSave,
  trigger,
  initialImage,
}: POPDialogProps) {
  const [popImage, setPopImage] = useState<string | undefined>(initialImage);
  const recipientsMode = 'all'; // Fixed to all participants
  const deliveryTime = 'after'; // Fixed to after event

  useEffect(() => {
    setPopImage(initialImage);
  }, [initialImage]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        setPopImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave?.({
      popImage,
      recipientsMode,
      deliveryTime,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger !== null ? (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button
              variant='outline'
              size='sm'
              className='rounded-lg bg-transparent'
            >
              Configure POP
            </Button>
          )}
        </DialogTrigger>
      ) : null}
      <DialogContent className='sm:max-w-md rounded-2xl'>
        <DialogHeader>
          <DialogTitle className='text-xl sm:text-2xl lg:text-3xl font-bold text-primary font-primary'>
            Proof of Presence Setup
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-6 py-4'>
          {/* Image Upload */}
          <div className='space-y-3'>
            <Label>POP Design</Label>
            <div className='relative aspect-video rounded-xl border-2 border-dashed border-border bg-muted/50 overflow-hidden'>
              {popImage ? (
                <Image
                  src={popImage || '/placeholder.svg'}
                  alt='POP design'
                  fill
                  sizes='100vw'
                  className='object-cover'
                  unoptimized
                />
              ) : (
                <div className='flex flex-col items-center justify-center h-full text-muted-foreground'>
                  <ImageIcon className='h-8 w-8 mb-2' />
                  <p className='text-sm'>Upload photo or GIF</p>
                </div>
              )}
              <label
                htmlFor='pop-upload'
                className='absolute inset-0 cursor-pointer flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity'
              >
                <Button variant='secondary' size='sm' className='rounded-full'>
                  <Upload className='h-4 w-4 mr-2' />
                  Upload
                </Button>
              </label>
              <input
                id='pop-upload'
                type='file'
                accept='image/*,.gif'
                onChange={handleImageUpload}
                className='hidden'
              />
            </div>
          </div>

          {/* Recipients - Fixed to all participants */}
          <div className='space-y-3'>
            <Label>Recipients</Label>
            <div className='p-3 bg-muted/50 rounded-lg border'>
              <div className='text-sm text-muted-foreground'>
                POAP will be distributed to <strong>all registered participants</strong> automatically <strong>after the event ends</strong>.
              </div>
            </div>
          </div>

          <Button className='w-full rounded-xl' onClick={handleSave}>
            Save POP Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
