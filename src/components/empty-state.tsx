"use client";

import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { Search } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  title, 
  description, 
  action, 
  secondaryAction, 
  icon = <Search className="w-12 h-12 lg:w-16 lg:h-16 text-muted-foreground" />,
  className 
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center apple-section ${className}`}>
      <FadeIn variant="scale" timing="normal" className="responsive-spacing">
        {/* Icon */}
        <div className="flex items-center justify-center">
          <div className="p-4 lg:p-6 rounded-full bg-accent/50 backdrop-blur-sm">
            {icon}
          </div>
        </div>

        {/* Content */}
        <div className="responsive-spacing max-w-md lg:max-w-lg mx-auto">
          <h3 className="font-primary text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-semibold text-foreground tracking-tight">
            {title}
          </h3>
          <p className="font-secondary text-sm sm:text-base lg:text-lg xl:text-xl text-muted-foreground leading-relaxed tracking-tight">
            {description}
          </p>
        </div>

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 pt-4 lg:pt-8">
            {action && (
              action.href ? (
                <Link href={action.href}>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto font-secondary px-6 lg:px-8 py-3 lg:py-4 rounded-xl transition-all duration-200 ease-out tracking-tight"
                  >
                    {action.icon && <span className="mr-2 lg:mr-3">{action.icon}</span>}
                    {action.label}
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  className="w-full sm:w-auto font-secondary px-6 lg:px-8 py-3 lg:py-4 rounded-xl transition-all duration-200 ease-out tracking-tight"
                  onClick={action.onClick}
                >
                  {action.icon && <span className="mr-2 lg:mr-3">{action.icon}</span>}
                  {action.label}
                </Button>
              )
            )}
            
            {secondaryAction && (
              secondaryAction.href ? (
                <Link href={secondaryAction.href}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto font-secondary px-6 lg:px-8 py-3 lg:py-4 rounded-xl transition-all duration-200 ease-out tracking-tight"
                  >
                    {secondaryAction.icon && <span className="mr-2 lg:mr-3">{secondaryAction.icon}</span>}
                    {secondaryAction.label}
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto font-secondary px-6 lg:px-8 py-3 lg:py-4 rounded-xl transition-all duration-200 ease-out tracking-tight"
                  onClick={secondaryAction.onClick}
                >
                  {secondaryAction.icon && <span className="mr-2 lg:mr-3">{secondaryAction.icon}</span>}
                  {secondaryAction.label}
                </Button>
              )
            )}
          </div>
        )}
      </FadeIn>
    </div>
  );
} 