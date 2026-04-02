"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { VolumeHighIcon, VolumeMute01Icon } from "@hugeicons/core-free-icons";

// ---------------------------------------------------------------------------
// Singleton audio manager — survives React remounts and route changes.
// The HTMLAudioElement lives outside the component tree so navigating between
// the two root layouts ((landing) ↔ (everywhere-else)) won't restart the track.
// ---------------------------------------------------------------------------
interface AudioState {
  playing: boolean;
  interacted: boolean;
}

const TARGET_VOLUME = 0.3;
const FADE_MS = 1500;
const FADE_STEP_MS = 30;
// How many seconds before the end of the track to start fading out for a
// seamless loop crossfade. The track restarts at 0 once the fade-out finishes.
const LOOP_FADE_SEC = 3;

const listeners = new Set<() => void>();
let state: AudioState = { playing: false, interacted: false };
let audio: HTMLAudioElement | null = null;
let fadeTimer: ReturnType<typeof setInterval> | null = null;
let loopRaf: number | null = null;
let isCrossfading = false;

function getAudio() {
  if (typeof window === "undefined") return null;
  if (!audio) {
    audio = new Audio("/assets/bg.mp3");
    audio.loop = true;
    audio.volume = 0;
    audio.preload = "none"; // Don't preload 6.6MB audio until user interaction
  }
  return audio;
}

function emit() {
  listeners.forEach((l) => l());
}

function getSnapshot(): AudioState {
  return state;
}

const SERVER_SNAPSHOT: AudioState = { playing: false, interacted: false };

function getServerSnapshot(): AudioState {
  return SERVER_SNAPSHOT;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// --- Volume fade helpers ---------------------------------------------------
function clearFade() {
  if (fadeTimer) {
    clearInterval(fadeTimer);
    fadeTimer = null;
  }
}

function fadeTo(el: HTMLAudioElement, target: number, durationMs: number): Promise<void> {
  clearFade();
  return new Promise((resolve) => {
    const start = el.volume;
    const diff = target - start;
    if (Math.abs(diff) < 0.01) {
      el.volume = target;
      resolve();
      return;
    }
    const steps = Math.max(1, Math.round(durationMs / FADE_STEP_MS));
    let step = 0;
    fadeTimer = setInterval(() => {
      step++;
      el.volume = Math.min(1, Math.max(0, start + diff * (step / steps)));
      if (step >= steps) {
        clearFade();
        el.volume = target;
        resolve();
      }
    }, FADE_STEP_MS);
  });
}

// --- Seamless loop crossfade -----------------------------------------------
// Uses native loop=true, but fades volume down near the end and back up after
// the browser resets currentTime to 0.
function startLoopWatcher() {
  stopLoopWatcher();
  const tick = () => {
    const el = audio;
    if (!el || el.paused || !el.duration || !state.playing) {
      loopRaf = requestAnimationFrame(tick);
      return;
    }
    const remaining = el.duration - el.currentTime;
    if (remaining <= LOOP_FADE_SEC && !isCrossfading) {
      // Start crossfade-out near the end
      isCrossfading = true;
      clearFade();
      fadeTo(el, 0, remaining * 1000);
    }
    // Detect the loop reset (currentTime jumps back to near 0)
    if (isCrossfading && el.currentTime < LOOP_FADE_SEC) {
      isCrossfading = false;
      clearFade();
      fadeTo(el, TARGET_VOLUME, FADE_MS);
    }
    loopRaf = requestAnimationFrame(tick);
  };
  loopRaf = requestAnimationFrame(tick);
}

function stopLoopWatcher() {
  if (loopRaf !== null) {
    cancelAnimationFrame(loopRaf);
    loopRaf = null;
  }
  isCrossfading = false;
}

// --- Playback controls -----------------------------------------------------
function startPlayback() {
  if (state.interacted) return;
  const el = getAudio();
  if (!el) return;
  state = { ...state, interacted: true };
  emit();
  el.volume = 0;
  el.play()
    .then(() => {
      state = { ...state, playing: true };
      emit();
      fadeTo(el, TARGET_VOLUME, FADE_MS);
      startLoopWatcher();
    })
    .catch(() => {});
}

function toggle() {
  const el = getAudio();
  if (!el) return;
  if (state.playing) {
    state = { ...state, playing: false };
    emit();
    stopLoopWatcher();
    fadeTo(el, 0, FADE_MS).then(() => el.pause());
  } else {
    el.volume = 0;
    el.play()
      .then(() => {
        state = { ...state, playing: true };
        emit();
        fadeTo(el, TARGET_VOLUME, FADE_MS);
        startLoopWatcher();
      })
      .catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// Component — thin UI wrapper over the singleton
// ---------------------------------------------------------------------------
export function BackgroundMusic() {
  const { playing, interacted } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const handleInteraction = useCallback(() => startPlayback(), []);

  useEffect(() => {
    if (interacted) return;
    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [interacted, handleInteraction]);

  return (
    <AnimatePresence>
      {interacted && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          onClick={toggle}
          className="fixed top-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[#F7EAD9] hover:bg-white/20 transition-colors"
          aria-label={playing ? "Mute music" : "Unmute music"}
        >
          {playing ? <HugeiconsIcon icon={VolumeHighIcon} size={18} /> : <HugeiconsIcon icon={VolumeMute01Icon} size={18} />}
        </motion.button>
      )}
    </AnimatePresence>
  );
}

