"use client";

import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";

interface FloatingMapToggleProps {
  onClick: () => void;
}

export function FloatingMapToggle({ onClick }: FloatingMapToggleProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 sm:bottom-8 lg:bottom-12 right-6 sm:right-8 lg:right-12 z-40 rounded-full w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90 hover:scale-[1.05] active:scale-[0.95] border-2 border-background"
    >
      <Map className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
    </Button>
  );
}