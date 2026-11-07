"use client";
/* eslint-disable @next/next/no-img-element */

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import gsap from "gsap";
import { cn } from "@/lib/cn";

export interface TumbleCard {
  src: string;
  fallbackSrc?: string;
  alt?: string;
  number?: string;
  totalLabel?: string;
  title?: string;
  subtitle?: string;
  href?: string;
  ctaLabel?: string;
}

export interface TumbleDeckShowcaseProps {
  cards: ReadonlyArray<TumbleCard>;
  height?: string;
  aspect?: number;
  scrollPerCard?: number;
  depth?: number;
  background?: string;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function clamp01(t: number): number {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

function wrap(i: number, n: number): number {
  return n ? ((i % n) + n) % n : 0;
}

/**
 * Forward-falling angle around the bottom hinge (`transform-origin: 50% 100%`).
 * Smoothly tilts the front panel toward the viewer as `p` progresses from 0 to 1.
 */
function fallAngle(p: number): number {
  const t = clamp01(p);
  return -78 * Math.pow(t, 1.35);
}

/**
 * Smooth Hermite advancement of the upright deck as the front card tips forward.
 */
function deckAdvance(pos: number): number {
  const base = Math.floor(pos);
  const frac = pos - base;
  const s = clamp01((frac - 0.18) / 0.72);
  return base + s * s * (3 - 2 * s);
}

interface CardPose {
  angle: number;
  z: number;
  yOffset: number;
  opacity: number;
  shade: number;
  contentOpacity: number;
  contentY: number;
  zIndex: number;
}

function cardPose(cardIndex: number, pos: number, depth: number): CardPose {
  const fallen = pos - cardIndex;

  if (fallen >= 1) {
    return {
      angle: -78,
      z: -depth - 1,
      yOffset: 48,
      opacity: 0,
      shade: 0,
      contentOpacity: 0,
      contentY: 24,
      zIndex: 1,
    };
  }

  if (fallen > 0) {
    const t = clamp01(fallen);
    const angle = fallAngle(t);
    const dropY = t > 0.28 ? Math.pow((t - 0.28) / 0.72, 1.45) * 42 : 0;
    const opacity = t <= 0.42 ? 1 : clamp01(1 - (t - 0.42) / 0.42);
    const shade = 0.28 + t * 0.12;
    const contentOpacity = clamp01(1 - t / 0.25);
    const contentY = -t * 24;
    return {
      angle,
      z: 0.04,
      yOffset: dropY,
      opacity,
      shade,
      contentOpacity,
      contentY,
      zIndex: 200,
    };
  }

  const behind = Math.max(0, cardIndex - deckAdvance(pos));
  const opacity = clamp01(depth - behind);
  // Active front card gets a refined editorial gradient veil for white serif typography legibility;
  // stacked cards behind stay clean and slightly toned by depth.
  const frontFactor = clamp01(1 - behind / 0.45);
  const shade = frontFactor * 0.3 + (1 - frontFactor) * Math.min(0.2, behind * 0.04);
  const contentOpacity = clamp01(1 - behind / 0.35);
  const contentY = (1 - contentOpacity) * 28;
  const zIndex = Math.max(2, Math.round(150 - behind * 10));

  return {
    angle: 0,
    z: -behind,
    yOffset: 0,
    opacity,
    shade,
    contentOpacity,
    contentY,
    zIndex,
  };
}

export function TumbleDeckShowcase({
  cards,
  height = "calc(100svh - var(--atelier-navbar-offset, 4.75rem))",
  aspect = 1.62,
  scrollPerCard = 240,
  depth = 5,
  background = "#F8F2EA",
  className,
  style,
  ariaLabel = "Atelier Wall Art 13 Categories 3D Tumble Deck",
}: TumbleDeckShowcaseProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const imgRefs = useRef<Array<HTMLImageElement | null>>([]);
  const numRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const titleRefs = useRef<Array<HTMLHeadingElement | null>>([]);
  const subtitleRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const slotVirtualIndexRef = useRef<Array<number | undefined>>([]);
  const stateRef = useRef<{ pos: number }>({ pos: 0 });
  const metricsRef = useRef<{
    h: number;
    w: number;
    gapZ: number;
    stepY: number;
  }>({
    h: 540,
    w: 1240,
    gapZ: 86,
    stepY: 16,
  });

  const count = cards.length;
  const poolSize = count > 0 ? depth + 4 : 0;

  const renderDeck = useCallback(() => {
    if (count === 0) return;
    const { pos } = stateRef.current;
    const { gapZ, stepY } = metricsRef.current;
    const firstSlot = Math.floor(pos) - 1;

    cardRefs.current.forEach((cardEl, slotIdx) => {
      const imgEl = imgRefs.current[slotIdx];
      if (!cardEl || !imgEl || slotIdx >= poolSize) return;

      const virtualIdx = firstSlot + wrap(slotIdx - firstSlot, poolSize);
      if (slotVirtualIndexRef.current[slotIdx] !== virtualIdx) {
        slotVirtualIndexRef.current[slotIdx] = virtualIdx;
        const wrappedIdx = wrap(virtualIdx, count);
        const item = cards[wrappedIdx];
        if (item) {
          imgEl.dataset.fallback = item.fallbackSrc || "";
          imgEl.src = item.src;
          imgEl.alt = item.alt ?? item.title ?? "";

          const numEl = numRefs.current[slotIdx];
          if (numEl) {
            const numStr =
              item.number || String(wrappedIdx + 1).padStart(2, "0");
            const totStr =
              item.totalLabel || String(count).padStart(2, "0");
            numEl.textContent = `OUR ${totStr} CATEGORIES  —  ${numStr} / ${totStr}`;
          }

          const titleEl = titleRefs.current[slotIdx];
          if (titleEl) {
            titleEl.textContent = item.title || "";
          }

          const subtitleEl = subtitleRefs.current[slotIdx];
          if (subtitleEl) {
            subtitleEl.textContent = item.subtitle || "";
          }

          const linkEl = linkRefs.current[slotIdx];
          if (linkEl) {
            linkEl.href = item.href || "/explore-designs";
            linkEl.textContent = item.ctaLabel || "Explore Category";
          }
        }
      }

      const pose = cardPose(virtualIdx, pos, depth);
      const translateY = pose.z < 0 ? pose.z * stepY : pose.yOffset;
      const translateZ = pose.z * gapZ;

      cardEl.style.transform = `translate3d(0px, ${translateY.toFixed(
        2
      )}px, ${translateZ.toFixed(2)}px) rotateX(${pose.angle.toFixed(2)}deg)`;
      cardEl.style.opacity = pose.opacity.toFixed(3);
      cardEl.style.visibility = pose.opacity > 0.005 ? "visible" : "hidden";
      cardEl.style.zIndex = String(pose.zIndex);
      cardEl.style.setProperty("--td-shade", pose.shade.toFixed(3));
      cardEl.style.setProperty(
        "--td-content-opacity",
        pose.contentOpacity.toFixed(3)
      );
      cardEl.style.setProperty(
        "--td-content-y",
        `${pose.contentY.toFixed(1)}px`
      );
      cardEl.dataset.frontActive =
        pose.contentOpacity > 0.6 ? "true" : "false";
    });
  }, [cards, count, depth, poolSize]);

  useIsomorphicLayoutEffect(() => {
    slotVirtualIndexRef.current = [];
    renderDeck();
  }, [cards, renderDeck]);

  useIsomorphicLayoutEffect(() => {
    const rootEl = rootRef.current;
    const sceneEl = sceneRef.current;
    if (!rootEl || !sceneEl) return;

    const fit = () => {
      const cw = rootEl.clientWidth;
      const ch = rootEl.clientHeight;
      if (cw <= 0 || ch <= 0) return;

      const isMobile = cw < 640;
      const isTablet = cw >= 640 && cw < 1024;

      const w = isMobile
        ? Math.max(260, cw - 32)
        : isTablet
          ? Math.min(cw - 64, 960)
          : Math.min(cw - 80, 1240);

      const h = isMobile
        ? Math.max(250, Math.min(ch * 0.62, w * 0.85, 440))
        : Math.max(280, Math.min(ch * 0.72, w * 0.56, 620));

      const gapZ = h * 0.16;
      const stepY = h * 0.028;

      const stackCrown = h * 0.17;
      const top = Math.max(
        stackCrown + 16,
        (ch - (h + stackCrown)) / 2 + stackCrown
      );

      metricsRef.current = { h, w, gapZ, stepY };
      sceneEl.style.perspective = `${5.4 * h}px`;
      sceneEl.style.perspectiveOrigin = `50% ${top - 0.52 * h}px`;

      rootEl.style.setProperty("--td-w", `${w.toFixed(1)}px`);
      rootEl.style.setProperty("--td-h", `${h.toFixed(1)}px`);
      rootEl.style.setProperty("--td-top", `${top.toFixed(1)}px`);
      renderDeck();
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(rootEl);
    return () => ro.disconnect();
  }, [aspect, renderDeck]);

  const controlsRef = useRef<{ step: (delta: number) => void }>({
    step: () => {},
  });
  const didDragRef = useRef<boolean>(false);

  useEffect(() => {
    const rootEl = rootRef.current;
    if (!rootEl || count === 0) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const state = stateRef.current;
    let targetPos = state.pos;
    let tickerActive = false;
    let settleTimer: ReturnType<typeof setTimeout> | undefined;
    let reducedAccum = 0;

    const follow = () => {
      const rawDt = gsap.ticker.deltaRatio(60) / 60;
      const dt = Math.min(0.033, Math.max(0.008, rawDt));
      state.pos += (targetPos - state.pos) * (1 - Math.exp(-dt * 9));
      if (Math.abs(targetPos - state.pos) < 0.002) {
        state.pos = targetPos;
        gsap.ticker.remove(follow);
        tickerActive = false;
      }
      renderDeck();
    };

    const push = (next: number) => {
      targetPos = Math.max(
        state.pos - 2.5,
        Math.min(state.pos + 2.5, next)
      );
      if (reducedMotion) {
        state.pos = Math.round(targetPos);
        targetPos = state.pos;
        renderDeck();
      } else if (!tickerActive) {
        tickerActive = true;
        gsap.ticker.add(follow);
      }
    };

    const settle = (dir = 0) => {
      const nearest = Math.round(targetPos);
      const offset = targetPos - nearest;
      let snapped = nearest;
      if (dir > 0 && offset > 0.22) {
        snapped = Math.ceil(targetPos);
      } else if (dir < 0 && offset < -0.22) {
        snapped = Math.floor(targetPos);
      }
      push(snapped);
    };

    controlsRef.current.step = (delta: number) => {
      clearTimeout(settleTimer);
      push(Math.round(targetPos) + delta);
    };

    const onWheel = (e: WheelEvent) => {
      const unit =
        e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? rootEl.clientHeight : 1;
      const dx = e.deltaX * unit;
      const dy = e.deltaY * unit;
      const isHorizontal = Math.abs(dx) > Math.abs(dy);
      const delta = isHorizontal ? dx : dy;

      if (!isHorizontal) {
        const rect = rootEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const halfDeckWidth = Math.max(metricsRef.current.w * 0.52, 220);
        if (
          e.clientX > 0 &&
          Math.abs(e.clientX - centerX) > halfDeckWidth
        ) {
          return;
        }
        if (dy > 0 && targetPos >= count - 0.02) {
          return;
        }
        if (dy < 0 && targetPos <= -1 + 0.02) {
          return;
        }
      }

      e.preventDefault();

      if (reducedMotion) {
        for (
          reducedAccum += delta;
          Math.abs(reducedAccum) >= scrollPerCard;

        ) {
          const sign = Math.sign(reducedAccum);
          reducedAccum -= sign * scrollPerCard;
          push(Math.round(targetPos) + sign);
        }
        return;
      }

      push(targetPos + delta / scrollPerCard);
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => settle(Math.sign(delta)), 130);
    };

    let activePointer: {
      id: number;
      y: number;
      x: number;
      travel: number;
      last: number;
    } | null = null;

    const onDown = (e: PointerEvent) => {
      if (e.button === 0) {
        const target = e.target as HTMLElement | null;
        if (target?.closest("a.td-card-cta")) {
          return;
        }
        activePointer = {
          id: e.pointerId,
          y: e.clientY,
          x: e.clientX,
          travel: 0,
          last: 0,
        };
        didDragRef.current = false;
        clearTimeout(settleTimer);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!activePointer || e.pointerId !== activePointer.id) return;
      const dy = activePointer.y - e.clientY;
      const dx = activePointer.x - e.clientX;
      activePointer.y = e.clientY;
      activePointer.x = e.clientX;

      const verticalDelta = -dy;
      const delta =
        Math.abs(verticalDelta) >= Math.abs(dx) ? verticalDelta : dx;
      activePointer.travel += Math.hypot(dx, dy);
      if (delta !== 0) {
        activePointer.last = Math.sign(delta);
      }

      if (activePointer.travel > 6 && !didDragRef.current) {
        didDragRef.current = true;
        try {
          rootEl.setPointerCapture(e.pointerId);
        } catch {
          // ignore if capture unavailable
        }
      }

      if (didDragRef.current && !reducedMotion) {
        push(targetPos + delta / (metricsRef.current.h * 0.85));
      }
    };

    const onUp = (e: PointerEvent) => {
      if (!activePointer || e.pointerId !== activePointer.id) return;
      if (didDragRef.current) {
        if (reducedMotion) {
          push(Math.round(targetPos) + (activePointer.last || 0));
        } else {
          settle(activePointer.last);
        }
      }
      activePointer = null;
    };

    rootEl.addEventListener("wheel", onWheel, { passive: false });
    rootEl.addEventListener("pointerdown", onDown);
    rootEl.addEventListener("pointermove", onMove);
    rootEl.addEventListener("pointerup", onUp);
    rootEl.addEventListener("pointercancel", onUp);

    renderDeck();

    return () => {
      clearTimeout(settleTimer);
      gsap.ticker.remove(follow);
      rootEl.removeEventListener("wheel", onWheel);
      rootEl.removeEventListener("pointerdown", onDown);
      rootEl.removeEventListener("pointermove", onMove);
      rootEl.removeEventListener("pointerup", onUp);
      rootEl.removeEventListener("pointercancel", onUp);
    };
  }, [count, renderDeck, scrollPerCard]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      e.key === "ArrowRight" ||
      e.key === "ArrowDown" ||
      e.key === " " ||
      e.key === "Enter"
    ) {
      e.preventDefault();
      controlsRef.current.step(1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      controlsRef.current.step(-1);
    }
  };

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest("a.td-card-cta")) {
      return;
    }
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    controlsRef.current.step(1);
  };

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onClick={onClick}
      className={cn(
        "td-root relative w-full min-h-[460px] sm:min-h-[560px] touch-pan-y overflow-hidden border-0 outline-none select-none",
        className
      )}
      style={{ height, background, ...style }}
    >
      <style>{`
        .td-root,
        .td-root:focus,
        .td-root:focus-visible {
          outline: none !important;
          box-shadow: none !important;
          border: none !important;
        }
        .td-scene {
          position: absolute;
          inset: 0;
        }
        .td-card {
          position: absolute;
          left: 50%;
          top: var(--td-top);
          width: var(--td-w);
          height: var(--td-h);
          margin-left: calc(var(--td-w) / -2);
          transform-origin: 50% 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          will-change: transform, opacity;
          border-radius: 10px;
          overflow: hidden;
          cursor: grab;
          background: #EAE1D5;
          box-shadow:
            0 0 0 1px rgba(31, 23, 20, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.5),
            0 24px 52px -18px rgba(31, 23, 20, 0.24),
            0 8px 20px -8px rgba(31, 23, 20, 0.12);
        }
        .td-card:active {
          cursor: grabbing;
        }
        .td-card img {
          position: relative;
          z-index: 0;
          display: block;
          width: 100%;
          height: 100%;
          max-width: none;
          object-fit: cover;
          object-position: 50% 50%;
          pointer-events: none;
        }
        .td-card::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: linear-gradient(
            180deg,
            rgba(15, 10, 6, 0.22) 0%,
            rgba(15, 10, 6, 0.68) 100%
          );
          opacity: var(--td-shade, 0.3);
        }
        .td-card-content {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 28px 32px;
          color: #ffffff;
          opacity: var(--td-content-opacity, 0);
          transform: translateY(var(--td-content-y, 0px));
          pointer-events: none;
        }
        .td-card[data-front-active="true"] .td-card-cta {
          pointer-events: auto;
        }
        .td-card-num {
          position: absolute;
          top: 24px;
          left: 32px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
        }
        .td-card-title {
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: clamp(24px, 4.2vw, 60px);
          font-weight: 600;
          line-height: 1.1;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #ffffff;
          margin: 0 0 6px;
          max-width: 26ch;
          text-shadow: 0 4px 24px rgba(0, 0, 0, 0.42);
        }
        .td-card-subtitle {
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.82);
          margin: 14px 0 22px;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
        }
        .td-card-cta {
          display: inline-block;
          border: 1px solid rgba(255, 255, 255, 0.72);
          padding: 10px 26px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #ffffff;
          text-decoration: none;
          background: rgba(20, 15, 12, 0.28);
          transition: background-color 220ms ease, border-color 220ms ease;
          cursor: pointer;
        }
        .td-card-cta:hover {
          background: #9B1C1C;
          border-color: #9B1C1C;
          color: #ffffff;
        }
        @media (max-width: 639px) {
          .td-card-num {
            top: 16px;
            left: 18px;
            font-size: 9.5px;
            letter-spacing: 0.18em;
          }
          .td-card-subtitle {
            font-size: 10px;
            letter-spacing: 0.16em;
            margin: 10px 0 16px;
          }
          .td-card-cta {
            padding: 8px 18px;
            font-size: 10px;
          }
        }
      `}</style>
      <div ref={sceneRef} className="td-scene">
        {Array.from({ length: poolSize }, (_, slotIdx) => {
          const initialVirtualIdx = -1 + wrap(slotIdx + 1, poolSize);
          const initialWrappedIdx =
            count > 0 ? wrap(initialVirtualIdx, count) : 0;
          const initialItem = count > 0 ? cards[initialWrappedIdx] : undefined;
          const initialNum =
            initialItem?.number ||
            String(initialWrappedIdx + 1).padStart(2, "0");
          const initialTot =
            initialItem?.totalLabel || String(count).padStart(2, "0");

          return (
            <div
              key={slotIdx}
              ref={(el) => {
                cardRefs.current[slotIdx] = el;
              }}
              className="td-card"
            >
              <img
                ref={(el) => {
                  imgRefs.current[slotIdx] = el;
                }}
                src={initialItem?.src}
                alt={initialItem?.alt ?? initialItem?.title ?? ""}
                width={1240}
                height={Math.round(1240 / aspect)}
                draggable={false}
                loading="eager"
                onError={(e) => {
                  const img = e.currentTarget;
                  const fallback = img.dataset.fallback;
                  if (fallback && img.src !== fallback) {
                    img.src = fallback;
                  }
                }}
              />
              <div className="td-card-content">
                <span
                  ref={(el) => {
                    numRefs.current[slotIdx] = el;
                  }}
                  className="td-card-num"
                >
                  {initialItem
                    ? `OUR ${initialTot} CATEGORIES  —  ${initialNum} / ${initialTot}`
                    : ""}
                </span>
                <h2
                  ref={(el) => {
                    titleRefs.current[slotIdx] = el;
                  }}
                  className="td-card-title"
                >
                  {initialItem?.title ?? ""}
                </h2>
                <p
                  ref={(el) => {
                    subtitleRefs.current[slotIdx] = el;
                  }}
                  className="td-card-subtitle"
                >
                  {initialItem?.subtitle ?? ""}
                </p>
                <a
                  ref={(el) => {
                    linkRefs.current[slotIdx] = el;
                  }}
                  href={initialItem?.href || "/explore-designs"}
                  className="td-card-cta"
                >
                  {initialItem?.ctaLabel || "Explore Category"}
                </a>
              </div>
            </div>
          );
        })}
      </div>
      <span className="sr-only" aria-live="polite">
        {count} curated wall art categories. Scroll, drag, click or press the
        arrow keys to flip through them.
      </span>
    </div>
  );
}

export default TumbleDeckShowcase;
