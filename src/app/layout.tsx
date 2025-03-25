"use client";

import { useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { TriangleCursor } from "@/components/ui/triangle-cursor";
import "./globals.css";

// Metadata must be exported from a separate file or with a dynamic export
// when using "use client" directive
const metadata = {
  title: "Festos | Web3 Ticketing Platform",
  description: "Unforgettable experiences, one ticket at a time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  
  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
    
    // Get theme from localStorage or use system preference as default
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" || "system";
    setTheme(savedTheme);
    
    // Check if should use dark mode based on theme setting or system preference
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDarkTheme = 
      savedTheme === "dark" || 
      (savedTheme === "system" && systemPrefersDark);
    
    setIsDarkTheme(shouldUseDarkTheme);
    
    // Apply the theme class to the document to avoid hydration mismatch
    if (shouldUseDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  // Function to toggle theme
  const toggleTheme = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    if (newTheme === "light") {
      setIsDarkTheme(false);
      document.documentElement.classList.remove('dark');
    } else if (newTheme === "dark") {
      setIsDarkTheme(true);
      document.documentElement.classList.add('dark');
    } else {
      // System preference
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkTheme(systemPrefersDark);
      if (systemPrefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  // Dark theme gradient colors
  const darkGradientColors = [
    "#0A0A0A",
    "#1f0505",
    "#2d1e1e",
    "#3c0a0a",
    "#2a0a0a",
    "#1f0505",
    "#15151a"
  ];
  
  // Light theme gradient colors
  const lightGradientColors = [
    "#FFFFFF",
    "#F4F4F8",
    "#ffeded",
    "#ffe6e6",
    "#ffdada",
    "#ffcece",
    "#F8F8FC"
  ];

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className="antialiased font-azeret-mono relative min-h-screen overflow-x-hidden" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* Don't render anything until client-side hydration completes */}
          {mounted && (
            <>
              {/* Custom Triangle Cursor */}
              <TriangleCursor />
              
              {/* Animated Background */}
              <AnimatedGradientBackground
                Breathing={true}
                gradientColors={isDarkTheme ? darkGradientColors : lightGradientColors}
                gradientStops={[35, 50, 60, 70, 80, 90, 100]}
                startingGap={125}
                breathingRange={5}
                topOffset={0}
                animationSpeed={0.02}
                containerClassName="fixed inset-0 -z-10"
              />
              
              {/* Content Container with Navbar and Footer */}
              <div className="flex flex-col min-h-screen">
                {/* Fixed Navbar */}
                <Navbar theme={theme} setTheme={toggleTheme} />
                
                {/* Main Content */}
                <main className="flex-grow">
                  {children}
                </main>
                
                {/* Fixed Footer */}
                <Footer />
              </div>
            </>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
