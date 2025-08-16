"use client";

import { motion, type MotionProps, easeOut } from "framer-motion";
import { ReactNode, memo } from "react";

interface FadeInProps {
  children: ReactNode;
  variant?: "up" | "left" | "right" | "scale" | "down";
  timing?: "fast" | "normal" | "slow";
  delay?: number;
  duration?: number;
  className?: string;
}

// Simplified timing configurations for better performance
const timingConfigs = {
  fast: { delay: 0, duration: 0.4, ease: easeOut },
  normal: { delay: 0, duration: 0.6, ease: easeOut },
  slow: { delay: 0, duration: 0.8, ease: easeOut },
};

// Simplified variants for better performance
const variants: Record<string, MotionProps> = {
  up: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: easeOut }
  },
  left: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: easeOut }
  },
  right: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: easeOut }
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, ease: easeOut }
  },
  down: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: easeOut }
  }
};

export const FadeIn = memo(function FadeIn({ 
  children, 
  variant = "up", 
  timing = "normal",
  delay = 0, 
  duration,
  className = ""
}: FadeInProps) {
  // Use predefined timing or custom values
  const finalDelay = timingConfigs[timing]?.delay ?? delay;
  const finalDuration = duration ?? timingConfigs[timing]?.duration ?? 0.6;
  const finalEase = timingConfigs[timing]?.ease ?? easeOut;

  const selectedVariant = variants[variant];
  const finalVariant = {
    ...selectedVariant,
    transition: {
      ...selectedVariant.transition,
      delay: finalDelay,
      duration: finalDuration,
      ease: finalEase
    }
  };

  return (
    <motion.div
      className={className}
      {...finalVariant}
    >
      {children}
    </motion.div>
  );
}); 