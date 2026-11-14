"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  resolveArtworkSourcePixels,
  resolvePrintableArtworkInfo,
} from "@/lib/artwork-source-crops";
import {
  CatalogueCategoryRecord,
  CatalogueDesignItem,
  DESIGN_CATEGORY_RECORDS,
  DEVELOPMENT_FIXTURE_DESIGNS,
} from "@/lib/designs-catalogue";
import {
  deleteSavedStudioProject,
  ForegroundMaskRect,
  formatCalibratedMeasurementSummary,
  loadSavedStudioProjects,
  saveStudioProjectToBrowser,
  StudioLayersState,
  StudioMeasurementState,
  StudioSavedProject,
  SurfaceFinishId,
} from "@/lib/visualizer-studio-storage";
import {
  ArtworkSwatchThumbnail,
  SelectedArtworkSelectorModal,
} from "@/components/visualizer/SelectedArtworkSelector";
import {
  InspectorPrimaryTab,
  StudioKeyboardShortcutsPopover,
  StudioNewSessionDialog,
  StudioRightInspector,
  StudioSavedPreviewsModal,
  StudioToolId,
} from "@/components/visualizer/VisualizerStudioPanels";
import { cn } from "@/lib/cn";
import {
  AlertTriangle,
  ArrowLeft,
  Bookmark,
  Camera,
  CameraOff,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Columns2,
  Eye,
  EyeOff,
  FolderHeart,
  Grid,
  Image as ImageIcon,
  Keyboard,
  Layers,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Ruler,
  Scan,
  Share2,
  Sliders,
  SquarePen,
  Sun,
  SwitchCamera,
  Target,
  Upload,
} from "lucide-react";

export interface Point2D {
  x: number; // normalized [0..1]
  y: number; // normalized [0..1]
}

export type QuadCorners = [Point2D, Point2D, Point2D, Point2D]; // TL, TR, BR, BL

export interface SampleRoomElevation {
  id: string;
  name: string;
  shortTitle?: string;
  subtitle: string;
  imageUrl: string;
  defaultCorners: QuadCorners;
}

/**
 * Index 0 remains `Cream Bedroom Wall` (`Modern Bedroom`) so the `/visualizer`
 * landing hero laptop preview matches its reference specification, while all 5
 * studio sample rooms are available with room-specific perspective quads.
 */
export const SAMPLE_ROOM_ELEVATIONS: ReadonlyArray<SampleRoomElevation> = [
  {
    id: "room-consultation-atelier",
    name: "Cream Bedroom Wall",
    shortTitle: "Modern Bedroom",
    subtitle: "Sunlit warm plaster elevation above an upholstered headboard",
    imageUrl: "/images/atelier/visualizer/visualizer-room-cream-bedroom.webp",
    defaultCorners: [
      { x: 0.17, y: 0.085 },
      { x: 0.83, y: 0.085 },
      { x: 0.83, y: 0.51 },
      { x: 0.17, y: 0.51 },
    ],
  },
  {
    id: "room-living-sunlit",
    name: "Sunlit Living Room Wall",
    shortTitle: "Sunlit Living Room",
    subtitle: "Warm neutral plaster elevation with natural daylight",
    imageUrl: "/images/atelier/visualizer/visualizer-room-neutral-living.webp",
    defaultCorners: [
      { x: 0.18, y: 0.105 },
      { x: 0.85, y: 0.12 },
      { x: 0.85, y: 0.61 },
      { x: 0.18, y: 0.615 },
    ],
  },
  {
    id: "room-dining-hospitality",
    name: "Dining Space Wall",
    shortTitle: "Dining Space",
    subtitle: "Warm hospitality dining banquette with bare ceramic tile wall",
    imageUrl: "/images/atelier/projects/tiles-hospitality-before.webp",
    defaultCorners: [
      { x: 0.08, y: 0.06 },
      { x: 0.74, y: 0.2 },
      { x: 0.74, y: 0.55 },
      { x: 0.08, y: 0.61 },
    ],
  },
  {
    id: "room-arch-alcove",
    name: "Angled Gallery Corridor",
    shortTitle: "Gallery Corridor",
    subtitle: "Long receding cream wall with architectural skylight",
    imageUrl: "/images/atelier/visualizer/visualizer-room-angled-gallery.webp",
    defaultCorners: [
      { x: 0.08, y: 0.1 },
      { x: 0.52, y: 0.27 },
      { x: 0.52, y: 0.58 },
      { x: 0.08, y: 0.84 },
    ],
  },
  {
    id: "room-office-lounge",
    name: "Office Lounge Wall",
    shortTitle: "Office Lounge",
    subtitle: "Contemporary architectural lounge with wide bare plaster wall",
    imageUrl: "/images/atelier/projects/walls-lotus-residence-before.webp",
    defaultCorners: [
      { x: 0.2, y: 0.1 },
      { x: 0.64, y: 0.1 },
      { x: 0.64, y: 0.62 },
      { x: 0.2, y: 0.62 },
    ],
  },
];

const STUDIO_GALLERY_ORDER = [
  "room-living-sunlit",
  "room-consultation-atelier",
  "room-dining-hospitality",
  "room-arch-alcove",
  "room-office-lounge",
];

const ORDERED_STUDIO_ROOMS: ReadonlyArray<SampleRoomElevation> =
  STUDIO_GALLERY_ORDER.map(
    (id) => SAMPLE_ROOM_ELEVATIONS.find((r) => r.id === id)!
  ).filter(Boolean);

interface InteractiveWallVisualizerModalProps {
  isOpen: boolean;
  initialMode: "camera" | "photo";
  initialSampleRoomId?: string;
  selectedDesign: CatalogueDesignItem;
  externalVisualizerUrl?: string;
  catalogueDesigns?: ReadonlyArray<CatalogueDesignItem>;
  catalogueCategories?: ReadonlyArray<CatalogueCategoryRecord>;
  onSelectDesign: (design: CatalogueDesignItem) => void;
  onClose: () => void;
  /** When "workstation", renders inline beneath the global ATELIER Navbar. */
  presentation?: "workstation" | "modal";
}

interface PlacementSnapshot {
  corners: QuadCorners;
  applicationMode: "mural" | "pattern";
  scale: number;
  patternRepeatScale: number;
  panX: number;
  panY: number;
  rotationDegrees: number;
  rotationQuarterTurns: number;
  flipHorizontal: boolean;
  opacity: number;
  brightness: number;
  blendMultiply: boolean;
  surfaceFinish: SurfaceFinishId;
  layers: StudioLayersState;
}

const DEFAULT_LAYERS_STATE: StudioLayersState = {
  artworkVisible: true,
  artworkLocked: false,
  guidesVisible: true,
  guidesLocked: false,
  foregroundMask: {
    enabled: false,
    x: 0.34,
    y: 0.54,
    w: 0.32,
    h: 0.22,
  },
};

function cloneCorners(c: QuadCorners): QuadCorners {
  return [
    { x: c[0].x, y: c[0].y },
    { x: c[1].x, y: c[1].y },
    { x: c[2].x, y: c[2].y },
    { x: c[3].x, y: c[3].y },
  ];
}

function cloneLayers(l: StudioLayersState): StudioLayersState {
  return {
    ...l,
    foregroundMask: { ...l.foregroundMask },
  };
}

function isConvexValidQuad(corners: QuadCorners): boolean {
  let sign = 0;
  for (let i = 0; i < 4; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % 4];
    const c = corners[(i + 2) % 4];
    const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    if (Math.abs(cross) < 1e-4) return false;
    const currentSign = cross > 0 ? 1 : -1;
    if (sign === 0) sign = currentSign;
    else if (sign !== currentSign) return false;
  }
  return true;
}

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

let cachedMicroGrainTile: HTMLCanvasElement | null = null;
function getMicroGrainPatternTile(): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  if (cachedMicroGrainTile) return cachedMicroGrainTile;
  const tile = document.createElement("canvas");
  tile.width = 48;
  tile.height = 48;
  const tCtx = tile.getContext("2d");
  if (!tCtx) return null;
  for (let y = 0; y < 48; y += 2) {
    for (let x = 0; x < 48; x += 2) {
      const hash = ((x * 73856093) ^ (y * 19349663)) & 255;
      const lum = 112 + (hash % 44);
      tCtx.fillStyle = `rgb(${lum}, ${lum - 4}, ${lum - 9})`;
      tCtx.fillRect(x, y, 2, 2);
    }
  }
  cachedMicroGrainTile = tile;
  return tile;
}

/**
 * Draws a subdivided perspective-warped quad onto a 2D canvas using projective
 * homography subdivision (16x16 grid = 512 perspective-correct triangles).
 * Maps ONLY the isolated printable wall-artwork source (`resolveArtworkSourcePixels`).
 */
export function drawPerspectiveWarpedArtwork(options: {
  ctx: CanvasRenderingContext2D;
  artworkImg: HTMLImageElement;
  corners: QuadCorners;
  canvasWidth: number;
  canvasHeight: number;
  mode: "mural" | "pattern";
  scale: number;
  patternRepeatScale?: number;
  panX?: number;
  panY?: number;
  rotationDegrees?: number;
  opacity: number;
  brightness: number;
  blendMultiply: boolean;
  surfaceFinish?: SurfaceFinishId;
  flipHorizontal: boolean;
  rotationQuarterTurns: number;
  splitCompareX?: number | null;
  foregroundMask?: ForegroundMaskRect | null;
}) {
  const {
    ctx,
    artworkImg,
    corners,
    canvasWidth,
    canvasHeight,
    mode,
    scale,
    patternRepeatScale = 1,
    panX = 0,
    panY = 0,
    rotationDegrees = 0,
    opacity,
    brightness,
    blendMultiply,
    surfaceFinish = "plaster",
    flipHorizontal,
    rotationQuarterTurns,
    splitCompareX = null,
    foregroundMask = null,
  } = options;

  const pixelCorners: QuadCorners = [
    { x: corners[0].x * canvasWidth, y: corners[0].y * canvasHeight },
    { x: corners[1].x * canvasWidth, y: corners[1].y * canvasHeight },
    { x: corners[2].x * canvasWidth, y: corners[2].y * canvasHeight },
    { x: corners[3].x * canvasWidth, y: corners[3].y * canvasHeight },
  ];

  const H = solveUnitSquareHomography(pixelCorners);
  if (!H) return;

  const topW = Math.hypot(
    pixelCorners[1].x - pixelCorners[0].x,
    pixelCorners[1].y - pixelCorners[0].y
  );
  const botW = Math.hypot(
    pixelCorners[2].x - pixelCorners[3].x,
    pixelCorners[2].y - pixelCorners[3].y
  );
  const leftH = Math.hypot(
    pixelCorners[3].x - pixelCorners[0].x,
    pixelCorners[3].y - pixelCorners[0].y
  );
  const rightH = Math.hypot(
    pixelCorners[2].x - pixelCorners[1].x,
    pixelCorners[2].y - pixelCorners[1].y
  );
  const wallAspect = Math.max(
    0.35,
    Math.min(3.2, (topW + botW) / Math.max(1, leftH + rightH))
  );

  const sourceCanvas = document.createElement("canvas");
  const srcW = 1024;
  const srcH = Math.max(512, Math.round(srcW / wallAspect));
  sourceCanvas.width = srcW;
  sourceCanvas.height = srcH;
  const sCtx = sourceCanvas.getContext("2d");
  if (!sCtx) return;

  const { sx, sy, sw, sh } = resolveArtworkSourcePixels(artworkImg);

  // Fill warm base tone behind rotated/scaled bounds so extreme scales/rotations never leave hard black gaps
  sCtx.fillStyle = "#EAE0D3";
  sCtx.fillRect(0, 0, srcW, srcH);

  sCtx.save();
  const filterParts: string[] = [];
  if (brightness !== 100) {
    filterParts.push(`brightness(${brightness}%)`);
  }
  if (surfaceFinish === "limewash") {
    filterParts.push("contrast(93%) saturate(92%)");
  } else if (surfaceFinish === "matte") {
    filterParts.push("contrast(102%)");
  } else if (surfaceFinish === "textured") {
    filterParts.push("contrast(104%)");
  }
  if (filterParts.length > 0) {
    sCtx.filter = filterParts.join(" ");
  }

  sCtx.translate(srcW / 2, srcH / 2);
  if (flipHorizontal) {
    sCtx.scale(-1, 1);
  }
  const quarter = ((rotationQuarterTurns % 4) + 4) % 4;
  const totalRadians =
    (quarter * Math.PI) / 2 + (rotationDegrees * Math.PI) / 180;
  if (Math.abs(totalRadians) > 1e-4) {
    sCtx.rotate(totalRadians);
  }
  sCtx.translate(-srcW / 2, -srcH / 2);

  const shiftX = panX * srcW * 0.45;
  const shiftY = panY * srcH * 0.45;

  if (mode === "pattern") {
    const effectiveScale = Math.max(0.3, scale * patternRepeatScale);
    const repeatX = Math.max(1, Math.round((3 * wallAspect) / effectiveScale));
    const repeatY = Math.max(1, Math.round(3 / effectiveScale));
    const tileW = srcW / repeatX;
    const tileH = srcH / repeatY;
    for (let row = -2; row <= repeatY + 1; row++) {
      for (let col = -2; col <= repeatX + 1; col++) {
        sCtx.drawImage(
          artworkImg,
          sx,
          sy,
          sw,
          sh,
          col * tileW + (shiftX % tileW),
          row * tileH + (shiftY % tileH),
          tileW + 1,
          tileH + 1
        );
      }
    }
  } else {
    const artAspect = sw / Math.max(1, sh);
    let baseW = srcW;
    let baseH = srcH;
    if (artAspect > wallAspect) {
      baseH = srcH;
      baseW = srcH * artAspect;
    } else {
      baseW = srcW;
      baseH = srcW / artAspect;
    }
    const rotCompensation =
      Math.abs(rotationDegrees) > 0.5
        ? 1 + Math.abs(Math.sin((rotationDegrees * Math.PI) / 180)) * 0.32
        : 1;
    const drawW = baseW * scale * rotCompensation;
    const drawH = baseH * scale * rotCompensation;
    const offsetX = (srcW - drawW) / 2 + shiftX;
    const offsetY = (srcH - drawH) / 2 + shiftY;
    sCtx.drawImage(artworkImg, sx, sy, sw, sh, offsetX, offsetY, drawW, drawH);
  }
  sCtx.restore();

  // Apply optional surface finish simulation inside sourceCanvas (non-destructive to room)
  if (surfaceFinish === "plaster") {
    sCtx.save();
    sCtx.globalCompositeOperation = "multiply";
    sCtx.fillStyle = "rgba(232, 218, 198, 0.14)";
    sCtx.fillRect(0, 0, srcW, srcH);
    sCtx.restore();
  } else if (surfaceFinish === "limewash") {
    sCtx.save();
    sCtx.globalCompositeOperation = "screen";
    sCtx.fillStyle = "rgba(246, 239, 229, 0.16)";
    sCtx.fillRect(0, 0, srcW, srcH);
    sCtx.restore();
  } else if (surfaceFinish === "textured") {
    const grainTile = getMicroGrainPatternTile();
    if (grainTile) {
      const pat = sCtx.createPattern(grainTile, "repeat");
      if (pat) {
        sCtx.save();
        sCtx.globalCompositeOperation = "overlay";
        sCtx.globalAlpha = 0.14;
        sCtx.fillStyle = pat;
        sCtx.fillRect(0, 0, srcW, srcH);
        sCtx.restore();
      }
    }
  }

  ctx.save();
  ctx.globalAlpha = Math.max(0.05, Math.min(1, opacity));
  const useMultiply =
    surfaceFinish === "matte" ? false : blendMultiply;
  ctx.globalCompositeOperation = useMultiply ? "multiply" : "source-over";

  // Optional split-wipe clip (right side shows After, left side reveals untouched Before)
  if (typeof splitCompareX === "number") {
    const splitPx = Math.max(
      0,
      Math.min(canvasWidth, splitCompareX * canvasWidth)
    );
    ctx.beginPath();
    ctx.rect(splitPx, 0, canvasWidth - splitPx, canvasHeight);
    ctx.clip();
  }

  // Clip strictly to the 4-corner wall polygon
  ctx.beginPath();
  ctx.moveTo(pixelCorners[0].x, pixelCorners[0].y);
  ctx.lineTo(pixelCorners[1].x, pixelCorners[1].y);
  ctx.lineTo(pixelCorners[2].x, pixelCorners[2].y);
  ctx.lineTo(pixelCorners[3].x, pixelCorners[3].y);
  ctx.closePath();
  ctx.clip();

  const meshCanvas = document.createElement("canvas");
  meshCanvas.width = canvasWidth;
  meshCanvas.height = canvasHeight;
  const mCtx = meshCanvas.getContext("2d");
  if (!mCtx) {
    ctx.restore();
    return;
  }

  const gridN = 16;
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

      const su0 = u0 * srcW;
      const sv0 = v0 * srcH;
      const su1 = u1 * srcW;
      const sv1 = v1 * srcH;

      drawTexturedTriangle(
        mCtx,
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
      drawTexturedTriangle(
        mCtx,
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

  // Optional manual foreground obstacle mask (keeps furniture/windows untouched)
  if (foregroundMask?.enabled) {
    mCtx.clearRect(
      foregroundMask.x * canvasWidth,
      foregroundMask.y * canvasHeight,
      foregroundMask.w * canvasWidth,
      foregroundMask.h * canvasHeight
    );
  }

  ctx.drawImage(meshCanvas, 0, 0);
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
  const cx = (x0 + x1 + x2) / 3;
  const cy = (y0 + y1 + y2) / 3;
  const expand = (px: number, py: number) => {
    const dx = px - cx;
    const dy = py - cy;
    const len = Math.hypot(dx, dy) || 1;
    return { x: px + (dx / len) * 0.75, y: py + (dy / len) * 0.75 };
  };
  const e0 = expand(x0, y0);
  const e1 = expand(x1, y1);
  const e2 = expand(x2, y2);

  ctx.beginPath();
  ctx.moveTo(e0.x, e0.y);
  ctx.lineTo(e1.x, e1.y);
  ctx.lineTo(e2.x, e2.y);
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

const LEFT_TOOL_RAIL_ITEMS: ReadonlyArray<{
  id: StudioToolId;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "map", label: "Map Wall", Icon: Scan },
  { id: "adjust", label: "Adjust", Icon: Sliders },
  { id: "compare", label: "Compare", Icon: Columns2 },
  { id: "layers", label: "Layers", Icon: Layers },
  { id: "measure", label: "Measure", Icon: Ruler },
  { id: "lighting", label: "Lighting", Icon: Sun },
  { id: "share", label: "Share", Icon: Share2 },
];

export function InteractiveWallVisualizerModal({
  isOpen,
  initialMode,
  initialSampleRoomId,
  selectedDesign,
  catalogueDesigns = DEVELOPMENT_FIXTURE_DESIGNS,
  catalogueCategories = DESIGN_CATEGORY_RECORDS,
  onSelectDesign,
  onClose,
  presentation = "workstation",
}: InteractiveWallVisualizerModalProps) {
  const studioRootRef = useRef<HTMLDivElement | null>(null);
  const sampleGalleryScrollRef = useRef<HTMLDivElement | null>(null);
  const inspectorContainerRef = useRef<HTMLDivElement | null>(null);

  const [inputMode, setInputMode] = useState<"camera" | "photo">(initialMode);
  const [prevOpenAndMode, setPrevOpenAndMode] = useState<string>(
    `${isOpen}:${initialMode}`
  );
  const openAndModeKey = `${isOpen}:${initialMode}`;
  if (openAndModeKey !== prevOpenAndMode) {
    setPrevOpenAndMode(openAndModeKey);
    if (isOpen) {
      setInputMode(initialMode);
    }
  }

  const resolvedInitialRoom = useMemo(
    () =>
      SAMPLE_ROOM_ELEVATIONS.find((r) => r.id === initialSampleRoomId) ||
      SAMPLE_ROOM_ELEVATIONS.find((r) => r.id === "room-living-sunlit") ||
      SAMPLE_ROOM_ELEVATIONS[0],
    [initialSampleRoomId]
  );

  // Room state
  const [activeSampleRoom, setActiveSampleRoom] =
    useState<SampleRoomElevation>(resolvedInitialRoom);
  const [prevInitialRoomId, setPrevInitialRoomId] = useState<string>(
    resolvedInitialRoom.id
  );
  const [uploadedRoomDataUrl, setUploadedRoomDataUrl] = useState<string | null>(
    null
  );
  const [uploadedRoomName, setUploadedRoomName] = useState<string | null>(null);
  const [roomDropdownOpen, setRoomDropdownOpen] = useState<boolean>(false);
  const [sampleGalleryExpanded, setSampleGalleryExpanded] =
    useState<boolean>(true);
  const [artworkPickerOpen, setArtworkPickerOpen] = useState<boolean>(false);

  // 4-corner coordinates in normalized [0..1] space
  const [corners, setCorners] = useState<QuadCorners>(() =>
    cloneCorners(resolvedInitialRoom.defaultCorners)
  );
  if (resolvedInitialRoom.id !== prevInitialRoomId) {
    setPrevInitialRoomId(resolvedInitialRoom.id);
    setActiveSampleRoom(resolvedInitialRoom);
    setUploadedRoomDataUrl(null);
    setUploadedRoomName(null);
    setCorners(cloneCorners(resolvedInitialRoom.defaultCorners));
  }

  const [selectedCornerIndex, setSelectedCornerIndex] = useState<number>(0);
  const [draggingCornerIndex, setDraggingCornerIndex] = useState<number | null>(
    null
  );
  const [draggingSplitBar, setDraggingSplitBar] = useState<boolean>(false);
  const [draggingMaskMode, setDraggingMaskMode] = useState<
    "move" | "resize" | null
  >(null);
  const maskDragOriginRef = useRef<{
    pointerX: number;
    pointerY: number;
    rect: ForegroundMaskRect;
  } | null>(null);

  // Studio Tool Rail & Right Inspector state
  const [activeTool, setActiveTool] = useState<StudioToolId>("map");
  const [activeInspectorTab, setActiveInspectorTab] =
    useState<InspectorPrimaryTab>("customize");

  // Centralized Artwork Adjustments & Surface Settings
  const [applicationMode, setApplicationMode] = useState<"mural" | "pattern">(
    selectedDesign.visualizerConfig.defaultMode
  );
  const [scale, setScale] = useState<number>(1);
  const [patternRepeatScale, setPatternRepeatScale] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [rotationDegrees, setRotationDegrees] = useState<number>(0);
  const [rotationQuarterTurns, setRotationQuarterTurns] = useState<number>(0);
  const [flipHorizontal, setFlipHorizontal] = useState<boolean>(false);
  const [opacity, setOpacity] = useState<number>(0.92);
  const [brightness, setBrightness] = useState<number>(100);
  const [blendMultiply, setBlendMultiply] = useState<boolean>(true);
  const [surfaceFinish, setSurfaceFinish] =
    useState<SurfaceFinishId>("plaster");
  const [layers, setLayers] = useState<StudioLayersState>(() =>
    cloneLayers(DEFAULT_LAYERS_STATE)
  );
  const [measurement, setMeasurement] = useState<StudioMeasurementState>({
    widthInput: "",
    heightInput: "",
    unit: "ft",
  });

  // Comparison, Export & Session Persistence
  const [showBeforeRoomOnly, setShowBeforeRoomOnly] = useState<boolean>(false);
  const [splitCompareEnabled, setSplitCompareEnabled] =
    useState<boolean>(false);
  const [splitCompareX, setSplitCompareX] = useState<number>(0.5);
  const [exportFormat, setExportFormat] = useState<"png" | "jpeg">("png");
  const [selectedEnquirySurface, setSelectedEnquirySurface] = useState<string>(
    selectedDesign.compatibleSurfaces[0] || "Walls"
  );
  const [savedProjects, setSavedProjects] = useState<StudioSavedProject[]>(() =>
    loadSavedStudioProjects()
  );
  const [savedPreviewsOpen, setSavedPreviewsOpen] = useState<boolean>(false);
  const [newSessionDialogOpen, setNewSessionDialogOpen] =
    useState<boolean>(false);
  const [shortcutsOpen, setShortcutsOpen] = useState<boolean>(false);
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);
  const [isSessionDirty, setIsSessionDirty] = useState<boolean>(false);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState<boolean>(false);
  const [isFallbackFullscreen, setIsFallbackFullscreen] =
    useState<boolean>(false);

  // Status banner / feedback toast
  const [studioNotice, setStudioNotice] = useState<{
    tone: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const showTransientNotice = useCallback(
    (tone: "success" | "error" | "info", text: string) => {
      setStudioNotice({ tone, text });
    },
    []
  );

  useEffect(() => {
    if (!studioNotice) return;
    const t = window.setTimeout(() => setStudioNotice(null), 4500);
    return () => window.clearTimeout(t);
  }, [studioNotice]);

  // Undo / Redo History
  const [historyPast, setHistoryPast] = useState<PlacementSnapshot[]>([]);
  const [historyFuture, setHistoryFuture] = useState<PlacementSnapshot[]>([]);
  const dragSnapshotRef = useRef<PlacementSnapshot | null>(null);

  const captureSnapshot = useCallback(
    (): PlacementSnapshot => ({
      corners: cloneCorners(corners),
      applicationMode,
      scale,
      patternRepeatScale,
      panX,
      panY,
      rotationDegrees,
      rotationQuarterTurns,
      flipHorizontal,
      opacity,
      brightness,
      blendMultiply,
      surfaceFinish,
      layers: cloneLayers(layers),
    }),
    [
      corners,
      applicationMode,
      scale,
      patternRepeatScale,
      panX,
      panY,
      rotationDegrees,
      rotationQuarterTurns,
      flipHorizontal,
      opacity,
      brightness,
      blendMultiply,
      surfaceFinish,
      layers,
    ]
  );

  const pushHistory = useCallback((snap: PlacementSnapshot) => {
    setHistoryPast((prev) => [...prev.slice(-24), snap]);
    setHistoryFuture([]);
    setIsSessionDirty(true);
  }, []);

  const applySnapshot = useCallback((snap: PlacementSnapshot) => {
    setCorners(cloneCorners(snap.corners));
    setApplicationMode(snap.applicationMode);
    setScale(snap.scale);
    setPatternRepeatScale(snap.patternRepeatScale);
    setPanX(snap.panX);
    setPanY(snap.panY);
    setRotationDegrees(snap.rotationDegrees);
    setRotationQuarterTurns(snap.rotationQuarterTurns);
    setFlipHorizontal(snap.flipHorizontal);
    setOpacity(snap.opacity);
    setBrightness(snap.brightness);
    setBlendMultiply(snap.blendMultiply);
    setSurfaceFinish(snap.surfaceFinish);
    setLayers(cloneLayers(snap.layers));
  }, []);

  const handleUndo = useCallback(() => {
    setHistoryPast((prev) => {
      if (prev.length === 0) return prev;
      const previous = prev[prev.length - 1];
      setHistoryFuture((f) => [captureSnapshot(), ...f.slice(0, 24)]);
      applySnapshot(previous);
      return prev.slice(0, -1);
    });
  }, [applySnapshot, captureSnapshot]);

  const handleRedo = useCallback(() => {
    setHistoryFuture((prev) => {
      if (prev.length === 0) return prev;
      const [nextSnap, ...rest] = prev;
      setHistoryPast((p) => [...p.slice(-24), captureSnapshot()]);
      applySnapshot(nextSnap);
      return rest;
    });
  }, [applySnapshot, captureSnapshot]);

  // Sync design-dependent defaults while preserving valid room & wall mapping
  const [prevDesignId, setPrevDesignId] = useState(selectedDesign.id);
  if (selectedDesign.id !== prevDesignId) {
    setPrevDesignId(selectedDesign.id);
    setApplicationMode(selectedDesign.visualizerConfig.defaultMode);
    setSelectedEnquirySurface(selectedDesign.compatibleSurfaces[0] || "Walls");
  }

  const printableInfo = useMemo(
    () => resolvePrintableArtworkInfo(selectedDesign),
    [selectedDesign]
  );

  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<
    "idle" | "requesting" | "active" | "stopped" | "denied"
  >("idle");
  const [cameraFacingMode, setCameraFacingMode] = useState<
    "environment" | "user"
  >("environment");
  const [cameraStopped, setCameraStopped] = useState<boolean>(false);
  const [frozenFrameDataUrl, setFrozenFrameDataUrl] = useState<string | null>(
    null
  );
  const [frozenFrameImgEl, setFrozenFrameImgEl] =
    useState<HTMLImageElement | null>(null);
  const [cameraErrorMsg, setCameraErrorMsg] = useState<string | null>(null);
  const [videoNaturalSize, setVideoNaturalSize] = useState<{
    w: number;
    h: number;
  } | null>(null);

  // Loaded HTMLImageElements for canvas rendering
  const [artworkImageEl, setArtworkImageEl] =
    useState<HTMLImageElement | null>(null);
  const [roomImageEl, setRoomImageEl] = useState<HTMLImageElement | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeRoomImageUrl =
    uploadedRoomDataUrl || activeSampleRoom.imageUrl;

  const activeRoomLabel = useMemo(() => {
    if (inputMode === "camera") {
      return frozenFrameDataUrl ? "Frozen Camera Frame" : "Live Camera View";
    }
    if (uploadedRoomName) {
      return `Uploaded: ${uploadedRoomName}`;
    }
    return activeSampleRoom.shortTitle || activeSampleRoom.name;
  }, [activeSampleRoom, frozenFrameDataUrl, inputMode, uploadedRoomName]);

  // Compute natural aspect ratio of current background room or camera feed to prevent stretching
  const activeMediaDimensions = useMemo(() => {
    if (inputMode === "camera") {
      if (frozenFrameImgEl && frozenFrameImgEl.naturalWidth > 0) {
        return {
          w: frozenFrameImgEl.naturalWidth,
          h: frozenFrameImgEl.naturalHeight,
        };
      }
      if (videoNaturalSize && videoNaturalSize.w > 0) {
        return videoNaturalSize;
      }
      return { w: 1600, h: 1000 };
    }
    if (roomImageEl && roomImageEl.naturalWidth > 0) {
      return { w: roomImageEl.naturalWidth, h: roomImageEl.naturalHeight };
    }
    return { w: 1600, h: 1000 };
  }, [frozenFrameImgEl, inputMode, roomImageEl, videoNaturalSize]);

  const mediaAspectRatio = useMemo(() => {
    const raw =
      activeMediaDimensions.w / Math.max(1, activeMediaDimensions.h);
    return Math.max(0.55, Math.min(2.4, raw));
  }, [activeMediaDimensions]);

  // Load selected printable artwork image
  useEffect(() => {
    if (!isOpen || !printableInfo.hasValidPrintableSource) return;
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!cancelled) setArtworkImageEl(img);
    };
    img.onerror = () => {
      if (!cancelled) {
        setArtworkImageEl(null);
        showTransientNotice(
          "error",
          "Could not load printable artwork asset for preview."
        );
      }
    };
    img.src = printableInfo.printableImageUrl;
    return () => {
      cancelled = true;
    };
  }, [
    isOpen,
    printableInfo.hasValidPrintableSource,
    printableInfo.printableImageUrl,
    showTransientNotice,
  ]);

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

  // Load frozen camera frame image element
  useEffect(() => {
    if (!frozenFrameDataUrl) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setFrozenFrameImgEl(img);
    };
    img.src = frozenFrameDataUrl;
    return () => {
      cancelled = true;
    };
  }, [frozenFrameDataUrl]);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Start camera stream ONLY when studio is open AND inputMode === "camera" AND !cameraStopped
  useEffect(() => {
    if (!isOpen || inputMode !== "camera" || cameraStopped) {
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
            "Live camera access is unavailable on this browser or device. Upload a room photo or select a sample room below."
          );
        }
        return;
      }

      setCameraState("requesting");
      setCameraErrorMsg(null);

      let mediaStream: MediaStream | null = null;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: cameraFacingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch {
          if (!cancelled) {
            setCameraState("denied");
            setCameraErrorMsg(
              "Camera permission was declined or no camera hardware was detected. Upload a room photo or choose a sample room below."
            );
          }
          return;
        }
      }

      if (cancelled) {
        mediaStream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current && videoRef.current.videoWidth > 0) {
            setVideoNaturalSize({
              w: videoRef.current.videoWidth,
              h: videoRef.current.videoHeight,
            });
          }
        };
        await videoRef.current.play().catch(() => {});
      }
      setCameraState("active");
    }

    initCamera();

    return () => {
      cancelled = true;
      stopCameraStream();
    };
  }, [isOpen, inputMode, cameraFacingMode, cameraStopped, stopCameraStream]);

  // Native Fullscreen synchronization
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onFsChange = () => {
      setIsNativeFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const isFullscreenActive = isNativeFullscreen || isFallbackFullscreen;

  const handleToggleFullscreen = useCallback(async () => {
    if (typeof document === "undefined") return;
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
      return;
    }
    if (isFallbackFullscreen) {
      setIsFallbackFullscreen(false);
      return;
    }
    const target = studioRootRef.current;
    if (target && typeof target.requestFullscreen === "function") {
      try {
        await target.requestFullscreen();
        return;
      } catch {
        // Fallback when browser denies or lacks native element fullscreen (e.g. iOS Safari)
      }
    }
    setIsFallbackFullscreen(true);
    showTransientNotice(
      "info",
      "Expanded studio to full browser viewport (native fullscreen unavailable in this browser)."
    );
  }, [isFallbackFullscreen, showTransientNotice]);

  // Freeze / Resume camera frame
  const handleToggleFreezeFrame = useCallback(() => {
    if (frozenFrameDataUrl) {
      setFrozenFrameDataUrl(null);
      setFrozenFrameImgEl(null);
      return;
    }
    const video = videoRef.current;
    if (!video || video.videoWidth <= 0 || video.videoHeight <= 0) return;
    const snap = document.createElement("canvas");
    snap.width = video.videoWidth;
    snap.height = video.videoHeight;
    const sCtx = snap.getContext("2d");
    if (!sCtx) return;
    sCtx.drawImage(video, 0, 0, snap.width, snap.height);
    setFrozenFrameDataUrl(snap.toDataURL("image/jpeg", 0.92));
  }, [frozenFrameDataUrl]);

  const handleToggleStopStartCamera = useCallback(() => {
    if (cameraStopped) {
      setCameraStopped(false);
    } else {
      stopCameraStream();
      setFrozenFrameDataUrl(null);
      setFrozenFrameImgEl(null);
      setCameraStopped(true);
      setCameraState("stopped");
    }
  }, [cameraStopped, stopCameraStream]);

  const handleSwitchCameraFacing = useCallback(() => {
    setFrozenFrameDataUrl(null);
    setFrozenFrameImgEl(null);
    setCameraStopped(false);
    setCameraFacingMode((prev) =>
      prev === "environment" ? "user" : "environment"
    );
  }, []);

  // Render perspective-warped artwork onto the overlay canvas
  const renderOverlay = useCallback(() => {
    const canvas = overlayCanvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    const rect = stage.getBoundingClientRect();
    const dpr =
      typeof window !== "undefined"
        ? Math.min(window.devicePixelRatio || 1, 2)
        : 1;
    const w = Math.max(320, Math.round(rect.width * dpr));
    const h = Math.max(220, Math.round(rect.height * dpr));

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);

    if (
      showBeforeRoomOnly ||
      !layers.artworkVisible ||
      !printableInfo.hasValidPrintableSource ||
      !artworkImageEl
    ) {
      return;
    }

    drawPerspectiveWarpedArtwork({
      ctx,
      artworkImg: artworkImageEl,
      corners,
      canvasWidth: w,
      canvasHeight: h,
      mode: applicationMode,
      scale,
      patternRepeatScale,
      panX,
      panY,
      rotationDegrees,
      opacity,
      brightness,
      blendMultiply,
      surfaceFinish,
      flipHorizontal,
      rotationQuarterTurns,
      splitCompareX: splitCompareEnabled ? splitCompareX : null,
      foregroundMask: layers.foregroundMask,
    });
  }, [
    artworkImageEl,
    printableInfo.hasValidPrintableSource,
    corners,
    applicationMode,
    scale,
    patternRepeatScale,
    panX,
    panY,
    rotationDegrees,
    opacity,
    brightness,
    blendMultiply,
    surfaceFinish,
    flipHorizontal,
    rotationQuarterTurns,
    showBeforeRoomOnly,
    layers,
    splitCompareEnabled,
    splitCompareX,
  ]);

  useEffect(() => {
    if (!isOpen) return;
    const raf = requestAnimationFrame(() => {
      renderOverlay();
    });
    return () => cancelAnimationFrame(raf);
  }, [isOpen, renderOverlay]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!isOpen || !stage || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      renderOverlay();
    });
    ro.observe(stage);
    return () => ro.disconnect();
  }, [isOpen, renderOverlay]);

  // Keyboard shortcuts (Section 30): never intercept while typing in form inputs
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTextField =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (e.key === "Escape") {
        if (shortcutsOpen) {
          setShortcutsOpen(false);
          return;
        }
        if (roomDropdownOpen) {
          setRoomDropdownOpen(false);
          return;
        }
        if (newSessionDialogOpen) {
          setNewSessionDialogOpen(false);
          return;
        }
        if (savedPreviewsOpen) {
          setSavedPreviewsOpen(false);
          return;
        }
        if (artworkPickerOpen) {
          setArtworkPickerOpen(false);
          return;
        }
        if (isFallbackFullscreen) {
          setIsFallbackFullscreen(false);
          return;
        }
        if (!document.fullscreenElement) {
          onClose();
        }
        return;
      }

      if (isTextField) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
        return;
      }

      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        layers.foregroundMask.enabled
      ) {
        e.preventDefault();
        pushHistory(captureSnapshot());
        setLayers((prev) => ({
          ...prev,
          foregroundMask: { ...prev.foregroundMask, enabled: false },
        }));
        showTransientNotice("info", "Foreground obstacle mask removed.");
        return;
      }

      if (
        !layers.guidesLocked &&
        layers.guidesVisible &&
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
      ) {
        e.preventDefault();
        const delta = e.shiftKey ? 0.015 : 0.004;
        const dx =
          e.key === "ArrowLeft" ? -delta : e.key === "ArrowRight" ? delta : 0;
        const dy =
          e.key === "ArrowUp" ? -delta : e.key === "ArrowDown" ? delta : 0;
        setCorners((prev) => {
          const candidate = cloneCorners(prev);
          const pt = candidate[selectedCornerIndex];
          candidate[selectedCornerIndex] = {
            x: Math.max(0.01, Math.min(0.99, pt.x + dx)),
            y: Math.max(0.01, Math.min(0.99, pt.y + dy)),
          };
          return isConvexValidQuad(candidate) ? candidate : prev;
        });
        setIsSessionDirty(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    isOpen,
    shortcutsOpen,
    roomDropdownOpen,
    newSessionDialogOpen,
    savedPreviewsOpen,
    artworkPickerOpen,
    isFallbackFullscreen,
    onClose,
    handleUndo,
    handleRedo,
    layers,
    selectedCornerIndex,
    pushHistory,
    captureSnapshot,
    showTransientNotice,
  ]);

  // Pointer dragging for 4 wall corners, split-comparison bar, and optional foreground mask
  const handleStagePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!stageRef.current) return;
      const rect = stageRef.current.getBoundingClientRect();
      const nx = Math.max(
        0.01,
        Math.min(0.99, (e.clientX - rect.left) / rect.width)
      );
      const ny = Math.max(
        0.01,
        Math.min(0.99, (e.clientY - rect.top) / rect.height)
      );

      if (draggingSplitBar) {
        setSplitCompareX(Math.max(0.05, Math.min(0.95, nx)));
        return;
      }

      if (draggingMaskMode && maskDragOriginRef.current) {
        const orig = maskDragOriginRef.current;
        const dx = nx - orig.pointerX;
        const dy = ny - orig.pointerY;
        if (draggingMaskMode === "move") {
          const nextX = Math.max(
            0,
            Math.min(1 - orig.rect.w, orig.rect.x + dx)
          );
          const nextY = Math.max(
            0,
            Math.min(1 - orig.rect.h, orig.rect.y + dy)
          );
          setLayers((prev) => ({
            ...prev,
            foregroundMask: { ...prev.foregroundMask, x: nextX, y: nextY },
          }));
        } else {
          const nextW = Math.max(
            0.06,
            Math.min(0.95 - orig.rect.x, orig.rect.w + dx)
          );
          const nextH = Math.max(
            0.06,
            Math.min(0.95 - orig.rect.y, orig.rect.h + dy)
          );
          setLayers((prev) => ({
            ...prev,
            foregroundMask: { ...prev.foregroundMask, w: nextW, h: nextH },
          }));
        }
        setIsSessionDirty(true);
        return;
      }

      if (draggingCornerIndex === null || layers.guidesLocked) return;
      setCorners((prev) => {
        const candidate: QuadCorners = cloneCorners(prev);
        candidate[draggingCornerIndex] = { x: nx, y: ny };
        return isConvexValidQuad(candidate) ? candidate : prev;
      });
    },
    [draggingCornerIndex, draggingMaskMode, draggingSplitBar, layers.guidesLocked]
  );

  const handleStagePointerUp = useCallback(() => {
    if (draggingCornerIndex !== null) {
      if (dragSnapshotRef.current) {
        pushHistory(dragSnapshotRef.current);
        dragSnapshotRef.current = null;
      }
      setDraggingCornerIndex(null);
    }
    if (draggingSplitBar) {
      setDraggingSplitBar(false);
    }
    if (draggingMaskMode) {
      if (dragSnapshotRef.current) {
        pushHistory(dragSnapshotRef.current);
        dragSnapshotRef.current = null;
      }
      setDraggingMaskMode(null);
      maskDragOriginRef.current = null;
    }
  }, [draggingCornerIndex, draggingMaskMode, draggingSplitBar, pushHistory]);

  // Room selection & private room photo upload
  const handleSelectSampleRoom = useCallback(
    (room: SampleRoomElevation) => {
      pushHistory(captureSnapshot());
      setActiveSampleRoom(room);
      setUploadedRoomDataUrl(null);
      setUploadedRoomName(null);
      setInputMode("photo");
      setCorners(cloneCorners(room.defaultCorners));
      setShowBeforeRoomOnly(false);
      setRoomDropdownOpen(false);
    },
    [captureSnapshot, pushHistory]
  );

  const handleRoomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/avif",
    ];
    if (!validTypes.includes(file.type.toLowerCase())) {
      showTransientNotice(
        "error",
        "Unsupported format. Please choose a JPG, PNG, WEBP, or AVIF room photo."
      );
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      showTransientNotice(
        "error",
        "Room photo exceeds 25 MB. Please upload a smaller image."
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        pushHistory(captureSnapshot());
        setUploadedRoomDataUrl(reader.result);
        setUploadedRoomName(file.name.replace(/\.[^/.]+$/, ""));
        setInputMode("photo");
        setShowBeforeRoomOnly(false);
        setRoomDropdownOpen(false);
        setCorners([
          { x: 0.18, y: 0.12 },
          { x: 0.82, y: 0.12 },
          { x: 0.82, y: 0.66 },
          { x: 0.18, y: 0.66 },
        ]);
        showTransientNotice(
          "success",
          "Room photo loaded privately in your browser — drag the 4 corner pins to fit your wall."
        );
      }
    };
    reader.onerror = () => {
      showTransientNotice(
        "error",
        "Could not read the selected image file. Existing studio state preserved."
      );
    };
    reader.readAsDataURL(file);
  };

  const handleResetAdjustmentsOnly = useCallback(() => {
    pushHistory(captureSnapshot());
    setScale(1);
    setPatternRepeatScale(1);
    setPanX(0);
    setPanY(0);
    setRotationDegrees(0);
    setRotationQuarterTurns(0);
    setFlipHorizontal(false);
    setOpacity(0.92);
    setBrightness(100);
    setBlendMultiply(true);
    setSurfaceFinish("plaster");
    setShowBeforeRoomOnly(false);
  }, [captureSnapshot, pushHistory]);

  const handleRestoreDefaultCorners = useCallback(() => {
    pushHistory(captureSnapshot());
    if (uploadedRoomDataUrl) {
      setCorners([
        { x: 0.18, y: 0.12 },
        { x: 0.82, y: 0.12 },
        { x: 0.82, y: 0.66 },
        { x: 0.18, y: 0.66 },
      ]);
    } else if (inputMode === "camera") {
      setCorners([
        { x: 0.2, y: 0.16 },
        { x: 0.8, y: 0.16 },
        { x: 0.8, y: 0.68 },
        { x: 0.2, y: 0.68 },
      ]);
    } else {
      setCorners(cloneCorners(activeSampleRoom.defaultCorners));
    }
  }, [
    activeSampleRoom.defaultCorners,
    captureSnapshot,
    inputMode,
    pushHistory,
    uploadedRoomDataUrl,
  ]);

  // Build composite canvas at native/target resolution (shared by Export Snapshot & Save Project thumbnail)
  const renderCompositeOffscreen = useCallback(
    (maxWidthCap?: number): HTMLCanvasElement | null => {
      const srcW = activeMediaDimensions.w;
      const srcH = activeMediaDimensions.h;
      const ratio = srcW / Math.max(1, srcH);

      let outW = srcW;
      let outH = srcH;
      if (maxWidthCap && outW > maxWidthCap) {
        outW = maxWidthCap;
        outH = Math.max(1, Math.round(outW / ratio));
      }

      const offscreen = document.createElement("canvas");
      offscreen.width = outW;
      offscreen.height = outH;
      const ctx = offscreen.getContext("2d");
      if (!ctx) return null;

      if (inputMode === "camera" && frozenFrameImgEl) {
        ctx.drawImage(frozenFrameImgEl, 0, 0, outW, outH);
      } else if (
        inputMode === "camera" &&
        cameraState === "active" &&
        videoRef.current &&
        videoRef.current.videoWidth > 0
      ) {
        ctx.drawImage(videoRef.current, 0, 0, outW, outH);
      } else if (roomImageEl) {
        ctx.drawImage(roomImageEl, 0, 0, outW, outH);
      } else {
        ctx.fillStyle = "#FAF6F0";
        ctx.fillRect(0, 0, outW, outH);
      }

      if (
        !showBeforeRoomOnly &&
        layers.artworkVisible &&
        printableInfo.hasValidPrintableSource &&
        artworkImageEl
      ) {
        drawPerspectiveWarpedArtwork({
          ctx,
          artworkImg: artworkImageEl,
          corners,
          canvasWidth: outW,
          canvasHeight: outH,
          mode: applicationMode,
          scale,
          patternRepeatScale,
          panX,
          panY,
          rotationDegrees,
          opacity,
          brightness,
          blendMultiply,
          surfaceFinish,
          flipHorizontal,
          rotationQuarterTurns,
          foregroundMask: layers.foregroundMask,
        });
      }

      return offscreen;
    },
    [
      activeMediaDimensions,
      inputMode,
      frozenFrameImgEl,
      cameraState,
      roomImageEl,
      showBeforeRoomOnly,
      layers,
      printableInfo.hasValidPrintableSource,
      artworkImageEl,
      corners,
      applicationMode,
      scale,
      patternRepeatScale,
      panX,
      panY,
      rotationDegrees,
      opacity,
      brightness,
      blendMultiply,
      surfaceFinish,
      flipHorizontal,
      rotationQuarterTurns,
    ]
  );

  // Clean High-Resolution Snapshot Export (Section 26)
  const handleExportSnapshot = useCallback(() => {
    if (!printableInfo.hasValidPrintableSource || !artworkImageEl) {
      showTransientNotice(
        "error",
        "Export unavailable because this design does not have an isolated printable artwork source."
      );
      return;
    }

    try {
      const composite = renderCompositeOffscreen();
      if (!composite) {
        showTransientNotice("error", "Could not initialize export canvas.");
        return;
      }

      const mime = exportFormat === "jpeg" ? "image/jpeg" : "image/png";
      const ext = exportFormat === "jpeg" ? "jpg" : "png";
      const dataUrl =
        exportFormat === "jpeg"
          ? composite.toDataURL(mime, 0.94)
          : composite.toDataURL(mime);

      const link = document.createElement("a");
      link.download = `atelier-wall-preview-${selectedDesign.slug}.${ext}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showTransientNotice(
        "success",
        `Exported clean ${composite.width}×${composite.height} ${ext.toUpperCase()} preview — ready to share with our Mumbai studio.`
      );
    } catch (err) {
      const reason =
        err instanceof Error ? err.message : "Cross-origin or memory error";
      showTransientNotice("error", `Snapshot export failed: ${reason}`);
    }
  }, [
    artworkImageEl,
    exportFormat,
    printableInfo.hasValidPrintableSource,
    renderCompositeOffscreen,
    selectedDesign.slug,
    showTransientNotice,
  ]);

  // Save Project to Browser Guest Draft Storage (Section 28)
  const handleSaveProject = useCallback((): boolean => {
    let thumbUrl: string | null = null;
    try {
      const thumbCanvas = renderCompositeOffscreen(480);
      if (thumbCanvas) {
        thumbUrl = thumbCanvas.toDataURL("image/jpeg", 0.78);
      }
    } catch {
      thumbUrl = null;
    }

    const project: StudioSavedProject = {
      id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      savedAt: new Date().toISOString(),
      designId: selectedDesign.id,
      designSlug: selectedDesign.slug,
      designTitle: selectedDesign.title,
      categoryLabel: selectedDesign.categoryLabel,
      roomSourceKind:
        inputMode === "camera"
          ? "camera"
          : uploadedRoomDataUrl
            ? "upload"
            : "sample",
      sampleRoomId: activeSampleRoom.id,
      roomLabel: activeRoomLabel,
      corners: cloneCorners(corners),
      applicationMode,
      scale,
      patternRepeatScale,
      panX,
      panY,
      rotationDegrees,
      rotationQuarterTurns,
      flipHorizontal,
      opacity,
      brightness,
      blendMultiply,
      surfaceFinish,
      layers: cloneLayers(layers),
      measurement: { ...measurement },
      previewThumbnailDataUrl: thumbUrl,
    };

    const res = saveStudioProjectToBrowser(project);
    if (!res.ok) {
      showTransientNotice("error", res.error);
      return false;
    }

    setSavedProjects(res.projects);
    setIsSessionDirty(false);
    showTransientNotice(
      "success",
      `Saved "${selectedDesign.title}" to My Previews (stored as a local browser draft on this device).`
    );
    return true;
  }, [
    activeRoomLabel,
    activeSampleRoom.id,
    applicationMode,
    blendMultiply,
    brightness,
    corners,
    flipHorizontal,
    inputMode,
    layers,
    measurement,
    opacity,
    panX,
    panY,
    patternRepeatScale,
    renderCompositeOffscreen,
    rotationDegrees,
    rotationQuarterTurns,
    scale,
    selectedDesign,
    showTransientNotice,
    surfaceFinish,
    uploadedRoomDataUrl,
  ]);

  const handleLoadSavedProject = useCallback(
    (proj: StudioSavedProject) => {
      const matchedDesign = catalogueDesigns.find(
        (d) => d.id === proj.designId || d.slug === proj.designSlug
      );
      if (matchedDesign) {
        onSelectDesign(matchedDesign);
      }
      const matchedRoom = SAMPLE_ROOM_ELEVATIONS.find(
        (r) => r.id === proj.sampleRoomId
      );
      if (matchedRoom) {
        setActiveSampleRoom(matchedRoom);
      }
      setUploadedRoomDataUrl(null);
      setUploadedRoomName(null);
      setInputMode(proj.roomSourceKind === "camera" ? "camera" : "photo");
      setCorners(cloneCorners(proj.corners));
      setApplicationMode(proj.applicationMode);
      setScale(proj.scale);
      setPatternRepeatScale(proj.patternRepeatScale ?? 1);
      setPanX(proj.panX);
      setPanY(proj.panY);
      setRotationDegrees(proj.rotationDegrees ?? 0);
      setRotationQuarterTurns(proj.rotationQuarterTurns ?? 0);
      setFlipHorizontal(proj.flipHorizontal);
      setOpacity(proj.opacity);
      setBrightness(proj.brightness);
      setBlendMultiply(proj.blendMultiply);
      setSurfaceFinish(proj.surfaceFinish || "plaster");
      setLayers(cloneLayers(proj.layers || DEFAULT_LAYERS_STATE));
      setMeasurement(
        proj.measurement || { widthInput: "", heightInput: "", unit: "ft" }
      );
      setShowBeforeRoomOnly(false);
      setIsSessionDirty(false);
      showTransientNotice(
        "success",
        `Loaded saved preview "${proj.designTitle}".`
      );
    },
    [catalogueDesigns, onSelectDesign, showTransientNotice]
  );

  const handleDeleteSavedProject = useCallback((projectId: string) => {
    setSavedProjects(deleteSavedStudioProject(projectId));
  }, []);

  const performFreshSessionReset = useCallback(() => {
    const defaultRoom =
      SAMPLE_ROOM_ELEVATIONS.find((r) => r.id === "room-living-sunlit") ||
      SAMPLE_ROOM_ELEVATIONS[0];
    setActiveSampleRoom(defaultRoom);
    setUploadedRoomDataUrl(null);
    setUploadedRoomName(null);
    setFrozenFrameDataUrl(null);
    setFrozenFrameImgEl(null);
    setInputMode("photo");
    setCorners(cloneCorners(defaultRoom.defaultCorners));
    setApplicationMode(selectedDesign.visualizerConfig.defaultMode);
    setScale(1);
    setPatternRepeatScale(1);
    setPanX(0);
    setPanY(0);
    setRotationDegrees(0);
    setRotationQuarterTurns(0);
    setFlipHorizontal(false);
    setOpacity(0.92);
    setBrightness(100);
    setBlendMultiply(true);
    setSurfaceFinish("plaster");
    setLayers(cloneLayers(DEFAULT_LAYERS_STATE));
    setMeasurement({ widthInput: "", heightInput: "", unit: "ft" });
    setShowBeforeRoomOnly(false);
    setSplitCompareEnabled(false);
    setHistoryPast([]);
    setHistoryFuture([]);
    setIsSessionDirty(false);
    setNewSessionDialogOpen(false);
    showTransientNotice("info", "Started a fresh studio workspace session.");
  }, [selectedDesign.visualizerConfig.defaultMode, showTransientNotice]);

  const handleClickNewSession = useCallback(() => {
    if (isSessionDirty) {
      setNewSessionDialogOpen(true);
      return;
    }
    performFreshSessionReset();
  }, [isSessionDirty, performFreshSessionReset]);

  const handleCopyShareLink = useCallback(async () => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    params.set("studio", "1");
    params.set("design", selectedDesign.slug);
    params.set("title", selectedDesign.title);
    params.set("slot", String(selectedDesign.categorySlotNumber));
    params.set("category", selectedDesign.categoryLabel);
    params.set("room", activeSampleRoom.id);
    const url = `${window.location.origin}/visualizer?${params.toString()}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedShareLink(true);
      window.setTimeout(() => setCopiedShareLink(false), 2500);
      showTransientNotice(
        "success",
        "Visualizer studio link copied to clipboard."
      );
    } catch {
      showTransientNotice("error", "Clipboard access was blocked by browser.");
    }
  }, [activeSampleRoom.id, selectedDesign, showTransientNotice]);

  // Tool Rail Dispatcher (Section 10)
  const handleSelectTool = useCallback(
    (tool: StudioToolId) => {
      setActiveTool(tool);
      if (tool === "map") {
        setShowBeforeRoomOnly(false);
        setLayers((prev) => ({ ...prev, guidesVisible: true }));
        setActiveInspectorTab("customize");
      } else if (tool === "adjust") {
        setShowBeforeRoomOnly(false);
        setActiveInspectorTab("customize");
      } else if (tool === "compare") {
        setShowBeforeRoomOnly(false);
        setSplitCompareEnabled((prev) => !prev);
      } else if (tool === "layers") {
        setActiveInspectorTab("customize");
      } else if (tool === "measure") {
        setActiveInspectorTab("customize");
      } else if (tool === "lighting") {
        setShowBeforeRoomOnly(false);
        setActiveInspectorTab("customize");
      } else if (tool === "share") {
        setActiveInspectorTab("export");
      }

      if (typeof window !== "undefined" && window.innerWidth < 1024 && tool !== "map" && tool !== "compare") {
        inspectorContainerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    },
    []
  );

  const calibratedMeasurement = useMemo(
    () => formatCalibratedMeasurementSummary(measurement),
    [measurement]
  );

  // Build `/contact` enquiry URL preserving design, surface, mode, and optional dimensions (Section 27)
  const enquiryHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set("design", selectedDesign.slug);
    params.set("designId", selectedDesign.id);
    params.set("title", selectedDesign.title);
    params.set("category", selectedDesign.categoryLabel);
    params.set("mode", applicationMode);
    if (selectedEnquirySurface) {
      params.set("surface", selectedEnquirySurface);
    }
    if (calibratedMeasurement.queryValue) {
      params.set("dimensions", calibratedMeasurement.queryValue);
    }
    return `/contact?${params.toString()}`;
  }, [
    applicationMode,
    calibratedMeasurement.queryValue,
    selectedDesign,
    selectedEnquirySurface,
  ]);

  const cornerLabels = useMemo(
    () => ["01 TL", "02 TR", "03 BR", "04 BL"],
    []
  );

  const scrollSampleGallery = (dir: -1 | 1) => {
    const el = sampleGalleryScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 240, behavior: "smooth" });
  };

  if (!isOpen) return null;

  const canInteractWithWall =
    inputMode === "photo" ||
    cameraState === "active" ||
    Boolean(frozenFrameDataUrl);

  const activeWorkflowStep =
    activeTool === "share" || activeInspectorTab === "export"
      ? "share"
      : activeTool === "compare" || showBeforeRoomOnly || splitCompareEnabled
        ? "preview"
        : activeTool === "adjust" ||
            activeTool === "lighting" ||
            activeTool === "layers" ||
            activeTool === "measure"
          ? "customize"
          : "map";

  const studioShellContent = (
    <div
      ref={studioRootRef}
      role={presentation === "modal" ? "dialog" : "region"}
      aria-modal={presentation === "modal" ? true : undefined}
      aria-label={`Wall Visualizer Studio — ${selectedDesign.title}`}
      className={cn(
        "w-full bg-[#FAF6F0] text-[#1A1A1A]",
        isFullscreenActive
          ? "fixed inset-0 z-[105] overflow-y-auto p-2 sm:p-4"
          : presentation === "modal"
            ? "fixed inset-0 z-[100] overflow-y-auto bg-[#181210]/80 p-2 sm:p-5"
            : "py-3 sm:py-4 lg:py-5"
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full flex-col overflow-visible rounded-[22px] border border-[#DFD0C0] bg-[#FAF6F0] shadow-[0_20px_54px_rgba(32,24,18,0.08)]",
          isFullscreenActive ? "max-w-[1720px]" : "max-w-[1400px]"
        )}
      >
        {/* 1. DARK BURGUNDY STUDIO HEADER (Section 6) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-t-[21px] bg-[#351C1C] px-3.5 py-2.5 text-[#FAF6F0] sm:px-5 sm:py-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2.5 sm:gap-4">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Wall Visualizer Studio and return to Visualizer"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-[#F5EBE0] transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
              <span>Back to Visualizer</span>
            </button>

            <span
              aria-hidden="true"
              className="hidden h-5 w-px bg-white/20 sm:inline-block"
            />

            <div className="flex flex-wrap items-baseline gap-2.5">
              <h1 className="font-serif text-lg font-normal tracking-[-0.01em] text-[#FFFDF9] sm:text-[22px]">
                Wall Visualizer Studio
              </h1>
              <div
                aria-label="Studio workflow stages"
                className="hidden items-center gap-1.5 text-[11px] text-[#DECFC2] xl:inline-flex"
              >
                <span
                  className={cn(
                    activeWorkflowStep === "map" && "font-semibold text-white"
                  )}
                >
                  Map
                </span>
                <span aria-hidden="true">•</span>
                <span
                  className={cn(
                    activeWorkflowStep === "preview" &&
                      "font-semibold text-white"
                  )}
                >
                  Preview
                </span>
                <span aria-hidden="true">•</span>
                <span
                  className={cn(
                    activeWorkflowStep === "customize" &&
                      "font-semibold text-white"
                  )}
                >
                  Customize
                </span>
                <span aria-hidden="true">•</span>
                <span
                  className={cn(
                    activeWorkflowStep === "share" && "font-semibold text-white"
                  )}
                >
                  Share
                </span>
              </div>
            </div>
          </div>

          {/* Right Studio Header Actions */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleClickNewSession}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-[#FAF6F0] transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Session</span>
            </button>

            <button
              type="button"
              onClick={handleSaveProject}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-[#FAF6F0] transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white"
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>Save Project</span>
            </button>

            <button
              type="button"
              onClick={() => setSavedPreviewsOpen(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-[#FAF6F0] transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white"
            >
              <FolderHeart className="h-3.5 w-3.5" />
              <span className="tabular-nums">
                My Previews ({savedProjects.length})
              </span>
            </button>

            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-[#FAF6F0] transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white"
            >
              {isFullscreenActive ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Exit Full Screen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Full Screen</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Transient Studio Feedback Banner */}
        {studioNotice && (
          <div
            role="status"
            className={cn(
              "flex items-center justify-between gap-3 border-b px-4 py-2 text-xs font-medium sm:px-6",
              studioNotice.tone === "error"
                ? "border-[#9B1C1C]/30 bg-[#FDF2F2] text-[#7F1616]"
                : "border-[#E5D9CA] bg-[#F5EFE6] text-[#1A1A1A]"
            )}
          >
            <span>{studioNotice.text}</span>
            <button
              type="button"
              onClick={() => setStudioNotice(null)}
              className="cursor-pointer text-[11px] font-semibold text-[#9B1C1C] hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Hidden Private Room Upload Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleRoomPhotoUpload}
          className="hidden"
        />

        {/* STUDIO BODY */}
        <div className="space-y-3.5 p-3 sm:p-4 lg:p-5">
          {/* 2. SELECTED ARTWORK BAR (Sections 7, 8, 9) */}
          <div className="flex flex-col gap-3 rounded-2xl border border-[#E5D9CA] bg-[#FFFDF9] p-3 sm:px-4 sm:py-3 xl:flex-row xl:items-center xl:justify-between">
            {/* Left: Selected Artwork Swatch + Title + Change Artwork */}
            <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-start">
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-13 w-13 shrink-0 overflow-hidden rounded-xl border border-[#DFD0C0] bg-[#EAE0D3] sm:h-14 sm:w-14">
                  <ArtworkSwatchThumbnail
                    src={
                      printableInfo.printableImageUrl ||
                      selectedDesign.coverImage.secureUrl
                    }
                    alt={`${selectedDesign.title} artwork swatch`}
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-serif text-xl leading-tight font-normal text-[#1A1A1A] sm:text-2xl">
                    {selectedDesign.title}
                  </h2>
                  <p className="mt-0.5 truncate text-xs text-[#5C524B]">
                    {selectedDesign.categoryLabel} •{" "}
                    {applicationMode === "pattern"
                      ? "Repeating Pattern"
                      : "Full-Wall Mural"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setArtworkPickerOpen(true)}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-[#DFD0C0] bg-[#FAF6F0] px-3.5 py-1.5 text-xs font-semibold text-[#9B1C1C] transition-colors hover:border-[#9B1C1C] hover:bg-[#9B1C1C] hover:text-[#FFFDF9] focus-visible:outline-2 focus-visible:outline-[#9B1C1C]"
              >
                <SquarePen className="h-3.5 w-3.5" />
                <span>Change Artwork</span>
              </button>
            </div>

            {/* Center: Application Mode Segmented Control */}
            <div className="flex flex-wrap items-center gap-2 border-t border-[#EFE7DC] pt-2.5 xl:border-t-0 xl:pt-0">
              <span className="text-xs font-medium text-[#5C524B]">
                Application Mode:
              </span>
              <div className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    pushHistory(captureSnapshot());
                    setApplicationMode("mural");
                  }}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#9B1C1C]",
                    applicationMode === "mural"
                      ? "bg-[#9B1C1C] text-[#FFFDF9]"
                      : "border border-[#DFD0C0] bg-[#FAF6F0] text-[#2A231F] hover:border-[#9B1C1C]"
                  )}
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Full-Wall Mural</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    pushHistory(captureSnapshot());
                    setApplicationMode("pattern");
                  }}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#9B1C1C]",
                    applicationMode === "pattern"
                      ? "bg-[#9B1C1C] text-[#FFFDF9]"
                      : "border border-[#DFD0C0] bg-[#FAF6F0] text-[#2A231F] hover:border-[#9B1C1C]"
                  )}
                >
                  <Grid className="h-3.5 w-3.5" />
                  <span>Repeating Pattern</span>
                </button>
              </div>
            </div>

            {/* Right: Room Selection Dropdown */}
            <div className="relative flex items-center gap-2 border-t border-[#EFE7DC] pt-2.5 xl:border-t-0 xl:pt-0">
              <span className="text-xs font-medium text-[#5C524B]">Room:</span>
              <button
                type="button"
                onClick={() => setRoomDropdownOpen((v) => !v)}
                aria-expanded={roomDropdownOpen}
                aria-haspopup="listbox"
                className="flex min-w-[215px] flex-1 cursor-pointer items-center justify-between gap-2.5 rounded-xl border border-[#DFD0C0] bg-[#FAF6F0] px-2.5 py-1.5 text-left text-xs font-semibold text-[#1A1A1A] transition-colors hover:border-[#9B1C1C] xl:flex-initial"
              >
                <span className="flex min-w-0 items-center gap-2">
                  {inputMode === "camera" ? (
                    <span className="flex h-7 w-10 shrink-0 items-center justify-center rounded-md bg-[#351C1C] text-[#FFFDF9]">
                      <Camera className="h-3.5 w-3.5" />
                    </span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeRoomImageUrl}
                      alt=""
                      className="h-7 w-10 shrink-0 rounded-md object-cover"
                    />
                  )}
                  <span className="truncate">{activeRoomLabel}</span>
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-[#5C524B] transition-transform",
                    roomDropdownOpen && "rotate-180"
                  )}
                />
              </button>

              {roomDropdownOpen && (
                <div
                  role="listbox"
                  aria-label="Choose room or camera input"
                  className="absolute top-full right-0 z-50 mt-2 w-72 rounded-2xl border border-[#DFD0C0] bg-[#FFFDF9] p-2 shadow-[0_18px_44px_rgba(28,20,16,0.18)]"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setCameraStopped(false);
                      setInputMode("camera");
                      setRoomDropdownOpen(false);
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors",
                      inputMode === "camera"
                        ? "bg-[#9B1C1C] text-[#FFFDF9]"
                        : "text-[#1A1A1A] hover:bg-[#FAF6F0]"
                    )}
                  >
                    <Camera className="h-4 w-4 shrink-0" />
                    <span>Live Camera View</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRoomDropdownOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="mt-0.5 flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#1A1A1A] transition-colors hover:bg-[#FAF6F0]"
                  >
                    <Upload className="h-4 w-4 shrink-0 text-[#9B1C1C]" />
                    <span>Upload Room Photo…</span>
                  </button>

                  <div className="my-1.5 border-t border-[#EFE7DC]" />
                  <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5C524B]">
                    Sample Rooms
                  </p>

                  {ORDERED_STUDIO_ROOMS.map((room) => {
                    const isCurrent =
                      inputMode === "photo" &&
                      !uploadedRoomDataUrl &&
                      activeSampleRoom.id === room.id;
                    return (
                      <button
                        key={room.id}
                        type="button"
                        role="option"
                        aria-selected={isCurrent}
                        onClick={() => handleSelectSampleRoom(room)}
                        className={cn(
                          "mt-0.5 flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs transition-colors",
                          isCurrent
                            ? "bg-[#FAF6F0] font-semibold text-[#9B1C1C]"
                            : "text-[#1A1A1A] hover:bg-[#FAF6F0]"
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={room.imageUrl}
                            alt=""
                            className="h-8 w-11 shrink-0 rounded-md object-cover"
                          />
                          <span className="truncate">{room.name}</span>
                        </span>
                        {isCurrent && (
                          <Check className="h-3.5 w-3.5 shrink-0 text-[#9B1C1C]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 3. THREE-COLUMN STUDIO WORKSPACE (Left Rail | Main Canvas + Gallery | Right Inspector) */}
          <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[78px_minmax(0,1fr)_368px] xl:grid-cols-[80px_minmax(0,1fr)_400px]">
            {/* COLUMN 1 (Desktop lg+): Left Vertical Tool Rail */}
            <nav
              aria-label="Wall editing tools"
              className="hidden flex-col gap-1.5 rounded-2xl border border-[#E5D9CA] bg-[#FFFDF9] p-2 lg:flex"
            >
              {LEFT_TOOL_RAIL_ITEMS.map(({ id, label, Icon }) => {
                const isActive = activeTool === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleSelectTool(id)}
                    aria-pressed={isActive}
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-3 text-center transition-colors focus-visible:outline-2 focus-visible:outline-[#9B1C1C]",
                      isActive
                        ? "bg-[#9B1C1C] font-semibold text-[#FFFDF9]"
                        : "text-[#2A231F] hover:bg-[#FAF6F0] hover:text-[#9B1C1C]"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-[11px] leading-tight">{label}</span>
                  </button>
                );
              })}
            </nav>

            {/* COLUMN 2: Main Editor Canvas + Input Mode Buttons + Sample Room Gallery */}
            <div className="relative flex min-w-0 flex-col rounded-2xl border border-[#E5D9CA] bg-[#FFFDF9] p-3 sm:p-4">
              {/* Top Canvas Prompt & Pin Controls */}
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2 text-xs text-[#2A231F]">
                  <Target className="h-4 w-4 shrink-0 text-[#9B1C1C]" />
                  {inputMode === "camera" ? (
                    <span>
                      {frozenFrameDataUrl ? (
                        <>
                          <strong className="font-semibold text-[#1A1A1A]">
                            Camera Frame Frozen
                          </strong>{" "}
                          — drag the 4 corner handles (01–04) accurately on this still frame.
                        </>
                      ) : (
                        <>
                          <strong className="font-semibold text-[#1A1A1A]">
                            Camera Manual 4-Corner Preview
                          </strong>{" "}
                          — use Freeze Frame below to pin corners without hand movement.
                        </>
                      )}
                    </span>
                  ) : activeTool === "measure" ? (
                    <span className="font-medium text-[#1A1A1A]">
                      {calibratedMeasurement.summaryText}
                    </span>
                  ) : (
                    <span>
                      Drag the{" "}
                      <strong className="font-semibold text-[#1A1A1A]">
                        4 corner handles (01–04)
                      </strong>{" "}
                      to match your wall&apos;s perspective.
                    </span>
                  )}
                </div>

                {/* Right Canvas Controls (Camera freeze/switch + Hide Pins + Reset Corners + Shortcuts) */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {inputMode === "camera" && (
                    <>
                      <button
                        type="button"
                        disabled={
                          cameraState !== "active" && !frozenFrameDataUrl
                        }
                        onClick={handleToggleFreezeFrame}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40",
                          frozenFrameDataUrl
                            ? "border-[#9B1C1C] bg-[#9B1C1C] text-[#FFFDF9]"
                            : "border-[#DFD0C0] bg-[#FAF6F0] text-[#1A1A1A] hover:border-[#9B1C1C]"
                        )}
                      >
                        {frozenFrameDataUrl ? (
                          <>
                            <Play className="h-3.5 w-3.5" />
                            <span>Resume Camera</span>
                          </>
                        ) : (
                          <>
                            <Pause className="h-3.5 w-3.5" />
                            <span>Freeze Frame</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleSwitchCameraFacing}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#DFD0C0] bg-[#FAF6F0] px-2.5 py-1.5 text-xs font-medium text-[#1A1A1A] hover:border-[#9B1C1C]"
                      >
                        <SwitchCamera className="h-3.5 w-3.5 text-[#9B1C1C]" />
                        <span>
                          {cameraFacingMode === "environment"
                            ? "Front Cam"
                            : "Rear Cam"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleToggleStopStartCamera}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#DFD0C0] bg-[#FAF6F0] px-2.5 py-1.5 text-xs font-medium text-[#1A1A1A] hover:border-[#9B1C1C]"
                      >
                        {cameraStopped ? (
                          <>
                            <Camera className="h-3.5 w-3.5 text-[#9B1C1C]" />
                            <span>Start Cam</span>
                          </>
                        ) : (
                          <>
                            <CameraOff className="h-3.5 w-3.5 text-[#9B1C1C]" />
                            <span>Stop Cam</span>
                          </>
                        )}
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setLayers((prev) => ({
                        ...prev,
                        guidesVisible: !prev.guidesVisible,
                      }))
                    }
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#DFD0C0] bg-[#FAF6F0] px-3 py-1.5 text-xs font-medium text-[#1A1A1A] transition-colors hover:border-[#9B1C1C]"
                  >
                    {layers.guidesVisible ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5 text-[#5C524B]" />
                        <span>Hide Pins</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5 text-[#9B1C1C]" />
                        <span>Show Pins</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleRestoreDefaultCorners}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#DFD0C0] bg-[#FAF6F0] px-3 py-1.5 text-xs font-medium text-[#1A1A1A] transition-colors hover:border-[#9B1C1C]"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-[#5C524B]" />
                    <span>Reset Corners</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShortcutsOpen((v) => !v)}
                    aria-label="Show keyboard shortcuts"
                    className="hidden h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#DFD0C0] bg-[#FAF6F0] text-[#5C524B] transition-colors hover:border-[#9B1C1C] hover:text-[#9B1C1C] sm:inline-flex"
                  >
                    <Keyboard className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <StudioKeyboardShortcutsPopover
                isOpen={shortcutsOpen}
                onClose={() => setShortcutsOpen(false)}
              />

              {/* MAIN INTERACTIVE WALL CANVAS WRAPPER (Maintains Exact Room/Camera Aspect Ratio) */}
              <div className="flex w-full items-center justify-center overflow-hidden rounded-xl border border-[#E5D9CA] bg-[#ECE3D7]">
                <div
                  ref={stageRef}
                  onPointerMove={handleStagePointerMove}
                  onPointerUp={handleStagePointerUp}
                  onPointerLeave={handleStagePointerUp}
                  style={{
                    aspectRatio: `${activeMediaDimensions.w} / ${activeMediaDimensions.h}`,
                    maxWidth: isFullscreenActive
                      ? `min(100%, calc(68dvh * ${mediaAspectRatio}))`
                      : `min(100%, calc(47dvh * ${mediaAspectRatio}))`,
                  }}
                  className="relative mx-auto w-full touch-none overflow-hidden select-none"
                >
                  {/* Layer 0: Base Room Photograph or Live Camera Video */}
                  {inputMode === "camera" ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={cn(
                          "h-full w-full object-cover",
                          (cameraState !== "active" ||
                            Boolean(frozenFrameDataUrl)) &&
                            "hidden"
                        )}
                      />

                      {frozenFrameDataUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={frozenFrameDataUrl}
                          alt="Frozen camera wall preview frame"
                          className="h-full w-full object-cover"
                        />
                      )}

                      {cameraState !== "active" && !frozenFrameDataUrl && (
                        <div className="flex aspect-[16/10] w-full flex-col items-center justify-center bg-[#2A201D] px-6 py-10 text-center text-[#FAF6F0]">
                          {cameraState === "requesting" ? (
                            <>
                              <Camera className="h-8 w-8 animate-pulse text-[#E5B8B0]" />
                              <p className="mt-3 font-serif text-xl">
                                Requesting Camera Access…
                              </p>
                              <p className="mt-1 max-w-md text-xs text-[#DECFC2]">
                                Approve camera permission in your browser to preview {selectedDesign.title} on your wall.
                              </p>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-8 w-8 text-[#E5B8B0]" />
                              <p className="mt-3 font-serif text-xl">
                                {cameraState === "stopped"
                                  ? "Live Camera Paused"
                                  : "Camera Access Unavailable"}
                              </p>
                              <p className="mt-1.5 max-w-md text-xs leading-relaxed text-[#DECFC2]">
                                {cameraErrorMsg ||
                                  "Start the camera again, upload a room photograph, or select a sample room below."}
                              </p>
                              <div className="mt-4 flex flex-wrap justify-center gap-2.5">
                                {cameraState === "stopped" && (
                                  <button
                                    type="button"
                                    onClick={() => setCameraStopped(false)}
                                    className="cursor-pointer rounded-full bg-[#9B1C1C] px-4 py-2 text-xs font-semibold text-[#FFFDF9]"
                                  >
                                    Resume Camera
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="cursor-pointer rounded-full bg-[#FFFDF9] px-4 py-2 text-xs font-semibold text-[#1A1A1A]"
                                >
                                  Upload Room Photo
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setInputMode("photo")}
                                  className="cursor-pointer rounded-full border border-white/25 px-4 py-2 text-xs font-semibold text-[#FFFDF9]"
                                >
                                  Use Sample Room
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeRoomImageUrl}
                      alt={activeRoomLabel}
                      className="block h-full w-full object-cover"
                    />
                  )}

                  {/* Missing Printable Source Warning (Section 12 & 35) */}
                  {!printableInfo.hasValidPrintableSource && (
                    <div className="absolute inset-x-4 top-4 z-30 flex items-start gap-2.5 rounded-xl border border-[#9B1C1C]/35 bg-[#FFFDF9]/96 p-3.5 text-xs text-[#1A1A1A] shadow-md">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#9B1C1C]" />
                      <div>
                        <p className="font-semibold text-[#1A1A1A]">
                          Printable Source Required for Wall Mapping
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#5C524B]">
                          {printableInfo.sourceNote}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Layer 1: Perspective-Warped Pure Artwork Canvas */}
                  <canvas
                    ref={overlayCanvasRef}
                    className="pointer-events-none absolute inset-0 h-full w-full"
                  />

                  {/* Layer 2: Optional Draggable Foreground Obstacle Mask Box */}
                  {canInteractWithWall && layers.foregroundMask.enabled && (
                    <div
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        (e.currentTarget as HTMLElement).setPointerCapture(
                          e.pointerId
                        );
                        if (!stageRef.current) return;
                        const rect = stageRef.current.getBoundingClientRect();
                        dragSnapshotRef.current = captureSnapshot();
                        maskDragOriginRef.current = {
                          pointerX: (e.clientX - rect.left) / rect.width,
                          pointerY: (e.clientY - rect.top) / rect.height,
                          rect: { ...layers.foregroundMask },
                        };
                        setDraggingMaskMode("move");
                      }}
                      style={{
                        left: `${layers.foregroundMask.x * 100}%`,
                        top: `${layers.foregroundMask.y * 100}%`,
                        width: `${layers.foregroundMask.w * 100}%`,
                        height: `${layers.foregroundMask.h * 100}%`,
                      }}
                      className="absolute z-20 cursor-move rounded-md border-2 border-dashed border-[#B45309] bg-[#FEF3C7]/20"
                    >
                      <span className="pointer-events-none absolute top-1.5 left-1.5 rounded bg-[#FFFDF9]/95 px-1.5 py-0.5 text-[10px] font-semibold text-[#92400E] shadow-xs">
                        Protected Mask
                      </span>
                      <button
                        type="button"
                        aria-label="Resize foreground obstacle mask"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          (e.currentTarget as HTMLElement).setPointerCapture(
                            e.pointerId
                          );
                          if (!stageRef.current) return;
                          const rect = stageRef.current.getBoundingClientRect();
                          dragSnapshotRef.current = captureSnapshot();
                          maskDragOriginRef.current = {
                            pointerX: (e.clientX - rect.left) / rect.width,
                            pointerY: (e.clientY - rect.top) / rect.height,
                            rect: { ...layers.foregroundMask },
                          };
                          setDraggingMaskMode("resize");
                        }}
                        className="absolute -right-2 -bottom-2 h-5 w-5 cursor-nwse-resize rounded-full border-2 border-[#FFFDF9] bg-[#B45309] shadow-sm"
                      />
                    </div>
                  )}

                  {/* Layer 3: Draggable Split-Wipe Comparison Divider */}
                  {canInteractWithWall &&
                    splitCompareEnabled &&
                    !showBeforeRoomOnly && (
                      <div
                        style={{ left: `${splitCompareX * 100}%` }}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          (e.currentTarget as HTMLElement).setPointerCapture(
                            e.pointerId
                          );
                          setDraggingSplitBar(true);
                        }}
                        role="slider"
                        aria-label="Before and after split comparison wipe"
                        aria-valuemin={5}
                        aria-valuemax={95}
                        aria-valuenow={Math.round(splitCompareX * 100)}
                        tabIndex={0}
                        className="absolute inset-y-0 z-25 flex w-9 -translate-x-1/2 cursor-ew-resize items-center justify-center"
                      >
                        <div className="h-full w-[2px] bg-[#FFFDF9] shadow-[0_0_8px_rgba(0,0,0,0.45)]" />
                        <span className="absolute flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#9B1C1C] bg-[#FFFDF9] text-[#9B1C1C] shadow-md">
                          <Columns2 className="h-4 w-4" />
                        </span>
                        <span className="pointer-events-none absolute top-3 right-6 rounded-full bg-[#351C1C]/85 px-2.5 py-0.5 text-[10px] font-semibold text-[#FFFDF9]">
                          Before
                        </span>
                        <span className="pointer-events-none absolute top-3 left-6 rounded-full bg-[#9B1C1C] px-2.5 py-0.5 text-[10px] font-semibold text-[#FFFDF9]">
                          After
                        </span>
                      </div>
                    )}

                  {/* Layer 4: Dashed Perspective Quad + 4 Draggable Corner Handles (01 TL .. 04 BL) */}
                  {canInteractWithWall &&
                    layers.guidesVisible &&
                    !showBeforeRoomOnly && (
                      <>
                        <svg
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 z-15 h-full w-full"
                        >
                          <polygon
                            points={corners
                              .map((c) => `${c.x * 100},${c.y * 100}`)
                              .join(" ")}
                            fill="none"
                            stroke="#FFFDF9"
                            strokeWidth="0.42"
                            strokeDasharray="1.8 1.2"
                          />
                        </svg>

                        {corners.map((corner, idx) => {
                          const isDragging = draggingCornerIndex === idx;
                          const isSelected = selectedCornerIndex === idx;
                          return (
                            <button
                              key={cornerLabels[idx]}
                              type="button"
                              aria-label={`Drag corner ${cornerLabels[idx]} to align wall`}
                              disabled={layers.guidesLocked}
                              onClick={() => setSelectedCornerIndex(idx)}
                              onPointerDown={(e) => {
                                if (layers.guidesLocked) return;
                                e.stopPropagation();
                                (
                                  e.currentTarget as HTMLElement
                                ).setPointerCapture(e.pointerId);
                                setSelectedCornerIndex(idx);
                                dragSnapshotRef.current = captureSnapshot();
                                setDraggingCornerIndex(idx);
                              }}
                              style={{
                                left: `${corner.x * 100}%`,
                                top: `${corner.y * 100}%`,
                              }}
                              className={cn(
                                "absolute z-20 flex min-h-[34px] min-w-[60px] -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center gap-1.5 rounded-full border bg-[#FFFDF9] px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-[#1A1A1A] shadow-[0_6px_16px_rgba(24,18,14,0.22)] transition-transform active:cursor-grabbing disabled:cursor-not-allowed sm:min-h-[30px]",
                                isDragging
                                  ? "scale-110 border-[#9B1C1C] ring-2 ring-[#9B1C1C]"
                                  : isSelected
                                    ? "border-[#9B1C1C]"
                                    : "border-[#DFD0C0] hover:scale-105"
                              )}
                            >
                              <span
                                aria-hidden="true"
                                className="h-2 w-2 shrink-0 rounded-full bg-[#9B1C1C]"
                              />
                              <span className="tabular-nums">
                                {cornerLabels[idx]}
                              </span>
                            </button>
                          );
                        })}
                      </>
                    )}

                  {/* Layer 5: Refined Bottom-Center Before / After Pill (Section 15) */}
                  {canInteractWithWall && (
                    <div
                      role="group"
                      aria-label="Compare untouched room before and mapped artwork after"
                      className="absolute bottom-3.5 left-1/2 z-30 inline-flex -translate-x-1/2 items-center rounded-full border border-[#DFD0C0] bg-[#FFFDF9]/96 p-1 shadow-[0_10px_28px_rgba(24,18,14,0.20)]"
                    >
                      <button
                        type="button"
                        aria-pressed={showBeforeRoomOnly}
                        onClick={() => {
                          setShowBeforeRoomOnly(true);
                          setSplitCompareEnabled(false);
                        }}
                        className={cn(
                          "cursor-pointer rounded-full px-5 py-1.5 text-xs font-semibold transition-colors sm:px-6",
                          showBeforeRoomOnly
                            ? "bg-[#9B1C1C] text-[#FFFDF9]"
                            : "text-[#1A1A1A] hover:text-[#9B1C1C]"
                        )}
                      >
                        Before
                      </button>

                      <button
                        type="button"
                        aria-pressed={!showBeforeRoomOnly}
                        onClick={() => setShowBeforeRoomOnly(false)}
                        className={cn(
                          "cursor-pointer rounded-full px-5 py-1.5 text-xs font-semibold transition-colors sm:px-6",
                          !showBeforeRoomOnly
                            ? "bg-[#9B1C1C] text-[#FFFDF9]"
                            : "text-[#1A1A1A] hover:text-[#9B1C1C]"
                        )}
                      >
                        After
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* MOBILE / TABLET (<lg) HORIZONTAL EDITING TOOL TABS */}
              <nav
                aria-label="Mobile wall editing tools"
                className="mt-3 flex gap-1.5 overflow-x-auto pb-1 lg:hidden"
              >
                {LEFT_TOOL_RAIL_ITEMS.map(({ id, label, Icon }) => {
                  const isActive = activeTool === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelectTool(id)}
                      className={cn(
                        "inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                        isActive
                          ? "border-[#9B1C1C] bg-[#9B1C1C] text-[#FFFDF9]"
                          : "border-[#DFD0C0] bg-[#FAF6F0] text-[#2A231F]"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* CAMERA / UPLOAD / CHOOSE SAMPLE ROOM ACTION ROW (Reference Below Canvas) */}
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => {
                    setCameraStopped(false);
                    setInputMode("camera");
                  }}
                  className={cn(
                    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#9B1C1C]",
                    inputMode === "camera"
                      ? "bg-[#9B1C1C] text-[#FFFDF9] shadow-[0_6px_16px_rgba(155,28,28,0.22)]"
                      : "bg-[#9B1C1C] text-[#FFFDF9] hover:bg-[#7F1616]"
                  )}
                >
                  <Camera className="h-4 w-4 shrink-0" />
                  <span>Live Camera View</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#9B1C1C]",
                    uploadedRoomDataUrl && inputMode === "photo"
                      ? "border-[#9B1C1C] bg-[#FAF6F0] text-[#9B1C1C]"
                      : "border-[#DFD0C0] bg-[#FAF6F0] text-[#1A1A1A] hover:border-[#9B1C1C]"
                  )}
                >
                  <Upload className="h-4 w-4 shrink-0 text-[#9B1C1C]" />
                  <span>Upload Room Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSampleGalleryExpanded((v) => !v)}
                  aria-expanded={sampleGalleryExpanded}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[#DFD0C0] bg-[#FAF6F0] px-4 py-2.5 text-xs font-semibold text-[#1A1A1A] transition-colors hover:border-[#9B1C1C] focus-visible:outline-2 focus-visible:outline-[#9B1C1C]"
                >
                  <ImageIcon className="h-4 w-4 shrink-0 text-[#9B1C1C]" />
                  <span>Choose a Sample Room</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-[#5C524B] transition-transform",
                      sampleGalleryExpanded && "rotate-180"
                    )}
                  />
                </button>
              </div>

              {/* 4. SAMPLE ROOM GALLERY CAROUSEL (Section 25) */}
              {sampleGalleryExpanded && (
                <div className="mt-3.5 border-t border-[#EFE7DC] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1A1A1A]">
                      Sample Rooms:
                    </span>
                    <span className="text-[11px] text-[#5C524B]">
                      Each room loads calibrated wall perspective corners
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => scrollSampleGallery(-1)}
                      aria-label="Scroll sample rooms left"
                      className="hidden h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#DFD0C0] bg-[#FAF6F0] text-[#1A1A1A] hover:border-[#9B1C1C] hover:text-[#9B1C1C] sm:flex"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div
                      ref={sampleGalleryScrollRef}
                      className="flex min-w-0 flex-1 gap-2.5 overflow-x-auto scroll-smooth py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      {ORDERED_STUDIO_ROOMS.map((room) => {
                        const isSelected =
                          inputMode === "photo" &&
                          !uploadedRoomDataUrl &&
                          activeSampleRoom.id === room.id;
                        return (
                          <button
                            key={room.id}
                            type="button"
                            onClick={() => handleSelectSampleRoom(room)}
                            className={cn(
                              "group relative flex w-[138px] shrink-0 cursor-pointer flex-col overflow-hidden rounded-xl border bg-[#FAF6F0] p-1.5 text-center transition-all sm:w-[146px]",
                              isSelected
                                ? "border-2 border-[#9B1C1C] bg-[#FFFDF9]"
                                : "border-[#DFD0C0] hover:border-[#9B1C1C]"
                            )}
                          >
                            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-[#EAE0D3]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={room.imageUrl}
                                alt={room.shortTitle || room.name}
                                loading="lazy"
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                              />
                              {isSelected && (
                                <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#9B1C1C] text-[#FFFDF9] shadow-xs">
                                  <Check className="h-3 w-3 stroke-[2.5]" />
                                </span>
                              )}
                            </div>
                            <span
                              className={cn(
                                "mt-1.5 truncate text-[11px]",
                                isSelected
                                  ? "font-semibold text-[#1A1A1A]"
                                  : "font-medium text-[#2A231F]"
                              )}
                            >
                              {room.shortTitle || room.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => scrollSampleGallery(1)}
                      aria-label="Scroll sample rooms right"
                      className="hidden h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#DFD0C0] bg-[#FAF6F0] text-[#1A1A1A] hover:border-[#9B1C1C] hover:text-[#9B1C1C] sm:flex"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* COLUMN 3: Right Customization, Info & Export Inspector */}
            <div ref={inspectorContainerRef} className="min-w-0">
              <StudioRightInspector
                activeTab={activeInspectorTab}
                activeTool={activeTool}
                onSelectTab={setActiveInspectorTab}
                onSelectTool={handleSelectTool}
                selectedDesign={selectedDesign}
                printableInfo={printableInfo}
                activeRoomLabel={activeRoomLabel}
                applicationMode={applicationMode}
                onApplicationModeChange={(mode) => {
                  pushHistory(captureSnapshot());
                  setApplicationMode(mode);
                }}
                scale={scale}
                onScaleChange={(val) => {
                  setScale(val);
                  setIsSessionDirty(true);
                }}
                onSliderCommitStart={() => pushHistory(captureSnapshot())}
                patternRepeatScale={patternRepeatScale}
                onPatternRepeatScaleChange={(val) => {
                  setPatternRepeatScale(val);
                  setIsSessionDirty(true);
                }}
                panX={panX}
                panY={panY}
                onNudgePan={(dx, dy) => {
                  pushHistory(captureSnapshot());
                  setPanX((prev) => Math.max(-0.85, Math.min(0.85, prev + dx)));
                  setPanY((prev) => Math.max(-0.85, Math.min(0.85, prev + dy)));
                }}
                onCenterPan={() => {
                  pushHistory(captureSnapshot());
                  setPanX(0);
                  setPanY(0);
                }}
                rotationDegrees={rotationDegrees}
                onRotationDegreesChange={(deg) => {
                  setRotationDegrees(deg);
                  setIsSessionDirty(true);
                }}
                onResetRotationDegrees={() => {
                  pushHistory(captureSnapshot());
                  setRotationDegrees(0);
                  setRotationQuarterTurns(0);
                }}
                opacity={opacity}
                onOpacityChange={(val) => {
                  setOpacity(val);
                  setIsSessionDirty(true);
                }}
                brightness={brightness}
                onBrightnessChange={(val) => {
                  setBrightness(val);
                  setIsSessionDirty(true);
                }}
                surfaceFinish={surfaceFinish}
                onSurfaceFinishChange={(finish) => {
                  pushHistory(captureSnapshot());
                  setSurfaceFinish(finish);
                }}
                blendMultiply={blendMultiply}
                onToggleBlendMultiply={() => {
                  pushHistory(captureSnapshot());
                  setBlendMultiply((v) => !v);
                }}
                flipHorizontal={flipHorizontal}
                onToggleFlipHorizontal={() => {
                  pushHistory(captureSnapshot());
                  setFlipHorizontal((v) => !v);
                }}
                onRotateQuarterTurn={() => {
                  pushHistory(captureSnapshot());
                  setRotationQuarterTurns((prev) => (prev + 1) % 4);
                }}
                layers={layers}
                onUpdateLayers={(next) => {
                  setLayers(next);
                  setIsSessionDirty(true);
                }}
                onResetForegroundMask={() => {
                  pushHistory(captureSnapshot());
                  setLayers((prev) => ({
                    ...prev,
                    foregroundMask: {
                      enabled: true,
                      x: 0.34,
                      y: 0.54,
                      w: 0.32,
                      h: 0.22,
                    },
                  }));
                }}
                measurement={measurement}
                onUpdateMeasurement={(next) => {
                  setMeasurement(next);
                  setIsSessionDirty(true);
                }}
                canUndo={historyPast.length > 0}
                canRedo={historyFuture.length > 0}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onResetAdjustments={handleResetAdjustmentsOnly}
                onResetCorners={handleRestoreDefaultCorners}
                exportFormat={exportFormat}
                onExportFormatChange={setExportFormat}
                exportResolutionLabel={`${activeMediaDimensions.w} × ${activeMediaDimensions.h} px`}
                onExportSnapshot={handleExportSnapshot}
                onSaveProject={handleSaveProject}
                onCopyShareLink={handleCopyShareLink}
                copiedShareLink={copiedShareLink}
                selectedEnquirySurface={selectedEnquirySurface}
                onSelectEnquirySurface={setSelectedEnquirySurface}
                enquiryHref={enquiryHref}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Artwork Selector Modal (Preserves Current Room & Wall Quad) */}
      <SelectedArtworkSelectorModal
        isOpen={artworkPickerOpen}
        selectedDesign={selectedDesign}
        categories={catalogueCategories}
        designs={catalogueDesigns}
        onSelectDesign={(design) => {
          onSelectDesign(design);
          setIsSessionDirty(true);
        }}
        onClose={() => setArtworkPickerOpen(false)}
      />

      {/* Saved Previews Modal */}
      <StudioSavedPreviewsModal
        isOpen={savedPreviewsOpen}
        projects={savedProjects}
        onLoadProject={handleLoadSavedProject}
        onDeleteProject={handleDeleteSavedProject}
        onClose={() => setSavedPreviewsOpen(false)}
      />

      {/* New Session Unsaved Changes Confirmation */}
      <StudioNewSessionDialog
        isOpen={newSessionDialogOpen}
        onCancel={() => setNewSessionDialogOpen(false)}
        onSaveAndReset={() => {
          if (handleSaveProject()) {
            performFreshSessionReset();
          }
        }}
        onConfirmReset={performFreshSessionReset}
      />
    </div>
  );

  return studioShellContent;
}
