'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Trophy, Star, Sparkles, X } from 'lucide-react';
import Image from 'next/image';
import confetti from 'canvas-confetti';

interface POAP {
  id: number;
  name: string;
  event: string;
  rarity: string;
  image: string;
  date: string;
  description: string;
  totalMinted: number;
  attributes: Array<{ trait: string; value: string }>;
  mintNumber: number;
}

interface POAPTrophyRoomProps {
  poaps: POAP[];
  onClose: () => void;
  onSelectPOAP: (poap: POAP) => void;
}

export function POAPTrophyRoom({
  poaps,
  onClose,
  onSelectPOAP,
}: POAPTrophyRoomProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const legendaryPoaps = poaps.filter(poap => poap.rarity === 'legendary');

  // Trigger confetti when entering trophy room
  useEffect(() => {
    // Launch confetti from both sides
    const launchConfetti = () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6, x: 0.1 },
      });

      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6, x: 0.9 },
        });
      }, 250);
    };

    launchConfetti();
  }, []);

  // Rotate through POAPs
  const handleNext = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    const nextIndex = (selectedIndex + 1) % legendaryPoaps.length;
    setTimeout(() => {
      setSelectedIndex(nextIndex);
      setIsAnimating(false);

      // Add small confetti burst
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.5, x: 0.5 },
      });
    }, 300);
  };

  const handlePrev = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    const prevIndex =
      (selectedIndex - 1 + legendaryPoaps.length) % legendaryPoaps.length;
    setTimeout(() => {
      setSelectedIndex(prevIndex);
      setIsAnimating(false);
    }, 300);
  };

  // No legendary POAPs
  if (legendaryPoaps.length === 0) {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md'>
        <div className='max-w-md w-full p-8 rounded-xl bg-muted/30 border-2 border-border shadow-2xl text-center'>
          <Trophy className='h-16 w-16 mx-auto mb-4 text-muted-foreground' />
          <h2 className='font-primary text-xl font-bold mb-2'>
            Trophy Room Empty
          </h2>
          <p className='text-muted-foreground mb-6'>
            You haven&apos;t collected any legendary POAPs yet. Keep attending
            events to earn rare collectibles!
          </p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  const selectedPOAP = legendaryPoaps[selectedIndex];

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md overflow-hidden'>
      {/* Background effects */}
      <div className='absolute inset-0 bg-gradient-radial from-yellow-500/5 to-transparent' />
      <div className='absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-yellow-500/20 to-transparent' />
      <div className='absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-yellow-500/20 to-transparent' />

      {/* Random floating stars */}
      {Array.from({ length: 20 }).map((_, i) => {
        const randomX = Math.random() * 100;
        const randomY = Math.random() * 100;
        const randomSize = Math.random() * 0.5 + 0.5;
        const randomDuration = Math.random() * 10 + 10;

        return (
          <motion.div
            key={i}
            className='absolute text-yellow-300/30 z-0'
            style={{
              left: `${randomX}%`,
              top: `${randomY}%`,
              scale: randomSize,
            }}
            animate={{
              y: [0, -10, 0, 10, 0],
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, 180],
            }}
            transition={{
              duration: randomDuration,
              repeat: Infinity,
              repeatType: 'loop',
            }}
          >
            <Star className='h-4 w-4' />
          </motion.div>
        );
      })}

      {/* Trophy Room Content */}
      <div className='relative max-w-4xl w-full p-8 z-10'>
        <Button
          variant='ghost'
          size='icon'
          className='absolute top-0 right-0 text-muted-foreground hover:text-foreground'
          onClick={onClose}
        >
          <X className='h-5 w-5' />
        </Button>

        <div className='text-center mb-8'>
          <div className='inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 p-3 rounded-full mb-4'>
            <Trophy className='h-8 w-8 text-yellow-500' />
          </div>
          <h1 className='font-primary text-3xl font-bold mb-2 flex items-center justify-center gap-2'>
            Trophy Room
            <Sparkles className='h-6 w-6 text-yellow-500' />
          </h1>
          <p className='text-muted-foreground'>
            Your legendary collection ({selectedIndex + 1} of{' '}
            {legendaryPoaps.length})
          </p>
        </div>

        <div className='flex items-center justify-center gap-6 mb-12'>
          <Button
            variant='outline'
            size='icon'
            className='h-12 w-12 rounded-full border-2 border-yellow-500/30 text-yellow-500'
            onClick={handlePrev}
            disabled={isAnimating || legendaryPoaps.length <= 1}
          >
            <motion.div whileTap={{ x: -5 }} transition={{ duration: 0.2 }}>
              <Trophy className='h-5 w-5 rotate-[-25deg]' />
            </motion.div>
          </Button>

          <AnimatePresence mode='wait'>
            <motion.div
              key={selectedPOAP.id}
              className='relative'
              initial={{ opacity: 0, y: 20, rotateY: 90 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              exit={{ opacity: 0, y: -20, rotateY: -90 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            >
              <div className='flex flex-col items-center'>
                <div className='relative w-64 h-64 sm:w-72 sm:h-72 rounded-xl overflow-hidden mb-4 shadow-2xl shadow-yellow-500/20'>
                  <Image
                    src={selectedPOAP.image}
                    alt={selectedPOAP.name}
                    fill
                    className='object-cover'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />
                  <div className='absolute top-3 right-3'>
                    <Badge className='bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'>
                      <Award className='w-3 h-3 mr-1' />
                      Legendary
                    </Badge>
                  </div>
                  <div className='absolute bottom-3 left-3 right-3'>
                    <h3 className='font-primary text-lg font-bold text-white shadow-sm'>
                      {selectedPOAP.name}
                    </h3>
                    <p className='font-secondary text-xs text-white/80'>
                      {new Date(selectedPOAP.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className='text-center max-w-sm mx-auto'>
                  <p className='text-sm text-muted-foreground mb-4'>
                    {selectedPOAP.description}
                  </p>
                  <p className='text-xs font-medium mb-1'>
                    Only {selectedPOAP.totalMinted} ever minted • You own #
                    {selectedPOAP.mintNumber}
                  </p>
                  <div className='flex justify-center gap-3'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-700'
                      onClick={() => onSelectPOAP(selectedPOAP)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>

              {/* Animated glows */}
              <motion.div
                className='absolute -inset-4 bg-gradient-conic from-yellow-500/30 via-orange-300/0 to-yellow-500/30 rounded-full opacity-70 blur-lg'
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: 'loop',
                  ease: 'linear',
                }}
              />
            </motion.div>
          </AnimatePresence>

          <Button
            variant='outline'
            size='icon'
            className='h-12 w-12 rounded-full border-2 border-yellow-500/30 text-yellow-500'
            onClick={handleNext}
            disabled={isAnimating || legendaryPoaps.length <= 1}
          >
            <motion.div whileTap={{ x: 5 }} transition={{ duration: 0.2 }}>
              <Trophy className='h-5 w-5 rotate-[25deg]' />
            </motion.div>
          </Button>
        </div>
      </div>
    </div>
  );
}
