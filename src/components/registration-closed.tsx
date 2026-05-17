"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { REGISTRATION_CLOSED, WAITING_LIST_URL } from "@/lib/constants";

interface RegistrationClosedProps {
  children: React.ReactNode;
}

export function RegistrationClosed({ children }: RegistrationClosedProps) {
  if (!REGISTRATION_CLOSED) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* Underlying registration UI — visible but disabled */}
      <div
        aria-hidden
        inert
        className="pointer-events-none select-none blur-md opacity-40 [&_*]:!cursor-default"
      >
        {children}
      </div>

      {/* Blocking overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="parchment-bg text-parchment-ink border-2 border-parchment-dark rounded-2xl shadow-2xl max-w-md w-full p-8 md:p-10 text-center"
        >
          <p className="uppercase text-xs md:text-sm tracking-widest mb-4 opacity-70">
            Notice
          </p>
          <h1 className="font-jejuhallasan text-4xl md:text-5xl leading-none mb-6">
            Registration<br />is closed
          </h1>
          <p className="text-sm md:text-base mb-8 leading-relaxed">
            All slots have been claimed. Join the waiting list and we&apos;ll
            reach out if a spot opens up.
          </p>
          <Button
            asChild
            variant="parchment"
            size="xl"
            className="w-full border-parchment-ink"
          >
            <a
              href={WAITING_LIST_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join the waiting list
            </a>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
