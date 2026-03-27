"use client";

import Image from "next/image";
import type React from "react";
import { useRef, useState, useCallback } from "react";
import Tilt from "react-parallax-tilt";
import { cn } from "@/lib/utils";
import "./holo-card.css";

// ============================================================================
// Types
// ============================================================================

export interface HoloCardDisplayData {
  name: string;
  /** Username shown below the name (e.g. @handle) */
  username?: string;
  subtitle?: string;
  description?: string;
  primaryId?: string | number;
  secondaryInfo?: string;
  backgroundImage?: string;
  /** Small icon shown top-right of card */
  iconImage?: string;
  badge?: string;
  overlayColor?: string;
  overlayOpacity?: number;
}

export interface HoloCardBranding {
  logo?: string;
  logoAlt?: string;
  icon?: string;
  iconAlt?: string;
}

export interface HoloCardProps {
  data: HoloCardDisplayData;
  height?: number;
  /** Card width in pixels, or "full" to fill container */
  width?: number | "full";
  showSparkles?: boolean;
  forceSide?: "front" | "back";
  branding?: HoloCardBranding;
  className?: string;
  children?: React.ReactNode;
  onFlip?: (isFlipped: boolean) => void;
  /** Action button label + callback shown at bottom of front face */
  actionLabel?: string;
  onAction?: () => void;
  /** Hide masthead, info panel, and button — show only the holo background */
  minimal?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const HoloCard = ({
  data,
  height,
  width = 320,
  showSparkles = true,
  forceSide,
  branding,
  className,
  children,
  onFlip,
  actionLabel,
  onAction,
  minimal = false,
}: HoloCardProps) => {
  const [hover, setHover] = useState(false);
  const [animated, setAnimated] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeBackgroundPosition, setActiveBackgroundPosition] = useState({
    tp: 0,
    lp: 0,
  });
  const ref = useRef<HTMLDivElement>(null);

  const {
    name,
    username,
    subtitle,
    description,
    primaryId,
    secondaryInfo,
    backgroundImage,
    iconImage,
    badge,
    overlayColor,
    overlayOpacity = 40,
  } = data;

  const handleCardClick = useCallback(() => {
    if (!forceSide) {
      const newFlippedState = !isFlipped;
      setIsFlipped(newFlippedState);
      onFlip?.(newFlippedState);
    }
  }, [forceSide, isFlipped, onFlip]);

  const rafId = useRef<number>(0);

  const handleOnMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!animated) return; // already in active state, throttle via rAF below
      setAnimated(false);
      setHover(true);

      const card = ref.current;
      const l = event.nativeEvent.offsetX;
      const t = event.nativeEvent.offsetY;

      const h = card ? card.clientHeight : 0;
      const w = card ? card.clientWidth : 0;

      const px = Math.abs(Math.floor((100 / w) * l) - 100);
      const py = Math.abs(Math.floor((100 / h) * t) - 100);

      const lp = 50 + (px - 50) / 1.5;
      const tp = 50 + (py - 50) / 1.5;

      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        setActiveBackgroundPosition({ lp, tp });
      });
    },
    [animated]
  );

  const handleOnTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      setAnimated(false);
      setHover(true);

      const card = ref.current;
      if (!card) return;

      const touch = event.touches[0];
      const rect = card.getBoundingClientRect();
      const l = touch.clientX - rect.left;
      const t = touch.clientY - rect.top;

      const h = card.clientHeight;
      const w = card.clientWidth;

      const px = Math.abs(Math.floor((100 / w) * l) - 100);
      const py = Math.abs(Math.floor((100 / h) * t) - 100);

      const lp = 50 + (px - 50) / 1.5;
      const tp = 50 + (py - 50) / 1.5;

      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        setActiveBackgroundPosition({ lp, tp });
      });
    },
    []
  );

  const handleOnMouseOut = useCallback(() => {
    setHover(false);
    setAnimated(true);
  }, []);

  const isFull = width === "full";
  const numWidth = isFull ? 200 : width; // fallback for isCompact calc
  const effectiveFlipped = forceSide ? forceSide === "back" : isFlipped;

  const containerStyle = forceSide
    ? { perspective: "none", transform: "none" }
    : { perspective: "1000px", cursor: "pointer" };

  const innerStyle = forceSide
    ? {
        transform: "none",
        position: "relative" as const,
        ...(isFull
          ? { width: "100%", height: "100%" }
          : { height: `${height}px`, width: `${width}px` }),
      }
    : {
        transformStyle: "preserve-3d" as const,
        transform: effectiveFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        ...(isFull
          ? { width: "100%", height: "100%" }
          : { height: `${height}px`, width: `${width}px` }),
      };

  const frontStyle = forceSide
    ? {
        display: forceSide === "front" ? "block" : "none",
        position: "absolute" as const,
        inset: 0,
      }
    : {
        position: "absolute" as const,
        inset: 0,
        backfaceVisibility: "hidden" as const,
        WebkitBackfaceVisibility: "hidden" as const,
      };

  const backStyle = forceSide
    ? {
        display: forceSide === "back" ? "block" : "none",
        position: "absolute" as const,
        inset: 0,
        transform: "none",
      }
    : {
        position: "absolute" as const,
        inset: 0,
        backfaceVisibility: "hidden" as const,
        WebkitBackfaceVisibility: "hidden" as const,
        transform: "rotateY(180deg)",
      };

  const holoCardClasses = cn(
    "holo-card",
    hover && "holo-card--active",
    animated && "holo-card--animated",
    showSparkles && "holo-card--sparkles",
    isFull && "!block !w-full !h-full"
  );

  const holoCardStyle = {
    "--holo-width": isFull ? "100%" : `${width}px`,
    "--holo-height": isFull ? "100%" : `${height ?? 446}px`,
    "--holo-accent": overlayColor || "#211799",
    ...(backgroundImage
      ? {
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: hover
            ? `${activeBackgroundPosition.lp}% ${activeBackgroundPosition.tp}%`
            : "center",
        }
      : {
          backgroundColor: "#211799",
          backgroundPosition: hover
            ? `${activeBackgroundPosition.lp}% ${activeBackgroundPosition.tp}%`
            : "center",
        }),
  } as unknown as React.CSSProperties;

  const OverlayLayer = overlayColor ? (
    <div
      className="pointer-events-none absolute inset-0 z-[3]"
      style={{
        background: overlayColor,
        mixBlendMode: "overlay",
        opacity: overlayOpacity / 100,
      }}
    />
  ) : null;

  // Scale factor for proportionate sizing
  const isCompact = isFull || numWidth < 280;

  const FrontContent = (
    <div className="pointer-events-none absolute z-[2] flex h-full w-full flex-col items-start justify-end font-jejuhallasan transition">
      {/* Top bar: masthead left, icon right */}
      <div className="absolute top-2 left-0 flex w-full items-start justify-between px-2">
        <Image
          src="/assets/masthead.svg"
          alt="YTHWKND"
          width={isCompact ? 64 : 160}
          height={isCompact ? 19 : 48}
          className="object-contain"
        />
        {iconImage && (
          <Image
            src={iconImage}
            alt="Class icon"
            width={isCompact ? 40 : 80}
            height={isCompact ? 40 : 80}
            className="object-contain drop-shadow-md"
          />
        )}
      </div>

      {/* Fade-to-black gradient at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

      {/* Bottom text content */}
      <div className={cn(
        "relative flex w-full flex-col gap-0.5",
        isCompact ? "p-2" : "p-3"
      )}>
        <div className={cn(
          "text-white font-jetsytrial drop-shadow-md",
          isCompact ? "text-lg" : "text-4xl"
        )}>{name}</div>
        {username && (
          <div className={cn(
            "text-white/50 font-sans",
            isCompact ? "text-[9px]" : "text-xs"
          )}>{username}</div>
        )}
        {subtitle && (
          <div className={cn(
            "text-white/70",
            isCompact ? "text-[10px] mb-2" : "text-sm mb-4"
          )}>{subtitle}</div>
        )}

        {actionLabel ? (
          <div className="flex w-full flex-col gap-1">
            <button
              onClick={onAction ? (e) => { e.stopPropagation(); onAction(); } : undefined}
              disabled={!onAction}
              className={cn(
                "pointer-events-auto w-full rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white font-jetsytrial uppercase tracking-wider transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:enabled:bg-white/25 hover:enabled:shadow-md active:enabled:scale-95 cursor-pointer",
                isCompact ? "py-1.5 text-[10px]" : "py-2 text-sm"
              )}
            >
              {actionLabel}
            </button>
          </div>
        ) : (
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col items-start gap-0.5">
              {primaryId && (
                <span className={cn("text-white/80", isCompact ? "text-[9px]" : "text-sm")}>
                  {primaryId}
                </span>
              )}
              {secondaryInfo && (
                <span className={cn("text-white/50", isCompact ? "text-[8px]" : "text-xs")}>
                  {secondaryInfo}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const BackContent = (
    <div className={cn(
      "pointer-events-none absolute z-[2] flex h-full w-full flex-col items-start justify-between font-jejuhallasan",
      isCompact ? "p-2" : "p-3"
    )}>
      {/* Full-card dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60" />

      <div className={cn("relative flex w-full flex-col", isCompact ? "gap-2" : "gap-4")}>
        {/* Top bar: masthead left, icon right */}
        <div className="flex items-start justify-between">
          <Image
            src="/assets/masthead.svg"
            alt="YTHWKND"
            width={isCompact ? 56 : 140}
            height={isCompact ? 17 : 40}
            className="object-contain"
          />
          {iconImage && (
            <Image
              src={iconImage}
              alt="Class icon"
              width={isCompact ? 36 : 64}
              height={isCompact ? 36 : 64}
              className="object-contain drop-shadow-md"
            />
          )}
        </div>

        {/* Description text */}
        <div className={cn(isCompact ? "px-0" : "px-1")}>
          <div className={cn(
            "text-white font-jetsytrial drop-shadow-md",
            isCompact ? "text-sm mb-1" : "text-2xl mb-2"
          )}>
            {name}
          </div>
          {username && (
            <div className={cn(
              "text-white/50 font-sans",
              isCompact ? "text-[8px] -mt-0.5 mb-1" : "text-xs -mt-1 mb-2"
            )}>{username}</div>
          )}
          {subtitle && (
            <div className={cn(
              "text-white/70",
              isCompact ? "text-[9px] mb-1.5" : "text-sm mb-4"
            )}>
              {subtitle}
            </div>
          )}
          {description && (
            <p className={cn(
              "text-white/80 leading-relaxed",
              isCompact ? "text-xs" : "text-base"
            )}>{description}</p>
          )}
        </div>
      </div>

      {actionLabel ? (
        <button
          onClick={onAction ? (e) => { e.stopPropagation(); onAction(); } : undefined}
          disabled={!onAction}
          className={cn(
            "pointer-events-auto relative w-full rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white font-jetsytrial uppercase tracking-wider transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:enabled:bg-white/25 hover:enabled:shadow-md active:enabled:scale-95 cursor-pointer",
            isCompact ? "py-1.5 text-[10px]" : "py-2 text-sm"
          )}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );

  const renderCardFace = (
    content: React.ReactNode,
    isStatic: boolean = false
  ) => {
    if (isStatic || forceSide) {
      return (
        <div className="relative h-full w-full overflow-hidden rounded-2xl shadow-xl">
          {OverlayLayer}
          {content}
          <div ref={ref} className={holoCardClasses} style={holoCardStyle}>
            {children}
          </div>
        </div>
      );
    }

    return (
      <Tilt className="relative h-full w-full overflow-hidden rounded-2xl !p-0 shadow-xl">
        {OverlayLayer}
        {content}
        <div
          ref={ref}
          className={holoCardClasses}
          style={holoCardStyle}
          onMouseMove={handleOnMouseMove}
          onTouchMove={handleOnTouchMove}
          onMouseOut={handleOnMouseOut}
          onBlur={handleOnMouseOut}
        >
          {children}
        </div>
      </Tilt>
    );
  };

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleCardClick();
      }
    },
    [handleCardClick]
  );

  return (
    <div
      className={cn(forceSide ? "" : "perspective-1000", isFull && "w-full h-full", className)}
      onClick={handleCardClick}
      onKeyDown={!forceSide ? handleKeyDown : undefined}
      role={!forceSide ? "button" : undefined}
      tabIndex={!forceSide ? 0 : undefined}
      title={
        !forceSide ? `Profile card for ${name}. Click to flip.` : undefined
      }
      style={containerStyle}
    >
      <div
        className={
          forceSide ? "relative" : "relative transition-transform duration-700"
        }
        style={innerStyle}
      >
        <div style={frontStyle}>
          {renderCardFace(minimal ? null : FrontContent, !!forceSide)}
        </div>
        <div style={backStyle}>{renderCardFace(minimal ? null : BackContent, !!forceSide)}</div>
      </div>
    </div>
  );
};

export default HoloCard;
