"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, TrendingUp, Clock, Star } from "lucide-react"
import { exampleImages } from "@/utils/demo-images"
import { Button } from "@/components/ui/button"

// Tab types
type TabType = "trending" | "upcoming" | "featured" | "recent"

const DiscoverEventsSection = () => {
  const [activeTab, setActiveTab] = useState<TabType>("trending")
  const [attendeeCounts, setAttendeeCounts] = useState<number[]>([])
  
  // Generate stable attendee counts on client-side only
  useEffect(() => {
    const counts = exampleImages.map(() => Math.floor(Math.random() * 200) + 50)
    setAttendeeCounts(counts)
  }, [])
  
  const tabs = [
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "upcoming", label: "Upcoming", icon: Calendar },
    { id: "featured", label: "Featured", icon: Star },
    { id: "recent", label: "Recent", icon: Clock },
  ]
  
  return (
    <section className="py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-calendas text-black dark:text-white">
            <span className="text-[#ff4b43]">Discover</span> Events
          </h2>
          <p className="text-black/70 dark:text-white/70 mt-2 font-azeret-mono text-sm md:text-base">
            Find your next unforgettable experience
          </p>
        </div>
        
        {/* Tab navigation */}
        <div className="flex flex-wrap gap-2 mb-10">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  px-4 py-2 rounded-lg flex items-center gap-2 font-azeret-mono text-sm transition-colors
                  ${isActive 
                    ? 'bg-[#ff4b43] text-white accent-glow'
                    : 'bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-black/70 dark:text-white/70'}
                `}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>
        
        {/* Events grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {exampleImages.map((event, index) => (
            <motion.div
              key={`discover-${activeTab}-${index}`}
              className="card-glass hover:border-white/30 dark:hover:border-black/30 transition-all cursor-pointer group hover-glow"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div className="relative h-48">
                <img 
                  src={event.url} 
                  alt={event.title} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                />
                <div className="absolute top-3 right-3 bg-white/10 dark:bg-black/10 backdrop-blur-md px-3 py-1 rounded-lg">
                  <span className="text-white dark:text-black text-xs font-azeret-mono">0.025 ETH</span>
                </div>
                {activeTab === "trending" && (
                  <div className="absolute top-3 left-3 bg-[#ff4b43]/80 backdrop-blur-md px-3 py-1 rounded-lg accent-glow">
                    <span className="text-white text-xs font-azeret-mono">Hot</span>
                  </div>
                )}
                {activeTab === "upcoming" && (
                  <div className="absolute top-3 left-3 bg-emerald-500/80 backdrop-blur-md px-3 py-1 rounded-lg accent-glow">
                    <span className="text-white text-xs font-azeret-mono">New</span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-bold text-black dark:text-white">{event.title}</h3>
                <p className="text-black/70 dark:text-white/70 text-sm mt-1 font-azeret-mono">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • New York, NY
                </p>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="text-black/50 dark:text-white/50 text-xs font-azeret-mono">
                    {attendeeCounts[index] || "100+"} attendees
                  </div>
                  <Button 
                    variant="link" 
                    className="text-[#ff4b43] hover:text-[#ff6c66] text-sm font-azeret-mono p-0"
                  >
                    View details
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* View all events button */}
        <div className="mt-12 text-center">
          <Button size="lg" className="rounded-lg">
            View All Events
          </Button>
        </div>
      </div>
    </section>
  )
}

export default DiscoverEventsSection 