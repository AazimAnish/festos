"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvalancheBadgeProps extends Omit<React.ComponentProps<typeof Badge>, 'variant'> {
  className?: string;
}

export function AvalancheBadge({ className, ...props }: AvalancheBadgeProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      className="inline-block"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
    >
      <Badge
        className={cn(
          // Base styles using CSS variables
          "bg-background/90 backdrop-blur-sm border-muted text-black px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-medium",
          // Hover effects using CSS variables
          "hover:bg-background hover:shadow-lg hover:shadow-red-500/20",
          // Transitions and layout
          "transition-all duration-300 ease-out relative overflow-hidden",
          // Size and radius using CSS variables
          "h-7 sm:h-8 flex items-center justify-center rounded-lg",
          className
        )}
        {...props}
      >
        <span className="text-xs font-medium whitespace-nowrap flex items-center gap-1">
          powered by
          {/* Avalanche image - fades out on hover */}
          <motion.span
            animate={{ 
              opacity: isHovered ? 0 : 1,
              width: isHovered ? 0 : 'auto'
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden flex items-center"
            style={{ marginLeft: 0, marginRight: 0 }}
          >
            <Image
              src="/avalanche.webp"
              alt="Avalanche"
              width={16}
              height={16}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain rounded-lg"
            />
          </motion.span>
          {/* "Avalanche" text - fades in on hover */}
          <motion.span
            animate={{ 
              opacity: isHovered ? 1 : 0,
              width: isHovered ? 'auto' : 0
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden flex items-center"
            style={{ marginLeft: 0, marginRight: 0 }}
          >
            <span className="text-xs font-medium text-primary whitespace-nowrap">Avalanche</span>
          </motion.span>
        </span>
      </Badge>
    </motion.div>
  );
}