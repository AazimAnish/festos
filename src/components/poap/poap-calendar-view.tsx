"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { POAPCard3D } from "./poap-card-3d";
import Image from "next/image";

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

interface POAPCalendarViewProps {
  poaps: POAP[];
  onOpenDetails: (poap: POAP) => void;
  onShare: (poap: POAP) => void;
}

// Helper function to get month name
const getMonthName = (month: number) => {
  return new Date(0, month).toLocaleString('default', { month: 'long' });
};

// Helper function to get badge color for rarity (unused but kept for future use)
// const getRarityStyles = (rarity: string) => {
//   switch (rarity) {
//     case "legendary":
//       return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg";
//     case "rare":
//       return "bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg";
//     case "uncommon":
//       return "bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg";
//     default:
//       return "bg-gradient-to-r from-gray-400 to-slate-500 text-white shadow-lg";
//   }
// };

export function POAPCalendarView({ poaps, onOpenDetails, onShare }: POAPCalendarViewProps) {
  const today = useMemo(() => new Date(), []);
  const [activeYear, setActiveYear] = useState(today.getFullYear());
  const [activeMonth, setActiveMonth] = useState(today.getMonth());
  
  // Group POAPs by date
  const poapsByDate = useMemo(() => {
    const result = new Map<string, POAP[]>();
    
    poaps.forEach(poap => {
      const date = poap.date;
      if (!result.has(date)) {
        result.set(date, []);
      }
      result.get(date)?.push(poap);
    });
    
    return result;
  }, [poaps]);
  
  // Get number of days in current month/year
  const daysInMonth = useMemo(() => {
    return new Date(activeYear, activeMonth + 1, 0).getDate();
  }, [activeYear, activeMonth]);
  
  // Get day of week of first day of month (0 = Sunday, 6 = Saturday)
  const firstDayOfMonth = useMemo(() => {
    return new Date(activeYear, activeMonth, 1).getDay();
  }, [activeYear, activeMonth]);
  
  // Navigate to previous month
  const goToPrevMonth = () => {
    if (activeMonth === 0) {
      setActiveMonth(11);
      setActiveYear(activeYear - 1);
    } else {
      setActiveMonth(activeMonth - 1);
    }
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    if (activeMonth === 11) {
      setActiveMonth(0);
      setActiveYear(activeYear + 1);
    } else {
      setActiveMonth(activeMonth + 1);
    }
  };
  
  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 bg-muted/10 rounded-md"></div>);
    }
    
    // Add cells for each day of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(activeYear, activeMonth, day);
      const dateString = date.toISOString().split('T')[0];
      const dayPoaps = poapsByDate.get(dateString) || [];
      const isCurrentMonth = 
        date.getFullYear() === today.getFullYear() && 
        date.getMonth() === today.getMonth() && 
        date.getDate() === today.getDate();
      
      days.push(
        <div 
          key={day}
          className={`p-2 rounded-md flex flex-col h-32 md:h-36 lg:h-40 ${
            isCurrentMonth ? 'bg-primary/10 border border-primary/30' : 'bg-muted/10 hover:bg-muted/20'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-medium ${isCurrentMonth ? 'text-primary' : ''}`}>
              {day}
            </span>
            {dayPoaps.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {dayPoaps.length}
              </Badge>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {dayPoaps.slice(0, 2).map(poap => (
              <div 
                key={poap.id} 
                className="flex items-center gap-2 mb-1 p-1 rounded-md hover:bg-muted/20 cursor-pointer"
                onClick={() => onOpenDetails(poap)}
              >
                <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={poap.image}
                    alt={poap.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-xs truncate flex-1">{poap.name}</span>
              </div>
            ))}
            {dayPoaps.length > 2 && (
              <div className="text-xs text-muted-foreground text-center">
                +{dayPoaps.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  }, [activeYear, activeMonth, firstDayOfMonth, daysInMonth, poapsByDate, today, onOpenDetails]);
  
  // Get POAPs for current month
  const currentMonthPoaps = useMemo(() => {
    return poaps.filter(poap => {
      const date = new Date(poap.date);
      return date.getFullYear() === activeYear && date.getMonth() === activeMonth;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [poaps, activeYear, activeMonth]);
  
  return (
    <div className="space-y-6">
      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-primary text-xl font-semibold">{getMonthName(activeMonth)} {activeYear}</h3>
          <p className="text-sm text-muted-foreground">
            {currentMonthPoaps.length} POAPs collected this month
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={goToPrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActiveMonth(today.getMonth());
              setActiveYear(today.getFullYear());
            }}
          >
            Today
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={goToNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Calendar */}
      <Card>
        <CardContent className="p-4">
          {/* Calendar header (days of week) */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays}
          </div>
        </CardContent>
      </Card>
      
      {/* POAPs for selected month */}
      {currentMonthPoaps.length > 0 && (
        <div>
          <h3 className="font-primary text-xl font-semibold mb-4">
            POAPs from {getMonthName(activeMonth)} {activeYear}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentMonthPoaps.map(poap => (
              <POAPCard3D
                key={poap.id}
                poap={poap}
                onOpenDetails={onOpenDetails}
                onShare={onShare}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
