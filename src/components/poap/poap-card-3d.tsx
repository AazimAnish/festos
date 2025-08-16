"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Calendar, Info, Share2 } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface POAP {
  id: number;
  name: string;
  event: string;
  rarity: string;
  image: string;
  date: string;
  description: string;
  totalMinted: number;
  attributes: Array<{ trait: string; value: string }>;
  mintNumber: number;
}

interface POAPCard3DProps {
  poap: POAP;
  onOpenDetails: (poap: POAP) => void;
  onShare: (poap: POAP) => void;
}

// Helper function to get badge color for rarity
const getRarityStyles = (rarity: string) => {
  switch (rarity) {
    case "legendary":
      return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg";
    case "rare":
      return "bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg";
    case "uncommon":
      return "bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg";
    default:
      return "bg-gradient-to-r from-gray-400 to-slate-500 text-white shadow-lg";
  }
};

export function POAPCard3D({ poap, onOpenDetails, onShare }: POAPCard3DProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Apply a special glow effect for legendary POAPs
  const isLegendary = poap.rarity === "legendary";
  
  // Handle mouse movement for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate rotation based on mouse position
    // The effect should be subtle, so we limit the rotation to ±15 degrees
    const rotateXFactor = 15;
    const rotateYFactor = 15;
    
    setRotateX((e.clientY - centerY) / rect.height * rotateXFactor);
    setRotateY((centerX - e.clientX) / rect.width * rotateYFactor);
  };
  
  // Reset rotation when mouse leaves
  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };
  
  // Add a subtle auto-rotation effect when the card is legendary and not being hovered
  useEffect(() => {
    if (!isLegendary || isHovered) return;
    
    const interval = setInterval(() => {
      const time = Date.now() / 1000;
      setRotateX(Math.sin(time) * 2);
      setRotateY(Math.cos(time) * 2);
    }, 50);
    
    return () => clearInterval(interval);
  }, [isLegendary, isHovered]);
  
  return (
    <motion.div
      ref={cardRef}
      className="perspective-1000 cursor-pointer"
      style={{ perspective: "1000px" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`,
          transition: "transform 0.05s ease-out"
        }}
      >
        <Card className={`group overflow-hidden rounded-xl border border-border/50 bg-background shadow-sm transition-all duration-300 ease-out ${
          isHovered ? 'scale-[1.02] -translate-y-1 shadow-lg hover:border-border' : ''
        } ${isLegendary ? 'shadow-yellow-400/20 hover:shadow-yellow-400/30' : ''}`}>
          <div className="aspect-square relative overflow-hidden">
            <Image
              src={poap.image}
              alt={poap.name}
              fill
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
            {/* Rarity Badge */}
            <div className="absolute top-3 right-3">
              <Badge
                className={getRarityStyles(poap.rarity)}
              >
                <Award className="w-3 h-3 mr-1" />
                {poap.rarity}
              </Badge>
            </div>
            
            {/* Action Buttons */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 bg-black/40 transition-opacity duration-300">
              <Button 
                variant="default"
                size="icon" 
                className="h-10 w-10 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetails(poap);
                }}
              >
                <Info className="h-4 w-4" />
              </Button>
              <Button 
                variant="default"
                size="icon" 
                className="h-10 w-10 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(poap);
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Special effect for legendary POAPs */}
            {isLegendary && (
              <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            )}
          </div>
          <CardContent className="p-4">
            <h4 className="font-primary font-semibold text-sm mb-2 text-foreground line-clamp-2">{poap.name}</h4>
            <div className="font-secondary text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(poap.date).toLocaleDateString()}
            </div>
            <div className="mt-2 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Mint #{poap.mintNumber}</span>
                <span>{poap.totalMinted} minted</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
