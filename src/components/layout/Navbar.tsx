"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Calendar, Search, Ticket, User, Menu, X, Moon, Sun, Laptop, LucideIcon } from "lucide-react"
import { ExpandableTabs } from "@/components/ui/expandable-tabs"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavbarProps {
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export function Navbar({ theme, setTheme }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navTabs = [
    { title: "Home", icon: Home },
    { title: "Events", icon: Calendar },
    { title: "Search", icon: Search },
    { title: "Tickets", icon: Ticket },
    { type: "separator" as const },
    { title: "Account", icon: User },
  ]

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Laptop
  }

  const ThemeIcon = themeIcons[theme]

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-6 md:py-5",
        isScrolled
          ? "bg-black/30 dark:bg-white/5 backdrop-blur-md border-b border-white/10 dark:border-black/10"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Side - Logo */}
        <div className="flex-shrink-0 py-2">
          <Link href="/" className="text-white dark:text-gray-900 text-2xl font-calendas">
            <span className="text-[#ff4b43]">Festos</span>
          </Link>
        </div>

        {/* Center - Navigation (Absolute positioned to ensure center alignment) */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 w-auto z-10">
          <ExpandableTabs
            tabs={navTabs}
            className="bg-transparent border-white/10 dark:border-black/10 py-3"
            activeColor="text-[#ff4b43]"
          />
        </div>

        {/* Right Side Controls */}
        <div className="flex-shrink-0 flex items-center gap-6">
          {/* Connect Wallet Button - desktop only */}
          <motion.button
            className="hidden md:block px-5 py-3 rounded-lg bg-[#ff4b43] text-white font-medium hover:bg-[#ff6c66] transition-colors font-azeret-mono accent-glow hover-glow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Connect Wallet
          </motion.button>

          {/* Theme Toggle Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                className="p-3 rounded-lg card-glass dark:bg-white/10 hover:bg-white/20 dark:hover:bg-black/20 text-white dark:text-gray-900"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ThemeIcon size={20} />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="card-glass backdrop-blur-md border-white/10 dark:border-black/10 bg-black/25 dark:bg-white/25 text-white dark:text-gray-900 relative">
              <div className="relative z-10">
                <DropdownMenuItem
                  className="flex items-center gap-2 hover:bg-white/10 dark:hover:bg-black/10 cursor-pointer py-3 px-4"
                  onClick={() => setTheme("light")}
                >
                  <Sun size={16} />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 hover:bg-white/10 dark:hover:bg-black/10 cursor-pointer py-3 px-4"
                  onClick={() => setTheme("dark")}
                >
                  <Moon size={16} />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 hover:bg-white/10 dark:hover:bg-black/10 cursor-pointer py-3 px-4"
                  onClick={() => setTheme("system")}
                >
                  <Laptop size={16} />
                  <span>System</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden text-white dark:text-gray-900 p-3"
            onClick={toggleMobileMenu}
            whileTap={{ scale: 0.9 }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 top-[72px] bg-black/25 dark:bg-white/25 backdrop-blur-md z-40 md:hidden card-glass overflow-hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="flex flex-col items-center pt-10 px-4 relative z-10">
              {navTabs.filter(tab => tab.type !== "separator").map((tab, index) => {
                const TabIcon = tab.icon as LucideIcon
                return (
                  <motion.a
                    key={tab.title}
                    href="#"
                    className="flex items-center py-5 text-white/80 dark:text-gray-800/80 hover:text-[#ff4b43] dark:hover:text-[#ff4b43] font-azeret-mono text-lg w-full justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: 0.1 + (index * 0.1) }
                    }}
                    whileHover={{ scale: 1.05, x: 5 }}
                  >
                    <TabIcon className="mr-2" size={20} />
                    {tab.title}
                  </motion.a>
                )
              })}

              <motion.button
                className="mt-8 px-8 py-4 rounded-lg bg-[#ff4b43] text-white font-medium hover:bg-[#ff6c66] transition-colors font-azeret-mono accent-glow hover-glow w-full max-w-[250px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.5 }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Connect Wallet
              </motion.button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
} 