'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

// Dynamic import for wallet connection to avoid SSR issues
const CustomConnectButton = dynamic(
  () =>
    import('@/components/wallet/connect-button').then(
      m => m.CustomConnectButton
    ),
  { ssr: false }
);

// Navigation items with semantic structure
const NAVIGATION_ITEMS = [
  { href: '/discover', label: 'Discover', description: 'Find amazing events' },
  { href: '/feed', label: 'Social', description: 'Connect with community' },
  { href: '/marketplace', label: 'Marketplace', description: 'Trade tickets' },
] as const;

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletVisible, setIsWalletVisible] = useState(false);

  // Optimized scroll handler with throttling
  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 20;
    setIsScrolled(scrolled);
  }, []);

  // Handle scroll effect with proper cleanup
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Show wallet after initial load to prevent hydration issues
  useEffect(() => {
    const timer = setTimeout(() => setIsWalletVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Main Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`sticky top-0 z-50 transition-all duration-500 ease-out ${
          isScrolled
            ? 'backdrop-blur-2xl bg-background/80 border-b border-border/30 shadow-lg shadow-black/5'
            : 'bg-transparent'
        }`}
      >
        <div className='container mx-auto'>
          <div className='flex items-center justify-between h-16 lg:h-20 px-4 sm:px-6 lg:px-8'>
            {/* Logo - Primary Brand Element */}
            <Link
              href='/'
              className='flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg p-1'
              aria-label='Festos - Home'
            >
              <motion.div
                className='relative w-8 h-8 lg:w-10 lg:h-10'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src='/tickets.png'
                  alt='Festos Logo'
                  fill
                  className='object-cover rounded-xl transition-all duration-200'
                  priority
                />
              </motion.div>
              <span className='font-primary font-black text-xl lg:text-2xl text-primary tracking-tight'>
                Festos
              </span>
            </Link>

            {/* Desktop Navigation - Semantic Structure */}
            <nav
              className='hidden lg:flex items-center gap-1'
              role='navigation'
              aria-label='Main navigation'
            >
              {NAVIGATION_ITEMS.map(item => (
                <Link key={item.href} href={item.href} prefetch={true}>
                  <Button
                    variant='ghost'
                    size='lg'
                    className='font-secondary text-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200 ease-out rounded-xl px-4 py-2 h-12 tracking-tight'
                    aria-label={item.description}
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}

              {/* Primary Action - Create Event */}
              <Link href='/create' prefetch={true}>
                <Button
                  size='lg'
                  className='font-secondary rounded-xl px-6 py-2 h-12 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 ease-out hover:scale-105 active:scale-95 tracking-tight shadow-lg shadow-primary/20'
                >
                  Create Event
                </Button>
              </Link>
            </nav>

            {/* Right Section - Wallet & Mobile Menu */}
            <div className='flex items-center gap-3'>
              {/* Wallet Connection - Desktop */}
              <div className='hidden lg:block'>
                <AnimatePresence>
                  {isWalletVisible && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CustomConnectButton />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant='ghost'
                size='icon'
                className='lg:hidden h-10 w-10 rounded-xl'
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                <AnimatePresence mode='wait'>
                  {isMobileMenuOpen ? (
                    <motion.div
                      key='close'
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className='h-5 w-5' />
                    </motion.div>
                  ) : (
                    <motion.div
                      key='menu'
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className='h-5 w-5' />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden'
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className='fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-background/95 backdrop-blur-2xl border-l border-border/30 shadow-2xl z-50 lg:hidden'
            >
              <div className='flex flex-col h-full'>
                {/* Mobile Menu Header */}
                <div className='flex items-center justify-between p-6 border-b border-border/30'>
                  <span className='font-primary font-bold text-xl text-foreground'>
                    Menu
                  </span>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-10 w-10 rounded-xl'
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label='Close menu'
                  >
                    <X className='h-5 w-5' />
                  </Button>
                </div>

                {/* Mobile Navigation */}
                <nav
                  className='flex-1 p-6 space-y-2'
                  role='navigation'
                  aria-label='Mobile navigation'
                >
                  {NAVIGATION_ITEMS.map(item => (
                    <Link key={item.href} href={item.href} prefetch={true}>
                      <Button
                        variant='ghost'
                        className='w-full justify-start font-secondary text-foreground hover:text-primary hover:bg-accent/50 transition-all duration-200 ease-out rounded-xl px-4 py-3 h-12 tracking-tight'
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Button>
                    </Link>
                  ))}

                  {/* Mobile Primary Action */}
                  <Link href='/create' prefetch={true}>
                    <Button
                      className='w-full font-secondary rounded-xl px-4 py-3 h-12 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 ease-out tracking-tight shadow-lg shadow-primary/20'
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Create Event
                    </Button>
                  </Link>
                </nav>

                {/* Mobile Wallet Section */}
                <div className='p-6 border-t border-border/30'>
                  <AnimatePresence>
                    {isWalletVisible && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CustomConnectButton />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
