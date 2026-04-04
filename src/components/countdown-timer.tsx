"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CountdownTimerProps {
  targetDate: Date;
  className?: string;
}

function FlipDigit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute -inset-1 rounded-lg bg-[#F7EAD9]/5 blur-md" />

        {/* Card */}
        <div className="relative w-[72px] h-[88px] md:w-[90px] md:h-[108px] rounded-lg overflow-hidden">
          {/* Background with parchment-like texture */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(30,25,20,0.95) 0%, rgba(20,17,14,0.98) 48%, rgba(15,12,10,1) 50%, rgba(20,17,14,0.98) 52%, rgba(30,25,20,0.95) 100%)",
            }}
          />

          {/* Subtle border glow */}
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              boxShadow:
                "inset 0 0 12px rgba(247,234,217,0.06), 0 0 1px rgba(247,234,217,0.15)",
            }}
          />

          {/* Center divider line */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-px h-px bg-[#F7EAD9]/10" />

          {/* Number */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={display}
              initial={{ opacity: 0, y: -8, rotateX: -40 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, y: 8, rotateX: 40 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ perspective: "200px" }}
            >
              <span className="text-4xl md:text-5xl font-jejuhallasan text-[#F7EAD9] tracking-wider tabular-nums">
                {display}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Corner accents */}
          <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#F7EAD9]/15 rounded-tl-sm" />
          <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[#F7EAD9]/15 rounded-tr-sm" />
          <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-[#F7EAD9]/15 rounded-bl-sm" />
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[#F7EAD9]/15 rounded-br-sm" />
        </div>
      </div>

      {/* Label */}
      <span className="text-[10px] md:text-xs font-jejuhallasan uppercase tracking-[0.2em] text-[#F7EAD9]/50">
        {label}
      </span>
    </div>
  );
}

function Separator() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 pt-2 md:pt-3">
      <motion.div
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-1 h-1 rounded-full bg-[#F7EAD9]"
      />
      <motion.div
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3,
        }}
        className="w-1 h-1 rounded-full bg-[#F7EAD9]"
      />
    </div>
  );
}

export function CountdownTimer({
  targetDate,
  className = "",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      let diff = targetDate.getTime() - now.getTime();
      if (diff < 0) diff = 0;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`flex items-start justify-center gap-2 md:gap-4 ${className}`}
    >
      <FlipDigit value={timeLeft.days} label="Days" />
      <Separator />
      <FlipDigit value={timeLeft.hours} label="Hours" />
      <Separator />
      <FlipDigit value={timeLeft.minutes} label="Min" />
      <Separator />
      <FlipDigit value={timeLeft.seconds} label="Sec" />
    </motion.div>
  );
}
