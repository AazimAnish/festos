"use client";

import { 
  Ticket, 
  Sparkles, 
  Fingerprint, 
  MapPin 
} from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Bento Grid Component
export function BentoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">
      {children}
    </div>
  );
}

// Bento Card Component
export function BentoCard({
  className,
  Icon,
  name,
  description,
  cta,
  href,
  background,
}: {
  className?: string;
  Icon?: React.ElementType;
  name: string;
  description: string;
  cta?: string;
  href?: string;
  background?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "group/bento row-span-1 rounded-3xl border border-border/40 overflow-hidden bg-background relative flex flex-col items-start justify-between gap-4 p-6 shadow-apple-sm hover:shadow-apple-md transition-all duration-300 ease-out",
        className
      )}
    >
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        <div>
          {Icon && (
            <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-2xl bg-primary/10 text-primary">
              <Icon className="w-6 h-6" />
            </div>
          )}
          
          <h3 className="font-primary font-bold text-xl md:text-2xl text-foreground tracking-tight mb-2">
            {name}
          </h3>
          
          <p className="font-secondary text-sm md:text-base text-muted-foreground">
            {description}
          </p>
        </div>
        
        {cta && href && (
          <Link
            href={href}
            className="inline-flex mt-4 text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
          >
            {cta} →
          </Link>
        )}
      </div>
      
      {background && (
        <div className="absolute inset-0 z-0 transition-all duration-300 ease-out group-hover/bento:scale-105">
          {background}
        </div>
      )}
    </div>
  );
}

// Features for Why Festos section
const features = [
  {
    Icon: Ticket,
    name: "Real Tickets, Real Ownership",
    description: "No fakes. No scams. Just verified tickets on Avalanche that you truly own.",
    href: "/discover",
    cta: "Browse events",
    className: "col-span-1 sm:col-span-2 lg:col-span-1",
    background: (
      <div className="absolute top-0 right-0 w-full h-full opacity-5">
        <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-primary blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
      </div>
    ),
  },
  {
    Icon: Sparkles,
    name: "Collect Forever",
    description: "POAP NFTs as proof of your best memories. Tickets that flex harder than wristbands.",
    href: "/poaps",
    cta: "Explore POAPs",
    className: "col-span-1 sm:col-span-2 lg:col-span-2",
    background: (
      <div className="absolute inset-0 opacity-10">
        <Image 
          src="/FESTOS.jpg" 
          alt="POAPs" 
          fill
          className="object-cover opacity-10"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
      </div>
    ),
  },
  {
    Icon: Fingerprint,
    name: "Resell Fairly",
    description: "Sell tickets in-app with capped prices. Fair for fans, transparent for everyone.",
    href: "/marketplace",
    cta: "View marketplace",
    className: "col-span-1 sm:col-span-2 lg:col-span-2",
    background: (
      <div className="absolute inset-0">
        <div className="absolute left-0 bottom-0 w-64 h-64 rounded-full bg-primary blur-3xl opacity-5 translate-y-1/2 -translate-x-1/2" />
      </div>
    ),
  },
  {
    Icon: MapPin,
    name: "Creators Earn More",
    description: "Organizers & creators earn a share on every resale. Your success is our success.",
    href: "/create",
    cta: "Create event",
    className: "col-span-1 sm:col-span-2 lg:col-span-1",
    background: (
      <div className="absolute inset-0">
        <div className="absolute right-0 bottom-0 w-64 h-64 rounded-full bg-primary blur-3xl opacity-5 translate-y-1/2 translate-x-1/2" />
      </div>
    ),
  },
];

export default function WhyFestos() {
  return (
    <section className="w-full bg-background apple-section relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <FadeIn variant="up" timing="normal" className="space-y-10">
          {/* Section Header */}
          <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="font-primary font-bold text-3xl sm:text-4xl md:text-5xl text-foreground tracking-tight">
              Events Will Never Be <span className="text-primary">The Same</span>
            </h2>
            <p className="font-secondary text-lg text-muted-foreground max-w-2xl">
              Trusted by organizers, loved by fans. Your ticket is more than entry — it&apos;s proof you were there.
            </p>
          </div>
          
          {/* Bento Grid */}
          <BentoGrid>
            {features.map((feature, idx) => (
              <BentoCard key={idx} {...feature} />
            ))}
          </BentoGrid>
        </FadeIn>
      </div>
    </section>
  );
}
