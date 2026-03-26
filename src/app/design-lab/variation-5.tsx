"use client";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRef, useState } from "react";

/**
 * VARIATION 5: "Campfire Carnival"
 *
 * High energy, festival-poster inspired.
 * Horizontal ribbon dividers, bold color blocks.
 * Bright greens, sunset orange, warm yellows.
 * Interactive character picker with flip-card animation.
 */

const palette = {
  bg: "#111b13",
  bgSection: "#0d160f",
  accent1: "#50c878",   // bright emerald
  accent2: "#f4a940",   // sunset orange
  accent3: "#68b8e0",   // bright sky
  text: "#f0ebe2",
  textMuted: "#8a9b8e",
  card: "#1a2e1f",
  ribbon: "#50c87822",
};

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 70, damping: 16 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const heroes = [
  { name: "Warrior", perk: "Frontline Breaker", desc: "Smashes through obstacles, absorbs the hardest hits.", color: "#f4a940" },
  { name: "Archer", perk: "Precision Striker", desc: "Finds the opening and delivers the critical shot.", color: "#68b8e0" },
  { name: "Scout", perk: "Rapid Pathfinder", desc: "Moves fast, gathers intel, slips through the cracks.", color: "#50c878" },
  { name: "Guardian", perk: "Iron Wall", desc: "Holds the line and shields the team.", color: "#f4a940" },
  { name: "Scholar", perk: "Tactical Mind", desc: "Deciphers patterns and builds the winning plan.", color: "#68b8e0" },
];

export function Variation5() {
  const [activeHero, setActiveHero] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroRotate = useTransform(scrollYProgress, [0, 1], [0, -3]);

  return (
    <div style={{ background: palette.bg, color: palette.text }} className="min-h-screen font-sans">
      {/* === HERO: Full energy === */}
      <div ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div style={{ rotate: heroRotate }} className="absolute inset-[-10%]">
          <Image
            src="/assets/background.png"
            alt="Vibrant landscape"
            fill
            className="object-cover"
            quality={90}
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(160deg, ${palette.bg}cc 0%, transparent 40%, ${palette.bg} 90%)`,
            }}
          />
        </motion.div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 12 }}
          >
            <Image src="/assets/masthead-white.svg" alt="YTHWKND Logo" width={500} height={500} className="mx-auto" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="mt-8 flex items-center gap-4"
          >
            <div className="h-px w-12" style={{ background: palette.accent1 }} />
            <span className="text-lg tracking-[0.3em] uppercase font-jejuhallasan" style={{ color: palette.accent1 }}>
              30 May &ndash; 1 June
            </span>
            <div className="h-px w-12" style={{ background: palette.accent1 }} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-4 text-lg"
            style={{ color: palette.textMuted }}
          >
            Peacehaven, Genting Highlands
          </motion.div>
        </div>
      </div>

      {/* === RIBBON DIVIDER === */}
      <div
        className="py-4 text-center overflow-hidden"
        style={{ background: palette.ribbon, borderTop: `1px solid ${palette.accent1}33`, borderBottom: `1px solid ${palette.accent1}33` }}
      >
        <motion.div
          animate={{ x: [0, -500] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap text-sm tracking-[0.5em] uppercase"
          style={{ color: palette.accent1 }}
        >
          WARRIOR &bull; ARCHER &bull; SCOUT &bull; GUARDIAN &bull; SCHOLAR &bull; WARRIOR &bull; ARCHER &bull; SCOUT &bull; GUARDIAN &bull; SCHOLAR &bull; WARRIOR &bull; ARCHER &bull; SCOUT &bull; GUARDIAN &bull; SCHOLAR &bull;
        </motion.div>
      </div>

      {/* === SECTION: Interactive Hero Picker === */}
      <section className="py-20 px-6" style={{ background: palette.bgSection }}>
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <h2 className="text-5xl md:text-6xl font-jejuhallasan text-center" style={{ color: palette.accent2 }}>
              Pick Your Hero
            </h2>
          </Reveal>

          <Reveal>
            <div className="mt-12 flex justify-center">
              <Image
                src="/assets/chars.png"
                alt="Hero characters"
                width={600}
                height={350}
                className="object-contain"
              />
            </div>
          </Reveal>

          <Reveal>
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {heroes.map((hero, i) => (
                <motion.button
                  key={hero.name}
                  onClick={() => setActiveHero(i)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-3 rounded-xl font-jejuhallasan text-sm transition-colors"
                  style={{
                    background: activeHero === i ? hero.color : palette.card,
                    color: activeHero === i ? palette.bg : palette.text,
                    border: `1px solid ${activeHero === i ? hero.color : palette.accent1}33`,
                  }}
                >
                  {hero.name}
                </motion.button>
              ))}
            </div>
          </Reveal>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeHero}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 100, damping: 16 }}
              className="mt-8 rounded-2xl p-8 text-center max-w-md mx-auto"
              style={{ background: palette.card, border: `2px solid ${heroes[activeHero].color}44` }}
            >
              <div className="text-2xl font-jejuhallasan" style={{ color: heroes[activeHero].color }}>
                {heroes[activeHero].name}
              </div>
              <div className="text-sm uppercase tracking-widest mt-2" style={{ color: palette.accent1 }}>
                {heroes[activeHero].perk}
              </div>
              <div className="mt-4 text-sm leading-relaxed" style={{ color: palette.textMuted }}>
                {heroes[activeHero].desc}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* === RIBBON DIVIDER 2 === */}
      <div
        className="py-3"
        style={{ background: `linear-gradient(90deg, ${palette.accent2}, ${palette.accent1}, ${palette.accent3})` }}
      />

      {/* === SECTION: Pricing === */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <Reveal>
            <h2 className="text-5xl md:text-6xl font-jejuhallasan" style={{ color: palette.accent2 }}>
              Grab Your Spot
            </h2>
          </Reveal>

          <Reveal>
            <div className="mt-12 grid sm:grid-cols-2 gap-6">
              {[
                { price: "RM160", label: "YM Member", color: palette.accent1 },
                { price: "RM130", label: "New Friends", color: palette.accent2 },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ scale: 1.03, rotate: 1 }}
                  className="rounded-2xl p-8 relative overflow-hidden"
                  style={{ background: palette.card, border: `2px solid ${item.color}33` }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ background: item.color }}
                  />
                  <div className="text-5xl font-jejuhallasan" style={{ color: item.color }}>
                    {item.price}
                  </div>
                  <div className="mt-3 text-lg" style={{ color: palette.textMuted }}>
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <motion.button
              whileHover={{ scale: 1.06, rotate: -1 }}
              whileTap={{ scale: 0.94 }}
              className="mt-12 px-14 py-5 rounded-full text-xl font-jejuhallasan text-black"
              style={{
                background: `linear-gradient(135deg, ${palette.accent1}, ${palette.accent3})`,
                boxShadow: `0 0 40px ${palette.accent1}44`,
              }}
            >
              Register Now
            </motion.button>
            <p className="mt-4 text-sm" style={{ color: palette.textMuted }}>
              *For non-Muslims only
            </p>
          </Reveal>
        </div>
      </section>

      <footer className="py-12 text-center text-sm" style={{ color: palette.textMuted }}>
        A Highschool Event by @YMFGAKL
      </footer>
    </div>
  );
}
