"use client";

import { motion, type MotionProps, easeOut } from "framer-motion";
import { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  variant?: "up" | "left" | "right" | "scale" | "down";
  timing?: "fast" | "normal" | "slow" | "hero-badge" | "hero-text" | "hero-buttons" | "hero-card";
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeIn({ 
  children, 
  variant = "up", 
  timing = "normal",
  delay = 0, 
  duration = 1.2,
  className = ""
}: FadeInProps) {
  // Predefined timing configurations with Apple-inspired easing
  const timingConfigs = {
    fast: { delay: 0, duration: 0.6, ease: easeOut },
    normal: { delay: 0, duration: 1.2, ease: easeOut },
    slow: { delay: 0, duration: 1.8, ease: easeOut },
    "hero-badge": { delay: 0.2, duration: 1.4, ease: easeOut },
    "hero-text": { delay: 0.4, duration: 1.6, ease: easeOut },
    "hero-buttons": { delay: 0.6, duration: 1.8, ease: easeOut },
    "hero-card": { delay: 0.5, duration: 1.6, ease: easeOut }
  };

  // Use predefined timing or custom values
  const finalDelay = timingConfigs[timing]?.delay ?? delay;
  const finalDuration = timingConfigs[timing]?.duration ?? duration;
  const finalEase = timingConfigs[timing]?.ease ?? easeOut;

  const variants: Record<string, MotionProps> = {
    up: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: finalDuration, delay: finalDelay, ease: finalEase }
    },
    left: {
      initial: { opacity: 0, x: -30 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: finalDuration, delay: finalDelay, ease: finalEase }
    },
    right: {
      initial: { opacity: 0, x: 30 },
      animate: { opacity: 1, x: 0 },
      transition: { duration: finalDuration, delay: finalDelay, ease: finalEase }
    },
    scale: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: finalDuration, delay: finalDelay, ease: finalEase }
    },
    down: {
      initial: { opacity: 0, y: -30 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: finalDuration, delay: finalDelay, ease: finalEase }
    }
  };

  return (
    <motion.div
      className={className}
      {...variants[variant]}
    >
      {children}
    </motion.div>
  );
} 