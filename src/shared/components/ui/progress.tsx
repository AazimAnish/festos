'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { motion } from 'framer-motion';

import { cn } from '@/shared/utils/cn';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    showValue?: boolean;
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, value, showValue = false, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className='w-full'>
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-full bg-accent/20 border border-border/50',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <motion.div
          className='h-full w-full flex-1 bg-primary transition-all duration-300 ease-out'
          style={{
            transform: `translateX(-${100 - (value || 0)}%)`,
          }}
          initial={{ transform: 'translateX(-100%)' }}
          animate={{ transform: `translateX(-${100 - (value || 0)}%)` }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      </ProgressPrimitive.Root>

      {showValue && (
        <motion.div
          className='mt-2 text-sm text-muted-foreground font-secondary tracking-tight'
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: 0.2,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {Math.round(value || 0)}% complete
        </motion.div>
      )}
    </div>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
