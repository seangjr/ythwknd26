"use client";
import { motion } from "framer-motion";
import Image from "next/image";

/**
 * VARIATION 3: "Enchanted Meadow"
 *
 * Soft, warm, Ghibli-inspired aesthetic.
 * Rounded elements, gentle gradients, floating particles.
 * Light-on-dark with warm greens and creamy highlights.
 * Playful bounce animations, cozy and inviting.
 */

const palette = {
  bg: "#0d1f14",        // deep forest
  bgSection: "#112a1a",
  accent1: "#7ec89b",   // soft mint green
  accent2: "#f0c86e",   // warm cream gold
  accent3: "#89b4d4",   // gentle sky blue
  text: "#f2ede4",      // cream white
  textMuted: "#8faa96", // sage
  card: "#163324",
  glow: "#7ec89b33",
};

const floatAnimation = {
  y: [-8, 8, -8],
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
};

function BounceIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ type: "spring", stiffness: 120, damping: 14, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Variation3() {
  return (
    <div style={{ background: palette.bg, color: palette.text }} className="min-h-screen font-sans overflow-hidden">
      {/* === HERO === */}
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Background with soft vignette */}
        <div className="absolute inset-0">
          <Image
            src="/assets/background.png"
            alt="Enchanted landscape"
            fill
            className="object-cover opacity-60"
            quality={90}
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, transparent 30%, ${palette.bg} 80%)`,
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-1/2"
            style={{
              background: `linear-gradient(to top, ${palette.bg}, transparent)`,
            }}
          />
        </div>

        {/* Floating decorative dots */}
        {[
          { top: "15%", left: "10%", size: 6, delay: 0 },
          { top: "25%", right: "15%", size: 8, delay: 1 },
          { top: "60%", left: "20%", size: 5, delay: 2 },
          { top: "45%", right: "25%", size: 7, delay: 0.5 },
          { top: "75%", left: "70%", size: 4, delay: 1.5 },
        ].map((dot, i) => (
          <motion.div
            key={i}
            animate={floatAnimation}
            style={{
              position: "absolute",
              top: dot.top,
              left: dot.left,
              right: dot.right,
              width: dot.size,
              height: dot.size,
              borderRadius: "50%",
              background: palette.accent1,
              opacity: 0.4,
              animationDelay: `${dot.delay}s`,
            }}
          />
        ))}

        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, type: "spring", stiffness: 50 }}
          >
            <Image src="/assets/masthead-white.svg" alt="YTHWKND Logo" width={460} height={460} className="mx-auto drop-shadow-2xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6"
          >
            <span
              className="inline-block px-6 py-2 rounded-full text-sm tracking-widest uppercase"
              style={{ background: palette.glow, color: palette.accent1, border: `1px solid ${palette.accent1}44` }}
            >
              A Highschool Adventure
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-8 text-lg max-w-md mx-auto leading-relaxed"
            style={{ color: palette.textMuted }}
          >
            Step into the Multiverse of Mystery. Choose your hero, find your team, and embark on an unforgettable weekend.
          </motion.p>
        </div>
      </div>

      {/* === SECTION: Details in rounded cards === */}
      <section className="py-20 px-6 -mt-20 relative z-10">
        <div className="max-w-lg mx-auto space-y-6">
          <BounceIn>
            <div
              className="rounded-3xl p-8 text-center"
              style={{ background: palette.card, border: `1px solid ${palette.accent1}22`, boxShadow: `0 8px 32px ${palette.bg}88` }}
            >
              <div className="text-3xl mb-3">&#127793;</div>
              <div className="text-4xl font-jejuhallasan" style={{ color: palette.accent2 }}>
                30 May &ndash; 1 June
              </div>
              <div className="mt-2 text-lg" style={{ color: palette.textMuted }}>Three days of adventure</div>
            </div>
          </BounceIn>

          <BounceIn delay={0.1}>
            <div
              className="rounded-3xl p-8 text-center"
              style={{ background: palette.card, border: `1px solid ${palette.accent1}22`, boxShadow: `0 8px 32px ${palette.bg}88` }}
            >
              <div className="text-3xl mb-3">&#9968;</div>
              <div className="text-4xl font-jejuhallasan" style={{ color: palette.accent2 }}>
                Peacehaven
              </div>
              <div className="mt-2 text-lg" style={{ color: palette.textMuted }}>Genting Highlands, Malaysia</div>
            </div>
          </BounceIn>
        </div>
      </section>

      {/* === SECTION: Characters === */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <BounceIn>
            <h2 className="text-5xl md:text-6xl font-jejuhallasan" style={{ color: palette.accent2 }}>
              Meet Your Heroes
            </h2>
            <p className="mt-4 text-lg" style={{ color: palette.textMuted }}>
              Five classes, each with a unique role in your team
            </p>
          </BounceIn>

          <BounceIn delay={0.15}>
            <motion.div animate={floatAnimation} className="mt-12">
              <Image
                src="/assets/chars.png"
                alt="Hero characters"
                width={600}
                height={350}
                className="mx-auto object-contain drop-shadow-xl"
              />
            </motion.div>
          </BounceIn>

          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {[
              { name: "Warrior", emoji: "&#9876;", color: palette.accent2 },
              { name: "Archer", emoji: "&#127993;", color: palette.accent3 },
              { name: "Scout", emoji: "&#128065;", color: palette.accent1 },
              { name: "Guardian", emoji: "&#128737;", color: palette.accent2 },
              { name: "Scholar", emoji: "&#128218;", color: palette.accent3 },
            ].map((hero, i) => (
              <BounceIn key={hero.name} delay={0.2 + i * 0.06}>
                <motion.div
                  whileHover={{ scale: 1.08, rotate: [-1, 1, 0] }}
                  className="rounded-2xl px-6 py-4 cursor-default"
                  style={{ background: palette.card, border: `1px solid ${palette.accent1}22` }}
                >
                  <span dangerouslySetInnerHTML={{ __html: hero.emoji }} className="text-xl mr-2" />
                  <span className="font-jejuhallasan" style={{ color: hero.color }}>{hero.name}</span>
                </motion.div>
              </BounceIn>
            ))}
          </div>
        </div>
      </section>

      {/* === SECTION: Pricing === */}
      <section className="py-20 px-6" style={{ background: palette.bgSection }}>
        <div className="max-w-2xl mx-auto text-center">
          <BounceIn>
            <h2 className="text-5xl md:text-6xl font-jejuhallasan" style={{ color: palette.accent2 }}>
              Your Ticket In
            </h2>
          </BounceIn>

          <BounceIn delay={0.1}>
            <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
              {[
                { price: "RM160", label: "YM Member" },
                { price: "RM130", label: "New Friends" },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ y: -6 }}
                  className="rounded-3xl p-8 flex-1 max-w-xs"
                  style={{ background: palette.card, border: `1px solid ${palette.accent1}22` }}
                >
                  <div className="text-5xl font-jejuhallasan" style={{ color: palette.accent1 }}>
                    {item.price}
                  </div>
                  <div className="mt-3 text-lg" style={{ color: palette.textMuted }}>
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </BounceIn>

          <BounceIn delay={0.2}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-12 px-12 py-5 rounded-full text-xl font-jejuhallasan"
              style={{
                background: palette.accent2,
                color: palette.bg,
                boxShadow: `0 0 30px ${palette.accent2}33`,
              }}
            >
              Join the Adventure
            </motion.button>
            <p className="mt-4 text-sm" style={{ color: palette.textMuted }}>
              *For non-Muslims only
            </p>
          </BounceIn>
        </div>
      </section>

      <footer className="py-12 text-center text-sm" style={{ color: palette.textMuted }}>
        A Highschool Event by @YMFGAKL
      </footer>
    </div>
  );
}
