import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 font-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md active:scale-[0.98] hover:scale-[1.02]',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md active:scale-[0.98] hover:scale-[1.02]',
        outline:
          'border border-border bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground hover:shadow-md active:scale-[0.98] hover:scale-[1.02] hover:border-primary/50',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90 hover:shadow-md active:scale-[0.98] hover:scale-[1.02]',
        ghost:
          'text-foreground hover:bg-accent hover:text-accent-foreground active:scale-[0.98] hover:scale-[1.02]',
        link: 'text-primary underline-offset-4 hover:underline bg-transparent border-transparent shadow-none hover:scale-[1.02]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 py-1.5 text-xs',
        lg: 'h-12 rounded-xl px-6 py-3 text-base',
        xl: 'h-14 rounded-xl px-8 py-4 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot='button'
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
