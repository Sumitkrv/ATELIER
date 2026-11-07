"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
} from "lucide-react";
import {
  ATELIER_ART_VAULT_CONTENT,
  buildAtelierVaultCategories,
} from "@/lib/designs-catalogue";
import { cn } from "@/lib/cn";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

export interface ZoomSliderItem {
  id?: string;
  slug?: string;
  number: string;
  src: string;
  fallbackSrc?: string;
  alt?: string;
  title: string;
  desc: string;
  slotNumber?: number;
  artworkCount?: number;
  compatibleSurfaces?: string[];
}

export interface ZoomSliderControlHandle {
  next: () => void;
  prev: () => void;
  goToIndex: (index: number) => void;
  pauseAutoplay: (resumeDelayMs?: number) => void;
  getActiveIndex: () => number;
}

export interface ZoomSliderProps {
  sliderData?: ZoomSliderItem[];
  title?: string;
  subheading?: string;
  scaleOnHover?: boolean;
  textOnHover?: boolean;
  size?: number;
  easeScrollPercentage?: number;
  /** Initial category index on mount (e.g. from ?category=cat-04 deep link). */
  initialIndex?: number;
  /** Controlled active preview index. */
  activeIndex?: number;
  /** Deliberately applied catalogue filter slug (kept separate from preview movement). */
  selectedSlug?: string;
  /** Enable infinite smooth autoplay across all categories (default: true). */
  autoPlay?: boolean;
  /** Time interval between automatic category movements in ms (default: 2000ms = 2s). */
  autoPlayHoldMs?: number;
  /** Smooth transition duration between categories in seconds (default: 0.85s). */
  autoPlayTransitionDuration?: number;
  /** Inactivity delay before resuming autoplay after manual drag/click (default: 3500ms). */
  inactivityResumeMs?: number;
  /** Short delay before resuming autoplay after mouse leaves the gallery. */
  hoverResumeMs?: number;
  onActiveIndexChange?: (index: number, item: ZoomSliderItem) => void;
  onSelectItem?: (item: ZoomSliderItem, index: number) => void;
  showBuiltInHeader?: boolean;
  showBuiltInControls?: boolean;
  className?: string;
  stageHeightClassName?: string;
}

const WHEEL_FACTOR = 1;
const IDLE_LERP = 0.068;
const DRAG_LERP = 0.24;
const FRICTION = 0.9;
const MIN_VELOCITY = 0.12;
const MOBILE_BREAKPOINT = 640;
const TABLET_BREAKPOINT = 1025;

const DEFAULT_AUTOPLAY_INTERVAL_MS = 2000;
const DEFAULT_INACTIVITY_RESUME_MS = 3500;

function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

const DEFAULT_ATELIER_SLIDES: ZoomSliderItem[] =
  buildAtelierVaultCategories().map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    number: cat.number,
    src: cat.coverImage,
    fallbackSrc: cat.fallbackImage,
    alt: cat.altText,
    title: cat.title,
    desc: cat.description,
    slotNumber: cat.slotNumber,
    artworkCount: cat.artworkCount,
    compatibleSurfaces: cat.compatibleSurfaces,
  }));

export const ZoomSliderComp = forwardRef<
  ZoomSliderControlHandle,
  ZoomSliderProps
>(function ZoomSliderComp(
  {
    sliderData = DEFAULT_ATELIER_SLIDES,
    title,
    subheading,
    scaleOnHover = true,
    textOnHover = true,
    size = 1,
    easeScrollPercentage = 100,
    initialIndex = 0,
    selectedSlug,
    autoPlay = true,
    autoPlayHoldMs = DEFAULT_AUTOPLAY_INTERVAL_MS,
    inactivityResumeMs = DEFAULT_INACTIVITY_RESUME_MS,
    onActiveIndexChange,
    onSelectItem,
    showBuiltInHeader = false,
    showBuiltInControls = false,
    className,
    stageHeightClassName,
  },
  ref
) {
  const slides = useMemo(
    () =>
      sliderData && sliderData.length > 0
        ? sliderData
        : DEFAULT_ATELIER_SLIDES,
    [sliderData]
  );

  const stageWrapperRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const slideOuterRefs = useRef<Array<HTMLDivElement | null>>([]);
  const cardBoxRefs = useRef<Array<HTMLDivElement | null>>([]);
  const captionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const badgeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const revealFnsRef = useRef<
    Array<{ show: () => void; hide: () => void } | null>
  >([]);

  const [containerWidth, setContainerWidth] = useState<number>(1360);
  const [containerHeight, setContainerHeight] = useState<number>(520);
  const [isDraggingVisual, setIsDraggingVisual] = useState<boolean>(false);

  const isMobile = containerWidth < MOBILE_BREAKPOINT;
  const isTablet =
    containerWidth >= MOBILE_BREAKPOINT && containerWidth < TABLET_BREAKPOINT;

  const sizeMultiplier = Math.max(0.5, Number(size) || 1);
  const easePct = Math.max(20, Number(easeScrollPercentage) || 100);

  // Core variable-width geometry from the reference ZoomSliderComp, adapted to container dimensions
  const initialCardWidth = (isMobile ? 78 : 190) * sizeMultiplier;
  const maxCardWidth =
    (isMobile ? 250 : isTablet ? 445 : 585) * sizeMultiplier;
  const maxCardHeight = Math.round(
    isMobile
      ? containerHeight * 0.66 * sizeMultiplier
      : containerHeight * 0.75 * sizeMultiplier
  );
  const minCardHeight = Math.round((isMobile ? 92 : 88) * sizeMultiplier);
  const virtualStep = maxCardWidth;
  // Slot offset ensures slide index 0 begins in the prominent expanded focal region
  const focusSlotOffset = isMobile ? 2 : 3;

  const clampedInitialIdx = useMemo(() => {
    if (!slides.length) return 0;
    const raw =
      typeof initialIndex === "number" && !Number.isNaN(initialIndex)
        ? initialIndex
        : 0;
    return ((raw % slides.length) + slides.length) % slides.length;
  }, [initialIndex, slides.length]);

  const physicsRef = useRef<{
    current: number;
    target: number;
    raf: number | null;
    isDragging: boolean;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    dragMovedPx: number;
    touchDirection: "undecided" | "horizontal" | "vertical";
    velocity: number;
    initializedPosition: boolean;
    lastAutoStepTime: number;
    pauseUntilTime: number;
  }>({
    current: 0,
    target: 0,
    raf: null,
    isDragging: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    dragMovedPx: 0,
    touchDirection: "undecided",
    velocity: 0,
    initializedPosition: false,
    lastAutoStepTime: 0,
    pauseUntilTime: 0,
  });

  // Single authoritative active-preview category index
  const [activeIndex, setActiveIndex] = useState<number>(clampedInitialIdx);
  const activeIndexRef = useRef<number>(clampedInitialIdx);
  const onActiveIndexChangeRef = useRef(onActiveIndexChange);
  useEffect(() => {
    onActiveIndexChangeRef.current = onActiveIndexChange;
  }, [onActiveIndexChange]);

  // Initialize virtual position to clampedInitialIdx once on mount (and keep slot aligned on resize)
  const prevVirtualStepRef = useRef<number>(virtualStep);
  useEffect(() => {
    if (virtualStep <= 0 || !slides.length) return;
    const state = physicsRef.current;
    if (!state.initializedPosition) {
      const startPos = clampedInitialIdx * virtualStep;
      state.current = startPos;
      state.target = startPos;
      state.initializedPosition = true;
      state.lastAutoStepTime = performance.now();
      activeIndexRef.current = clampedInitialIdx;
      setActiveIndex(clampedInitialIdx);
      prevVirtualStepRef.current = virtualStep;
    } else if (prevVirtualStepRef.current !== virtualStep) {
      // Scale current and target proportionally when responsive virtualStep changes on resize
      const ratio = virtualStep / (prevVirtualStepRef.current || virtualStep);
      state.current *= ratio;
      state.target =
        Math.round((state.target * ratio) / virtualStep) * virtualStep;
      state.velocity = 0;
      prevVirtualStepRef.current = virtualStep;
    }
  }, [clampedInitialIdx, slides.length, virtualStep]);

  // Measure actual slider stage container via ResizeObserver (avoids w-screen horizontal overflow)
  useEffect(() => {
    const el = stageWrapperRef.current;
    if (!el) return;

    const updateDimensions = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) setContainerWidth(Math.round(rect.width));
      if (rect.height > 0) setContainerHeight(Math.round(rect.height));
    };

    updateDimensions();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        updateDimensions();
      });
      observer.observe(el);
      return () => observer.disconnect();
    } else {
      window.addEventListener("resize", updateDimensions);
      return () => window.removeEventListener("resize", updateDimensions);
    }
  }, []);

  const pauseAutoplay = useCallback(
    (resumeDelayMs = inactivityResumeMs) => {
      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      physicsRef.current.pauseUntilTime = now + resumeDelayMs;
      physicsRef.current.lastAutoStepTime = now;
    },
    [inactivityResumeMs]
  );

  // Navigate to a specific category index along the shortest circular path
  const goToIndex = useCallback(
    (targetIdx: number, resumeDelayMs = inactivityResumeMs) => {
      const total = slides.length;
      if (!total || virtualStep <= 0) return;

      pauseAutoplay(resumeDelayMs);
      const normalizedIdx = ((targetIdx % total) + total) % total;
      const totalVirtualWidth = total * virtualStep;
      const state = physicsRef.current;

      const currentWrapped =
        ((state.target % totalVirtualWidth) + totalVirtualWidth) %
        totalVirtualWidth;
      const desiredWrapped = normalizedIdx * virtualStep;

      let delta = desiredWrapped - currentWrapped;
      if (delta > totalVirtualWidth / 2) {
        delta -= totalVirtualWidth;
      } else if (delta < -totalVirtualWidth / 2) {
        delta += totalVirtualWidth;
      }

      state.velocity = 0;
      state.target =
        Math.round((state.target + delta) / virtualStep) * virtualStep;
    },
    [inactivityResumeMs, pauseAutoplay, slides.length, virtualStep]
  );

  // Advance or retreat by 1 category (seamlessly wraps 13 -> 01 in circular virtual space)
  const stepBy = useCallback(
    (direction: 1 | -1, isManual = true) => {
      const total = slides.length;
      if (!total || virtualStep <= 0) return;

      const state = physicsRef.current;
      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      if (isManual) {
        state.pauseUntilTime = now + inactivityResumeMs;
      }
      state.lastAutoStepTime = now;
      state.velocity = 0;
      const nextSlot = Math.round(state.target / virtualStep) + direction;
      state.target = nextSlot * virtualStep;
    },
    [inactivityResumeMs, slides.length, virtualStep]
  );

  useImperativeHandle(
    ref,
    () => ({
      next: () => stepBy(1, true),
      prev: () => stepBy(-1, true),
      goToIndex: (idx: number) => goToIndex(idx, inactivityResumeMs),
      pauseAutoplay,
      getActiveIndex: () => activeIndexRef.current,
    }),
    [goToIndex, inactivityResumeMs, pauseAutoplay, stepBy]
  );

  // Core quadratic easing layout function (ct in original ZoomSliderComp)
  const layoutSlides = useCallback(
    (scrollValue: number) => {
      if (!trackRef.current) return;
      const total = slides.length;
      if (!total) return;

      const totalVirtualWidth = total * virtualStep;
      const W = containerWidth;
      const floorY = containerHeight;
      const easeZone = 2 * W * (easePct / 100);

      const mapVtoX = (v: number): number => {
        if (v <= 0) return 0;
        if (v >= easeZone) return v - easeZone / 2;
        return (v * v) / (2 * easeZone);
      };

      const wrappedScroll =
        ((scrollValue % totalVirtualWidth) + totalVirtualWidth) %
        totalVirtualWidth;
      const baseIndex = Math.floor(wrappedScroll / virtualStep);
      const frac = (wrappedScroll % virtualStep) / virtualStep;
      const cardGap = isMobile ? 6 : 10;

      for (let slot = 0; slot < total; slot += 1) {
        const slideIdx =
          (baseIndex + slot - focusSlotOffset + total * 4) % total;
        const virtualX = (slot - frac) * virtualStep;
        const screenX = mapVtoX(virtualX);
        const rawWidth = mapVtoX(virtualX + virtualStep) - screenX;
        const widthRatio = Math.min(1, Math.max(0, rawWidth / maxCardWidth));
        const cardHeight =
          minCardHeight + widthRatio * (maxCardHeight - minCardHeight);
        const topY = floorY - cardHeight;

        const slideOuter = slideOuterRefs.current[slideIdx];
        if (!slideOuter) continue;

        const visibleWidth = Math.max(2, rawWidth - cardGap);
        const isWithinViewport =
          screenX < W + 60 && screenX + rawWidth > -60 && rawWidth > 4;

        slideOuter.style.transform = `translate3d(${screenX.toFixed(1)}px, ${topY.toFixed(1)}px, 0)`;
        slideOuter.style.zIndex = String(Math.round(widthRatio * 30));
        slideOuter.style.pointerEvents = isWithinViewport ? "auto" : "none";

        const cardBox = cardBoxRefs.current[slideIdx];
        if (cardBox) {
          cardBox.style.width = `${visibleWidth.toFixed(1)}px`;
          cardBox.style.height = `${cardHeight.toFixed(1)}px`;
        }

        // Show compact bottom pill when card is wide enough to read
        const badgeEl = badgeRefs.current[slideIdx];
        if (badgeEl) {
          badgeEl.style.opacity = visibleWidth >= 56 ? "1" : "0";
        }
      }
    },
    [
      containerHeight,
      containerWidth,
      easePct,
      focusSlotOffset,
      isMobile,
      maxCardHeight,
      maxCardWidth,
      minCardHeight,
      slides.length,
      virtualStep,
    ]
  );

  // Scoped pointer/wheel/touch engine + Unified RAF Autoplay & Interpolation Loop
  useEffect(() => {
    const stageEl = stageWrapperRef.current;
    if (!stageEl || !slides.length || virtualStep <= 0) return;

    const state = physicsRef.current;
    const totalVirtualWidth = slides.length * virtualStep;
    const intervalMs = Math.max(1000, autoPlayHoldMs);

    if (state.lastAutoStepTime === 0) {
      state.lastAutoStepTime = performance.now();
    }

    const tick = (now: number) => {
      // 1. Automatic 2-second category movement inside the unified RAF loop
      if (
        autoPlay &&
        slides.length > 1 &&
        !state.isDragging &&
        document.visibilityState !== "hidden" &&
        now >= state.pauseUntilTime &&
        now - state.lastAutoStepTime >= intervalMs
      ) {
        state.lastAutoStepTime = now;
        state.velocity = 0;
        const nextSlot = Math.round(state.target / virtualStep) + 1;
        state.target = nextSlot * virtualStep;
      }

      // 2. Drag / free-momentum physics
      if (!state.isDragging && Math.abs(state.velocity) > MIN_VELOCITY) {
        state.target += state.velocity;
        state.velocity *= FRICTION;
      } else if (!state.isDragging && Math.abs(state.velocity) > 0) {
        state.velocity = 0;
        state.target = Math.round(state.target / virtualStep) * virtualStep;
      }

      // 3. Smooth interpolation toward target
      const factor = state.isDragging ? DRAG_LERP : IDLE_LERP;
      state.current = lerp(state.current, state.target, factor);

      // 4. Layout all 13 variable-width cards
      layoutSlides(state.current);

      // 5. Synchronize authoritative activeIndex across header, badge, counter, and info card
      if (slides.length > 0 && totalVirtualWidth > 0) {
        const wrapped =
          ((state.current % totalVirtualWidth) + totalVirtualWidth) %
          totalVirtualWidth;
        const nextActive = Math.round(wrapped / virtualStep) % slides.length;
        if (nextActive !== activeIndexRef.current) {
          activeIndexRef.current = nextActive;
          setActiveIndex(nextActive);
          const item = slides[nextActive];
          if (item && onActiveIndexChangeRef.current) {
            onActiveIndexChangeRef.current(nextActive, item);
          }
        }
      }

      state.raf = requestAnimationFrame(tick);
    };

    // Scoped wheel handler: only intercept intentional horizontal trackpad swipe or Shift+Wheel
    const onWheel = (e: WheelEvent) => {
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      if (absX > absY * 1.5 && absX > 6) {
        e.preventDefault();
        const now = performance.now();
        state.pauseUntilTime = now + inactivityResumeMs;
        state.lastAutoStepTime = now;
        state.target += e.deltaX * WHEEL_FACTOR;
      } else if (e.shiftKey && absY > 2) {
        e.preventDefault();
        const now = performance.now();
        state.pauseUntilTime = now + inactivityResumeMs;
        state.lastAutoStepTime = now;
        state.target += e.deltaY * WHEEL_FACTOR;
      }
    };

    const beginDrag = (clientX: number, clientY: number) => {
      state.isDragging = true;
      state.startX = clientX;
      state.startY = clientY;
      state.lastX = clientX;
      state.lastY = clientY;
      state.dragMovedPx = 0;
      state.velocity = 0;
      setIsDraggingVisual(true);
    };

    const moveDrag = (clientX: number, clientY: number, directionSign = 1) => {
      if (!state.isDragging) return;
      const dx = clientX - state.lastX;
      const dy = clientY - state.lastY;
      state.dragMovedPx += Math.hypot(dx, dy);

      if (state.dragMovedPx > 9) {
        const now = performance.now();
        state.pauseUntilTime = now + inactivityResumeMs;
        state.lastAutoStepTime = now;
      }

      const delta = -dx * directionSign * 1.15;
      state.target += delta;
      state.velocity = lerp(state.velocity, delta, 0.5);
      state.lastX = clientX;
      state.lastY = clientY;
    };

    const endDrag = () => {
      if (!state.isDragging) return;
      const wasRealDrag = state.dragMovedPx > 9;
      state.isDragging = false;
      state.touchDirection = "undecided";
      setIsDraggingVisual(false);

      if (wasRealDrag) {
        const now = performance.now();
        state.pauseUntilTime = now + inactivityResumeMs;
        state.lastAutoStepTime = now;
      }

      if (Math.abs(state.velocity) <= MIN_VELOCITY) {
        state.target = Math.round(state.target / virtualStep) * virtualStep;
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      beginDrag(e.clientX, e.clientY);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!state.isDragging) return;
      moveDrag(e.clientX, e.clientY, 1);
    };

    const onMouseUp = () => {
      endDrag();
    };

    const onTouchStart = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      state.touchDirection = "undecided";
      beginDrag(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!state.isDragging || !e.touches[0]) return;
      const touch = e.touches[0];
      const totalDx = Math.abs(touch.clientX - state.startX);
      const totalDy = Math.abs(touch.clientY - state.startY);

      if (state.touchDirection === "undecided") {
        if (totalDx > 6 || totalDy > 6) {
          state.touchDirection =
            totalDx >= totalDy ? "horizontal" : "vertical";
        }
      }

      if (state.touchDirection === "vertical") {
        state.isDragging = false;
        setIsDraggingVisual(false);
        return;
      }

      if (state.touchDirection === "horizontal" && e.cancelable) {
        e.preventDefault();
      }

      moveDrag(touch.clientX, touch.clientY, 1);
    };

    const onTouchEnd = () => {
      endDrag();
    };

    stageEl.addEventListener("wheel", onWheel, { passive: false });
    stageEl.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    stageEl.addEventListener("touchstart", onTouchStart, { passive: true });
    stageEl.addEventListener("touchmove", onTouchMove, { passive: false });
    stageEl.addEventListener("touchend", onTouchEnd);
    stageEl.addEventListener("touchcancel", onTouchEnd);

    state.raf = requestAnimationFrame(tick);

    return () => {
      if (state.raf !== null) {
        cancelAnimationFrame(state.raf);
      }
      stageEl.removeEventListener("wheel", onWheel);
      stageEl.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      stageEl.removeEventListener("touchstart", onTouchStart);
      stageEl.removeEventListener("touchmove", onTouchMove);
      stageEl.removeEventListener("touchend", onTouchEnd);
      stageEl.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [
    autoPlay,
    autoPlayHoldMs,
    inactivityResumeMs,
    layoutSlides,
    slides,
    virtualStep,
  ]);

  // GSAP SplitText line animations + hover image scale
  useEffect(() => {
    if (!slides.length) return;

    const cleanups: Array<() => void> = [];
    revealFnsRef.current = [];

    slideOuterRefs.current.forEach((outerEl, idx) => {
      const captionEl = captionRefs.current[idx];
      const cardBoxEl = cardBoxRefs.current[idx];
      if (!outerEl || !captionEl || !cardBoxEl) return;

      const numberEl = captionEl.querySelector("[data-number]");
      const titleEl = captionEl.querySelector("[data-title]");
      const descEl = captionEl.querySelector("[data-desc]");
      const ctaEl = captionEl.querySelector("[data-cta]");
      if (!numberEl || !titleEl || !descEl) return;

      const targets = ctaEl
        ? [numberEl, titleEl, descEl, ctaEl]
        : [numberEl, titleEl, descEl];

      const split = SplitText.create(targets, {
        type: "lines",
        mask: "lines",
      });

      gsap.set(split.lines, { yPercent: 100 });
      gsap.set(captionEl, { autoAlpha: 0 });

      const imgEl = cardBoxEl.querySelector("img");
      if (imgEl) {
        gsap.set(imgEl, { opacity: 1 });
      }

      const showCaption = () => {
        if (!textOnHover) return;
        gsap.killTweensOf([captionEl, split.lines]);
        gsap
          .timeline()
          .set(captionEl, { autoAlpha: 1 })
          .to(split.lines, {
            yPercent: 0,
            duration: 0.48,
            stagger: 0.04,
            ease: "power3.out",
          });

        if (imgEl && scaleOnHover) {
          gsap.to(imgEl, {
            scale: 1.05,
            duration: 0.6,
            ease: "power2.out",
          });
        }
      };

      const hideCaption = () => {
        if (textOnHover) {
          gsap.killTweensOf([captionEl, split.lines]);
          gsap.to(split.lines, {
            yPercent: 100,
            duration: 0.24,
            stagger: 0.02,
            ease: "power2.in",
            onComplete: () => {
              gsap.set(captionEl, { autoAlpha: 0 });
            },
          });
        } else {
          gsap.killTweensOf([captionEl, split.lines]);
          gsap.set(captionEl, { autoAlpha: 0 });
          gsap.set(split.lines, { yPercent: 100 });
        }

        if (imgEl && scaleOnHover) {
          gsap.to(imgEl, {
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
          });
        }
      };

      revealFnsRef.current[idx] = { show: showCaption, hide: hideCaption };

      const onMouseEnter = () => {
        if (imgEl && scaleOnHover) {
          gsap.to(imgEl, {
            scale: 1.05,
            duration: 0.5,
            ease: "power2.out",
          });
        }
      };
      const onMouseLeave = () => {
        if (imgEl && scaleOnHover && idx !== activeIndexRef.current) {
          gsap.to(imgEl, {
            scale: 1,
            duration: 0.5,
            ease: "power2.out",
          });
        }
      };

      cardBoxEl.addEventListener("mouseenter", onMouseEnter);
      cardBoxEl.addEventListener("mouseleave", onMouseLeave);

      cleanups.push(() => {
        cardBoxEl.removeEventListener("mouseenter", onMouseEnter);
        cardBoxEl.removeEventListener("mouseleave", onMouseLeave);
        gsap.killTweensOf([captionEl, split.lines, imgEl]);
        split.revert();
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [scaleOnHover, slides, textOnHover]);

  // Synchronize SplitText header strictly to the authoritative activeIndex
  const prevVisibleCaptionRef = useRef<number | null>(null);

  useEffect(() => {
    const prev = prevVisibleCaptionRef.current;
    if (prev !== null && prev !== activeIndex) {
      revealFnsRef.current[prev]?.hide();
    }
    revealFnsRef.current[activeIndex]?.show();
    prevVisibleCaptionRef.current = activeIndex;
  }, [activeIndex, slides]);

  const handleCardActivation = useCallback(
    (item: ZoomSliderItem, idx: number) => {
      if (physicsRef.current.dragMovedPx > 9) {
        return;
      }
      goToIndex(idx, 0);
      if (onSelectItem) {
        onSelectItem(item, idx);
      }
    },
    [goToIndex, onSelectItem]
  );

  const activeSlide = slides[activeIndex];
  const liveAnnouncement = slides.length
    ? activeSlide?.title
      ? `Category ${activeSlide.number} of ${slides.length}: ${activeSlide.title}`
      : `Slide ${activeIndex + 1} of ${slides.length}`
    : "";

  return (
    <div
      className={cn(
        "relative w-full select-none overflow-hidden bg-[#F7F3ED]",
        className
      )}
    >
      {/* Screen-reader polite active slide announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Optional standalone header when ZoomSliderComp is used directly */}
      {showBuiltInHeader && (title || subheading) ? (
        <div className="pointer-events-none relative z-20 mx-auto max-w-3xl px-4 pt-8 text-center">
          {title ? (
            <h2 className="font-serif text-3xl font-medium text-[#211D1A] sm:text-4xl">
              {title}
            </h2>
          ) : null}
          {subheading ? (
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#6F665E] sm:text-sm">
              {subheading}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* Interactive ZoomSlider Stage (Scoped gesture target, touch-action: pan-y so vertical scroll works) */}
      <div
        ref={stageWrapperRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={title || "Atelier 13 Worlds of Wall Art Category ZoomSlider"}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            stepBy(1, true);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            stepBy(-1, true);
          } else if (e.key === "Home") {
            e.preventDefault();
            goToIndex(0, inactivityResumeMs);
          } else if (e.key === "End" && slides.length > 0) {
            e.preventDefault();
            goToIndex(slides.length - 1, inactivityResumeMs);
          }
        }}
        className={cn(
          "relative w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#9B1C1C]",
          isDraggingVisual ? "cursor-grabbing" : "cursor-grab",
          stageHeightClassName ||
            "h-[340px] sm:h-[395px] lg:h-[450px] xl:h-[470px]"
        )}
        style={{ touchAction: "pan-y" }}
      >
        {/* Subtle ambient architectural vignette along left and right edges */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 bg-gradient-to-r from-[#F7F3ED] via-[#F7F3ED]/45 to-transparent sm:w-20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-20 w-10 bg-gradient-to-l from-[#F7F3ED]/75 to-transparent sm:w-16"
        />

        {/* Variable-Width Expanding Artwork Panels Track */}
        <div ref={trackRef} className="absolute inset-0">
          {slides.map((item, idx) => {
            const isActiveSlide = idx === activeIndex;
            const isFilteredCatalogueMatch =
              Boolean(selectedSlug) &&
              selectedSlug !== "all" &&
              item.slug === selectedSlug;
            const totalLabel = String(slides.length).padStart(2, "0");

            return (
              <div
                key={item.id || item.slug || `${item.number}-${idx}`}
                ref={(el) => {
                  slideOuterRefs.current[idx] = el;
                }}
                className="absolute left-0 top-0"
                style={{ willChange: "transform" }}
              >
                {/* GSAP SplitText Animated Category Header Above Focal Panel */}
                <div
                  ref={(el) => {
                    captionRefs.current[idx] = el;
                  }}
                  onClick={() => handleCardActivation(item, idx)}
                  className="absolute z-30 flex cursor-pointer flex-col gap-1"
                  style={{
                    bottom: "calc(100% + 12px)",
                    left: 0,
                    width: isMobile ? "220px" : "320px",
                    padding: "0 0 4px",
                    visibility: "hidden",
                  }}
                >
                  <p
                    data-number
                    className="overflow-hidden select-none text-[11px] font-semibold uppercase leading-none tracking-[0.22em] text-[#9B1C1C]"
                  >
                    {item.number} / {totalLabel}
                    {typeof item.artworkCount === "number"
                      ? ` • ${item.artworkCount} ${item.artworkCount === 1 ? "DESIGN" : "DESIGNS"}`
                      : ""}
                  </p>
                  <p
                    data-title
                    className="overflow-hidden select-none font-serif text-[22px] font-semibold leading-[1.12] tracking-[-0.01em] text-[#211D1A] sm:text-[26px]"
                  >
                    {item.title}
                  </p>
                  <p
                    data-desc
                    className="line-clamp-2 overflow-hidden select-none text-[12px] font-normal leading-[1.45] tracking-[0.01em] text-[#6F665E]"
                  >
                    {item.desc}
                  </p>
                  <span
                    data-cta
                    className="mt-1 inline-flex w-fit items-center gap-1.5 overflow-hidden text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#211D1A] transition-colors hover:text-[#9B1C1C]"
                  >
                    <span>EXPLORE COLLECTION</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[#9B1C1C]" />
                  </span>
                </div>

                {/* Variable-Width Expanding Image Card */}
                <div
                  ref={(el) => {
                    cardBoxRefs.current[idx] = el;
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Explore Category ${item.number} of ${totalLabel}: ${item.title}. ${item.desc}`}
                  aria-current={isActiveSlide ? "true" : undefined}
                  aria-pressed={isFilteredCatalogueMatch}
                  onClick={() => handleCardActivation(item, idx)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      goToIndex(idx, 0);
                      if (onSelectItem) {
                        onSelectItem(item, idx);
                      }
                    }
                  }}
                  className={cn(
                    "group relative overflow-hidden rounded-t-xl border transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B1C1C]",
                    isActiveSlide
                      ? "border-[#9B1C1C] shadow-[0_14px_34px_-8px_rgba(155,28,28,0.28)]"
                      : "border-[#DDD2C5] hover:border-[#9B1C1C]/50"
                  )}
                  style={{
                    width: initialCardWidth,
                    height: maxCardHeight,
                    willChange: "width, height",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={item.alt || `${item.title} wall art category`}
                    loading={Math.abs(idx - activeIndex) <= 2 ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback =
                        item.fallbackSrc ||
                        "/images/atelier/hero-botanical-living.jpg";
                      if (target.src && !target.src.endsWith(fallback)) {
                        target.src = fallback;
                      }
                    }}
                    className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover opacity-0"
                    style={{
                      transform: "none",
                      objectPosition: "center center",
                      transition: "none",
                      willChange: "transform",
                    }}
                  />

                  {/* Subtle architectural bottom gradient for panel legibility */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
                  />

                  {/* Synchronized Crimson Top Accent Bar on Active Preview Card */}
                  {isActiveSlide && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[#9B1C1C]"
                    />
                  )}

                  {/* Permanent Bottom Panel Index & Title Identifier */}
                  <div
                    ref={(el) => {
                      badgeRefs.current[idx] = el;
                    }}
                    className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-2 p-3 transition-opacity duration-200"
                  >
                    <div className="min-w-0">
                      <span className="block font-mono text-[10px] font-semibold tracking-[0.18em] text-[#D89B8C]">
                        {item.number}
                      </span>
                      <span className="block truncate font-serif text-[15px] font-medium text-[#FAF9F6]">
                        {item.title}
                      </span>
                    </div>

                    {isActiveSlide && (
                      <span className="shrink-0 rounded-full bg-[#9B1C1C] px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#FAF9F6]">
                        {isFilteredCatalogueMatch ? "Selected" : "Active"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optional standalone controls when used outside AtelierCategoryExplorer */}
      {showBuiltInControls && slides.length > 0 && (
        <div className="flex items-center justify-between border-t border-[#DDD2C5] px-6 py-3.5 text-xs text-[#6F665E]">
          <div className="inline-flex items-center gap-2">
            <MoveHorizontal className="h-3.5 w-3.5 text-[#9B1C1C]" />
            <span className="uppercase tracking-[0.16em]">Drag to explore</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => stepBy(-1, true)}
              aria-label="Previous category"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#DDD2C5] bg-[#FBF8F3] text-[#211D1A] transition-colors hover:border-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-[#FAF9F6]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-mono text-xs tracking-[0.18em] text-[#211D1A]">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(slides.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => stepBy(1, true)}
              aria-label="Next category"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#DDD2C5] bg-[#FBF8F3] text-[#211D1A] transition-colors hover:border-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-[#FAF9F6]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export function AtelierCategorySlider({
  categories,
}: {
  categories: Array<{
    id: string;
    title: string;
    description: string;
    coverImage: string;
  }>;
}) {
  const slides: ZoomSliderItem[] = categories.map((category, index) => ({
    id: category.id,
    number: String(index + 1).padStart(2, "0"),
    src: category.coverImage,
    title: category.title,
    desc: category.description,
  }));

  return (
    <ZoomSliderComp
      sliderData={slides}
      title={ATELIER_ART_VAULT_CONTENT.headline}
      subheading="Drag to explore the Atelier collection"
      scaleOnHover
      textOnHover
      size={1}
      easeScrollPercentage={100}
      showBuiltInHeader
      showBuiltInControls
    />
  );
}

export function ZoomSlider({
  scaleOnHover = true,
  textOnHover = true,
  size = 1,
  easeScrollPercentage = 100,
  ...rest
}: ZoomSliderProps = {}) {
  return (
    <ZoomSliderComp
      title={ATELIER_ART_VAULT_CONTENT.headline}
      subheading={ATELIER_ART_VAULT_CONTENT.subheading}
      sliderData={DEFAULT_ATELIER_SLIDES}
      scaleOnHover={scaleOnHover}
      textOnHover={textOnHover}
      size={size}
      easeScrollPercentage={easeScrollPercentage}
      {...rest}
    />
  );
}

export default ZoomSlider;
