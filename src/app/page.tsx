"use client";

import { motion } from "framer-motion";

export default function ComingSoonPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop={true}
        muted
        playsInline
      >
        <source src="/comingSoonBg.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 backdrop-blur-sm" />
      <main className="relative z-10 max-w-3xl text-center px-4 w-full">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-[#b53937] font-serif font-bold 
          text-5xl sm:text-6xl md:text-6xl 
          leading-tight 
          mobile:text-6xl mobile:leading-tight"
        >
          <span className="font-bold">Coming Soon!</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-[#b53937] font-serif 
          text-xl sm:text-2xl md:text-3xl 
          leading-relaxed mt-4 
          mobile:text-2xl mobile:leading-relaxed"
        >
          <span className="italic">Romans threw epic events in grand arenas, ours is next. Stay tuned!</span>
        </motion.p>
      </main>
    </div>
  );
}