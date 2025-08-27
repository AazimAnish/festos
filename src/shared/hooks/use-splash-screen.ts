'use client';

import { useState, useEffect, useRef } from 'react';

export function useSplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const hasMounted = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasMounted.current) return;
    hasMounted.current = true;

    setIsClient(true);

    // Check if this is the first visit
    const hasVisited = localStorage.getItem('festos-has-visited');

    if (hasVisited) {
      setIsFirstVisit(false);
      setShowSplash(false);
    } else {
      // Mark as visited
      localStorage.setItem('festos-has-visited', 'true');
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return {
    showSplash: isClient && isFirstVisit && showSplash,
    handleSplashComplete,
    isFirstVisit,
  };
}
