"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

/**
 * VARIATION 1: "Storybook Journey"
 *
 * Full-bleed hero with layered parallax depth.
 * Each section slides in like turning a storybook page.
 * Warm greens and sky blues with earthy stone accents.
 * Bouncy spring animations on section reveals.
 */

const palette = {
  bg: "#0a1a0f",
  bgSection: "#0f2318",
  accent1: "#4a9e6e", // forest green
  accent2: "#6bb8d4", // sky blue
  accent3: "#c4a35a", // golden stone
  text: "#e8e4dc",    // warm off-white
  textMuted: "#9baa9e", // muted sage
  card: "#152e1e",
};

function FadeInSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ type: "spring", stiffness: 80, damping: 20, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Variation1() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const titleScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.85]);

  return (
    <div style={{ background: palette.bg, color: palette.text }} className="min-h-screen font-sans">
      {/* === HERO === */}
      <div ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <Image
            src="/assets/background.png"
            alt="Adventure landscape"
            fill
            className="object-cover object-center"
            quality={90}
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, transparent 40%, ${palette.bg} 100%)`,
            }}
          />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity, scale: titleScale }}
          className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 60 }}
          >
            <Image src="/assets/masthead-white.svg" alt="YTHWKND Logo" width={500} height={500} className="mx-auto" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-lg tracking-[0.3em] uppercase"
            style={{ color: palette.accent2 }}
          >
            Your adventure begins here
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12"
          >
            <div className="animate-bounce text-2xl" style={{ color: palette.accent3 }}>
              &#8595;
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* === SECTION: Event Details === */}
      <section className="relative py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeInSection>
            <p className="text-sm tracking-[0.4em] uppercase mb-4" style={{ color: palette.accent1 }}>
              Chapter One
            </p>
            <h2 className="text-5xl md:text-6xl font-jejuhallasan" style={{ color: palette.accent3 }}>
              The Quest Awaits
            </h2>
          </FadeInSection>

          <FadeInSection delay={0.1}>
            <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="rounded-2xl p-8 text-center" style={{ background: palette.card, border: `1px solid ${palette.accent1}33` }}>
                <div className="text-sm uppercase tracking-widest mb-2" style={{ color: palette.accent2 }}>When</div>
                <div className="text-3xl font-jejuhallasan" style={{ color: palette.text }}>
                  30 May &ndash; 1 June
                </div>
              </div>
              <div className="rounded-2xl p-8 text-center" style={{ background: palette.card, border: `1px solid ${palette.accent1}33` }}>
                <div className="text-sm uppercase tracking-widest mb-2" style={{ color: palette.accent2 }}>Where</div>
                <div className="text-3xl font-jejuhallasan" style={{ color: palette.text }}>
                  Peacehaven
                </div>
                <div className="text-lg mt-1" style={{ color: palette.textMuted }}>
                  Genting Highlands
                </div>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* === SECTION: Characters === */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeInSection>
            <p className="text-sm tracking-[0.4em] uppercase mb-4 text-center" style={{ color: palette.accent1 }}>
              Chapter Two
            </p>
            <h2 className="text-5xl md:text-6xl font-jejuhallasan text-center" style={{ color: palette.accent3 }}>
              Choose Your Hero
            </h2>
          </FadeInSection>

          <FadeInSection delay={0.15}>
            <div className="mt-16 flex justify-center">
              <Image
                src="/assets/chars.png"
                alt="Hero characters"
                width={700}
                height={400}
                className="object-contain"
              />
            </div>
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <div className="mt-12 grid grid-cols-5 gap-3 text-center">
              {["Warrior", "Archer", "Scout", "Guardian", "Scholar"].map((name, i) => (
                <motion.div
                  key={name}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="rounded-xl py-4 px-2 cursor-default"
                  style={{ background: palette.card, border: `1px solid ${palette.accent1}22` }}
                >
                  <div className="text-sm font-jejuhallasan" style={{ color: palette.accent2 }}>{name}</div>
                </motion.div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* === SECTION: Pricing === */}
      <section className="relative py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <FadeInSection>
            <p className="text-sm tracking-[0.4em] uppercase mb-4" style={{ color: palette.accent1 }}>
              Chapter Three
            </p>
            <h2 className="text-5xl md:text-6xl font-jejuhallasan" style={{ color: palette.accent3 }}>
              Join the Party
            </h2>
          </FadeInSection>

          <FadeInSection delay={0.1}>
            <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
              {[
                { price: "RM160", label: "YM Member" },
                { price: "RM130", label: "New Friends" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl p-8 flex-1 max-w-xs"
                  style={{ background: palette.card, border: `1px solid ${palette.accent1}33` }}
                >
                  <div className="text-5xl font-jejuhallasan" style={{ color: palette.accent2 }}>
                    {item.price}
                  </div>
                  <div className="mt-2 text-lg" style={{ color: palette.textMuted }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </FadeInSection>

          <FadeInSection delay={0.2}>
            <div className="mt-12">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-12 py-4 rounded-full text-xl font-jejuhallasan text-white"
                style={{ background: `linear-gradient(135deg, ${palette.accent1}, ${palette.accent2})` }}
              >
                Register Now
              </motion.button>
              <p className="mt-4 text-sm" style={{ color: palette.textMuted }}>
                *For non-Muslims only
              </p>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="py-12 text-center text-sm" style={{ color: palette.textMuted }}>
        A Highschool Event by @YMFGAKL
      </footer>
    </div>
  );
}
