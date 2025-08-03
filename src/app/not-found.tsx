"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <FadeIn variant="up" timing="normal">
          <div className="space-y-6">
            {/* 404 Icon */}
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-primary">404</span>
              </div>
            </div>
            
            {/* Content */}
            <div className="space-y-4">
              <h1 className="font-primary text-2xl sm:text-3xl font-bold text-foreground">
                Page Not Found
              </h1>
              <p className="font-secondary text-base text-gray leading-relaxed">
                The page you&apos;re looking for doesn&apos;t exist or has been moved. 
                Let&apos;s get you back on track.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link href="/discover">
                  <Search className="w-4 h-4 mr-2" />
                  Explore Events
                </Link>
              </Button>
            </div>

            {/* Back Button */}
            <div className="pt-4">
              <Button
                variant="ghost"
                onClick={() => window.history.back()}
                className="text-gray hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
} 