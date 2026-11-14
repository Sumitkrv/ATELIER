/**
 * Pure Wall-Artwork Source Region & Printable Asset Resolver (`artwork-source-crops.ts`).
 *
 * Separates three distinct visual roles for every ATELIER design:
 *  1. Showcase Image (`coverImage.secureUrl`): Staged architectural room scene for cards/galleries.
 *  2. Printable Artwork Image: Pure flat artwork or verified mural-only extraction region — NEVER
 *     pasting a furnished showcase room photograph onto another room's wall.
 *  3. Repeatable Pattern Suitability: Whether the artwork motif is suitable for tiled pattern repeats.
 */

import type { CatalogueDesignItem } from "@/lib/designs-catalogue";

export interface NormalizedCropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const ARTWORK_MURAL_SOURCE_CROPS: ReadonlyArray<
  NormalizedCropRect & { match: string; patternSuitable?: boolean }
> = [
  // Primary 13 Category Featured Artworks
  { match: "artwork-terracotta-wave", x: 0.43, y: 0.08, w: 0.54, h: 0.42, patternSuitable: true },
  { match: "artwork-botanical-canopy", x: 0.19, y: 0.03, w: 0.29, h: 0.25, patternSuitable: true },
  { match: "artwork-arch-limestone", x: 0.31, y: 0.06, w: 0.44, h: 0.46, patternSuitable: true },
  { match: "artwork-mountain-silhouette", x: 0.37, y: 0.05, w: 0.61, h: 0.41, patternSuitable: false },
  { match: "artwork-lotus-atelier", x: 0.43, y: 0.05, w: 0.54, h: 0.41, patternSuitable: true },
  { match: "artwork-geometric-harmony", x: 0.34, y: 0.1, w: 0.53, h: 0.42, patternSuitable: true },
  { match: "cat-mineral-travertine", x: 0.03, y: 0.05, w: 0.84, h: 0.88, patternSuitable: true },
  { match: "siena-abstract-horizon", x: 0.34, y: 0.16, w: 0.35, h: 0.36, patternSuitable: false },
  { match: "cat-textured-plaster", x: 0.03, y: 0.05, w: 0.76, h: 0.88, patternSuitable: true },
  { match: "surface-tiles-interior", x: 0.24, y: 0.08, w: 0.47, h: 0.44, patternSuitable: true },
  { match: "surface-glass-interior", x: 0.43, y: 0.12, w: 0.26, h: 0.28, patternSuitable: true },
  { match: "surface-plywood-metal-interior", x: 0.38, y: 0.16, w: 0.48, h: 0.44, patternSuitable: true },
  { match: "surface-office-blinds-interior", x: 0.45, y: 0.08, w: 0.5, h: 0.4, patternSuitable: false },

  // Secondary & Tertiary Collection Artworks (#14–#39)
  { match: "hero-botanical-living", x: 0.23, y: 0.04, w: 0.47, h: 0.43, patternSuitable: true },
  { match: "process-hero-sculptural-arch", x: 0.47, y: 0.25, w: 0.22, h: 0.27, patternSuitable: true },
  { match: "wall-preview-matched-after", x: 0.33, y: 0.08, w: 0.51, h: 0.56, patternSuitable: true },
  { match: "about-story-arch-vase", x: 0.12, y: 0.05, w: 0.48, h: 0.55, patternSuitable: false },
  { match: "sculpted-dune-ochre-relief", x: 0.08, y: 0.06, w: 0.58, h: 0.58, patternSuitable: true },
  { match: "raw-travertine-plaster-ribbons", x: 0.48, y: 0.06, w: 0.48, h: 0.7, patternSuitable: true },
  { match: "services-hero-sculptural-lotus", x: 0.42, y: 0.28, w: 0.3, h: 0.27, patternSuitable: true },
  { match: "services-spiral-staircase", x: 0.28, y: 0.05, w: 0.52, h: 0.48, patternSuitable: false },
  { match: "roman-vein-cut-alabaster", x: 0.2, y: 0.08, w: 0.31, h: 0.41, patternSuitable: true },
  { match: "raw-umber-sandstone-quarry", x: 0.23, y: 0.07, w: 0.53, h: 0.52, patternSuitable: true },
  { match: "crimson-alcove-ochre-study", x: 0.36, y: 0.23, w: 0.34, h: 0.2, patternSuitable: false },
  { match: "gallery-tonal-planes-study", x: 0.4, y: 0.08, w: 0.55, h: 0.74, patternSuitable: true },
  { match: "backlit-dune-valley-horizon", x: 0.09, y: 0.2, w: 0.64, h: 0.35, patternSuitable: false },
  { match: "kyoto-crane-crimson-sun", x: 0.37, y: 0.09, w: 0.5, h: 0.44, patternSuitable: false },
  { match: "about-hero-lotus-arch", x: 0.53, y: 0.06, w: 0.26, h: 0.48, patternSuitable: true },
  { match: "pressed-herbarium-linen-study", x: 0.08, y: 0.05, w: 0.68, h: 0.42, patternSuitable: true },
  { match: "venetian-marmorino-warm-sand", x: 0.15, y: 0.06, w: 0.6, h: 0.58, patternSuitable: true },
  { match: "burgundy-lime-alcove-patina", x: 0.26, y: 0.08, w: 0.46, h: 0.44, patternSuitable: true },
  { match: "amalfi-terracotta-tile-arch", x: 0.32, y: 0.03, w: 0.56, h: 0.48, patternSuitable: true },
  { match: "travertine-lotus-tile-edition", x: 0.63, y: 0.06, w: 0.19, h: 0.56, patternSuitable: true },
  { match: "fluted-reed-linen-glass-screen", x: 0.35, y: 0.1, w: 0.4, h: 0.46, patternSuitable: true },
  { match: "translucent-lotus-glazing-mural", x: 0.25, y: 0.12, w: 0.4, h: 0.48, patternSuitable: true },
  { match: "surface-metals-brushed-bronze", x: 0.08, y: 0.06, w: 0.66, h: 0.86, patternSuitable: true },
  { match: "nordic-birch-terracotta-millwork", x: 0.24, y: 0.68, w: 0.48, h: 0.28, patternSuitable: true },
  { match: "botanical-solar-screen-blind", x: 0.29, y: 0.12, w: 0.52, h: 0.48, patternSuitable: true },
  { match: "architectural-arch-blind-triptych", x: 0.23, y: 0.15, w: 0.58, h: 0.42, patternSuitable: true },
];

export interface PrintableArtworkResolution {
  showcaseImageUrl: string;
  printableImageUrl: string;
  hasValidPrintableSource: boolean;
  sourceKind: "dedicated_texture" | "calibrated_artwork_region" | "showcase_only_blocked";
  isPatternSuitable: boolean;
  sourceNote: string;
}

export function findNormalizedArtworkCrop(
  srcUrl: string | undefined | null
): (NormalizedCropRect & { patternSuitable?: boolean }) | null {
  if (!srcUrl) return null;
  const found = ARTWORK_MURAL_SOURCE_CROPS.find((entry) =>
    srcUrl.includes(entry.match)
  );
  if (!found) return null;
  return {
    x: found.x,
    y: found.y,
    w: found.w,
    h: found.h,
    patternSuitable: found.patternSuitable ?? true,
  };
}

/**
 * Determines whether a design has a valid flat/isolated printable artwork source
 * vs only an uncalibrated room-showcase photograph (which must NOT be pasted as a room-in-room overlay).
 */
export function resolvePrintableArtworkInfo(
  design: CatalogueDesignItem
): PrintableArtworkResolution {
  const showcaseImageUrl = design.coverImage.secureUrl;
  const textureUrl = (design.visualizerConfig.textureUrl || "").trim();
  const candidateUrl = textureUrl || showcaseImageUrl;

  if (!candidateUrl) {
    return {
      showcaseImageUrl,
      printableImageUrl: "",
      hasValidPrintableSource: false,
      sourceKind: "showcase_only_blocked",
      isPatternSuitable: false,
      sourceNote:
        "No printable artwork image is attached to this design record yet.",
    };
  }

  // 1. Dedicated flat texture (e.g., /uploads/..., /samples/..., or distinct textureUrl != coverImage)
  const isDedicatedFlatAsset =
    candidateUrl.startsWith("/uploads/") ||
    candidateUrl.startsWith("/samples/") ||
    candidateUrl.startsWith("data:") ||
    (Boolean(textureUrl) && textureUrl !== showcaseImageUrl);

  const calibratedCrop = findNormalizedArtworkCrop(candidateUrl);

  if (isDedicatedFlatAsset && !calibratedCrop) {
    return {
      showcaseImageUrl,
      printableImageUrl: candidateUrl,
      hasValidPrintableSource: true,
      sourceKind: "dedicated_texture",
      isPatternSuitable: true,
      sourceNote: "Dedicated flat printable artwork asset.",
    };
  }

  // 2. Verified calibrated pure-artwork extraction region (zero furniture/room elements)
  if (calibratedCrop) {
    return {
      showcaseImageUrl,
      printableImageUrl: candidateUrl,
      hasValidPrintableSource: true,
      sourceKind: "calibrated_artwork_region",
      isPatternSuitable: calibratedCrop.patternSuitable ?? true,
      sourceNote:
        "Isolated pure wall-artwork composition (room showcase framing excluded).",
    };
  }

  // 3. Unverified showcase interior image — block misleading whole-room paste!
  if (candidateUrl.includes("/images/atelier/")) {
    return {
      showcaseImageUrl,
      printableImageUrl: candidateUrl,
      hasValidPrintableSource: false,
      sourceKind: "showcase_only_blocked",
      isPatternSuitable: false,
      sourceNote:
        "Only an installed room showcase photograph is available for this record; upload a flat print texture in Admin CMS to preview on walls.",
    };
  }

  return {
    showcaseImageUrl,
    printableImageUrl: candidateUrl,
    hasValidPrintableSource: true,
    sourceKind: "dedicated_texture",
    isPatternSuitable: true,
    sourceNote: "External printable artwork source.",
  };
}

export function resolveArtworkSourcePixels(artworkImg: HTMLImageElement): {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
} {
  const nw = artworkImg.naturalWidth || artworkImg.width || 1024;
  const nh = artworkImg.naturalHeight || artworkImg.height || 1024;
  const src = artworkImg.currentSrc || artworkImg.src || "";
  const crop = findNormalizedArtworkCrop(src);
  if (!crop) {
    return { sx: 0, sy: 0, sw: nw, sh: nh };
  }
  return {
    sx: Math.max(0, Math.round(nw * crop.x)),
    sy: Math.max(0, Math.round(nh * crop.y)),
    sw: Math.max(16, Math.round(nw * crop.w)),
    sh: Math.max(16, Math.round(nh * crop.h)),
  };
}
