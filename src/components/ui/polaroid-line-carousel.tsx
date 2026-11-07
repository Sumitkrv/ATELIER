"use client";
/* eslint-disable @next/next/no-img-element */

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export interface PolaroidSlide {
  image: string;
  title: string;
  caption?: string;
  alt?: string;
  badge?: string;
}

export interface PolaroidLineCarouselHandle {
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
}

export interface PolaroidLineCarouselProps {
  slides: ReadonlyArray<PolaroidSlide>;
  activeIndex?: number;
  defaultIndex?: number;
  height?: string;
  cardWidth?: number;
  sag?: number;
  swing?: number;
  autoplay?: number | false;
  string?: string;
  background?: string;
  ink?: string;
  accentColor?: string;
  showControls?: boolean;
  onChange?: (index: number) => void;
  ariaLabel?: string;
  className?: string;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void): () => void {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerReducedMotionSnapshot(): boolean {
  return false;
}

function wrapIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

/**
 * Shortest signed circular distance from `from` to `to` on a ring of length `count`.
 */
function shortestCircularDelta(from: number, to: number, count: number): number {
  if (count <= 0) return 0;
  let diff = (to - from) % count;
  if (diff > count / 2) diff -= count;
  if (diff < -count / 2) diff += count;
  return diff;
}

export const PolaroidLineCarousel = forwardRef<
  PolaroidLineCarouselHandle,
  PolaroidLineCarouselProps
>(function PolaroidLineCarousel(
  {
    slides,
    activeIndex: controlledIndex,
    defaultIndex = 0,
    height = "min(560px, 70svh)",
    cardWidth = 300,
    sag = 44,
    swing = 0.85,
    autoplay = 6500,
    string: stringColor = "#9A8067",
    background = "#F3EDE5",
    ink = "#1A1A1A",
    accentColor = "#9B1C1C",
    showControls = true,
    onChange,
    ariaLabel = "Interactive hanging Polaroid process gallery",
    className,
  },
  ref
) {
  const count = slides.length;
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot
  );

  const initialIdx = wrapIndex(
    controlledIndex !== undefined ? controlledIndex : defaultIndex,
    count
  );
  const [currentIndex, setCurrentIndex] = useState<number>(initialIdx);
  const [stageDims, setStageDims] = useState<{ width: number; height: number }>({
    width: 1200,
    height: 520,
  });
  const [hoveredCardIdx, setHoveredCardIdx] = useState<number | null>(null);
  const [isDraggingUI, setIsDraggingUI] = useState<boolean>(false);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Continuous physics state stored in refs to avoid 60fps React re-renders
  const physicsRef = useRef<{
    pos: number;
    targetPos: number;
    vel: number;
    angles: number[];
    angVels: number[];
    isDragging: boolean;
    dragStartX: number;
    dragStartPos: number;
    lastPointerX: number;
    lastPointerTime: number;
    pointerVelocityPx: number;
    dragMovedPx: number;
    isHovered: boolean;
    isFocused: boolean;
    isInViewport: boolean;
    isTabVisible: boolean;
    lastInteractionTime: number;
  }>({
    pos: initialIdx,
    targetPos: initialIdx,
    vel: 0,
    angles: Array.from({ length: Math.max(count, 5) }, () => 0),
    angVels: Array.from({ length: Math.max(count, 5) }, () => 0),
    isDragging: false,
    dragStartX: 0,
    dragStartPos: initialIdx,
    lastPointerX: 0,
    lastPointerTime: 0,
    pointerVelocityPx: 0,
    dragMovedPx: 0,
    isHovered: false,
    isFocused: false,
    isInViewport: true,
    isTabVisible: true,
    lastInteractionTime: 0,
  });

  const activeIndexRef = useRef<number>(initialIdx);

  // Commit authoritative active index and notify parent
  const commitIndex = useCallback(
    (nextLogicalIdx: number, notifyParent: boolean) => {
      if (count <= 0) return;
      const wrapped = wrapIndex(nextLogicalIdx, count);
      const p = physicsRef.current;
      const currentLogical = wrapIndex(Math.round(p.targetPos), count);
      const delta = shortestCircularDelta(currentLogical, wrapped, count);
      p.targetPos = Math.round(p.targetPos) + delta;

      if (activeIndexRef.current !== wrapped) {
        activeIndexRef.current = wrapped;
        setCurrentIndex(wrapped);
        if (notifyParent) {
          onChangeRef.current?.(wrapped);
        }
      } else if (notifyParent) {
        onChangeRef.current?.(wrapped);
      }
    },
    [count]
  );

  // Sync when controlled `activeIndex` prop changes externally
  useEffect(() => {
    if (controlledIndex === undefined || count <= 0) return;
    const wrapped = wrapIndex(controlledIndex, count);
    if (wrapped !== activeIndexRef.current) {
      commitIndex(wrapped, false);
    }
  }, [controlledIndex, count, commitIndex]);

  // Expose imperative methods
  const handleNext = useCallback(() => {
    if (count <= 0) return;
    const p = physicsRef.current;
    p.lastInteractionTime = performance.now();
    const nextVirtual = Math.round(p.targetPos) + 1;
    p.targetPos = nextVirtual;
    const wrapped = wrapIndex(nextVirtual, count);
    activeIndexRef.current = wrapped;
    setCurrentIndex(wrapped);
    onChangeRef.current?.(wrapped);
  }, [count]);

  const handlePrev = useCallback(() => {
    if (count <= 0) return;
    const p = physicsRef.current;
    p.lastInteractionTime = performance.now();
    const prevVirtual = Math.round(p.targetPos) - 1;
    p.targetPos = prevVirtual;
    const wrapped = wrapIndex(prevVirtual, count);
    activeIndexRef.current = wrapped;
    setCurrentIndex(wrapped);
    onChangeRef.current?.(wrapped);
  }, [count]);

  const handleGoTo = useCallback(
    (index: number) => {
      if (count <= 0) return;
      physicsRef.current.lastInteractionTime = performance.now();
      commitIndex(index, true);
    },
    [count, commitIndex]
  );

  useImperativeHandle(
    ref,
    () => ({
      goTo: handleGoTo,
      next: handleNext,
      prev: handlePrev,
    }),
    [handleGoTo, handleNext, handlePrev]
  );

  // Responsive stage measurement via ResizeObserver
  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof window === "undefined") return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setStageDims({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        });
      }
    };

    updateSize();

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(updateSize);
      ro.observe(el);
      return () => ro.disconnect();
    } else {
      window.addEventListener("resize", updateSize, { passive: true });
      return () => window.removeEventListener("resize", updateSize);
    }
  }, []);

  // Viewport visibility & document tab visibility tracking
  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof window === "undefined") return;

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry) {
            physicsRef.current.isInViewport = entry.isIntersecting;
          }
        },
        { threshold: 0.15 }
      );
      io.observe(el);
    }

    const onVisChange = () => {
      physicsRef.current.isTabVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVisChange);

    return () => {
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVisChange);
    };
  }, []);

  // Responsive card dimensions & spacing derived from stage width
  const effectiveCardWidth =
    stageDims.width < 480
      ? Math.min(cardWidth, Math.max(215, stageDims.width * 0.64))
      : stageDims.width < 768
        ? Math.min(cardWidth, Math.max(240, stageDims.width * 0.46))
        : stageDims.width < 1024
          ? Math.min(cardWidth, 272)
          : cardWidth;

  const effectiveSpacing =
    stageDims.width < 480
      ? effectiveCardWidth * 0.92
      : stageDims.width < 768
        ? effectiveCardWidth * 1.02
        : stageDims.width < 1024
          ? effectiveCardWidth * 1.08
          : effectiveCardWidth * 1.14;

  const effectiveSag =
    stageDims.width < 640 ? Math.round(sag * 0.68) : sag;

  const stringAnchorY = stageDims.width < 640 ? 34 : 42;

  // Main spring + pendulum simulation loop (60fps DOM transform updates)
  useEffect(() => {
    if (count <= 0 || typeof window === "undefined") return;

    let rafId = 0;
    let lastTime = performance.now();

    const step = (now: number) => {
      const dt = Math.min(0.04, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const p = physicsRef.current;

      // Pause heavy simulation when off-screen and already settled
      const distToTarget = p.targetPos - p.pos;
      if (!p.isInViewport && !p.isDragging && Math.abs(distToTarget) < 0.001) {
        rafId = window.requestAnimationFrame(step);
        return;
      }

      const prevVel = p.vel;

      if (p.isDragging) {
        // Smoothly track finger/mouse while dragging
        const dragDiff = p.targetPos - p.pos;
        p.vel = dragDiff / Math.max(dt, 0.012);
        p.pos += dragDiff * 0.45;
      } else if (prefersReducedMotion) {
        p.pos = p.targetPos;
        p.vel = 0;
      } else {
        // Critically-damped spring toward targetPos
        const stiffness = 62;
        const damping = 13.5;
        const accel = stiffness * (p.targetPos - p.pos) - damping * p.vel;
        p.vel += accel * dt;
        p.pos += p.vel * dt;

        if (Math.abs(p.targetPos - p.pos) < 0.0006 && Math.abs(p.vel) < 0.002) {
          p.pos = p.targetPos;
          p.vel = 0;
        }
      }

      // Horizontal acceleration drives realistic pendulum swing
      const horizAccel = (p.vel - prevVel) / dt;
      const W = Math.max(320, stageDims.width);
      const centerX = W / 2;

      for (let i = 0; i < count; i++) {
        const cardEl = cardRefs.current[i];
        if (!cardEl) continue;

        // Shortest wrapped offset relative to current virtual track position
        const offset = shortestCircularDelta(p.pos, i, count);
        const x = centerX + offset * effectiveSpacing;
        const t = Math.max(-0.15, Math.min(1.15, x / W));

        // Quadratic Bezier catenary sag: y(t) = y0 + 4 * sag * t * (1 - t)
        const clampedT = Math.max(0, Math.min(1, t));
        const y =
          stringAnchorY + 4 * effectiveSag * clampedT * (1 - clampedT);

        // Tangent slope of the sagging string at position t (in degrees)
        const dyDx = (4 * effectiveSag * (1 - 2 * clampedT)) / W;
        const stringTangentDeg =
          (Math.atan(dyDx) * 180) / Math.PI;

        // Natural resting angle follows a fraction of the string slope plus subtle organic variation
        const alternatingBias = (i % 2 === 0 ? 1 : -1) * 0.65;
        const restAngle =
          prefersReducedMotion
            ? 0
            : stringTangentDeg * 0.38 + alternatingBias * Math.min(1, Math.abs(offset));

        // Pendulum spring dynamics for card i
        let angle = p.angles[i] ?? 0;
        let angVel = p.angVels[i] ?? 0;

        if (prefersReducedMotion) {
          angle = 0;
          angVel = 0;
        } else {
          // Impulse from track velocity and acceleration
          const impulse =
            (-p.vel * 6.8 - horizAccel * 0.18) * swing;
          const hoverNudge =
            hoveredCardIdx === i ? (i % 2 === 0 ? 1.35 : -1.35) : 0;
          const targetAngle = Math.max(
            -14,
            Math.min(14, restAngle + impulse + hoverNudge)
          );

          const angStiffness = 54;
          const angDamping = 7.8;
          const angAccel =
            angStiffness * (targetAngle - angle) - angDamping * angVel;
          angVel += angAccel * dt;
          angle += angVel * dt;
        }

        p.angles[i] = angle;
        p.angVels[i] = angVel;

        // Depth, scale, and opacity based on distance from center
        const absOffset = Math.abs(offset);
        const proximity = Math.max(0, 1 - absOffset);
        const isHovered = hoveredCardIdx === i;
        const scale =
          0.86 +
          proximity * 0.18 +
          (isHovered ? 0.025 : 0);
        const liftY = isHovered ? -4 : 0;
        const opacity =
          absOffset > 2.35
            ? 0
            : absOffset > 1.75
              ? Math.max(0.25, 1 - (absOffset - 1.2) * 0.62)
              : 1 - absOffset * 0.14;
        const zIndex = Math.round(50 - absOffset * 12) + (isHovered ? 5 : 0);

        cardEl.style.transform = `translate3d(${x - effectiveCardWidth / 2}px, ${y + liftY}px, 0) rotate(${angle.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        cardEl.style.opacity = opacity.toFixed(3);
        cardEl.style.zIndex = String(zIndex);
        cardEl.style.pointerEvents = absOffset > 2.1 ? "none" : "auto";
      }

      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [
    count,
    stageDims.width,
    effectiveCardWidth,
    effectiveSpacing,
    effectiveSag,
    stringAnchorY,
    swing,
    hoveredCardIdx,
    prefersReducedMotion,
  ]);

  // Autoplay controller (advances every `autoplay` ms when idle, visible, and not hovered/focused/dragging)
  useEffect(() => {
    if (!autoplay || autoplay <= 0 || count <= 1 || prefersReducedMotion) {
      return;
    }

    const intervalMs = Math.max(2500, autoplay);
    const timer = window.setInterval(() => {
      const p = physicsRef.current;
      const now = performance.now();
      if (
        p.isDragging ||
        p.isHovered ||
        p.isFocused ||
        !p.isInViewport ||
        !p.isTabVisible ||
        now - p.lastInteractionTime < 4200
      ) {
        return;
      }

      const nextVirtual = Math.round(p.targetPos) + 1;
      p.targetPos = nextVirtual;
      const wrapped = wrapIndex(nextVirtual, count);
      activeIndexRef.current = wrapped;
      setCurrentIndex(wrapped);
      onChangeRef.current?.(wrapped);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [autoplay, count, prefersReducedMotion]);

  // Pointer drag handlers on the stage
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (count <= 1) return;
    // Ignore clicks on explicit control buttons
    const targetEl = e.target as HTMLElement;
    if (targetEl.closest("[data-carousel-control='true']")) return;

    const p = physicsRef.current;
    p.isDragging = true;
    p.dragStartX = e.clientX;
    p.dragStartPos = p.pos;
    p.lastPointerX = e.clientX;
    p.lastPointerTime = performance.now();
    p.pointerVelocityPx = 0;
    p.dragMovedPx = 0;
    p.lastInteractionTime = performance.now();
    setIsDraggingUI(true);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Safe fallback if pointer capture is unsupported
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = physicsRef.current;
    if (!p.isDragging) return;

    const now = performance.now();
    const dxTotal = e.clientX - p.dragStartX;
    const dxStep = e.clientX - p.lastPointerX;
    const dtStep = Math.max(1, now - p.lastPointerTime);

    p.dragMovedPx = Math.max(p.dragMovedPx, Math.abs(dxTotal));
    p.pointerVelocityPx = dxStep / dtStep; // px per ms
    p.lastPointerX = e.clientX;
    p.lastPointerTime = now;
    p.lastInteractionTime = now;

    const indexDelta = -dxTotal / Math.max(180, effectiveSpacing);
    p.targetPos = p.dragStartPos + indexDelta;

    // Live-sync active stage while dragging across centres
    const nearestWrapped = wrapIndex(Math.round(p.targetPos), count);
    if (nearestWrapped !== activeIndexRef.current) {
      activeIndexRef.current = nearestWrapped;
      setCurrentIndex(nearestWrapped);
      onChangeRef.current?.(nearestWrapped);
    }
  };

  const finishDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const p = physicsRef.current;
    if (!p.isDragging) return;

    p.isDragging = false;
    p.lastInteractionTime = performance.now();
    setIsDraggingUI(false);

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }

    // Apply momentum throw based on release velocity
    const velocityIndexThrow =
      (-p.pointerVelocityPx * 220) / Math.max(180, effectiveSpacing);
    const snappedVirtual = Math.round(p.targetPos + velocityIndexThrow);
    p.targetPos = snappedVirtual;

    const wrapped = wrapIndex(snappedVirtual, count);
    activeIndexRef.current = wrapped;
    setCurrentIndex(wrapped);
    onChangeRef.current?.(wrapped);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    } else if (e.key === "Home") {
      e.preventDefault();
      handleGoTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      handleGoTo(count - 1);
    }
  };

  // SVG Quadratic Bezier control point for `y(0.5) = y0 + effectiveSag`
  // For a quadratic Bezier with endpoints at y0, the midpoint is 0.5*y0 + 0.5*cy => cy = y0 + 2*effectiveSag
  const svgWidth = Math.max(320, stageDims.width);
  const controlPointY = stringAnchorY + 2 * effectiveSag;
  const mainStringPath = `M 0,${stringAnchorY} Q ${svgWidth / 2},${controlPointY} ${svgWidth},${stringAnchorY}`;
  const shadowStringPath = `M 0,${stringAnchorY + 6} Q ${svgWidth / 2},${controlPointY + 8} ${svgWidth},${stringAnchorY + 6}`;

  return (
    <div
      ref={stageRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => {
        physicsRef.current.isHovered = true;
      }}
      onMouseLeave={() => {
        physicsRef.current.isHovered = false;
        setHoveredCardIdx(null);
      }}
      onFocusCapture={() => {
        physicsRef.current.isFocused = true;
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          physicsRef.current.isFocused = false;
        }
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      style={{
        height,
        backgroundColor: background,
        color: ink,
      }}
      className={cn(
        "relative w-full overflow-hidden select-none rounded-[26px] border border-[#DED5CB] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]",
        isDraggingUI ? "cursor-grabbing" : "cursor-grab",
        className
      )}
    >
      {/* Subtle Architectural Studio Wall Lighting & Plaster Depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 75% 65% at 50% 42%, rgba(250, 249, 246, 0.85) 0%, rgba(243, 237, 229, 0.25) 60%, rgba(220, 209, 195, 0.42) 100%)",
        }}
      />

      {/* Left & Right Architectural Vignette Edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-30 w-10 bg-gradient-to-r from-[#F3EDE5] via-[#F3EDE5]/65 to-transparent sm:w-20 lg:w-28"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-30 w-10 bg-gradient-to-l from-[#F3EDE5] via-[#F3EDE5]/65 to-transparent sm:w-20 lg:w-28"
      />

      {/* Continuous Gently Sagging Physical Studio Line (SVG) */}
      <svg
        aria-hidden="true"
        width={svgWidth}
        height={Math.max(180, stringAnchorY + effectiveSag + 45)}
        viewBox={`0 0 ${svgWidth} ${Math.max(180, stringAnchorY + effectiveSag + 45)}`}
        className="pointer-events-none absolute inset-x-0 top-0 z-10 w-full overflow-visible"
      >
        {/* Soft cast shadow of the cord onto the studio plaster wall */}
        <path
          d={shadowStringPath}
          fill="none"
          stroke="rgba(32, 26, 22, 0.11)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Primary braided linen/hemp architectural studio cord */}
        <path
          d={mainStringPath}
          fill="none"
          stroke={stringColor}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* Top warm specular highlight on the cord */}
        <path
          d={mainStringPath}
          fill="none"
          stroke="rgba(255, 250, 242, 0.45)"
          strokeWidth="0.9"
          strokeDasharray="3 5"
          strokeLinecap="round"
        />
        {/* Left & Right Brass Studio Wall Anchor Pins */}
        <circle
          cx={14}
          cy={stringAnchorY + 1}
          r={4.5}
          fill="#8C6D4F"
          stroke="#FAF9F6"
          strokeWidth="1.2"
        />
        <circle
          cx={svgWidth - 14}
          cy={stringAnchorY + 1}
          r={4.5}
          fill="#8C6D4F"
          stroke="#FAF9F6"
          strokeWidth="1.2"
        />
      </svg>

      {/* Suspended Polaroid Cards */}
      <div className="relative h-full w-full">
        {slides.map((slide, idx) => {
          const isSelected = idx === currentIndex;
          const stageNum = String(idx + 1).padStart(2, "0");

          return (
            <button
              key={`${slide.title}-${idx}`}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              type="button"
              aria-label={`Stage ${stageNum}: ${slide.title}${slide.caption ? ` — ${slide.caption}` : ""}`}
              aria-pressed={isSelected}
              onMouseEnter={() => setHoveredCardIdx(idx)}
              onMouseLeave={() =>
                setHoveredCardIdx((prev) => (prev === idx ? null : prev))
              }
              onClick={(e) => {
                e.stopPropagation();
                // Ignore if user dragged more than 8px
                if (physicsRef.current.dragMovedPx > 8) return;
                handleGoTo(idx);
              }}
              style={{
                width: `${effectiveCardWidth}px`,
                transformOrigin: "50% 0px",
                willChange: "transform, opacity",
              }}
              className="group absolute top-0 left-0 cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9B1C1C]"
            >
              {/* Handcrafted Wooden Clothespin Peg */}
              <div
                aria-hidden="true"
                className="pointer-events-none relative mx-auto -mt-[15px] mb-[-9px] flex h-[34px] w-[14px] flex-col items-center justify-center rounded-[3px] shadow-[0_6px_12px_rgba(26,20,16,0.32)] transition-transform duration-300 group-hover:scale-105"
                style={{
                  background:
                    "linear-gradient(90deg, #DFBE99 0%, #C69C6D 48%, #9D7449 100%)",
                  border: "1px solid rgba(112, 79, 46, 0.55)",
                }}
              >
                {/* Upper wood groove */}
                <span className="h-[1px] w-full bg-[#7A5633]/40" />
                {/* Brass coil spring band */}
                <span
                  className="my-[4px] h-[5px] w-[15px] rounded-[1px] shadow-xs"
                  style={{
                    background:
                      "linear-gradient(90deg, #8B693D 0%, #E2C692 50%, #7C5B32 100%)",
                  }}
                />
                {/* Lower wood bevel */}
                <span className="h-[1px] w-full bg-[#FFF7EC]/40" />
              </div>

              {/* Archival Polaroid Frame */}
              <div
                className={cn(
                  "relative rounded-[6px] bg-[#FCF9F4] p-3 pb-4 transition-[box-shadow,border-color] duration-300 sm:p-3.5 sm:pb-5",
                  isSelected
                    ? "border border-[#D5C6B4] shadow-[0_30px_60px_-15px_rgba(26,20,16,0.36),0_12px_24px_-8px_rgba(155,28,28,0.16)] ring-1 ring-[#9B1C1C]/35"
                    : "border border-[#E4DBD0] shadow-[0_18px_36px_-14px_rgba(26,20,16,0.22)] hover:shadow-[0_22px_44px_-14px_rgba(26,20,16,0.28)]"
                )}
              >
                {/* Photographic Print Window */}
                <div className="relative aspect-[4/3.15] w-full overflow-hidden rounded-[2px] border border-[#E6DDD1] bg-[#1A1A1A]">
                  <img
                    src={slide.image}
                    alt={slide.alt || slide.title}
                    draggable={false}
                    loading={idx <= 2 ? "eager" : "lazy"}
                    decoding="async"
                    className={cn(
                      "h-full w-full object-cover object-center transition-[transform,filter] duration-500",
                      isSelected
                        ? "scale-100 brightness-[1.02] contrast-[1.02]"
                        : "scale-[1.01] brightness-[0.95] group-hover:scale-[1.03] group-hover:brightness-100"
                    )}
                  />
                  {/* Subtle archival print inner shadow */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 shadow-[inset_0_0_16px_rgba(26,20,16,0.18)]"
                  />

                  {/* Top-left Stage Stamp Pill */}
                  <span
                    className={cn(
                      "absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.18em] uppercase backdrop-blur-md transition-colors",
                      isSelected
                        ? "bg-[#9B1C1C] text-[#FAF9F6] shadow-xs"
                        : "bg-[#1A1A1A]/70 text-[#FAF9F6]/90"
                    )}
                  >
                    <span>STAGE {stageNum}</span>
                  </span>
                </div>

                {/* Polaroid Bottom Caption Apron */}
                <div className="mt-3 flex flex-col justify-between pt-0.5 sm:mt-3.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <p
                      className="truncate font-serif text-[18px] leading-tight font-medium tracking-[-0.01em] sm:text-[20px]"
                      style={{ color: ink }}
                    >
                      {slide.title}
                    </p>
                    <span
                      className="shrink-0 font-mono text-[10px] font-bold tracking-[0.16em]"
                      style={{
                        color: isSelected ? accentColor : "rgba(105,95,86,0.65)",
                      }}
                    >
                      {stageNum}/0{count}
                    </span>
                  </div>

                  {slide.caption && (
                    <p className="mt-1 truncate text-[10.5px] font-semibold tracking-[0.14em] text-[#6E6359] uppercase">
                      {slide.caption}
                    </p>
                  )}

                  {/* Subtle Crimson Active Bar on the Polaroid Apron */}
                  <div className="mt-2.5 h-[2px] w-full overflow-hidden rounded-full bg-[#EAE2D7]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: isSelected ? "100%" : "0%",
                        backgroundColor: accentColor,
                      }}
                    />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Floating On-Stage Prev / Next Quick Arrows & Drag Hint */}
      {showControls && count > 1 && (
        <div
          data-carousel-control="true"
          className="pointer-events-none absolute inset-x-4 bottom-3.5 z-40 flex items-center justify-between sm:inset-x-6"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous stage Polaroid"
            className="pointer-events-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#D4C5B4] bg-[#FAF9F6]/92 text-[#1A1A1A] shadow-md backdrop-blur-md transition-all duration-200 hover:border-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-[#FAF9F6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-[#DDD2C4] bg-[#FAF9F6]/88 px-3.5 py-1 text-[10px] font-semibold tracking-[0.2em] text-[#5C534C] uppercase shadow-2xs backdrop-blur-md sm:inline-flex">
            <span>Drag String or Click Print to Explore</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next stage Polaroid"
            className="pointer-events-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#D4C5B4] bg-[#FAF9F6]/92 text-[#1A1A1A] shadow-md backdrop-blur-md transition-all duration-200 hover:border-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-[#FAF9F6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Screen-reader live announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {slides[currentIndex]
          ? `Stage ${currentIndex + 1} of ${count}: ${slides[currentIndex].title}`
          : ""}
      </div>
    </div>
  );
});

export default PolaroidLineCarousel;

