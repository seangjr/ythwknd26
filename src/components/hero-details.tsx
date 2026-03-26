"use client";

import { CONSTANTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import Image from "next/image";

interface HeroDetailsProps {
  heroId: string | null;
  className?: string;
  teamId: number;
}

const getHeroIcon = (heroId: string | null) => {
  if (!heroId) return "/placeholder.svg";
  const heroObj = CONSTANTS.HEROES.find(h => h.id === heroId);
  return heroObj?.icon || "/placeholder.svg";
};

export function HeroDetails({ heroId, className, teamId }: HeroDetailsProps) {
  const heroDetails = useMemo(() => {
    if (!heroId) return null;
    return CONSTANTS.HEROES.find((h) => h.id === heroId);
  }, [heroId]);

  if (!heroDetails) {
    return (
      <div className={cn("bg-[#1a1a1a] rounded-2xl p-8 text-center", className)}>
        <p className="text-gray-400">Select a class to see details</p>
      </div>
    );
  }

  return (
    <div className={cn("bg-[#18181b] rounded-2xl overflow-hidden shadow-lg border border-gray-800", className)}>
      <div className="relative w-full h-56 bg-black flex items-center justify-center">
        <Image
          src={getHeroIcon(heroId)}
          alt={heroDetails.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0" style={{background: 'linear-gradient(to bottom, rgba(24,24,27,0) 60%, rgba(24,24,27,1) 100%)'}} />
      </div>
      <div className="p-6 flex flex-col gap-2">
        <h2 className="text-[#F7EAD9] text-3xl font-jejuhallasan mb-1">{heroDetails.name}</h2>
        {heroDetails.class && (
          <div className="mb-2">
            <h3 className="font-jejuhallasan text-xl uppercase text-[#F7EAD9] mb-1">Class</h3>
            <p className="text-[#F7EAD9] text-sm uppercase">{heroDetails.class}</p>
          </div>
        )}
        {heroDetails.perk && (
          <div className="mb-2">
            <h3 className="font-jejuhallasan text-xl uppercase text-[#F7EAD9] mb-1">Perk</h3>
            <p className="text-[#F7EAD9] text-sm">{heroDetails.perk}</p>
          </div>
        )}
        {heroDetails.description && (
          <div>
            <h3 className="font-jejuhallasan text-xl uppercase text-[#F7EAD9] mb-1">Description</h3>
            <p className="text-[#F7EAD9] text-sm uppercase">{heroDetails.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
