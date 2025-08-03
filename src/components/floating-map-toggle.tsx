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
      className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90 hover:scale-110 border-2 border-background"
    >
      <Map className="w-5 h-5 sm:w-6 sm:h-6" />
    </Button>
  );
}