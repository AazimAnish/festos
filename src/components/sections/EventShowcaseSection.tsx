"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, MapPin, Ticket, ChevronRight } from "lucide-react"

import { exampleImages } from "@/utils/demo-images"
import { cn } from "@/lib/utils"

type TabType = "upcoming" | "trending" | "music" | "tech" | "food" | "arts"

const EventShowcaseSection = () => {
  const [activeTab, setActiveTab] = useState<TabType>("upcoming")

  const tabs: { id: TabType; label: string }[] = [
    { id: "upcoming", label: "Upcoming" },
    { id: "trending", label: "Trending" },
    { id: "music", label: "Music" },
    { id: "tech", label: "Tech" },
    { id: "food", label: "Food" },
    { id: "arts", label: "Arts" },
  ]

  return (
    <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl md:text-4xl font-calendas text-white">
          <span className="text-[#ff7e78]">Discover</span> Events
        </h2>
        <button className="px-5 py-2 rounded-full border border-white/30 text-white text-sm font-azeret-mono hover:bg-white/10 transition-colors flex items-center gap-1 group">
          <span>View All</span>
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto pb-4 mb-8 hide-scrollbar">
        <div className="flex space-x-2 mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-azeret-mono transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-[#ff7e78] text-white"
                  : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Event Cards Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {exampleImages.map((event, index) => (
            <motion.div
              key={`${activeTab}-${index}`}
              className="bg-black/40 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all cursor-pointer group"
              whileHover={{ y: -5 }}
            >
              <div className="relative h-48">
                <img 
                  src={event.url} 
                  alt={event.title} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                />
                <div className="absolute top-3 right-3 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full">
                  <span className="text-white text-xs font-azeret-mono">0.025 ETH</span>
                </div>
                {activeTab === "trending" && (
                  <div className="absolute top-3 left-3 bg-[#ff7e78]/80 backdrop-blur-md px-3 py-1 rounded-full">
                    <span className="text-white text-xs font-azeret-mono">Hot</span>
                  </div>
                )}
                {activeTab === "upcoming" && (
                  <div className="absolute top-3 left-3 bg-emerald-500/80 backdrop-blur-md px-3 py-1 rounded-full">
                    <span className="text-white text-xs font-azeret-mono">New</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-white text-lg font-calendas mb-2">{event.title}</h3>
                <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
                  <Calendar size={14} />
                  <span className="font-azeret-mono">Jun 15, 2023</span>
                </div>
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <MapPin size={14} />
                  <span className="font-azeret-mono">New York, NY</span>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Ticket size={16} className="text-[#ff7e78]" />
                    <span className="text-white font-azeret-mono text-sm">125 available</span>
                  </div>
                  <button className="bg-[#ff7e78]/10 text-[#ff7e78] px-3 py-1 rounded-full text-xs font-azeret-mono hover:bg-[#ff7e78]/20 transition-colors">
                    Buy Ticket
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Mobile View All */}
      <div className="flex justify-center mt-10 md:hidden">
        <button className="w-full max-w-sm py-3 rounded-full border border-white/30 text-white text-sm font-azeret-mono hover:bg-white/10 transition-colors flex items-center justify-center gap-1 group">
          <span>View All Events</span>
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  )
}

export default EventShowcaseSection 