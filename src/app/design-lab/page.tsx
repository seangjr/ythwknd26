"use client";
import { useState } from "react";
import { VariationRefined } from "./variation-refined";
import { Variation1 } from "./variation-1";
import { Variation2 } from "./variation-2";
import { Variation3 } from "./variation-3";
import { Variation4 } from "./variation-4";
import { Variation5 } from "./variation-5";

const variations = [
  { id: 0, name: "Refined", desc: "Keeps existing hero, redesigned details: typographic, organic, hand-crafted feel" },
  { id: 1, name: "Storybook Journey", desc: "Parallax hero, chapter-style scroll sections, earthy forest palette" },
  { id: 2, name: "Mountain Trail", desc: "Waypoint navigation, alternating L/R layout, deep slate & moss" },
  { id: 3, name: "Enchanted Meadow", desc: "Soft Ghibli feel, floating particles, rounded cards, warm mint" },
  { id: 4, name: "Expedition Log", desc: "Editorial grid, numbered sections, structured & clean" },
  { id: 5, name: "Campfire Carnival", desc: "High energy, ribbon dividers, interactive hero picker" },
];

const components = [VariationRefined, Variation1, Variation2, Variation3, Variation4, Variation5];

export default function DesignLabPage() {
  const [active, setActive] = useState(0);
  const ActiveComponent = components[active];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Sticky nav bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-xs tracking-widest uppercase text-white/50">Design Lab</span>
            <span className="text-xs text-white/30">|</span>
            <span className="text-xs text-white/40">{variations[active].name}</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {variations.map((v, i) => (
              <button
                key={v.id}
                onClick={() => { setActive(i); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                  active === i
                    ? "bg-white text-black font-medium"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                {v.id === 0 ? "Refined" : `V${v.id}`}: {v.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Variation description */}
      <div className="pt-28 pb-4 px-6 text-center">
        <p className="text-sm text-white/50 max-w-xl mx-auto">
          {variations[active].desc}
        </p>
      </div>

      {/* Active variation */}
      <div className="relative">
        <ActiveComponent />
      </div>
    </div>
  );
}
