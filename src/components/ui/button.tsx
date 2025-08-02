import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-3xl text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50 hover:scale-105 hover:shadow-lg font-secondary",
  {
    variants: {
      variant: {
        default:
          "backdrop-blur-sm bg-white/20 border border-white/30 shadow-[0_8px_32px_rgba(255,255,255,0.1)] text-gray-800 hover:bg-white/30 hover:shadow-[0_8px_32px_rgba(255,255,255,0.2)] hover:border-white/50",
        destructive:
          "backdrop-blur-sm bg-red-500/20 border border-red-300/30 shadow-[0_8px_32px_rgba(239,68,68,0.1)] text-red-800 hover:bg-red-500/30 hover:shadow-[0_8px_32px_rgba(239,68,68,0.2)] hover:border-red-300/50",
        outline:
          "backdrop-blur-sm bg-transparent border border-white/30 shadow-[0_8px_32px_rgba(255,255,255,0.1)] text-gray-800 hover:bg-white/10 hover:shadow-[0_8px_32px_rgba(255,255,255,0.2)] hover:border-white/50",
        secondary:
          "backdrop-blur-sm bg-gray-500/20 border border-gray-300/30 shadow-[0_8px_32px_rgba(107,114,128,0.1)] text-gray-800 hover:bg-gray-500/30 hover:shadow-[0_8px_32px_rgba(107,114,128,0.2)] hover:border-gray-300/50",
        ghost:
          "backdrop-blur-sm bg-transparent border border-transparent text-gray-800 hover:bg-white/10 hover:shadow-[0_8px_32px_rgba(255,255,255,0.2)] hover:border-white/30",
        link: "text-blue-600 underline-offset-4 hover:underline bg-transparent border-transparent shadow-none",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-xl gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-xl px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
