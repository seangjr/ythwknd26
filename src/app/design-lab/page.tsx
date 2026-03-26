"use client";

import { HoloCard } from "@/components/ui/holo-card";
import { CONSTANTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Class-specific overlay colors
const CLASS_COLORS: Record<string, string> = {
  warrior: "#ef4444",
  archer: "#22c55e",
  scout: "#0ea5e9",
  guardian: "#f59e0b",
  scholar: "#8b5cf6",
};

// SVG background images per hero (high quality)
const HERO_BG: Record<string, string> = {
  warrior: "/card-bg/Warrior.webp",
  archer: "/card-bg/Archer.webp",
  scout: "/card-bg/Scout.webp",
  guardian: "/card-bg/Guardian.webp",
  scholar: "/card-bg/Scholar.webp",
};

// Demo: simulate 2 taken heroes with IG handles
const demoTaken: Record<string, string> = {
  guardian: "@josh_yap",
  archer: "@jenisha.k",
};

export default function DesignLab() {
  const demoTeam = CONSTANTS.TEAMS[0]; // Crimson

  return (
    <main className="min-h-screen bg-black text-white p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-jetsytrial mb-2">
          Design Lab
        </h1>
        <p className="text-white/50 mb-2">
          Class Cards &mdash; {demoTeam.code} {demoTeam.name}
        </p>
        <p className="text-white/30 text-sm mb-10">
          PNG backgrounds, SVG icons top-right, Jetsy Trial for names &amp;
          buttons. Guardian &amp; Archer greyed out.
        </p>

        {/* Hero cards row */}
        <div className="flex flex-wrap justify-center gap-6">
          {CONSTANTS.HEROES.map((hero) => {
            const isTaken = hero.id in demoTaken;

            return (
              <div
                key={hero.id}
                className={cn(
                  "transition-all duration-300",
                  isTaken && "grayscale opacity-50"
                )}
              >
                <HoloCard
                  data={{
                    name: isTaken ? demoTaken[hero.id] : hero.name,
                    subtitle: hero.perk,
                    description: hero.description,
                    backgroundImage: HERO_BG[hero.id],
                    iconImage: hero.icon,
                    overlayColor: CLASS_COLORS[hero.id],
                    overlayOpacity: 25,
                  }}
                  width={200}
                  height={280}
                  showSparkles={!isTaken}
                  forceSide={isTaken ? "front" : undefined}
                  actionLabel={isTaken ? "Claimed" : "Claim Class"}
                  onAction={isTaken ? undefined : () => alert(`Claiming ${hero.name}!`)}
                />
              </div>
            );
          })}
        </div>

        {/* Second row: team overlay color */}
        <h2 className="text-xl font-jejuhallasan uppercase tracking-wide mt-16 mb-2">
          With team overlay color
        </h2>
        <p className="text-white/30 text-sm mb-6">
          {CONSTANTS.TEAMS[4].name} team hex as overlay.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          {CONSTANTS.HEROES.map((hero) => (
            <HoloCard
              key={hero.id}
              data={{
                name: hero.name,
                subtitle: hero.perk,
                description: hero.description,
                backgroundImage: HERO_BG[hero.id],
                iconImage: hero.icon,
                overlayColor: CONSTANTS.TEAMS[4].hex,
                overlayOpacity: 30,
              }}
              width={200}
              height={280}
              showSparkles={true}
              actionLabel="Claim Class"
              onAction={() => alert(`Claiming ${hero.name}!`)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
