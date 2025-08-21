'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export function SplashScreen({
  onComplete,
  duration = 2500,
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [currentPhase, setCurrentPhase] = useState(0);

  useEffect(() => {
    const phases = [
      { delay: 0, duration: 600 }, // Logo fade in
      { delay: 600, duration: 800 }, // Logo scale and glow
      { delay: 1400, duration: 500 }, // Text fade in
      { delay: 1900, duration: 300 }, // Fade out
    ];

    const totalDuration = phases.reduce(
      (acc, phase) => acc + phase.delay + phase.duration,
      0
    );
    const adjustedDuration = Math.max(duration, totalDuration);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Wait for fade out animation
    }, adjustedDuration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  // Handle escape key to skip splash screen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsVisible(false);
        setTimeout(onComplete, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

  // Phase-based animation control
  useEffect(() => {
    const phaseTimer = setTimeout(
      () => {
        if (currentPhase < 3) {
          setCurrentPhase(currentPhase + 1);
        }
      },
      currentPhase === 0
        ? 600
        : currentPhase === 1
          ? 800
          : currentPhase === 2
            ? 500
            : 300
    );

    return () => clearTimeout(phaseTimer);
  }, [currentPhase]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className='fixed inset-0 z-50 flex items-center justify-center bg-background cursor-pointer'
          onClick={() => {
            setIsVisible(false);
            setTimeout(onComplete, 100);
          }}
        >
          {/* Grid Background - Same as Hero Section */}
          <div className='absolute inset-0 bg-background'>
            <div className='absolute inset-0 [background-size:40px_40px] [background-image:linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,var(--color-muted)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-muted)_1px,transparent_1px)]' />
            {/* Radial gradient for the container to give a faded look */}
            <div className='pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]'></div>
          </div>

          {/* Main content container */}
          <div className='relative z-10 flex flex-col items-center justify-center space-y-8'>
            {/* Logo container with smooth animations */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: currentPhase >= 0 ? 1 : 0,
                scale: currentPhase >= 1 ? 1.05 : currentPhase >= 0 ? 1 : 0.9,
              }}
              transition={{
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: 0,
              }}
              className='relative'
            >
              {/* Subtle glow effect */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: currentPhase >= 1 ? 0.4 : 0,
                  scale: currentPhase >= 1 ? 1.2 : 0.9,
                }}
                transition={{
                  duration: 0.8,
                  ease: 'easeOut',
                  delay: 0.6,
                }}
                className='absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-full blur-xl'
              />

              {/* Logo image */}
              <div className='relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40'>
                <Image
                  src='/ticket.png'
                  alt='Festos Logo'
                  fill
                  className='object-cover rounded-2xl shadow-2xl'
                  priority
                />

                {/* Subtle border glow */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: currentPhase >= 1 ? 1 : 0 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  className='absolute inset-0 rounded-2xl border border-primary/20 shadow-[0_0_20px_rgba(255,56,74,0.3)]'
                />
              </div>
            </motion.div>

            {/* Brand name with smooth typography */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: currentPhase >= 2 ? 1 : 0,
                y: currentPhase >= 2 ? 0 : 10,
              }}
              transition={{
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: 1.4,
              }}
              className='text-center space-y-2'
            >
              <motion.h1
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{
                  opacity: currentPhase >= 2 ? 1 : 0,
                  scale: currentPhase >= 2 ? 1 : 0.98,
                }}
                transition={{
                  duration: 0.5,
                  ease: 'easeOut',
                  delay: 1.4,
                }}
                className='font-primary font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-primary tracking-tight leading-[0.9]'
              >
                FESTOS
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: currentPhase >= 2 ? 1 : 0 }}
                transition={{
                  duration: 0.5,
                  ease: 'easeOut',
                  delay: 1.6,
                }}
                className='font-secondary text-lg sm:text-xl md:text-2xl text-muted-foreground font-medium tracking-wide'
              >
                For the culture. On the chain.
              </motion.p>
            </motion.div>

            {/* Simple loading indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: currentPhase >= 2 ? 1 : 0 }}
              transition={{ delay: 1.8, duration: 0.3 }}
              className='flex items-center space-x-2'
            >
              <div className='flex space-x-1'>
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{
                      scale: [0.8, 1.1, 0.8],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: 'easeInOut',
                    }}
                    className='w-1.5 h-1.5 bg-primary rounded-full'
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
