"use client"

import { motion } from "framer-motion"
import { CTASection } from "@/components/ui/cta-with-rectangle"

export default function CallToActionSection() {
  return (
    <div className="space-y-16 py-0 pt-0">
      {/* Become an Organizer CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <CTASection
          badge={{ text: "For Event Organizers" }}
          title="Become an Organizer"
          description="Create and manage events with powerful tools and reach a wider audience."
          action={{
            text: "Start Creating",
            href: "#",
            variant: "default"
          }}
          withGlow={true}
          className="bg-black/30 backdrop-blur-sm card-glass border border-white/10 rounded-xl hover-glow"
        />
      </motion.div>
      
      {/* List Your Event CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <CTASection
          badge={{ text: "Promote Your Event" }}
          title="List Your Event"
          description="Get discovered by thousands of event-goers looking for the next great experience."
          action={{
            text: "List Event",
            href: "#",
            variant: "default"
          }}
          withGlow={true}
          className="bg-black/20 backdrop-blur-sm card-glass border border-white/10 rounded-xl hover-glow"
        />
      </motion.div>
      
      {/* Join the Community CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <CTASection
          badge={{ text: "Join Us" }}
          title="Join the Community"
          description="Connect with like-minded event enthusiasts and discover exclusive opportunities."
          action={{
            text: "Join Now",
            href: "#",
            variant: "default"
          }}
          withGlow={true}
          className="bg-black/30 backdrop-blur-sm card-glass border border-white/10 rounded-xl hover-glow"
        />
      </motion.div>
    </div>
  )
} 