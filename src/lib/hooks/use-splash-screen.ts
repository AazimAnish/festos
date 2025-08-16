"use client";

import { useState, useEffect } from "react";

export function useSplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Check if this is the first visit
    const hasVisited = localStorage.getItem("festos-has-visited");
    
    if (hasVisited) {
      setIsFirstVisit(false);
      setShowSplash(false);
    } else {
      // Mark as visited
      localStorage.setItem("festos-has-visited", "true");
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return {
    showSplash: isClient && isFirstVisit && showSplash,
    handleSplashComplete,
    isFirstVisit
  };
}
