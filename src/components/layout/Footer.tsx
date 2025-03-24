"use client"

import { motion } from "framer-motion";
import Link from "next/link";
import { Twitter, Instagram, Facebook, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

// Social media links data
const socialLinks = [
  { name: "Twitter", href: "#", icon: Twitter },
  { name: "Instagram", href: "#", icon: Instagram },
  { name: "Facebook", href: "#", icon: Facebook },
  { name: "Github", href: "#", icon: Github },
];

// Footer link categories
const aboutLinks = [
  { name: "About Us", href: "#" },
  { name: "Our Team", href: "#" },
  { name: "Careers", href: "#" },
  { name: "Press", href: "#" },
];

const helpLinks = [
  { name: "Contact", href: "#" },
  { name: "FAQs", href: "#" },
  { name: "Privacy", href: "#" },
  { name: "Terms", href: "#" },
];

const resourceLinks = [
  { name: "Blog", href: "#" },
  { name: "Developers", href: "#" },
  { name: "Integrations", href: "#" },
  { name: "Guides", href: "#" },
];

// Helper component for footer links columns
interface FooterLinkColumnProps {
  title: string;
  links: {
    name: string;
    href: string;
  }[];
}

const FooterLinkColumn = ({ title, links }: FooterLinkColumnProps) => (
  <div className="mb-8 md:mb-0">
    <h3 className="text-white dark:text-black font-azeret-mono text-base font-medium mb-3">{title}</h3>
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.name}>
          <Link 
            href={link.href}
            className="text-white/70 dark:text-black/70 hover:text-white dark:hover:text-black text-sm font-azeret-mono"
          >
            {link.name}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export function Footer() {
  return (
    <footer className="relative bg-black/30 dark:bg-white/10 backdrop-blur-md border-t border-white/10 dark:border-black/10 pt-16 pb-8 overflow-hidden">
      {/* Animated decoration elements */}
      <motion.div 
        className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-20 bg-gradient-to-r from-purple-500 to-[#ff4b43]"
        animate={{
          x: [0, 10, 0],
          y: [0, 15, 0],
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        style={{
          filter: "blur(40px)"
        }}
      />
      
      <motion.div 
        className="absolute bottom-20 right-20 w-48 h-48 rounded-full opacity-20 bg-gradient-to-r from-blue-500 to-[#ff4b43]"
        animate={{
          x: [0, -20, 0],
          y: [0, 10, 0],
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        style={{
          filter: "blur(50px)"
        }}
      />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="text-white dark:text-black text-2xl font-calendas">
                <span className="text-[#ff4b43]">Festos</span>
              </Link>
              <p className="text-white/70 dark:text-black/70 text-sm font-azeret-mono mt-4">
                Secure, decentralized ticketing platform for unforgettable experiences.
              </p>
              
              <div className="flex space-x-4">
                {socialLinks.map((social, i) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.href}
                      className="p-2 rounded-md card-glass hover:bg-white/10 dark:hover:bg-black/10 text-white/80 dark:text-black/80 hover:text-white dark:hover:text-black transition-colors"
                      whileHover={{ 
                        scale: 1.1,
                        boxShadow: "0 0 15px rgba(255, 75, 67, 0.5)"
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        transition: { delay: 0.1 + (i * 0.1) }
                      }}
                    >
                      <Icon size={18} />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          </div>
          
          {/* Links sections */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <FooterLinkColumn title="About" links={aboutLinks} />
            <FooterLinkColumn title="Help" links={helpLinks} />
            <FooterLinkColumn title="Resources" links={resourceLinks} />
          </div>
        </div>
        
        {/* Bottom section with newsletter */}
        <div className="mt-12 pt-8 border-t border-white/10 dark:border-black/10">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-white/50 dark:text-black/50 text-sm font-azeret-mono">
              © 2023 Festos. All rights reserved.
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <span className="text-white/70 dark:text-black/70 text-sm font-azeret-mono">
                Subscribe to our newsletter
              </span>
              
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-4 py-2 rounded-md border border-white/10 dark:border-black/10 bg-white/5 dark:bg-black/5 text-white dark:text-black placeholder-white/40 dark:placeholder-black/40 focus:outline-none focus:ring-1 focus:ring-[#ff4b43] text-sm font-azeret-mono"
                />
                <Button size="default">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 