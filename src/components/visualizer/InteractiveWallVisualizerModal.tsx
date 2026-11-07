"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  CatalogueDesignItem,
  DEVELOPMENT_FIXTURE_DESIGNS,
} from "@/lib/designs-catalogue";
import { cn } from "@/lib/cn";
import {
  AlertTriangle,
  ArrowUpRight,
  Camera,
  Check,
  Download,
  ExternalLink,
  Eye,
  FlipHorizontal,
  Grid,
  Image as ImageIcon,
  Layers,
  Maximize2,
  RefreshCw,
  RotateCcw,
  Sliders,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

export interface Point2D {
  x: number; // normalized [0..1]
  y: number; // normalized [0..1]
}

export type QuadCorners = [Point2D, Point2D, Point2D, Point2D]; // TL, TR, BR, BL

interface SampleRoomElevation {
  id: string;
  name: string;
  subtitle: string;
  imageUrl: string;
  defaultCorners: QuadCorners;
}

const SAMPLE_ROOM_ELEVATIONS: ReadonlyArray<SampleRoomElevation> = [
  {
    id: "room-living-sunlit",
    name: "Sunlit Living Room Wall",
    subtitle: "Warm neutral plaster elevation with natural daylight",
    imageUrl: "/images/atelier/wall-preview-before.jpg",
    defaultCorners: [
      { x: 0.14, y: 0.1 },
      { x: 0.88, y: 0.1 },
      { x: 0.88, y: 0.78 },
      { x: 0.14, y: 0.78 },
    ],
  },
  {
    id: "room-arch-alcove",
    name: "Sculptural Plaster Studio",
    subtitle: "Curved architectural wall & travertine plinth",
    imageUrl: "/images/atelier/visualizer-hero-burgundy-alcove.jpg",
    defaultCorners: [
      { x: 0.06, y: 0.08 },
      { x: 0.56, y: 0.08 },
      { x: 0.52, y: 0.86 },
      { x: 0.06, y: 0.86 },
    ],
  },
  {
    id: "room-consultation-atelier",
    name: "Atelier Consultation Suite",
    subtitle: "Warm studio wall above architectural sample table",
    imageUrl: "/images/atelier/studio-about-interior.jpg",
    defaultCorners: [
      { x: 0.18, y: 0.08 },
      { x: 0.82, y: 0.08 },
      { x: 0.82, y: 0.68 },
      { x: 0.18, y: 0.68 },
    ],
  },
];

interface InteractiveWallVisualizerModalProps {
  isOpen: boolean;
  initialMode: "camera" | "photo";
  selectedDesign: CatalogueDesignItem;
  externalVisualizerUrl: string;
  onSelectDesign: (design: CatalogueDesignItem) => void;
  onClose: () => void;
}

/**
 * Computes the 3x3 projective homography matrix H mapping the unit square
 * (0,0), (1,0), (1,1), (0,1) to the 4 arbitrary quad corners (x0,y0)..(x3,y3),
 * and returns its inverse H^-1 for per-pixel / mesh perspective warping.
 */
function solveUnitSquareHomography(corners: QuadCorners): number[] | null {
  const [p0, p1, p2, p3] = corners;
  const dx1 = p1.x - p2.x;
  const dx2 = p3.x - p2.x;
  const sx = p0.x - p1.x + p2.x - p3.x;
  const dy1 = p1.y - p2.y;
  const dy2 = p3.y - p2.y;
  const sy = p0.y - p1.y + p2.y - p3.y;

  const denom = dx1 * dy2 - dx2 * dy1;
  if (Math.abs(denom) < 1e-7) return null;

  const g = (sx * dy2 - sy * dx2) / denom;
  const h = (dx1 * sy - dy1 * sx) / denom;
  const a = p1.x - p0.x + g * p1.x;
  const b = p3.x - p0.x + h * p3.x;
  const c = p0.x;
  const d = p1.y - p0.y + g * p1.y;
  const e = p3.y - p0.y + h * p3.y;
  const f = p0.y;

  // Matrix H in row-major: [a, b, c, d, e, f, g, h, 1]
  return [a, b, c, d, e, f, g, h, 1];
}

function projectUnitPoint(H: number[], u: number, v: number): Point2D {
  const w = H[6] * u + H[7] * v + H[8];
  const invW = Math.abs(w) > 1e-6 ? 1 / w : 1;
  return {
    x: (H[0] * u + H[1] * v + H[2]) * invW,
    y: (H[3] * u + H[4] * v + H[5]) * invW,
  };
}

/**
 * Draws a subdivided perspective-warped quad onto a 2D canvas using projective
 * homography subdivision (16x16 grid = 512 perspective-correct triangles).
 * Works reliably across all desktop and mobile GPUs and allows clean composite PNG export.
 */
function drawPerspectiveWarpedArtwork(options: {
  ctx: CanvasRenderingContext2D;
  artworkImg: HTMLImageElement;
  corners: QuadCorners;
  canvasWidth: number;
  canvasHeight: number;
  mode: "mural" | "pattern";
  scale: number;
  opacity: number;
  brightness: number;
  blendMultiply: boolean;
  flipHorizontal: boolean;
  rotationQuarterTurns: number;
}) {
  const {
    ctx,
    artworkImg,
    corners,
    canvasWidth,
    canvasHeight,
    mode,
    scale,
    opacity,
    brightness,
    blendMultiply,
    flipHorizontal,
    rotationQuarterTurns,
  } = options;

  const pixelCorners: QuadCorners = [
    { x: corners[0].x * canvasWidth, y: corners[0].y * canvasHeight },
    { x: corners[1].x * canvasWidth, y: corners[1].y * canvasHeight },
    { x: corners[2].x * canvasWidth, y: corners[2].y * canvasHeight },
    { x: corners[3].x * canvasWidth, y: corners[3].y * canvasHeight },
  ];

  const H = solveUnitSquareHomography(pixelCorners);
  if (!H) return;

  // Prepare an offscreen pattern/mural source canvas with scale, flip, rotation, and tiling applied
  const sourceCanvas = document.createElement("canvas");
  const srcSize = 1024;
  sourceCanvas.width = srcSize;
  sourceCanvas.height = srcSize;
  const sCtx = sourceCanvas.getContext("2d");
  if (!sCtx) return;

  sCtx.save();
  if (brightness !== 100) {
    sCtx.filter = `brightness(${brightness}%)`;
  }

  // Apply center transform for flip & rotation
  sCtx.translate(srcSize / 2, srcSize / 2);
  if (flipHorizontal) {
    sCtx.scale(-1, 1);
  }
  if (rotationQuarterTurns % 4 !== 0) {
    sCtx.rotate(((rotationQuarterTurns % 4) * Math.PI) / 2);
  }
  sCtx.translate(-srcSize / 2, -srcSize / 2);

  if (mode === "pattern") {
    const repeatCount = Math.max(1, Math.round(3 / Math.max(scale, 0.35)));
    const tileW = srcSize / repeatCount;
    const tileH = srcSize / repeatCount;
    for (let row = 0; row < repeatCount; row++) {
      for (let col = 0; col < repeatCount; col++) {
        sCtx.drawImage(artworkImg, col * tileW, row * tileH, tileW + 1, tileH + 1);
      }
    }
  } else {
    // Mural mode with zoom scale around center
    const drawW = srcSize * scale;
    const drawH = srcSize * scale;
    const offsetX = (srcSize - drawW) / 2;
    const offsetY = (srcSize - drawH) / 2;
    sCtx.drawImage(artworkImg, 0, 0, srcSize, srcSize);
    if (scale !== 1) {
      sCtx.clearRect(0, 0, srcSize, srcSize);
      sCtx.drawImage(artworkImg, offsetX, offsetY, drawW, drawH);
    }
  }
  sCtx.restore();

  ctx.save();
  ctx.globalAlpha = Math.max(0.05, Math.min(1, opacity));
  ctx.globalCompositeOperation = blendMultiply ? "multiply" : "source-over";

  // Clip strictly to the 4-corner wall polygon
  ctx.beginPath();
  ctx.moveTo(pixelCorners[0].x, pixelCorners[0].y);
  ctx.lineTo(pixelCorners[1].x, pixelCorners[1].y);
  ctx.lineTo(pixelCorners[2].x, pixelCorners[2].y);
  ctx.lineTo(pixelCorners[3].x, pixelCorners[3].y);
  ctx.closePath();
  ctx.clip();

  const gridN = 14;
  for (let iy = 0; iy < gridN; iy++) {
    const v0 = iy / gridN;
    const v1 = (iy + 1) / gridN;
    for (let ix = 0; ix < gridN; ix++) {
      const u0 = ix / gridN;
      const u1 = (ix + 1) / gridN;

      const p00 = projectUnitPoint(H, u0, v0);
      const p10 = projectUnitPoint(H, u1, v0);
      const p11 = projectUnitPoint(H, u1, v1);
      const p01 = projectUnitPoint(H, u0, v1);

      const su0 = u0 * srcSize;
      const sv0 = v0 * srcSize;
      const su1 = u1 * srcSize;
      const sv1 = v1 * srcSize;

      // Triangle 1: (u0,v0) -> (u1,v0) -> (u1,v1)
      drawTexturedTriangle(
        ctx,
        sourceCanvas,
        p00.x,
        p00.y,
        p10.x,
        p10.y,
        p11.x,
        p11.y,
        su0,
        sv0,
        su1,
        sv0,
        su1,
        sv1
      );
      // Triangle 2: (u0,v0) -> (u1,v1) -> (u0,v1)
      drawTexturedTriangle(
        ctx,
        sourceCanvas,
        p00.x,
        p00.y,
        p11.x,
        p11.y,
        p01.x,
        p01.y,
        su0,
        sv0,
        su1,
        sv1,
        su0,
        sv1
      );
    }
  }

  ctx.restore();
}

function drawTexturedTriangle(
  ctx: CanvasRenderingContext2D,
  img: HTMLCanvasElement,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  u0: number,
  v0: number,
  u1: number,
  v1: number,
  u2: number,
  v2: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.closePath();
  ctx.clip();

  const denom = u0 * (v2 - v1) - u1 * v2 + u2 * v1 + (u1 - u2) * v0;
  if (Math.abs(denom) < 1e-5) {
    ctx.restore();
    return;
  }

  const m11 = -(v0 * (x2 - x1) - v1 * x2 + v2 * x1 + (v1 - v2) * x0) / denom;
  const m12 = (v1 * y2 + v0 * (y1 - y2) - v2 * y1 + (v2 - v1) * y0) / denom;
  const m21 = (u0 * (x2 - x1) - u1 * x2 + u2 * x1 + (u1 - u2) * x0) / denom;
  const m22 = -(u1 * y2 + u0 * (y1 - y2) - u2 * y1 + (u2 - u1) * y0) / denom;
  const dx =
    (u0 * (v2 * x1 - v1 * x2) +
      v0 * (u1 * x2 - u2 * x1) +
      (u2 * v1 - u1 * v2) * x0) /
    denom;
  const dy =
    (u0 * (v2 * y1 - v1 * y2) +
      v0 * (u1 * y2 - u2 * y1) +
      (u2 * v1 - u1 * v2) * y0) /
    denom;

  ctx.transform(m11, m12, m21, m22, dx, dy);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

export function InteractiveWallVisualizerModal({
  isOpen,
  initialMode,
  selectedDesign,
  externalVisualizerUrl,
  onSelectDesign,
  onClose,
}: InteractiveWallVisualizerModalProps) {
  const [inputMode, setInputMode] = useState<"camera" | "photo">(initialMode);
  const [prevInitialMode, setPrevInitialMode] = useState<"camera" | "photo">(
    initialMode
  );
  if (initialMode !== prevInitialMode) {
    setPrevInitialMode(initialMode);
    setInputMode(initialMode);
  }

  // Active room photo for Room Photo Mode
  const [activeSampleRoom, setActiveSampleRoom] = useState<SampleRoomElevation>(
    SAMPLE_ROOM_ELEVATIONS[0]
  );
  const [uploadedRoomDataUrl, setUploadedRoomDataUrl] = useState<string | null>(
    null
  );
  const [uploadedRoomName, setUploadedRoomName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // 4-corner coordinates in normalized [0..1] space
  const [corners, setCorners] = useState<QuadCorners>(
    SAMPLE_ROOM_ELEVATIONS[0].defaultCorners
  );
  const [draggingCornerIndex, setDraggingCornerIndex] = useState<number | null>(
    null
  );
  const [showCornerHandles, setShowCornerHandles] = useState<boolean>(true);

  // Artwork adjustments
  const [applicationMode, setApplicationMode] = useState<"mural" | "pattern">(
    selectedDesign.visualizerConfig.defaultMode
  );
  const [scale, setScale] = useState<number>(1);
  const [opacity, setOpacity] = useState<number>(0.92);
  const [brightness, setBrightness] = useState<number>(100);
  const [blendMultiply, setBlendMultiply] = useState<boolean>(true);
  const [flipHorizontal, setFlipHorizontal] = useState<boolean>(false);
  const [rotationQuarterTurns, setRotationQuarterTurns] = useState<number>(0);
  const [showBeforeRoomOnly, setShowBeforeRoomOnly] = useState<boolean>(false);

  // Camera state (only activated when inputMode === "camera" && isOpen)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<
    "idle" | "requesting" | "active" | "denied"
  >("idle");
  const [cameraErrorMsg, setCameraErrorMsg] = useState<string | null>(null);

  // Loaded HTMLImageElements for canvas rendering
  const [artworkImageEl, setArtworkImageEl] =
    useState<HTMLImageElement | null>(null);
  const [roomImageEl, setRoomImageEl] = useState<HTMLImageElement | null>(null);
  const [exportToast, setExportToast] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeRoomImageUrl =
    uploadedRoomDataUrl || activeSampleRoom.imageUrl;

  // Sync default application mode when selectedDesign changes
  const [prevDesignId, setPrevDesignId] = useState(selectedDesign.id);
  if (selectedDesign.id !== prevDesignId) {
    setPrevDesignId(selectedDesign.id);
    setApplicationMode(selectedDesign.visualizerConfig.defaultMode);
  }

  // Load selected artwork texture image
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!cancelled) setArtworkImageEl(img);
    };
    img.src =
      selectedDesign.visualizerConfig.textureUrl ||
      selectedDesign.coverImage.secureUrl;
    return () => {
      cancelled = true;
    };
  }, [isOpen, selectedDesign]);

  // Load room background image for photo mode
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!cancelled) setRoomImageEl(img);
    };
    img.src = activeRoomImageUrl;
    return () => {
      cancelled = true;
    };
  }, [isOpen, activeRoomImageUrl]);

  // Stop camera stream helper
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Start camera stream ONLY when modal is open AND inputMode === "camera"
  useEffect(() => {
    if (!isOpen || inputMode !== "camera") {
      stopCameraStream();
      return;
    }

    let cancelled = false;

    async function initCamera() {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        if (!cancelled) {
          setCameraState("denied");
          setCameraErrorMsg(
            "Live camera access is not available on this device or browser. You can upload a room photo or test with our sample room elevations below."
          );
        }
        return;
      }

      setCameraState("requesting");
      setCameraErrorMsg(null);

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        if (cancelled) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play().catch(() => {});
        }
        setCameraState("active");
      } catch {
        if (!cancelled) {
          setCameraState("denied");
          setCameraErrorMsg(
            "Camera permission was declined or no camera was detected. Switch to Room Photo Mode to upload a photo of your wall or preview on a studio elevation."
          );
        }
      }
    }

    initCamera();

    return () => {
      cancelled = true;
      stopCameraStream();
    };
  }, [isOpen, inputMode, stopCameraStream]);

  // Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // Render the perspective-warped artwork onto the overlay canvas
  const renderOverlay = useCallback(() => {
    const canvas = overlayCanvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    const rect = stage.getBoundingClientRect();
    const w = Math.max(320, Math.round(rect.width));
    const h = Math.max(240, Math.round(rect.height));

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);

    if (showBeforeRoomOnly || !artworkImageEl) return;

    drawPerspectiveWarpedArtwork({
      ctx,
      artworkImg: artworkImageEl,
      corners,
      canvasWidth: w,
      canvasHeight: h,
      mode: applicationMode,
      scale,
      opacity,
      brightness,
      blendMultiply,
      flipHorizontal,
      rotationQuarterTurns,
    });
  }, [
    artworkImageEl,
    corners,
    applicationMode,
    scale,
    opacity,
    brightness,
    blendMultiply,
    flipHorizontal,
    rotationQuarterTurns,
    showBeforeRoomOnly,
  ]);

  useEffect(() => {
    if (!isOpen) return;
    const raf = requestAnimationFrame(() => {
      renderOverlay();
    });
    return () => cancelAnimationFrame(raf);
  }, [isOpen, renderOverlay]);

  // Pointer dragging for the 4 wall corners
  const handleStagePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (draggingCornerIndex === null || !stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      const nx = Math.max(0.02, Math.min(0.98, (e.clientX - rect.left) / rect.width));
      const ny = Math.max(0.02, Math.min(0.98, (e.clientY - rect.top) / rect.height));

      setCorners((prev) => {
        const next: QuadCorners = [...prev] as QuadCorners;
        next[draggingCornerIndex] = { x: nx, y: ny };
        return next;
      });
    },
    [draggingCornerIndex]
  );

  const handleStagePointerUp = useCallback(() => {
    if (draggingCornerIndex !== null) {
      setDraggingCornerIndex(null);
    }
  }, [draggingCornerIndex]);

  // Room Photo file upload validation & reader
  const handleRoomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError("Please upload a valid JPG, PNG, or WEBP room photograph.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setUploadError("Room photo exceeds 25 MB. Please choose a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setUploadedRoomDataUrl(reader.result);
        setUploadedRoomName(file.name.replace(/\.[^/.]+$/, ""));
        setInputMode("photo");
        setCorners([
          { x: 0.16, y: 0.12 },
          { x: 0.84, y: 0.12 },
          { x: 0.84, y: 0.82 },
          { x: 0.16, y: 0.82 },
        ]);
      }
    };
    reader.onerror = () => {
      setUploadError("Could not read the selected image file. Please try another photo.");
    };
    reader.readAsDataURL(file);
  };

  // Reset all adjustments & corners
  const handleResetAll = () => {
    setCorners(activeSampleRoom.defaultCorners);
    setScale(1);
    setOpacity(0.92);
    setBrightness(100);
    setBlendMultiply(true);
    setFlipHorizontal(false);
    setRotationQuarterTurns(0);
    setShowBeforeRoomOnly(false);
  };

  // Export clean high-resolution composite PNG without UI chrome
  const handleExportSnapshot = () => {
    if (!artworkImageEl) return;

    const exportCanvas = document.createElement("canvas");
    const outW = 1600;
    const outH = 1000;
    exportCanvas.width = outW;
    exportCanvas.height = outH;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    // 1. Draw background (live video frame if camera active, else active room image)
    if (
      inputMode === "camera" &&
      cameraState === "active" &&
      videoRef.current &&
      videoRef.current.videoWidth > 0
    ) {
      ctx.drawImage(videoRef.current, 0, 0, outW, outH);
    } else if (roomImageEl) {
      ctx.drawImage(roomImageEl, 0, 0, outW, outH);
    } else {
      ctx.fillStyle = "#1E1917";
      ctx.fillRect(0, 0, outW, outH);
    }

    // 2. Draw perspective-mapped artwork
    if (!showBeforeRoomOnly) {
      drawPerspectiveWarpedArtwork({
        ctx,
        artworkImg: artworkImageEl,
        corners,
        canvasWidth: outW,
        canvasHeight: outH,
        mode: applicationMode,
        scale,
        opacity,
        brightness,
        blendMultiply,
        flipHorizontal,
        rotationQuarterTurns,
      });
    }

    // 3. Subtle ATELIER studio watermark badge at bottom-right
    ctx.save();
    ctx.fillStyle = "rgba(26, 21, 19, 0.78)";
    ctx.fillRect(outW - 420, outH - 54, 400, 38);
    ctx.fillStyle = "#FAF6F0";
    ctx.font = "600 13px sans-serif";
    ctx.fillText(
      `ATELIER — WALL STORY • ${selectedDesign.title}`,
      outW - 404,
      outH - 30
    );
    ctx.restore();

    const dataUrl = exportCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `atelier-wall-preview-${selectedDesign.slug}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportToast("Snapshot exported — ready to share with our Mumbai studio.");
    window.setTimeout(() => setExportToast(null), 4000);
  };

  const cornerLabels = useMemo(
    () => ["01 TL", "02 TR", "03 BR", "04 BL"],
    []
  );

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Interactive Wall Visualizer — ${selectedDesign.title}`}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#140F0D]/88 p-2 sm:p-5 backdrop-blur-md"
    >
      <div className="flex h-[95dvh] w-full max-w-[1440px] flex-col overflow-hidden rounded-[26px] border border-[#4A2528] bg-[#1C1513] text-[#FAF6F0] shadow-2xl">
        {/* Top Studio Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#241315] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#921A1E] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FAF6F0]">
              <Sparkles className="h-3 w-3" />
              <span>Live 4-Corner Studio</span>
            </span>
            <div>
              <p className="font-serif text-lg font-medium leading-tight text-[#FAF6F0] sm:text-xl">
                {selectedDesign.title}
              </p>
              <p className="text-[11px] text-[#D8C7B8]">
                {selectedDesign.categoryLabel} •{" "}
                {applicationMode === "pattern" ? "Repeating Pattern" : "Full-Wall Mural"}
              </p>
            </div>
          </div>

          {/* Mode Switcher Pills inside Studio */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full border border-white/15 bg-black/30 p-1">
              <button
                type="button"
                onClick={() => setInputMode("camera")}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors",
                  inputMode === "camera"
                    ? "bg-[#921A1E] text-[#FAF6F0]"
                    : "text-[#D8C7B8] hover:text-white"
                )}
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Live Camera</span>
              </button>
              <button
                type="button"
                onClick={() => setInputMode("photo")}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors",
                  inputMode === "photo"
                    ? "bg-[#921A1E] text-[#FAF6F0]"
                    : "text-[#D8C7B8] hover:text-white"
                )}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Room Photo Mode</span>
              </button>
            </div>

            <a
              href={`${externalVisualizerUrl}?mode=${inputMode}&artId=${encodeURIComponent(
                selectedDesign.slug
              )}&artName=${encodeURIComponent(
                selectedDesign.title
              )}&artCategory=${encodeURIComponent(
                selectedDesign.categoryLabel
              )}&artUrl=${encodeURIComponent(
                (selectedDesign.visualizerConfig.textureUrl ||
                  selectedDesign.coverImage.secureUrl ||
                  ""
                ).startsWith("http")
                  ? selectedDesign.visualizerConfig.textureUrl ||
                    selectedDesign.coverImage.secureUrl
                  : `http://localhost:3000${
                      selectedDesign.visualizerConfig.textureUrl ||
                      selectedDesign.coverImage.secureUrl
                    }`
              )}&artMode=${encodeURIComponent(applicationMode)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-wider text-[#E8DDD1] transition-colors hover:border-[#921A1E] hover:bg-white/10"
            >
              <span>Standalone Engine</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Wall Visualizer Studio"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#FAF6F0] transition-colors hover:bg-[#921A1E]"
            >
              <X className="h-4 w-4" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Main Workspace Grid */}
        <div className="grid flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-12 lg:overflow-hidden">
          {/* Center/Left Interactive Wall Stage (8 columns) */}
          <div className="relative flex flex-col justify-between bg-[#120E0D] lg:col-span-8">
            {/* Top Stage Helper Ribbon */}
            <div className="z-20 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#1B1412]/90 px-4 py-2.5 text-xs text-[#D8C7B8]">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[#E05A47]" />
                <span>
                  Drag the <strong>4 corner handles (01–04)</strong> to match your wall’s perspective corners.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCornerHandles((v) => !v)}
                  className="cursor-pointer rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] text-[#FAF6F0] hover:border-[#921A1E]"
                >
                  {showCornerHandles ? "Hide Corner Pins" : "Show Corner Pins"}
                </button>
                <button
                  type="button"
                  onPointerDown={() => setShowBeforeRoomOnly(true)}
                  onPointerUp={() => setShowBeforeRoomOnly(false)}
                  onPointerLeave={() => setShowBeforeRoomOnly(false)}
                  onClick={() => setShowBeforeRoomOnly((v) => !v)}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-colors",
                    showBeforeRoomOnly
                      ? "border-[#921A1E] bg-[#921A1E] text-white"
                      : "border-white/15 bg-white/5 text-[#FAF6F0] hover:border-[#921A1E]"
                  )}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>{showBeforeRoomOnly ? "Showing Before Wall" : "Before / After"}</span>
                </button>
              </div>
            </div>

            {/* Interactive Stage Viewport */}
            <div
              ref={stageRef}
              onPointerMove={handleStagePointerMove}
              onPointerUp={handleStagePointerUp}
              onPointerCancel={handleStagePointerUp}
              className="relative flex min-h-[380px] flex-1 select-none items-center justify-center overflow-hidden bg-[#0E0B0A] sm:min-h-[480px]"
            >
              {/* Background Layer: Live Camera or Room Photo */}
              {inputMode === "camera" ? (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    autoPlay
                    className={cn(
                      "pointer-events-none absolute inset-0 h-full w-full object-cover",
                      cameraState === "active" ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {cameraState !== "active" && (
                    <div className="relative z-20 mx-4 max-w-md rounded-2xl border border-white/15 bg-[#241315]/95 p-6 text-center shadow-2xl">
                      {cameraState === "requesting" ? (
                        <>
                          <RefreshCw className="mx-auto h-7 w-7 animate-spin text-[#E6B8B2]" />
                          <h3 className="mt-3 font-serif text-xl text-[#FAF6F0]">
                            Requesting Camera Access…
                          </h3>
                          <p className="mt-1.5 text-xs leading-relaxed text-[#D8C7B8]">
                            Allow browser camera access to project{" "}
                            <strong>{selectedDesign.title}</strong> directly onto your room wall.
                          </p>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="mx-auto h-7 w-7 text-[#E05A47]" />
                          <h3 className="mt-3 font-serif text-xl text-[#FAF6F0]">
                            Camera Unavailable — Try Room Photo Mode
                          </h3>
                          <p className="mt-1.5 text-xs leading-relaxed text-[#D8C7B8]">
                            {cameraErrorMsg ||
                              "We could not access a live camera on this device. Switch to Room Photo Mode to upload your wall photo or use our studio room elevations."}
                          </p>
                          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => setInputMode("photo")}
                              className="cursor-pointer rounded-full bg-[#921A1E] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#761317]"
                            >
                              Switch to Room Photo Mode
                            </button>
                            <a
                              href={`${externalVisualizerUrl}?mode=camera`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-xs text-[#FAF6F0] hover:border-white"
                            >
                              <span>Open Port 3001 Camera</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={activeRoomImageUrl}
                  alt={uploadedRoomName || activeSampleRoom.name}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                />
              )}

              {/* Perspective-Warped Artwork Canvas Overlay */}
              <canvas
                ref={overlayCanvasRef}
                className="pointer-events-none absolute inset-0 h-full w-full"
              />

              {/* SVG Quad Outline & 4 Draggable Corner Handles */}
              {showCornerHandles &&
                (inputMode === "photo" || cameraState === "active") && (
                  <>
                    <svg
                      className="pointer-events-none absolute inset-0 h-full w-full"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <polygon
                        points={corners
                          .map((pt) => `${pt.x * 100},${pt.y * 100}`)
                          .join(" ")}
                        fill="rgba(146, 26, 30, 0.06)"
                        stroke="#FAF6F0"
                        strokeWidth="0.35"
                        strokeDasharray="1.2 0.8"
                      />
                    </svg>

                    {corners.map((pt, idx) => (
                      <button
                        key={cornerLabels[idx]}
                        type="button"
                        aria-label={`Drag wall corner ${cornerLabels[idx]}`}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          (e.currentTarget as HTMLElement).setPointerCapture(
                            e.pointerId
                          );
                          setDraggingCornerIndex(idx);
                        }}
                        style={{
                          left: `${pt.x * 100}%`,
                          top: `${pt.y * 100}%`,
                        }}
                        className={cn(
                          "absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-full border-2 border-[#FAF6F0] bg-[#921A1E] px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#FAF6F0] shadow-lg transition-transform active:scale-125 active:cursor-grabbing",
                          draggingCornerIndex === idx && "scale-125 ring-4 ring-white/40"
                        )}
                      >
                        {cornerLabels[idx]}
                      </button>
                    ))}
                  </>
                )}

              {/* Toast notification on snapshot export */}
              {exportToast && (
                <div className=" absolute bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full border border-emerald-400/30 bg-[#1B1412]/95 px-4 py-2 text-xs font-medium text-emerald-200 shadow-lg">
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    {exportToast}
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Stage Bar: Upload Room Photo + Sample Room Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#1C1513] px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleRoomPhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#FAF6F0] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#1D1917] transition-colors hover:bg-[#E8DDD1]"
                >
                  <Upload className="h-3.5 w-3.5 text-[#921A1E]" />
                  <span>Upload Your Room Photo</span>
                </button>

                {SAMPLE_ROOM_ELEVATIONS.map((room) => {
                  const isCurrent =
                    inputMode === "photo" &&
                    !uploadedRoomDataUrl &&
                    activeSampleRoom.id === room.id;
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => {
                        setUploadedRoomDataUrl(null);
                        setUploadedRoomName(null);
                        setActiveSampleRoom(room);
                        setInputMode("photo");
                        setCorners(room.defaultCorners);
                      }}
                      className={cn(
                        "cursor-pointer rounded-full border px-3 py-1.5 text-[11px] transition-colors",
                        isCurrent
                          ? "border-[#921A1E] bg-[#921A1E]/25 text-[#FAF6F0]"
                          : "border-white/15 bg-white/5 text-[#D8C7B8] hover:border-white/30"
                      )}
                    >
                      {room.name}
                    </button>
                  );
                })}
              </div>

              {uploadError && (
                <p className="text-xs text-rose-300">{uploadError}</p>
              )}
            </div>
          </div>

          {/* Right Control Sidebar (4 columns) */}
          <div className="flex flex-col justify-between overflow-y-auto border-l border-white/10 bg-[#231715] p-5 lg:col-span-4">
            <div className="space-y-5">
              {/* 1. Artwork Quick Switcher */}
              <div>
                <label
                  htmlFor="studio-design-select"
                  className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E6B8B2]"
                >
                  Active ATELIER Artwork
                </label>
                <select
                  id="studio-design-select"
                  value={selectedDesign.id}
                  onChange={(e) => {
                    const next = DEVELOPMENT_FIXTURE_DESIGNS.find(
                      (d) => d.id === e.target.value
                    );
                    if (next) onSelectDesign(next);
                  }}
                  className="mt-2 w-full rounded-xl border border-white/15 bg-[#160F0E] px-3.5 py-2.5 text-sm text-[#FAF6F0] focus:border-[#921A1E] focus:outline-none"
                >
                  {DEVELOPMENT_FIXTURE_DESIGNS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} ({item.categoryLabel})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Application Mode: Full-Wall Mural vs Repeating Pattern */}
              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E6B8B2]">
                  Application Mode
                </span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setApplicationMode("mural")}
                    className={cn(
                      "flex cursor-pointer items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-medium transition-colors",
                      applicationMode === "mural"
                        ? "border-[#921A1E] bg-[#921A1E] text-white"
                        : "border-white/15 bg-white/5 text-[#D8C7B8] hover:border-white/30"
                    )}
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span>Full-Wall Mural</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setApplicationMode("pattern")}
                    className={cn(
                      "flex cursor-pointer items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-medium transition-colors",
                      applicationMode === "pattern"
                        ? "border-[#921A1E] bg-[#921A1E] text-white"
                        : "border-white/15 bg-white/5 text-[#D8C7B8] hover:border-white/30"
                    )}
                  >
                    <Grid className="h-3.5 w-3.5" />
                    <span>Repeating Pattern</span>
                  </button>
                </div>
              </div>

              {/* 3. Scale, Opacity & Lighting Sliders */}
              <div className="space-y-3.5 rounded-2xl border border-white/10 bg-[#18100F] p-4">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#E6B8B2]">
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Perspective & Surface Controls</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-[#D8C7B8]">
                    <span>Artwork Scale</span>
                    <span>{Math.round(scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={2.0}
                    step={0.05}
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="mt-1 w-full accent-[#921A1E]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-[#D8C7B8]">
                    <span>Wall Blend Opacity</span>
                    <span>{Math.round(opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.25}
                    max={1}
                    step={0.02}
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="mt-1 w-full accent-[#921A1E]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-[#D8C7B8]">
                    <span>Ambient Daylight Exposure</span>
                    <span>{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min={70}
                    max={130}
                    step={2}
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="mt-1 w-full accent-[#921A1E]"
                  />
                </div>

                {/* Orientation & Blend Toggles */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setBlendMultiply((v) => !v)}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] transition-colors",
                      blendMultiply
                        ? "border-[#921A1E] bg-[#921A1E]/25 text-white"
                        : "border-white/15 bg-white/5 text-[#D8C7B8]"
                    )}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Plaster Multiply Blend</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFlipHorizontal((v) => !v)}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] transition-colors",
                      flipHorizontal
                        ? "border-[#921A1E] bg-[#921A1E]/25 text-white"
                        : "border-white/15 bg-white/5 text-[#D8C7B8]"
                    )}
                  >
                    <FlipHorizontal className="h-3.5 w-3.5" />
                    <span>Mirror</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRotationQuarterTurns((r) => (r + 1) % 4)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] text-[#D8C7B8] hover:border-white/30"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Rotate 90°</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] text-[#D8C7B8] hover:border-white/30"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset Corners</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Export Snapshot & Enquire CTA Stack */}
            <div className="mt-6 space-y-2.5 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={handleExportSnapshot}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#921A1E] px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#FAF6F0] shadow-lg transition-colors hover:bg-[#761317]"
              >
                <Download className="h-4 w-4" />
                <span>Export Wall Preview Snapshot</span>
              </button>

              <Link
                href={`/contact?design=${encodeURIComponent(
                  selectedDesign.slug
                )}&title=${encodeURIComponent(
                  selectedDesign.title
                )}&category=${encodeURIComponent(selectedDesign.categoryLabel)}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#FAF6F0] transition-colors hover:bg-white/15"
              >
                <span>Enquire With This Design</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

