"use client";

import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: string;
}

export function EmptyState({ 
  title = "No events found", 
  description = "Try adjusting your filters or search terms to find more events",
  actionText = "Clear Filters",
  onAction,
  icon = "🎭"
}: EmptyStateProps) {
  return (
    <FadeIn variant="up" timing="normal" className="w-full">
      <div className="text-center py-12 sm:py-16 lg:py-20">
        <div className="space-y-4 sm:space-y-6 max-w-md mx-auto">
          <div className="text-6xl sm:text-8xl lg:text-9xl animate-bounce">
            {icon}
          </div>
          <div className="space-y-2 sm:space-y-3">
            <h3 className="font-primary text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
              {title}
            </h3>
            <p className="font-secondary text-sm sm:text-base text-gray leading-relaxed">
              {description}
            </p>
          </div>
          {onAction && (
            <Button
              onClick={onAction}
              className="mt-4 sm:mt-6 font-secondary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 h-auto bg-primary text-primary-foreground rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
            >
              {actionText}
            </Button>
          )}
        </div>
      </div>
    </FadeIn>
  );
} 