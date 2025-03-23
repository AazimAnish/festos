"use client";

import { useEffect } from "react"
import { motion, stagger, useAnimate } from "framer-motion"
import { Search } from "lucide-react"

import Floating, {
  FloatingElement,
} from "@/fancy/components/image/parallax-floating"

import { exampleImages } from "@/utils/demo-images"

export default function HomePage() {
  const [scope, animate] = useAnimate()

  useEffect(() => {
    animate("img", { opacity: [0, 1] }, { duration: 0.5, delay: stagger(0.15) })
    animate(".hero-text", { opacity: 1, y: 0 }, { duration: 0.8, delay: 1 })
    animate(".search-bar", { opacity: 1, y: 0 }, { duration: 0.8, delay: 1.2 })
    animate(".cta-buttons", { opacity: 1, y: 0 }, { duration: 0.8, delay: 1.4 })
  }, [animate])

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black to-[#1d0e0d]">
      {/* Hero section with floating elements */}
      <div 
        className="flex w-full h-screen justify-center items-center overflow-hidden"
        ref={scope}
      >
        {/* Content overlay */}
        <div className="z-50 flex flex-col items-center justify-center px-4 text-center space-y-8 max-w-4xl">
          <motion.div 
            className="hero-text space-y-4"
            initial={{ opacity: 0, y: 20 }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif text-white leading-tight">
              <span className="text-[#ff7e78]">Festos</span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/80 italic">
              Unforgettable experiences, one ticket at a time
            </p>
          </motion.div>

          <motion.div 
            className="search-bar w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
          >
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search for events..." 
                className="w-full py-3 px-5 pr-12 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-[#ff7e78]/50 focus:border-transparent"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70" size={20} />
            </div>
          </motion.div>

          <motion.div 
            className="cta-buttons flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
          >
            <button className="px-8 py-3 rounded-full bg-[#ff7e78] text-white font-medium hover:bg-[#ff9d99] transition-colors">
              Explore Events
            </button>
            <button className="px-8 py-3 rounded-full bg-transparent border border-white/30 text-white font-medium hover:bg-white/10 transition-colors">
              Create Event
            </button>
          </motion.div>
        </div>

        {/* Floating images */}
        <Floating sensitivity={-1} className="overflow-hidden">
          <FloatingElement depth={0.5} className="top-[8%] left-[11%]">
            <motion.img
              initial={{ opacity: 0 }}
              src={exampleImages[0].url}
              alt={exampleImages[0].title}
              className="w-16 h-16 md:w-24 md:h-24 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform rounded-lg"
            />
          </FloatingElement>
          <FloatingElement depth={1} className="top-[10%] left-[32%]">
            <motion.img
              initial={{ opacity: 0 }}
              src={exampleImages[1].url}
              alt={exampleImages[1].title}
              className="w-20 h-20 md:w-28 md:h-28 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform rounded-lg"
            />
          </FloatingElement>
          <FloatingElement depth={2} className="top-[2%] left-[53%]">
            <motion.img
              initial={{ opacity: 0 }}
              src={exampleImages[2].url}
              alt={exampleImages[2].title}
              className="w-28 h-40 md:w-40 md:h-52 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform rounded-lg"
            />
          </FloatingElement>
          <FloatingElement depth={1} className="top-[0%] left-[83%]">
            <motion.img
              initial={{ opacity: 0 }}
              src={exampleImages[3].url}
              alt={exampleImages[3].title}
              className="w-24 h-24 md:w-32 md:h-32 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform rounded-lg"
            />
          </FloatingElement>

          <FloatingElement depth={1} className="top-[40%] left-[2%]">
            <motion.img
              initial={{ opacity: 0 }}
              src={exampleImages[4].url}
              alt={exampleImages[4].title}
              className="w-28 h-28 md:w-36 md:h-36 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform rounded-lg"
            />
          </FloatingElement>
          <FloatingElement depth={2} className="top-[70%] left-[77%]">
            <motion.img
              initial={{ opacity: 0 }}
              src={exampleImages[7].url}
              alt={exampleImages[7].title}
              className="w-28 h-28 md:w-36 md:h-48 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform rounded-lg"
            />
          </FloatingElement>

          <FloatingElement depth={4} className="top-[73%] left-[15%]">
            <motion.img
              initial={{ opacity: 0 }}
              src={exampleImages[5].url}
              alt={exampleImages[5].title}
              className="w-40 md:w-52 h-full object-cover hover:scale-105 duration-200 cursor-pointer transition-transform rounded-lg"
            />
          </FloatingElement>
          <FloatingElement depth={1} className="top-[80%] left-[50%]">
            <motion.img
              initial={{ opacity: 0 }}
              src={exampleImages[6].url}
              alt={exampleImages[6].title}
              className="w-24 h-24 md:w-32 md:h-32 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform rounded-lg"
            />
          </FloatingElement>
        </Floating>
      </div>
    </div>
  )
}