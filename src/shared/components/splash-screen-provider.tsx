'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSplashScreen } from '@/shared/hooks/use-splash-screen';
import { SplashScreen } from '@/shared/components/splash-screen';

interface SplashScreenContextType {
  showSplash: boolean;
  handleSplashComplete: () => void;
  isFirstVisit: boolean;
}

const SplashScreenContext = createContext<SplashScreenContextType | undefined>(
  undefined
);

export function useSplashScreenContext() {
  const context = useContext(SplashScreenContext);
  if (context === undefined) {
    throw new Error(
      'useSplashScreenContext must be used within a SplashScreenProvider'
    );
  }
  return context;
}

interface SplashScreenProviderProps {
  children: ReactNode;
}

export function SplashScreenProvider({ children }: SplashScreenProviderProps) {
  const splashScreen = useSplashScreen();

  return (
    <SplashScreenContext.Provider value={splashScreen}>
      {splashScreen.showSplash && (
        <SplashScreen onComplete={splashScreen.handleSplashComplete} />
      )}
      {children}
    </SplashScreenContext.Provider>
  );
}
