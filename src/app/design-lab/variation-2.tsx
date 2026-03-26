"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

/**
 * VARIATION 2: "Mountain Trail"
 *
 * Vertical journey from base camp to summit.
 * Sections connected by a winding trail/path visual.
 * Earthy tones — moss green, slate blue, warm stone.
 * Snap-scroll sections with dramatic entrances.
 */

const palette = {
  bg: "#1a1f2e",        // deep slate
  bgAlt: "#141825",
  accent1: "#5b8c5a",   // moss green
  accent2: "#7ba7c2",   // slate blue
  accent3: "#d4a853",   // warm stone/gold
  text: "#eae6df",
  textMuted: "#8b9298",
  card: "#1e2538",
  cardBorder: "#2a3349",
};

function SlideInLeft({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -80 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ type: "spring", stiffness: 60, damping: 18 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SlideInRight({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ type: "spring", stiffness: 60, damping: 18 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function PopIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 100, damping: 15, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Variation2() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  return (
    <div style={{ background: palette.bg, color: palette.text }} className="min-h-screen font-sans">
      {/* === HERO: Base Camp === */}
      <div ref={heroRef} className="relative h-screen overflow-hidden flex items-center justify-center">
        <motion.div style={{ y: bgY }} className="absolute inset-0">
          <Image
            src="/landing.png"
            alt="Mountain adventure"
            fill
            className="object-cover"
            quality={90}
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${palette.bg}44 0%, ${palette.bg} 95%)`,
            }}
          />
        </motion.div>

        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <Image src="/assets/masthead-white.svg" alt="YTHWKND Logo" width={440} height={440} className="mx-auto" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm tracking-widest uppercase"
            style={{ background: `${palette.accent1}22`, border: `1px solid ${palette.accent1}44`, color: palette.accent2 }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: palette.accent1 }} />
            Base Camp &mdash; Start Your Journey
          </motion.div>
        </div>
      </div>

      {/* === TRAIL CONNECTOR === */}
      <div className="flex justify-center -mt-8 relative z-20">
        <motion.div
          initial={{ height: 0 }}
          whileInView={{ height: 80 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-px"
          style={{ background: `linear-gradient(to bottom, ${palette.accent3}, transparent)` }}
        />
      </div>

      {/* === SECTION: When & Where (alternating layout) === */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Date — slides from left */}
          <SlideInLeft className="flex items-center gap-8 mb-16">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: `${palette.accent3}22`, border: `1px solid ${palette.accent3}44` }}
            >
              &#9728;
            </div>
            <div>
              <div className="text-sm uppercase tracking-widest mb-1" style={{ color: palette.accent3 }}>
                Waypoint 1 &mdash; The Date
              </div>
              <div className="text-4xl md:text-5xl font-jejuhallasan">30 May &ndash; 1 June</div>
            </div>
          </SlideInLeft>

          {/* Location — slides from right */}
          <SlideInRight className="flex items-center gap-8 flex-row-reverse text-right">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: `${palette.accent2}22`, border: `1px solid ${palette.accent2}44` }}
            >
              &#9968;
            </div>
            <div>
              <div className="text-sm uppercase tracking-widest mb-1" style={{ color: palette.accent2 }}>
                Waypoint 2 &mdash; The Location
              </div>
              <div className="text-4xl md:text-5xl font-jejuhallasan">Peacehaven</div>
              <div className="text-xl mt-1" style={{ color: palette.textMuted }}>Genting Highlands</div>
            </div>
          </SlideInRight>
        </div>
      </section>

      {/* === TRAIL CONNECTOR === */}
      <div className="flex justify-center relative z-20">
        <motion.div
          initial={{ height: 0 }}
          whileInView={{ height: 80 }}
          viewport={{ once: true }}
          className="w-px"
          style={{ background: `linear-gradient(to bottom, ${palette.accent2}, transparent)` }}
        />
      </div>

      {/* === SECTION: Heroes === */}
      <section className="py-20 px-6" style={{ background: palette.bgAlt }}>
        <div className="max-w-5xl mx-auto text-center">
          <PopIn>
            <div className="text-sm uppercase tracking-widest mb-4" style={{ color: palette.accent1 }}>
              Waypoint 3 &mdash; Your Party
            </div>
            <h2 className="text-5xl md:text-6xl font-jejuhallasan mb-12" style={{ color: palette.accent3 }}>
              Assemble Your Heroes
            </h2>
          </PopIn>

          <PopIn delay={0.1}>
            <Image
              src="/assets/chars.png"
              alt="Hero lineup"
              width={650}
              height={380}
              className="mx-auto object-contain"
            />
          </PopIn>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { name: "Warrior", perk: "Frontline Breaker", color: palette.accent3 },
              { name: "Archer", perk: "Precision Striker", color: palette.accent2 },
              { name: "Scout", perk: "Rapid Pathfinder", color: palette.accent1 },
              { name: "Guardian", perk: "Iron Wall", color: palette.accent3 },
              { name: "Scholar", perk: "Tactical Mind", color: palette.accent2 },
            ].map((hero, i) => (
              <PopIn key={hero.name} delay={0.15 + i * 0.08}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.03 }}
                  className="rounded-xl p-4"
                  style={{ background: palette.card, border: `1px solid ${palette.cardBorder}` }}
                >
                  <div className="font-jejuhallasan text-lg" style={{ color: hero.color }}>{hero.name}</div>
                  <div className="text-xs mt-1" style={{ color: palette.textMuted }}>{hero.perk}</div>
                </motion.div>
              </PopIn>
            ))}
          </div>
        </div>
      </section>

      {/* === SECTION: Pricing & CTA === */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <PopIn>
            <div className="text-sm uppercase tracking-widest mb-4" style={{ color: palette.accent1 }}>
              The Summit
            </div>
            <h2 className="text-5xl md:text-6xl font-jejuhallasan" style={{ color: palette.accent3 }}>
              Ready to Climb?
            </h2>
          </PopIn>

          <PopIn delay={0.1}>
            <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
              {[
                { price: "RM160", label: "YM Member", badge: "Returning Hero" },
                { price: "RM130", label: "New Friends", badge: "First Adventure" },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl p-8 flex-1 max-w-xs relative overflow-hidden"
                  style={{ background: palette.card, border: `1px solid ${palette.cardBorder}` }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 py-1 text-xs text-center uppercase tracking-widest"
                    style={{ background: `${palette.accent1}33`, color: palette.accent1 }}
                  >
                    {item.badge}
                  </div>
                  <div className="text-5xl font-jejuhallasan mt-4" style={{ color: palette.accent2 }}>
                    {item.price}
                  </div>
                  <div className="mt-2 text-lg" style={{ color: palette.textMuted }}>
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </PopIn>

          <PopIn delay={0.2}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="mt-12 px-14 py-5 rounded-full text-xl font-jejuhallasan"
              style={{
                background: palette.accent1,
                color: "#fff",
                boxShadow: `0 0 40px ${palette.accent1}44`,
              }}
            >
              Begin Your Journey
            </motion.button>
            <p className="mt-4 text-sm" style={{ color: palette.textMuted }}>
              *For non-Muslims only
            </p>
          </PopIn>
        </div>
      </section>

      <footer className="py-12 text-center text-sm" style={{ color: palette.textMuted }}>
        A Highschool Event by @YMFGAKL
      </footer>
    </div>
  );
}
