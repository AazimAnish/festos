"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, stagger, useAnimate } from "framer-motion"
import { Search } from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"

import Floating, {
  FloatingElement,
} from "@/components/ui/parallax-floating"

import { Button } from "@/components/ui/button"

// Import the background images
import darkBgImage from "../../../public/images/dark.jpg"
import lightBgImage from "../../../public/images/light.jpg"

const Hero = () => {
  const [scope, animate] = useAnimate()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Optimize animations with useCallback to avoid recreating functions
  const runAnimations = useCallback(() => {
    animate(".float-item", { opacity: [0, 1] }, { duration: 0.5, delay: stagger(0.15) })
    animate(".avalanche-badge", { opacity: 1, y: 0 }, { duration: 0.8, delay: 0.5 })
    animate(".hero-text", { opacity: 1, y: 0 }, { duration: 0.8, delay: 1 })
    animate(".search-bar", { opacity: 1, y: 0 }, { duration: 0.8, delay: 1.2 })
    animate(".cta-buttons", { opacity: 1, y: 0 }, { duration: 0.8, delay: 1.4 })
  }, [animate])

  useEffect(() => {
    setMounted(true)
    runAnimations()
  }, [runAnimations])

  // Memoize background to avoid unnecessary re-renders
  const renderBackground = useCallback(() => {
    if (!mounted) return null
    
    return (
      <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
        {/* Dark mode background */}
        {resolvedTheme === 'dark' && (
          <div className="absolute inset-0 transition-opacity duration-500 opacity-100">
            <Image
              src={darkBgImage}
              alt="Dark background"
              fill
              priority
              quality={100}
              placeholder="blur"
              sizes="100vw"
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          </div>
        )}
        
        {/* Light mode background */}
        {resolvedTheme === 'light' && (
          <div className="absolute inset-0 transition-opacity duration-500 opacity-100">
            <Image
              src={lightBgImage}
              alt="Light background"
              fill
              priority
              quality={100}
              placeholder="blur"
              sizes="100vw"
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          </div>
        )}
        
        {/* Noise overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 150 150' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='7.5' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            opacity: 0.15,
            mixBlendMode: 'overlay',
            zIndex: 1
          }}
        />
      </div>
    )
  }, [mounted, resolvedTheme])

  return (
    <div
      className="relative flex w-full h-screen justify-center items-center overflow-hidden"
      ref={scope}
    >
      {/* Background Images */}
      {renderBackground()}

      {/* Content overlay */}
      <div className="flex flex-col items-center justify-center px-4 text-center space-y-8 max-w-4xl relative" style={{ zIndex: 10 }}>
        {/* Avalanche Badge with increased glow intensity */}
        <motion.div
          className="avalanche-badge mb-4 px-3 py-1.5 rounded-md bg-black/30 backdrop-blur-md border border-white/10 card-glass flex items-center"
          initial={{ opacity: 0, y: -20 }}
        >
          <span className="glowing-dot"></span>
          <span className="text-white/90 text-xs font-azeret-mono tracking-wide">powered by avalanche</span>
        </motion.div>

        <motion.div
          className="hero-text space-y-4"
          initial={{ opacity: 0, y: 20 }}
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-calendas text-white leading-tight">
            <span className="text-[#ff4b43]">Festos</span>
          </h1>
          <p className="text-xl sm:text-2xl text-white/80 font-calendas italic">
            Unforgettable experiences, one ticket at a time
          </p>
        </motion.div>

        <motion.div
          className="search-bar w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
        >
          <div className="relative search-glow">
            <input
              type="text"
              placeholder="Search for events..."
              className="w-full py-3 px-5 pr-12 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-[#ff4b43]/50 focus:border-transparent font-azeret-mono"
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 cursor-pointer" size={20} />
          </div>
        </motion.div>

        <motion.div
          className="cta-buttons flex flex-wrap gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
        >
          <Button size="lg" className="">
            Explore Events
          </Button>
          <Button variant="glassmorphic" size="lg" className="">
            Create Event
          </Button>
        </motion.div>
      </div>

      {/* Floating images - contained within the hero section */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 5 }}>
        <Floating sensitivity={-1} className="overflow-hidden">
          <FloatingElement depth={0.5} className="top-[15%] left-[18%]">
            <motion.div
              initial={{ opacity: 0 }}
              className="float-item event-frame-3d w-28 h-40 md:w-40 md:h-40 rounded-lg relative hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="absolute inset-1 bg-black/40 dark:bg-white/40 backdrop-blur-md rounded-lg z-10 border border-white/20 dark:border-black/20 shadow-inner overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-4xl md:text-5xl">
                  🎭
                </div>
              </div>
              <div className="absolute inset-0 bg-black/25 dark:bg-white/25 backdrop-blur-lg rounded-lg border border-white/10 dark:border-black/10 shadow-lg"></div>
            </motion.div>
          </FloatingElement>
          <FloatingElement depth={1} className="top-[40%] right-[20%]">
            <motion.div
              initial={{ opacity: 0 }}
              className="float-item event-frame-3d w-20 h-20 md:w-28 md:h-28 rounded-lg relative hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="absolute inset-1 bg-black/40 dark:bg-white/40 backdrop-blur-md rounded-lg z-10 border border-white/20 dark:border-black/20 shadow-inner overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-4xl md:text-5xl">
                  🎤
                </div>
              </div>
              <div className="absolute inset-0 bg-black/25 dark:bg-white/25 backdrop-blur-lg rounded-lg border border-white/10 dark:border-black/10 shadow-lg"></div>
            </motion.div>
          </FloatingElement>
          <FloatingElement depth={2} className="top-[15%] left-[53%]">
            <motion.div
              initial={{ opacity: 0 }}
              className="float-item event-frame-3d w-16 h-16 md:w-24 md:h-24 rounded-lg relative hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="absolute inset-1 bg-black/40 dark:bg-white/40 backdrop-blur-md rounded-lg z-10 border border-white/20 dark:border-black/20 shadow-inner overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-5xl md:text-6xl">
                  🎉
                </div>
              </div>
              <div className="absolute inset-0 bg-black/25 dark:bg-white/25 backdrop-blur-lg rounded-lg border border-white/10 dark:border-black/10 shadow-lg"></div>
            </motion.div>
          </FloatingElement>
          <FloatingElement depth={1} className="top-[20%] left-[83%]">
            <motion.div
              initial={{ opacity: 0 }}
              className="float-item event-frame-3d w-24 h-24 md:w-32 md:h-32 rounded-lg relative hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="absolute inset-1 bg-black/40 dark:bg-white/40 backdrop-blur-md rounded-lg z-10 border border-white/20 dark:border-black/20 shadow-inner overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-4xl md:text-5xl">
                  🎮
                </div>
              </div>
              <div className="absolute inset-0 bg-black/25 dark:bg-white/25 backdrop-blur-lg rounded-lg border border-white/10 dark:border-black/10 shadow-lg"></div>
            </motion.div>
          </FloatingElement>

          <FloatingElement depth={1} className="top-[44%] left-[8%]">
            <motion.div
              initial={{ opacity: 0 }}
              className="float-item event-frame-3d w-28 h-28 md:w-36 md:h-36 rounded-lg relative hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="absolute inset-1 bg-black/40 dark:bg-white/40 backdrop-blur-md rounded-lg z-10 border border-white/20 dark:border-black/20 shadow-inner overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-4xl md:text-5xl">
                  🎓
                </div>
              </div>
              <div className="absolute inset-0 bg-black/25 dark:bg-white/25 backdrop-blur-lg rounded-lg border border-white/10 dark:border-black/10 shadow-lg"></div>
            </motion.div>
          </FloatingElement>
          <FloatingElement depth={2} className="top-[70%] left-[77%]">
            <motion.div
              initial={{ opacity: 0 }}
              className="float-item event-frame-3d w-28 h-28 md:w-36 md:h-36 rounded-lg relative hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="absolute inset-1 bg-black/40 dark:bg-white/40 backdrop-blur-md rounded-lg z-10 border border-white/20 dark:border-black/20 shadow-inner overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-4xl md:text-5xl">
                  ⚽
                </div>
              </div>
              <div className="absolute inset-0 bg-black/25 dark:bg-white/25 backdrop-blur-lg rounded-lg border border-white/10 dark:border-black/10 shadow-lg"></div>
            </motion.div>
          </FloatingElement>

          <FloatingElement depth={4} className="top-[73%] left-[20%]">
            <motion.div
              initial={{ opacity: 0 }}
              className="float-item event-frame-3d w-40 md:w-52 h-40 md:h-52 rounded-lg relative hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="absolute inset-1 bg-black/40 dark:bg-white/40 backdrop-blur-md rounded-lg z-10 border border-white/20 dark:border-black/20 shadow-inner overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-4xl md:text-5xl">
                  🍽
                </div>
              </div>
              <div className="absolute inset-0 bg-black/25 dark:bg-white/25 backdrop-blur-lg rounded-lg border border-white/10 dark:border-black/10 shadow-lg"></div>
            </motion.div>
          </FloatingElement>
          <FloatingElement depth={1} className="top-[80%] left-[50%]">
            <motion.div
              initial={{ opacity: 0 }}
              className="float-item event-frame-3d w-24 h-24 md:w-32 md:h-32 rounded-lg relative hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="absolute inset-1 bg-black/40 dark:bg-white/40 backdrop-blur-md rounded-lg z-10 border border-white/20 dark:border-black/20 shadow-inner overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-4xl md:text-5xl">
                  🏕
                </div>
              </div>
              <div className="absolute inset-0 bg-black/25 dark:bg-white/25 backdrop-blur-lg rounded-lg border border-white/10 dark:border-black/10 shadow-lg"></div>
            </motion.div>
          </FloatingElement>
        </Floating>
      </div>
    </div>
  )
}

export default Hero