"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

/**
 * VARIATION 4: "Expedition Log"
 *
 * Structured, editorial layout inspired by field journals.
 * Clear grid system, numbered sections, badge-style labels.
 * Cool blues and warm tans — like a weathered expedition map.
 * Smooth reveals with staggered children.
 */

const palette = {
  bg: "#0f1923",
  bgAlt: "#0a1219",
  accent1: "#3d8b6e",   // expedition green
  accent2: "#e8c87a",   // parchment gold
  accent3: "#5a9ec2",   // compass blue
  text: "#e5e0d5",
  textMuted: "#7d8a91",
  card: "#162432",
  line: "#2a3a48",
};

const stagger = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  },
  item: {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 80, damping: 16 } },
  },
};

function SectionNumber({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
        style={{ background: `${palette.accent1}22`, color: palette.accent1, border: `1px solid ${palette.accent1}33` }}
      >
        {num}
      </div>
      <div className="text-xs uppercase tracking-[0.3em]" style={{ color: palette.textMuted }}>
        {label}
      </div>
      <div className="flex-1 h-px" style={{ background: palette.line }} />
    </div>
  );
}

export function Variation4() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <div style={{ background: palette.bg, color: palette.text }} className="min-h-screen font-sans">
      {/* === HERO === */}
      <div ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div style={{ scale: imgScale }} className="absolute inset-0">
          <Image
            src="/landing.png"
            alt="Expedition background"
            fill
            className="object-cover"
            quality={90}
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${palette.bg}88 0%, ${palette.bg} 90%)`,
            }}
          />
        </motion.div>

        <div className="relative z-10 flex flex-col items-center justify-end h-full pb-20 px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <Image src="/assets/masthead-white.svg" alt="YTHWKND Logo" width={420} height={420} className="mx-auto" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 flex flex-wrap justify-center gap-3"
          >
            {["Adventure", "Mystery", "Heroes", "Teamwork"].map((tag) => (
              <span
                key={tag}
                className="px-4 py-1.5 rounded-md text-xs uppercase tracking-widest"
                style={{ background: palette.card, color: palette.accent3, border: `1px solid ${palette.line}` }}
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* === SECTION 01: Mission Briefing === */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger.container}
          >
            <motion.div variants={stagger.item}>
              <SectionNumber num="01" label="Mission Briefing" />
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                variants={stagger.item}
                className="rounded-xl p-6"
                style={{ background: palette.card, border: `1px solid ${palette.line}` }}
              >
                <div className="text-xs uppercase tracking-widest mb-3" style={{ color: palette.accent3 }}>
                  Date
                </div>
                <div className="text-3xl font-jejuhallasan" style={{ color: palette.accent2 }}>
                  30 May &ndash; 1 June
                </div>
                <div className="text-sm mt-2" style={{ color: palette.textMuted }}>
                  3 days, 2 nights of adventure
                </div>
              </motion.div>

              <motion.div
                variants={stagger.item}
                className="rounded-xl p-6"
                style={{ background: palette.card, border: `1px solid ${palette.line}` }}
              >
                <div className="text-xs uppercase tracking-widest mb-3" style={{ color: palette.accent3 }}>
                  Location
                </div>
                <div className="text-3xl font-jejuhallasan" style={{ color: palette.accent2 }}>
                  Peacehaven
                </div>
                <div className="text-sm mt-2" style={{ color: palette.textMuted }}>
                  Genting Highlands, Malaysia
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* === SECTION 02: Hero Classes === */}
      <section className="py-20 px-6" style={{ background: palette.bgAlt }}>
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger.container}
          >
            <motion.div variants={stagger.item}>
              <SectionNumber num="02" label="Hero Classes" />
            </motion.div>

            <motion.div variants={stagger.item} className="mb-10">
              <Image
                src="/assets/chars.png"
                alt="Hero lineup"
                width={600}
                height={350}
                className="mx-auto object-contain"
              />
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { name: "Warrior", perk: "Frontline Breaker", color: palette.accent2 },
                { name: "Archer", perk: "Precision Striker", color: palette.accent3 },
                { name: "Scout", perk: "Rapid Pathfinder", color: palette.accent1 },
                { name: "Guardian", perk: "Iron Wall", color: palette.accent2 },
                { name: "Scholar", perk: "Tactical Mind", color: palette.accent3 },
              ].map((hero) => (
                <motion.div
                  key={hero.name}
                  variants={stagger.item}
                  whileHover={{ y: -4 }}
                  className="rounded-lg p-4 text-center"
                  style={{ background: palette.card, border: `1px solid ${palette.line}` }}
                >
                  <div className="font-jejuhallasan" style={{ color: hero.color }}>{hero.name}</div>
                  <div className="text-xs mt-1" style={{ color: palette.textMuted }}>{hero.perk}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* === SECTION 03: Registration === */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger.container}
          >
            <motion.div variants={stagger.item}>
              <SectionNumber num="03" label="Registration" />
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { price: "RM160", label: "YM Member", desc: "For existing YM members" },
                { price: "RM130", label: "New Friends", desc: "First-time adventurers" },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  variants={stagger.item}
                  whileHover={{ y: -4 }}
                  className="rounded-xl p-8 text-center"
                  style={{ background: palette.card, border: `1px solid ${palette.line}` }}
                >
                  <div className="text-4xl font-jejuhallasan" style={{ color: palette.accent2 }}>
                    {item.price}
                  </div>
                  <div className="font-jejuhallasan text-lg mt-2" style={{ color: palette.accent3 }}>
                    {item.label}
                  </div>
                  <div className="text-sm mt-2" style={{ color: palette.textMuted }}>
                    {item.desc}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div variants={stagger.item} className="mt-12 text-center">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-14 py-5 rounded-xl text-xl font-jejuhallasan"
                style={{
                  background: palette.accent1,
                  color: "#fff",
                }}
              >
                Register Now
              </motion.button>
              <p className="mt-4 text-sm" style={{ color: palette.textMuted }}>
                *For non-Muslims only
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 text-center text-sm" style={{ color: palette.textMuted, borderTop: `1px solid ${palette.line}` }}>
        A Highschool Event by @YMFGAKL
      </footer>
    </div>
  );
}
