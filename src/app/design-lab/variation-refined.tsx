"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * REFINED VARIATION: "The Real One"
 *
 * Keeps existing hero. Redesigns only the content below.
 * Avoids AI-generated patterns: no symmetric grids, no emoji headers,
 * no "Chapter X" labels, no generic card layouts.
 *
 * Instead: mixed alignment, typographic hierarchy, organic spacing,
 * subtle motion, and content that breathes.
 */

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-5xl sm:text-7xl font-jejuhallasan tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-[10px] sm:text-xs uppercase tracking-[0.25em] mt-2 text-[#6b7f6e]">
        {label}
      </div>
    </div>
  );
}

function useCountdown(target: Date) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const tick = () => {
      let diff = Math.max(0, target.getTime() - Date.now());
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return time;
}

export function VariationRefined() {
  const targetDate = new Date(2026, 2, 30, 12, 30, 0);
  const countdown = useCountdown(targetDate);
  const [isOpen, setIsOpen] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOpen(new Date() >= targetDate);
  }, [targetDate]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const charsY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <>
      {/* ===== EXISTING HERO (kept as-is from current page) ===== */}
      <section className="w-full relative h-[620px] sm:h-[820px] flex items-end justify-center">
        <div className="absolute inset-0">
          <Image
            src="/landing.png"
            alt="YTHWKND background"
            fill
            className="object-cover object-top opacity-90"
            quality={100}
            priority
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black to-transparent z-[2]" />
        <div className="absolute w-full flex flex-col items-center pb-8 px-8 z-10">
          <Image
            src="/assets/masthead.svg"
            className="sm:-mb-36 -mb-10"
            alt="YTHWKND and the Multiverse of Mystery Logo"
            width={700}
            height={700}
          />
        </div>
      </section>

      {/* ===== REDESIGNED CONTENT BELOW ===== */}
      <div className="bg-black text-white">

        {/* — Date & Location — */}
        <section className="max-w-2xl mx-auto px-6 pt-24 sm:pt-44">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-baseline gap-4 flex-wrap">
              <h2 className="text-4xl sm:text-6xl font-jejuhallasan text-white leading-none">
                30 May&mdash;1 June
              </h2>
              <span className="text-sm text-[#5a7a5e] tracking-wide">2026</span>
            </div>

            <div className="mt-4 sm:mt-5">
              <p className="text-xl sm:text-2xl font-jejuhallasan text-[#8fa893]">
                Peacehaven, Genting Highlands
              </p>
            </div>

            <div className="mt-6 h-px w-16 bg-[#2a3d2e]" />
          </motion.div>
        </section>

        {/* — Characters — */}
        <section ref={sectionRef} className="relative mt-20 sm:mt-28 overflow-hidden">
          <div className="max-w-5xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-sm text-[#5a7a5e] tracking-[0.2em] uppercase">
                Five classes. One team.
              </p>
            </motion.div>

            <motion.div style={{ y: charsY }} className="mt-8 sm:mt-10 -mx-6 sm:mx-0">
              <Image
                src="/assets/chars.png"
                alt="Hero characters — Warrior, Archer, Scout, Guardian, Scholar"
                width={800}
                height={460}
                className="w-full max-w-3xl mx-auto object-contain"
              />
            </motion.div>

            {/* Character names — not a grid, just flowing text */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 sm:mt-8 flex flex-wrap gap-x-6 gap-y-2 justify-center sm:justify-start"
            >
              {[
                { name: "Warrior", sub: "Frontline" },
                { name: "Archer", sub: "Precision" },
                { name: "Scout", sub: "Recon" },
                { name: "Guardian", sub: "Defense" },
                { name: "Scholar", sub: "Strategy" },
              ].map((hero, i) => (
                <span key={hero.name} className="inline-flex items-baseline gap-1.5">
                  <span className="font-jejuhallasan text-lg text-[#c4d4c6]">{hero.name}</span>
                  <span className="text-xs text-[#4a6a4e]">{hero.sub}</span>
                  {i < 4 && <span className="text-[#2a3d2e] ml-3">/</span>}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* — Pricing — stacked, not cards */}
        <section className="max-w-2xl mx-auto px-6 mt-24 sm:mt-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="space-y-6">
              <div className="flex items-end gap-4">
                <span className="text-5xl sm:text-7xl font-jejuhallasan leading-none text-white">RM160</span>
                <div className="pb-1">
                  <span className="text-sm text-[#8fa893] block leading-tight">YM</span>
                  <span className="text-sm text-[#8fa893] block leading-tight">Member</span>
                </div>
              </div>

              <div className="flex items-end gap-4">
                <span className="text-5xl sm:text-7xl font-jejuhallasan leading-none text-[#8fa893]">RM130</span>
                <div className="pb-1">
                  <span className="text-sm text-[#5a7a5e] block leading-tight">New</span>
                  <span className="text-sm text-[#5a7a5e] block leading-tight">Friends</span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-xs text-[#4a6a4e] uppercase tracking-wider">
              *For non-Muslims only
            </p>
          </motion.div>
        </section>

        {/* — Countdown or CTA — */}
        <section className="max-w-2xl mx-auto px-6 mt-20 sm:mt-28 pb-24 sm:pb-32">
          {!isOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-sm text-[#5a7a5e] tracking-[0.15em] uppercase mb-8">
                Registration opens March 30, 12:30 PM
              </p>
              <div className="flex gap-6 sm:gap-10">
                <CountdownUnit value={countdown.days} label="Days" />
                <CountdownUnit value={countdown.hours} label="Hours" />
                <CountdownUnit value={countdown.minutes} label="Min" />
                <CountdownUnit value={countdown.seconds} label="Sec" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <a
                href="/register"
                className="inline-block w-full text-center py-5 rounded-full text-2xl font-jejuhallasan bg-white text-black hover:bg-neutral-200 transition-colors"
              >
                Register now
              </a>
            </motion.div>
          )}
        </section>
      </div>
    </>
  );
}
