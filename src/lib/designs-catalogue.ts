/**
 * Canonical Data & Category Architecture for Page 02 — Explore Designs (`/explore-designs`).
 *
 * Aligns with `DesignCategoryDocument` and `DesignDocument` in `@/types/models` while
 * implementing the approved Explore Designs — Design 02 visual direction:
 *  - Preserves all 13 CMS-manageable category slots (`category-slot-1`..`13`, `cat-01`..`cat-13`).
 *  - Pairs each category and artwork with curated architectural interior photography
 *    from `@/lib/asset-registry`.
 *  - Eliminates technical developer labels ("Category Slot 01", "Sample Fixture", "QA")
 *    from customer-facing presentation (Section 29).
 */

import {
  CONFIGURABLE_CATEGORY_SLOTS,
  DesignCategoryDocument,
  MediaAssetRef,
} from "@/types/models";

export interface ExploreDesignsHeroConfig {
  eyebrow: string;
  headline: string;
  supportingText: string;
  description: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  heroImage: string;
  heroImageAlt: string;
  isProvisionalCopy: boolean;
}

export const EXPLORE_DESIGNS_HERO_CONTENT: ExploreDesignsHeroConfig = {
  eyebrow: "THE ATELIER COLLECTION",
  headline: "Explore Wall Art Designs for Every Space",
  supportingText:
    "A curated collection of murals and surface artworks crafted to bring character, texture, and personality to architectural spaces.",
  description:
    "A curated collection of murals and surface artworks crafted to bring character, texture, and personality to architectural spaces.",
  primaryCtaLabel: "Browse Collection",
  secondaryCtaLabel: "Preview on Your Wall",
  heroImage: "/images/atelier/hero-botanical-living.jpg",
  heroImageAlt:
    "Sunlit luxury living room with a botanical wall mural and curved cream boucle sofa by Atelier Wall Story",
  isProvisionalCopy: false,
};

export interface CatalogueCategoryRecord extends DesignCategoryDocument {
  slotCode: string;
  shortTitle: string;
}

const CURATED_CATEGORY_META: ReadonlyArray<{
  name: string;
  description: string;
  imageUrl: string;
  altText: string;
}> = [
  {
    name: "Botanical",
    description: "Leafy murals and nature-inspired organic compositions for tranquil living spaces.",
    imageUrl: "/images/atelier/artwork-botanical-canopy.jpg",
    altText: "Botanical Canopy mural in a sunlit contemporary dining room",
  },
  {
    name: "Geometric",
    description: "Balanced architectural lines, arches, and contemporary geometric forms.",
    imageUrl: "/images/atelier/artwork-geometric-harmony.jpg",
    altText: "Geometric Harmony overlapping terracotta and warm sand arches mural",
  },
  {
    name: "Textured",
    description: "Layered plaster, terracotta relief, and tactile surface-inspired compositions.",
    imageUrl: "/images/atelier/artwork-terracotta-wave.jpg",
    altText: "Terracotta Wave Relief sculpted plaster wall mural in a living room",
  },
  {
    name: "Architectural",
    description: "Sculptural archways, colonnades, and perspective-rich spatial elevations.",
    imageUrl: "/images/atelier/artwork-arch-limestone.jpg",
    altText: "Arch Series Limestone three-dimensional fluted arch colonnade mural",
  },
  {
    name: "Mineral",
    description: "Natural travertine, veined marble, and warm sedimentary stone strata.",
    imageUrl: "/images/atelier/cat-mineral-travertine.jpg",
    altText: "Navona travertine mineral stone strata and warm veining wall finish",
  },
  {
    name: "Abstract",
    description: "Expressive fluid waves, tonal blocks, and modern abstract wall statements.",
    imageUrl: "/images/atelier/project-retail-terracotta-arch.jpg",
    altText: "Siena abstract terracotta and ochre curved relief composition in a lounge",
  },
  {
    name: "Landscapes",
    description: "Panoramic misty mountain silhouettes and serene horizon murals.",
    imageUrl: "/images/atelier/artwork-mountain-silhouette.jpg",
    altText: "Panoramic misty mountain silhouette landscape mural behind a linen sofa",
  },
  {
    name: "Floral Studies",
    description: "Delicate lotus and botanical flora studies proportioned for feature walls.",
    imageUrl: "/images/atelier/artwork-lotus-atelier.jpg",
    altText: "Lotus Atelier Study painterly botanical mural on a warm plaster wall",
  },
  {
    name: "Plaster & Lime",
    description: "Artisan lime-plaster and warm neutral tonal wall compositions.",
    imageUrl: "/images/atelier/cat-textured-plaster.jpg",
    altText: "Artisan hand-troweled warm beige lime plaster relief wall texture",
  },
  {
    name: "Tile Editions",
    description: "Decorative motifs and murals tailored for ceramic, vitrified, and stone tiles.",
    imageUrl: "/images/atelier/surface-tiles-interior.jpg",
    altText: "Mediterranean botanical and geometric fresco printed on ceramic wall tiles",
  },
  {
    name: "Glass & Glazing",
    description: "Translucent botanical and geometric privacy art for interior glass partitions.",
    imageUrl: "/images/atelier/surface-glass-interior.jpg",
    altText: "Frosted botanical privacy artwork printed on architectural glass partitions",
  },
  {
    name: "Timber & Metal",
    description: "Curated graphic compositions for birch plywood millwork and brushed metal panels.",
    imageUrl: "/images/atelier/surface-plywood-metal-interior.jpg",
    altText: "Minimalist geometric arch artwork printed on birch plywood and brushed metal panels",
  },
  {
    name: "Window Blinds",
    description: "Panoramic workspace and studio artwork printed across commercial roller blinds.",
    imageUrl: "/images/atelier/surface-office-blinds-interior.jpg",
    altText: "Panoramic mountain horizon artwork printed across executive office window roller blinds",
  },
];

export const DESIGN_CATEGORY_RECORDS: ReadonlyArray<CatalogueCategoryRecord> =
  CONFIGURABLE_CATEGORY_SLOTS.map((slot, idx) => {
    const codeLower = slot.slotCode.toLowerCase(); // "cat-01" .. "cat-13"
    const meta = CURATED_CATEGORY_META[idx] || CURATED_CATEGORY_META[0];
    return {
      id: `category-slot-${slot.slotNumber}`,
      slotNumber: slot.slotNumber,
      slotCode: slot.slotCode,
      name: meta.name,
      shortTitle: meta.name,
      slug: codeLower,
      description: meta.description,
      coverImage: {
        publicId: `categories/${codeLower}`,
        secureUrl: meta.imageUrl,
        resourceType: "image",
        width: 1200,
        height: 896,
        format: "jpg",
        altText: meta.altText,
      },
      displayOrder: slot.slotNumber,
      isActive: true,
      isConfigured: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
  });

export interface CatalogueDesignItem {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  categorySlug: string;
  categorySlotNumber: number;
  categoryCode: string;
  categoryLabel: string;
  summary: string;
  description: string;
  tags: ReadonlyArray<string>;
  compatibleSurfaces: ReadonlyArray<string>;
  dimensionsNote: string;
  coverImage: MediaAssetRef;
  galleryMedia: ReadonlyArray<MediaAssetRef>;
  videoAsset: MediaAssetRef | null;
  aspectRatio: "portrait" | "landscape" | "square";
  featured: boolean;
  published: boolean;
  sortOrder: number;
  isDevelopmentFixture: boolean;
  visualizerConfig: {
    defaultMode: "mural" | "pattern";
    textureUrl: string;
    width: number;
    height: number;
    mimeType: string;
  };
}

function makeMedia(
  publicId: string,
  secureUrl: string,
  altText: string
): MediaAssetRef {
  return {
    publicId,
    secureUrl,
    resourceType: "image",
    width: 1600,
    height: 1000,
    format: "jpg",
    altText,
  };
}

export const DEVELOPMENT_FIXTURE_DESIGNS: ReadonlyArray<CatalogueDesignItem> = [
  // 1. Terracotta Wave Relief (Design 02 Card #1)
  {
    id: "design-slot-3",
    title: "Terracotta Wave Relief",
    slug: "terracotta-wave-relief",
    categoryId: "category-slot-3",
    categorySlug: "cat-03",
    categorySlotNumber: 3,
    categoryCode: "CAT-03",
    categoryLabel: "Textured",
    summary:
      "Sweeping organic terracotta and warm sand wave mural crafted for statement living walls and timber elevations.",
    description:
      "Inspired by hand-troweled lime plaster and desert strata, Terracotta Wave Relief brings warm sculptural movement to contemporary interiors. Custom-proportioned to your exact wall dimensions and printed directly onto prepared walls or plywood panels.",
    tags: ["textured", "terracotta", "wave", "relief", "walls", "plywood", "mural"],
    compatibleSurfaces: ["Walls", "Plywood"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/terracotta-wave-relief",
      "/images/atelier/artwork-terracotta-wave.jpg",
      "Terracotta Wave Relief wall mural in a sunlit minimalist living room"
    ),
    galleryMedia: [
      makeMedia(
        "designs/terracotta-wave-relief-01",
        "/images/atelier/artwork-terracotta-wave.jpg",
        "Terracotta Wave Relief — Living Room Elevation"
      ),
      makeMedia(
        "designs/terracotta-wave-relief-02",
        "/images/atelier/cat-textured-plaster.jpg",
        "Terracotta Wave Relief — Plaster Texture Detail"
      ),
      makeMedia(
        "designs/terracotta-wave-relief-03",
        "/images/atelier/card-01-terracotta-wave.jpg",
        "Terracotta Wave Relief — Warm Daylight Perspective"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: true,
    published: true,
    sortOrder: 1,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/artwork-terracotta-wave.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 2. Botanical Canopy (Design 02 Card #2)
  {
    id: "design-slot-1",
    title: "Botanical Canopy",
    slug: "category-1-featured-design",
    categoryId: "category-slot-1",
    categorySlug: "cat-01",
    categorySlotNumber: 1,
    categoryCode: "CAT-01",
    categoryLabel: "Botanical",
    summary:
      "Overhanging sage and olive leafy canopy mural that brings quiet organic movement to dining and living rooms.",
    description:
      "Botanical Canopy frames interior walls with delicate, sunlit foliage extending gently from the upper elevation. Ideal for dining rooms, living spaces, and tiled hospitality feature walls.",
    tags: ["botanical", "canopy", "leaves", "nature", "mural", "walls", "tiles"],
    compatibleSurfaces: ["Walls", "Tiles"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/botanical-canopy",
      "/images/atelier/artwork-botanical-canopy.jpg",
      "Botanical Canopy mural in a warm contemporary dining room"
    ),
    galleryMedia: [
      makeMedia(
        "designs/botanical-canopy-01",
        "/images/atelier/artwork-botanical-canopy.jpg",
        "Botanical Canopy — Dining Room Feature Wall"
      ),
      makeMedia(
        "designs/botanical-canopy-02",
        "/images/atelier/hero-botanical-living.jpg",
        "Botanical Canopy — Living Room Perspective"
      ),
      makeMedia(
        "designs/botanical-canopy-03",
        "/images/atelier/wall-preview-after.jpg",
        "Botanical Canopy — Direct Wall Print Detail"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: true,
    published: true,
    sortOrder: 2,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/artwork-botanical-canopy.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 3. Arch Series – Limestone (Design 02 Card #3)
  {
    id: "design-slot-4",
    title: "Arch Series – Limestone",
    slug: "category-4-featured-design",
    categoryId: "category-slot-4",
    categorySlug: "cat-04",
    categorySlotNumber: 4,
    categoryCode: "CAT-04",
    categoryLabel: "Architectural",
    summary:
      "Three-dimensional fluted limestone arch colonnade mural creating serene architectural depth on flat walls.",
    description:
      "Arch Series – Limestone uses warm travertine shading and classical colonnade perspective to expand the visual depth of living rooms, foyers, and reception spaces.",
    tags: ["architectural", "arch", "limestone", "fluted", "3d", "walls"],
    compatibleSurfaces: ["Walls", "Tiles"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/arch-series-limestone",
      "/images/atelier/artwork-arch-limestone.jpg",
      "Arch Series – Limestone 3D architectural arch mural in a sunlit living room"
    ),
    galleryMedia: [
      makeMedia(
        "designs/arch-series-limestone-01",
        "/images/atelier/artwork-arch-limestone.jpg",
        "Arch Series – Limestone — Full Wall Elevation"
      ),
      makeMedia(
        "designs/arch-series-limestone-02",
        "/images/atelier/cat-mineral-travertine.jpg",
        "Arch Series – Limestone — Stone Tone Study"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: true,
    published: true,
    sortOrder: 3,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/artwork-arch-limestone.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 4. Mountain Silhouette (Design 02 Card #4)
  {
    id: "design-slot-7",
    title: "Mountain Silhouette",
    slug: "mountain-silhouette",
    categoryId: "category-slot-7",
    categorySlug: "cat-07",
    categorySlotNumber: 7,
    categoryCode: "CAT-07",
    categoryLabel: "Landscapes",
    summary:
      "Panoramic layered misty mountain ridges in warm taupe, muted sage, and sand tones for calm living spaces.",
    description:
      "Mountain Silhouette introduces a peaceful atmospheric horizon across wide residential walls and executive office blinds, harmonizing effortlessly with natural linen, oak, and stone furnishings.",
    tags: ["landscape", "mountain", "silhouette", "horizon", "artistic-mural", "walls"],
    compatibleSurfaces: ["Walls", "Office Blinds"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/mountain-silhouette",
      "/images/atelier/artwork-mountain-silhouette.jpg",
      "Mountain Silhouette panoramic wall mural behind a beige sofa"
    ),
    galleryMedia: [
      makeMedia(
        "designs/mountain-silhouette-01",
        "/images/atelier/artwork-mountain-silhouette.jpg",
        "Mountain Silhouette — Living Room Elevation"
      ),
      makeMedia(
        "designs/mountain-silhouette-02",
        "/images/atelier/surface-office-blinds-interior.jpg",
        "Mountain Silhouette — Printed Office Blinds Application"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: true,
    published: true,
    sortOrder: 4,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/artwork-mountain-silhouette.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 5. Lotus Atelier Study (Design 02 Card #5)
  {
    id: "design-slot-8",
    title: "Lotus Atelier Study",
    slug: "lotus-atelier-study",
    categoryId: "category-slot-8",
    categorySlug: "cat-08",
    categorySlotNumber: 8,
    categoryCode: "CAT-08",
    categoryLabel: "Floral Studies",
    summary:
      "Painterly botanical lotus blossoms and sage foliage composed on a warm parchment-toned background.",
    description:
      "Lotus Atelier Study pairs soft terracotta-blush petals with poised botanical stems, creating a timeless focal point for bedrooms, lounges, and translucent glass partitions.",
    tags: ["botanical", "lotus", "floral", "walls", "glass", "mural"],
    compatibleSurfaces: ["Walls", "Glass"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/lotus-atelier-study",
      "/images/atelier/artwork-lotus-atelier.jpg",
      "Lotus Atelier Study botanical wall mural in a refined living room"
    ),
    galleryMedia: [
      makeMedia(
        "designs/lotus-atelier-study-01",
        "/images/atelier/artwork-lotus-atelier.jpg",
        "Lotus Atelier Study — Feature Wall View"
      ),
      makeMedia(
        "designs/lotus-atelier-study-02",
        "/images/atelier/surface-glass-interior.jpg",
        "Lotus Atelier Study — Glass Partition Application"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: true,
    published: true,
    sortOrder: 5,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/artwork-lotus-atelier.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 6. Geometric Harmony (Design 02 Card #6)
  {
    id: "design-slot-2",
    title: "Geometric Harmony",
    slug: "category-2-featured-design",
    categoryId: "category-slot-2",
    categorySlug: "cat-02",
    categorySlotNumber: 2,
    categoryCode: "CAT-02",
    categoryLabel: "Geometric",
    summary:
      "Minimalist overlapping arches in terracotta, deep maroon, and warm sand designed for modern architectural interiors.",
    description:
      "Geometric Harmony balances clean modernist curves with warm earthy pigments. Suitable for direct printing on feature walls, office window blinds, and birch plywood millwork.",
    tags: ["geometric", "harmony", "arch", "terracotta", "walls", "office-blinds"],
    compatibleSurfaces: ["Walls", "Office Blinds", "Plywood"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/geometric-harmony",
      "/images/atelier/artwork-geometric-harmony.jpg",
      "Geometric Harmony terracotta arch mural in a sunlit room"
    ),
    galleryMedia: [
      makeMedia(
        "designs/geometric-harmony-01",
        "/images/atelier/artwork-geometric-harmony.jpg",
        "Geometric Harmony — Sunlit Interior Wall"
      ),
      makeMedia(
        "designs/geometric-harmony-02",
        "/images/atelier/surface-plywood-metal-interior.jpg",
        "Geometric Harmony — Plywood & Metal Panel Study"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: true,
    published: true,
    sortOrder: 6,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/artwork-geometric-harmony.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 7. Navona Travertine Strata (Mineral - cat-05)
  {
    id: "design-slot-5",
    title: "Navona Travertine Strata",
    slug: "cat-05-architectural-study-5",
    categoryId: "category-slot-5",
    categorySlug: "cat-05",
    categorySlotNumber: 5,
    categoryCode: "CAT-05",
    categoryLabel: "Mineral",
    summary:
      "Warm sedimentary stone veining and natural travertine texture engineered for continuous wall and tile elevations.",
    description:
      "Navona Travertine Strata brings the organic warmth of honed Italian stone to interior walls, ceramic tiles, and architectural panels.",
    tags: ["mineral", "travertine", "stone", "strata", "walls", "tiles", "pattern"],
    compatibleSurfaces: ["Walls", "Tiles", "Plywood"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/navona-travertine-strata",
      "/images/atelier/cat-mineral-travertine.jpg",
      "Navona Travertine Strata mineral wall print"
    ),
    galleryMedia: [
      makeMedia(
        "designs/navona-travertine-strata-01",
        "/images/atelier/cat-mineral-travertine.jpg",
        "Navona Travertine Strata — Close-Up Stone Grain"
      ),
      makeMedia(
        "designs/navona-travertine-strata-02",
        "/images/atelier/artwork-arch-limestone.jpg",
        "Navona Travertine Strata — Interior Application"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 7,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "pattern",
      textureUrl: "/images/atelier/cat-mineral-travertine.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 8. Siena Abstract Horizon (Abstract - cat-06)
  {
    id: "design-slot-6",
    title: "Siena Abstract Horizon",
    slug: "cat-06-architectural-study-6",
    categoryId: "category-slot-6",
    categorySlug: "cat-06",
    categorySlotNumber: 6,
    categoryCode: "CAT-06",
    categoryLabel: "Abstract",
    summary:
      "Fluid burnt-sienna, ochre, and warm cream ribbons composed for contemporary living rooms and hospitality lounges.",
    description:
      "Siena Abstract Horizon combines sweeping organic curves with rich earthy tones, creating an expressive focal wall without overwhelming the room.",
    tags: ["abstract", "siena", "wave", "terracotta", "walls", "metals"],
    compatibleSurfaces: ["Walls", "Metals", "Plywood"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/siena-abstract-horizon",
      "/images/atelier/card-01-terracotta-wave.jpg",
      "Siena Abstract Horizon wall mural"
    ),
    galleryMedia: [
      makeMedia(
        "designs/siena-abstract-horizon-01",
        "/images/atelier/card-01-terracotta-wave.jpg",
        "Siena Abstract Horizon — Elevation Study"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 8,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/artwork-terracotta-wave.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 9. Artisan Lime Plaster Relief (Plaster & Lime - cat-09)
  {
    id: "design-slot-9",
    title: "Artisan Lime Plaster Relief",
    slug: "cat-09-architectural-study-9",
    categoryId: "category-slot-9",
    categorySlug: "cat-09",
    categorySlotNumber: 9,
    categoryCode: "CAT-09",
    categoryLabel: "Plaster & Lime",
    summary:
      "Subtle hand-swept plaster movement in warm ivory and sand tones for understated architectural walls.",
    description:
      "Designed for minimalist interiors that call for quiet tonal movement and warm daylight interplay across walls and plywood partitions.",
    tags: ["plaster", "lime", "textured", "minimal", "walls", "plywood"],
    compatibleSurfaces: ["Walls", "Plywood"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/artisan-lime-plaster",
      "/images/atelier/cat-textured-plaster.jpg",
      "Artisan Lime Plaster Relief texture study"
    ),
    galleryMedia: [
      makeMedia(
        "designs/artisan-lime-plaster-01",
        "/images/atelier/cat-textured-plaster.jpg",
        "Artisan Lime Plaster Relief — Surface Detail"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 9,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "pattern",
      textureUrl: "/images/atelier/cat-textured-plaster.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 10. Mediterranean Ceramic Tile Mural (Tile Editions - cat-10)
  {
    id: "design-slot-10",
    title: "Mediterranean Tile Fresco",
    slug: "cat-10-architectural-study-10",
    categoryId: "category-slot-10",
    categorySlug: "cat-10",
    categorySlotNumber: 10,
    categoryCode: "CAT-10",
    categoryLabel: "Tile Editions",
    summary:
      "Custom botanical and geometric arch composition printed directly across large-format ceramic and stone tiles.",
    description:
      "Transforms tiled spa walls, dining elevations, and boutique hospitality lobbies with continuous direct-to-tile artwork.",
    tags: ["tiles", "ceramic", "fresco", "botanical", "arch", "hospitality"],
    compatibleSurfaces: ["Tiles", "Walls"],
    dimensionsNote: "Custom-proportioned to your tiled elevation",
    coverImage: makeMedia(
      "designs/mediterranean-tile-fresco",
      "/images/atelier/surface-tiles-interior.jpg",
      "Mediterranean Tile Fresco printed across ceramic wall tiles"
    ),
    galleryMedia: [
      makeMedia(
        "designs/mediterranean-tile-fresco-01",
        "/images/atelier/surface-tiles-interior.jpg",
        "Mediterranean Tile Fresco — Tiled Elevation"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 10,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/surface-tiles-interior.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 11. Frosted Fern Glazing Screen (Glass & Glazing - cat-11)
  {
    id: "design-slot-11",
    title: "Frosted Botanical Glazing Screen",
    slug: "cat-02-quiet-botanical-screen",
    categoryId: "category-slot-11",
    categorySlug: "cat-11",
    categorySlotNumber: 11,
    categoryCode: "CAT-11",
    categoryLabel: "Glass & Glazing",
    summary:
      "Layered botanical screen motif engineered for glass office partitions, sliding doors, and studio enclosures.",
    description:
      "Adds refined privacy and organic character to architectural glass partitions while preserving natural daylight across modern workspaces and residences.",
    tags: ["glass", "glazing", "botanical", "partition", "office-blinds", "walls"],
    compatibleSurfaces: ["Glass", "Office Blinds", "Walls"],
    dimensionsNote: "Custom-scaled for architectural glazing and walls",
    coverImage: makeMedia(
      "designs/frosted-botanical-glazing",
      "/images/atelier/surface-glass-interior.jpg",
      "Frosted Botanical Glazing Screen printed on studio glass partitions"
    ),
    galleryMedia: [
      makeMedia(
        "designs/frosted-botanical-glazing-01",
        "/images/atelier/surface-glass-interior.jpg",
        "Frosted Botanical Glazing Screen — Studio Partition"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 11,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "pattern",
      textureUrl: "/images/atelier/surface-glass-interior.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 12. Birch & Bronze Constructivist Panel (Timber & Metal - cat-12)
  {
    id: "design-slot-12",
    title: "Birch & Bronze Arch Panel",
    slug: "cat-01-fluted-travertine-plinth",
    categoryId: "category-slot-12",
    categorySlug: "cat-12",
    categorySlotNumber: 12,
    categoryCode: "CAT-12",
    categoryLabel: "Timber & Metal",
    summary:
      "Minimalist geometric arch and line study printed directly onto birch plywood millwork and brushed metal panels.",
    description:
      "Harmonizes warm timber grain and brushed metallic cladding with precision architectural line art.",
    tags: ["plywood", "metals", "timber", "bronze", "arch", "geometric"],
    compatibleSurfaces: ["Plywood", "Metals", "Walls"],
    dimensionsNote: "Custom-scaled to timber and metal panel dimensions",
    coverImage: makeMedia(
      "designs/birch-bronze-arch-panel",
      "/images/atelier/surface-plywood-metal-interior.jpg",
      "Birch & Bronze Arch Panel printed on plywood and metal"
    ),
    galleryMedia: [
      makeMedia(
        "designs/birch-bronze-arch-panel-01",
        "/images/atelier/surface-plywood-metal-interior.jpg",
        "Birch & Bronze Arch Panel — Foyer Installation View"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 12,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/surface-plywood-metal-interior.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 13. Panoramic Horizon Blind Edition (Window Blinds - cat-13)
  {
    id: "design-slot-13",
    title: "Panoramic Horizon Blind Edition",
    slug: "cat-13-architectural-study-13",
    categoryId: "category-slot-13",
    categorySlug: "cat-13",
    categorySlotNumber: 13,
    categoryCode: "CAT-13",
    categoryLabel: "Window Blinds",
    summary:
      "Continuous mountain and botanical horizon artwork aligned across multi-bay office window roller blinds.",
    description:
      "Turns drawn commercial window blinds into a cohesive panoramic mural for boardrooms, studios, and executive suites.",
    tags: ["office-blinds", "blinds", "panoramic", "workspace", "horizon"],
    compatibleSurfaces: ["Office Blinds", "Walls"],
    dimensionsNote: "Custom-aligned across individual or multi-window bays",
    coverImage: makeMedia(
      "designs/panoramic-horizon-blinds",
      "/images/atelier/surface-office-blinds-interior.jpg",
      "Panoramic Horizon Blind Edition in an executive boardroom"
    ),
    galleryMedia: [
      makeMedia(
        "designs/panoramic-horizon-blinds-01",
        "/images/atelier/surface-office-blinds-interior.jpg",
        "Panoramic Horizon Blind Edition — Boardroom View"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 13,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/surface-office-blinds-interior.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 14. Tropical Palm Salon Mural (Botanical - cat-01)
  {
    id: "design-slot-1-secondary",
    title: "Tropical Palm Salon Mural",
    slug: "tropical-palm-salon-mural",
    categoryId: "category-slot-1",
    categorySlug: "cat-01",
    categorySlotNumber: 1,
    categoryCode: "CAT-01",
    categoryLabel: "Botanical",
    summary:
      "Statement banana-leaf and tropical palm mural in muted sage, ochre, and warm beige for sunlit living rooms.",
    description:
      "Featured in our signature living room collection, Tropical Palm Salon Mural pairs lush botanical scale with warm plaster tones.",
    tags: ["botanical", "palm", "tropical", "living-room", "mural", "walls"],
    compatibleSurfaces: ["Walls", "Tiles", "Glass"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/tropical-palm-salon",
      "/images/atelier/hero-botanical-living.jpg",
      "Tropical Palm Salon Mural in a sunlit living room with curved cream sofa"
    ),
    galleryMedia: [
      makeMedia(
        "designs/tropical-palm-salon-01",
        "/images/atelier/hero-botanical-living.jpg",
        "Tropical Palm Salon Mural — Living Room View"
      ),
      makeMedia(
        "designs/tropical-palm-salon-02",
        "/images/atelier/wall-preview-after.jpg",
        "Tropical Palm Salon Mural — Direct Wall Elevation"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: true,
    published: true,
    sortOrder: 14,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/wall-preview-after.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 15. Olive Grove & Archway Fresco (Botanical - cat-01)
  {
    id: "design-slot-1-tertiary",
    title: "Olive Grove & Archway Fresco",
    slug: "olive-grove-archway-fresco",
    categoryId: "category-slot-1",
    categorySlug: "cat-01",
    categorySlotNumber: 1,
    categoryCode: "CAT-01",
    categoryLabel: "Botanical",
    summary:
      "Sun-dappled Mediterranean olive branches and botanical stems framed within a warm lime-plaster elevation.",
    description:
      "Olive Grove & Archway Fresco brings organic tranquility to sunlit foyers, dining rooms, and double-height living walls with soft botanical brushwork.",
    tags: ["botanical", "olive", "fresco", "plaster", "walls", "tiles"],
    compatibleSurfaces: ["Walls", "Tiles"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/olive-grove-archway-fresco",
      "/images/atelier/process-hero-sculptural-arch.jpg",
      "Olive Grove & Archway Fresco botanical wall mural framed by a sculptural arch"
    ),
    galleryMedia: [
      makeMedia(
        "designs/olive-grove-archway-fresco-01",
        "/images/atelier/process-hero-sculptural-arch.jpg",
        "Olive Grove & Archway Fresco — Archway Perspective"
      ),
      makeMedia(
        "designs/olive-grove-archway-fresco-02",
        "/images/atelier/artwork-botanical-canopy.jpg",
        "Olive Grove & Archway Fresco — Botanical Foliage Detail"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 15,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/process-hero-sculptural-arch.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 16. Bauhaus Terracotta Meridian (Geometric - cat-02)
  {
    id: "design-slot-2-secondary",
    title: "Bauhaus Terracotta Meridian",
    slug: "bauhaus-terracotta-meridian",
    categoryId: "category-slot-2",
    categorySlug: "cat-02",
    categorySlotNumber: 2,
    categoryCode: "CAT-02",
    categoryLabel: "Geometric",
    summary:
      "Poised concentric arches and solar disc geometry in burnt sienna, ochre, and warm parchment on plaster.",
    description:
      "Bauhaus Terracotta Meridian pairs clean architectural proportions with warm mineral pigments, calibrated for direct printing on feature walls and timber panels.",
    tags: ["geometric", "bauhaus", "meridian", "terracotta", "walls", "plywood"],
    compatibleSurfaces: ["Walls", "Plywood", "Metals"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/bauhaus-terracotta-meridian",
      "/images/atelier/wall-preview-matched-after.jpg",
      "Bauhaus Terracotta Meridian geometric arch mural on a sunlit plaster wall"
    ),
    galleryMedia: [
      makeMedia(
        "designs/bauhaus-terracotta-meridian-01",
        "/images/atelier/wall-preview-matched-after.jpg",
        "Bauhaus Terracotta Meridian — Sunlit Plaster Elevation"
      ),
      makeMedia(
        "designs/bauhaus-terracotta-meridian-02",
        "/images/atelier/artwork-geometric-harmony.jpg",
        "Bauhaus Terracotta Meridian — Living Room Study"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: true,
    published: true,
    sortOrder: 16,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/wall-preview-matched-after.jpg",
      width: 1200,
      height: 896,
      mimeType: "image/jpeg",
    },
  },

  // 17. Monolith Arch & Shadow Study (Geometric - cat-02)
  {
    id: "design-slot-2-tertiary",
    title: "Monolith Arch & Shadow Study",
    slug: "monolith-arch-shadow-study",
    categoryId: "category-slot-2",
    categorySlug: "cat-02",
    categorySlotNumber: 2,
    categoryCode: "CAT-02",
    categoryLabel: "Geometric",
    summary:
      "Sculptural stepped geometry and warm bronze line work designed for contemporary dining and reception spaces.",
    description:
      "Monolith Arch & Shadow Study introduces rhythmic architectural balance across plaster walls, birch plywood millwork, and brushed metal elevations.",
    tags: ["geometric", "monolith", "arch", "minimalist", "walls", "metals"],
    compatibleSurfaces: ["Walls", "Plywood", "Metals"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/monolith-arch-shadow-study",
      "/images/atelier/about-story-arch-vase.jpg",
      "Monolith Arch & Shadow Study geometric composition in a warm studio interior"
    ),
    galleryMedia: [
      makeMedia(
        "designs/monolith-arch-shadow-study-01",
        "/images/atelier/about-story-arch-vase.jpg",
        "Monolith Arch & Shadow Study — Architectural Vignette"
      ),
      makeMedia(
        "designs/monolith-arch-shadow-study-02",
        "/images/atelier/surface-plywood-metal-interior.jpg",
        "Monolith Arch & Shadow Study — Timber & Metal Application"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 17,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/about-story-arch-vase.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 18. Sculpted Dune & Ochre Relief (Textured - cat-03)
  {
    id: "design-slot-3-secondary",
    title: "Sculpted Dune & Ochre Relief",
    slug: "sculpted-dune-ochre-relief",
    categoryId: "category-slot-3",
    categorySlug: "cat-03",
    categorySlotNumber: 3,
    categoryCode: "CAT-03",
    categoryLabel: "Textured",
    summary:
      "Tactile wind-carved sand and terracotta contours engineered for statement hospitality and residential walls.",
    description:
      "Sculpted Dune & Ochre Relief captures the interplay of raking architectural light across layered earth strata.",
    tags: ["textured", "dune", "ochre", "relief", "walls", "plywood"],
    compatibleSurfaces: ["Walls", "Plywood"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/sculpted-dune-ochre-relief",
      "/images/atelier/project-retail-terracotta-arch.jpg",
      "Sculpted Dune & Ochre Relief wall installation in a luxury lounge"
    ),
    galleryMedia: [
      makeMedia(
        "designs/sculpted-dune-ochre-relief-01",
        "/images/atelier/project-retail-terracotta-arch.jpg",
        "Sculpted Dune & Ochre Relief — Lounge Elevation"
      ),
      makeMedia(
        "designs/sculpted-dune-ochre-relief-02",
        "/images/atelier/artwork-terracotta-wave.jpg",
        "Sculpted Dune & Ochre Relief — Wave Detail"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 18,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/project-retail-terracotta-arch.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 19. Raw Travertine & Plaster Ribbons (Textured - cat-03)
  {
    id: "design-slot-3-tertiary",
    title: "Raw Travertine & Plaster Ribbons",
    slug: "raw-travertine-plaster-ribbons",
    categoryId: "category-slot-3",
    categorySlug: "cat-03",
    categorySlotNumber: 3,
    categoryCode: "CAT-03",
    categoryLabel: "Textured",
    summary:
      "Hand-troweled warm beige plaster sweeps paired with subtle mineral grain for quiet luxury interiors.",
    description:
      "Brings artisanal surface depth to contemporary living rooms, corridors, and architectural feature walls.",
    tags: ["textured", "plaster", "travertine", "minimal", "walls"],
    compatibleSurfaces: ["Walls", "Tiles", "Plywood"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/raw-travertine-plaster-ribbons",
      "/images/atelier/cat-textured-plaster.jpg",
      "Raw Travertine & Plaster Ribbons tactile wall study"
    ),
    galleryMedia: [
      makeMedia(
        "designs/raw-travertine-plaster-ribbons-01",
        "/images/atelier/cat-textured-plaster.jpg",
        "Raw Travertine & Plaster Ribbons — Surface Relief"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 19,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "pattern",
      textureUrl: "/images/atelier/cat-textured-plaster.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 20. Palladian Vault & Rotunda (Architectural - cat-04)
  {
    id: "design-slot-4-secondary",
    title: "Palladian Vault & Rotunda",
    slug: "palladian-vault-rotunda",
    categoryId: "category-slot-4",
    categorySlug: "cat-04",
    categorySlotNumber: 4,
    categoryCode: "CAT-04",
    categoryLabel: "Architectural",
    summary:
      "Sculptural curved lime-plaster rotunda and recessed arch perspective designed to expand interior volume.",
    description:
      "Palladian Vault & Rotunda creates a breathtaking architectural focal point for living rooms, dining halls, and private galleries.",
    tags: ["architectural", "rotunda", "vault", "arch", "walls", "tiles"],
    compatibleSurfaces: ["Walls", "Tiles"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/palladian-vault-rotunda",
      "/images/atelier/services-hero-sculptural-lotus.jpg",
      "Palladian Vault & Rotunda sculptural arch interior elevation"
    ),
    galleryMedia: [
      makeMedia(
        "designs/palladian-vault-rotunda-01",
        "/images/atelier/services-hero-sculptural-lotus.jpg",
        "Palladian Vault & Rotunda — Full Elevation"
      ),
      makeMedia(
        "designs/palladian-vault-rotunda-02",
        "/images/atelier/artwork-arch-limestone.jpg",
        "Palladian Vault & Rotunda — Limestone Colonnade Detail"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 20,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/services-hero-sculptural-lotus.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 21. Helical Travertine Stairwell Study (Architectural - cat-04)
  {
    id: "design-slot-4-tertiary",
    title: "Helical Travertine Atrium Study",
    slug: "helical-travertine-atrium-study",
    categoryId: "category-slot-4",
    categorySlug: "cat-04",
    categorySlotNumber: 4,
    categoryCode: "CAT-04",
    categoryLabel: "Architectural",
    summary:
      "Sweeping sculptural curves and warm recessed lighting geometry tailored for foyers and stairwell elevations.",
    description:
      "Celebrates contemporary architectural form with soft travertine shading and seamless large-scale precision.",
    tags: ["architectural", "atrium", "travertine", "sculptural", "walls"],
    compatibleSurfaces: ["Walls", "Plywood"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/helical-travertine-atrium-study",
      "/images/atelier/services-spiral-staircase.jpg",
      "Helical Travertine Atrium Study sculptural architectural wall art"
    ),
    galleryMedia: [
      makeMedia(
        "designs/helical-travertine-atrium-study-01",
        "/images/atelier/services-spiral-staircase.jpg",
        "Helical Travertine Atrium Study — Atrium Perspective"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 21,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/services-spiral-staircase.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 22. Roman Vein Cut Alabaster (Mineral - cat-05)
  {
    id: "design-slot-5-secondary",
    title: "Roman Vein-Cut Alabaster",
    slug: "roman-vein-cut-alabaster",
    categoryId: "category-slot-5",
    categorySlug: "cat-05",
    categorySlotNumber: 5,
    categoryCode: "CAT-05",
    categoryLabel: "Mineral",
    summary:
      "Luminous warm ivory and sand mineral strata inspired by honed Italian alabaster and limestone quarries.",
    description:
      "Roman Vein-Cut Alabaster delivers the serene permanence of natural stone across walls, tiles, and architectural joinery without heavy slab installation.",
    tags: ["mineral", "alabaster", "stone", "vein-cut", "walls", "tiles"],
    compatibleSurfaces: ["Walls", "Tiles", "Plywood"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/roman-vein-cut-alabaster",
      "/images/atelier/studio-about-interior.jpg",
      "Roman Vein-Cut Alabaster mineral surface study in the Atelier showroom"
    ),
    galleryMedia: [
      makeMedia(
        "designs/roman-vein-cut-alabaster-01",
        "/images/atelier/studio-about-interior.jpg",
        "Roman Vein-Cut Alabaster — Material Table Study"
      ),
      makeMedia(
        "designs/roman-vein-cut-alabaster-02",
        "/images/atelier/cat-mineral-travertine.jpg",
        "Roman Vein-Cut Alabaster — Stone Veining Detail"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 22,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "pattern",
      textureUrl: "/images/atelier/cat-mineral-travertine.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 23. Raw Umber & Sandstone Quarry (Mineral - cat-05)
  {
    id: "design-slot-5-tertiary",
    title: "Raw Umber & Sandstone Quarry",
    slug: "raw-umber-sandstone-quarry",
    categoryId: "category-slot-5",
    categorySlug: "cat-05",
    categorySlotNumber: 5,
    categoryCode: "CAT-05",
    categoryLabel: "Mineral",
    summary:
      "Layered sedimentary sandstone and warm terracotta mineral bands calibrated for expansive feature walls.",
    description:
      "Brings grounded geological warmth to living rooms, executive suites, and tiled hospitality spaces.",
    tags: ["mineral", "sandstone", "umber", "quarry", "walls", "tiles"],
    compatibleSurfaces: ["Walls", "Tiles"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/raw-umber-sandstone-quarry",
      "/images/atelier/process-stage-04-approval.jpg",
      "Raw Umber & Sandstone Quarry mineral wall calibration study"
    ),
    galleryMedia: [
      makeMedia(
        "designs/raw-umber-sandstone-quarry-01",
        "/images/atelier/process-stage-04-approval.jpg",
        "Raw Umber & Sandstone Quarry — Studio Calibration View"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 23,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/process-stage-04-approval.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 24. Crimson Alcove & Ochre Study (Abstract - cat-06)
  {
    id: "design-slot-6-secondary",
    title: "Crimson Alcove & Ochre Study",
    slug: "crimson-alcove-ochre-study",
    categoryId: "category-slot-6",
    categorySlug: "cat-06",
    categorySlotNumber: 6,
    categoryCode: "CAT-06",
    categoryLabel: "Abstract",
    summary:
      "Deep burgundy-crimson architectural curves balanced with warm parchment and terracotta tonal blocks.",
    description:
      "Crimson Alcove & Ochre Study creates an intimate gallery-like atmosphere for lounges, dining rooms, and boutique hospitality spaces.",
    tags: ["abstract", "crimson", "ochre", "alcove", "walls", "plywood"],
    compatibleSurfaces: ["Walls", "Plywood", "Metals"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/crimson-alcove-ochre-study",
      "/images/atelier/journal-hero-burgundy-alcove.jpg",
      "Crimson Alcove & Ochre Study abstract mural in a burgundy architectural alcove"
    ),
    galleryMedia: [
      makeMedia(
        "designs/crimson-alcove-ochre-study-01",
        "/images/atelier/journal-hero-burgundy-alcove.jpg",
        "Crimson Alcove & Ochre Study — Alcove Elevation"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 24,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/journal-hero-burgundy-alcove.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 25. Gallery Still Life & Tonal Planes (Abstract - cat-06)
  {
    id: "design-slot-6-tertiary",
    title: "Gallery Tonal Planes Study",
    slug: "gallery-tonal-planes-study",
    categoryId: "category-slot-6",
    categorySlug: "cat-06",
    categorySlotNumber: 6,
    categoryCode: "CAT-06",
    categoryLabel: "Abstract",
    summary:
      "Poetic interplay of warm linen, raw umber, and soft shadow planes for contemporary residential walls.",
    description:
      "Designed for collectors and architects seeking a serene, museum-grade abstract wall composition.",
    tags: ["abstract", "tonal", "gallery", "minimal", "walls"],
    compatibleSurfaces: ["Walls", "Plywood"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/gallery-tonal-planes-study",
      "/images/atelier/journal-divider-still-life.jpg",
      "Gallery Tonal Planes Study abstract architectural composition"
    ),
    galleryMedia: [
      makeMedia(
        "designs/gallery-tonal-planes-study-01",
        "/images/atelier/journal-divider-still-life.jpg",
        "Gallery Tonal Planes Study — Studio Composition"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 25,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/journal-divider-still-life.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 26. Backlit Dune & Valley Horizon (Landscapes - cat-07)
  {
    id: "design-slot-7-secondary",
    title: "Backlit Dune & Valley Horizon",
    slug: "backlit-dune-valley-horizon",
    categoryId: "category-slot-7",
    categorySlug: "cat-07",
    categorySlotNumber: 7,
    categoryCode: "CAT-07",
    categoryLabel: "Landscapes",
    summary:
      "Expansive desert ridge and misty valley panorama engineered for wide boardrooms and living room elevations.",
    description:
      "Backlit Dune & Valley Horizon brings calm spatial depth to long architectural walls and multi-bay window blinds.",
    tags: ["landscape", "dune", "horizon", "panoramic", "walls", "office-blinds"],
    compatibleSurfaces: ["Walls", "Office Blinds", "Plywood"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/backlit-dune-valley-horizon",
      "/images/atelier/project-boardroom-relief-wall.jpg",
      "Backlit Dune & Valley Horizon panoramic mural in an executive space"
    ),
    galleryMedia: [
      makeMedia(
        "designs/backlit-dune-valley-horizon-01",
        "/images/atelier/project-boardroom-relief-wall.jpg",
        "Backlit Dune & Valley Horizon — Wide Wall View"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 26,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/project-boardroom-relief-wall.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 27. Kyoto Crane & Crimson Sun Panorama (Landscapes - cat-07)
  {
    id: "design-slot-7-tertiary",
    title: "Kyoto Crane & Crimson Sun",
    slug: "kyoto-crane-crimson-sun",
    categoryId: "category-slot-7",
    categorySlug: "cat-07",
    categorySlotNumber: 7,
    categoryCode: "CAT-07",
    categoryLabel: "Landscapes",
    summary:
      "Poetic horizon featuring soaring cranes, misty pines, and a warm crimson sun on textured plaster.",
    description:
      "A signature narrative landscape mural crafted for statement living rooms, dining halls, and luxury suites.",
    tags: ["landscape", "crane", "kyoto", "crimson", "walls"],
    compatibleSurfaces: ["Walls", "Plywood", "Glass"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/kyoto-crane-crimson-sun",
      "/images/atelier/project-hero-crane-living.jpg",
      "Kyoto Crane & Crimson Sun panoramic mural in a luxury living room"
    ),
    galleryMedia: [
      makeMedia(
        "designs/kyoto-crane-crimson-sun-01",
        "/images/atelier/project-hero-crane-living.jpg",
        "Kyoto Crane & Crimson Sun — Living Room Elevation"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 27,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/project-hero-crane-living.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 28. Sanctuary Lotus & Archway Study (Floral Studies - cat-08)
  {
    id: "design-slot-8-secondary",
    title: "Sanctuary Lotus & Archway Study",
    slug: "sanctuary-lotus-archway-study",
    categoryId: "category-slot-8",
    categorySlug: "cat-08",
    categorySlotNumber: 8,
    categoryCode: "CAT-08",
    categoryLabel: "Floral Studies",
    summary:
      "Large-scale blush lotus blooms and sage stems composed for curved architectural alcoves and bedrooms.",
    description:
      "Sanctuary Lotus & Archway Study brings serene botanical poetry to plaster walls, ceramic tiles, and frosted glass partitions.",
    tags: ["floral", "lotus", "sanctuary", "botanical", "walls", "glass"],
    compatibleSurfaces: ["Walls", "Glass", "Tiles"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/sanctuary-lotus-archway-study",
      "/images/atelier/about-hero-lotus-arch.jpg",
      "Sanctuary Lotus & Archway Study floral mural in a sunlit archway"
    ),
    galleryMedia: [
      makeMedia(
        "designs/sanctuary-lotus-archway-study-01",
        "/images/atelier/about-hero-lotus-arch.jpg",
        "Sanctuary Lotus & Archway Study — Archway View"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 28,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/about-hero-lotus-arch.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 29. Pressed Herbarium & Linen Study (Floral Studies - cat-08)
  {
    id: "design-slot-8-tertiary",
    title: "Pressed Herbarium & Linen Study",
    slug: "pressed-herbarium-linen-study",
    categoryId: "category-slot-8",
    categorySlug: "cat-08",
    categorySlotNumber: 8,
    categoryCode: "CAT-08",
    categoryLabel: "Floral Studies",
    summary:
      "Delicate hand-drawn botanical flora studies in warm sepia, terracotta, and sage on parchment tones.",
    description:
      "Inspired by archival studio sketchbooks, ideal for intimate dining rooms, dressing suites, and study walls.",
    tags: ["floral", "herbarium", "sketchbook", "botanical", "walls"],
    compatibleSurfaces: ["Walls", "Glass", "Plywood"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/pressed-herbarium-linen-study",
      "/images/atelier/about-story-sketchbook.jpg",
      "Pressed Herbarium & Linen Study botanical artwork"
    ),
    galleryMedia: [
      makeMedia(
        "designs/pressed-herbarium-linen-study-01",
        "/images/atelier/about-story-sketchbook.jpg",
        "Pressed Herbarium & Linen Study — Studio Detail"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 29,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/about-story-sketchbook.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 30. Venetian Marmorino & Warm Sand (Plaster & Lime - cat-09)
  {
    id: "design-slot-9-secondary",
    title: "Venetian Marmorino & Warm Sand",
    slug: "venetian-marmorino-warm-sand",
    categoryId: "category-slot-9",
    categorySlug: "cat-09",
    categorySlotNumber: 9,
    categoryCode: "CAT-09",
    categoryLabel: "Plaster & Lime",
    summary:
      "Luminous lime-wash and soft marmorino cloud movement tailored for sunlit architectural elevations.",
    description:
      "Delivers the timeless warmth of hand-burnished Venetian lime plaster across contemporary walls and joinery.",
    tags: ["plaster", "marmorino", "lime", "warm-sand", "walls", "plywood"],
    compatibleSurfaces: ["Walls", "Plywood"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/venetian-marmorino-warm-sand",
      "/images/atelier/wall-preview-before.jpg",
      "Venetian Marmorino & Warm Sand sunlit lime plaster wall"
    ),
    galleryMedia: [
      makeMedia(
        "designs/venetian-marmorino-warm-sand-01",
        "/images/atelier/wall-preview-before.jpg",
        "Venetian Marmorino & Warm Sand — Sunlit Wall Elevation"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 30,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "pattern",
      textureUrl: "/images/atelier/wall-preview-before.jpg",
      width: 1200,
      height: 896,
      mimeType: "image/jpeg",
    },
  },

  // 31. Burgundy Lime Alcove Patina (Plaster & Lime - cat-09)
  {
    id: "design-slot-9-tertiary",
    title: "Burgundy Lime Alcove Patina",
    slug: "burgundy-lime-alcove-patina",
    categoryId: "category-slot-9",
    categorySlug: "cat-09",
    categorySlotNumber: 9,
    categoryCode: "CAT-09",
    categoryLabel: "Plaster & Lime",
    summary:
      "Rich earth-red and warm parchment lime patina engineered for statement dining rooms and lounges.",
    description:
      "Pairs deep architectural pigment with authentic lime-plaster tonal variation.",
    tags: ["plaster", "lime", "burgundy", "patina", "walls"],
    compatibleSurfaces: ["Walls", "Plywood"],
    dimensionsNote: "Custom-proportioned to your architectural wall dimensions",
    coverImage: makeMedia(
      "designs/burgundy-lime-alcove-patina",
      "/images/atelier/visualizer-hero-burgundy-alcove.jpg",
      "Burgundy Lime Alcove Patina plaster wall finish"
    ),
    galleryMedia: [
      makeMedia(
        "designs/burgundy-lime-alcove-patina-01",
        "/images/atelier/visualizer-hero-burgundy-alcove.jpg",
        "Burgundy Lime Alcove Patina — Interior Alcove"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 31,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "pattern",
      textureUrl: "/images/atelier/visualizer-hero-burgundy-alcove.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 32. Amalfi Terracotta & Ceramic Arch (Tile Editions - cat-10)
  {
    id: "design-slot-10-secondary",
    title: "Amalfi Terracotta Tile Arch",
    slug: "amalfi-terracotta-tile-arch",
    categoryId: "category-slot-10",
    categorySlug: "cat-10",
    categorySlotNumber: 10,
    categoryCode: "CAT-10",
    categoryLabel: "Tile Editions",
    summary:
      "Warm terracotta and limestone geometric motifs calibrated for direct printing across ceramic and vitrified tile grids.",
    description:
      "Engineered with UV-cured ceramic inks for bath sanctuaries, courtyards, and hospitality feature walls.",
    tags: ["tiles", "amalfi", "terracotta", "ceramic", "arch"],
    compatibleSurfaces: ["Tiles", "Walls"],
    dimensionsNote: "Custom-proportioned to your tiled elevation",
    coverImage: makeMedia(
      "designs/amalfi-terracotta-tile-arch",
      "/images/atelier/contact-studio-dining-mural.jpg",
      "Amalfi Terracotta Tile Arch mural in a dining room"
    ),
    galleryMedia: [
      makeMedia(
        "designs/amalfi-terracotta-tile-arch-01",
        "/images/atelier/contact-studio-dining-mural.jpg",
        "Amalfi Terracotta Tile Arch — Dining Elevation"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 32,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/contact-studio-dining-mural.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 33. Travertine Mosaic & Lotus Tile Grid (Tile Editions - cat-10)
  {
    id: "design-slot-10-tertiary",
    title: "Travertine & Lotus Tile Edition",
    slug: "travertine-lotus-tile-edition",
    categoryId: "category-slot-10",
    categorySlug: "cat-10",
    categorySlotNumber: 10,
    categoryCode: "CAT-10",
    categoryLabel: "Tile Editions",
    summary:
      "Delicate botanical and stone-veined mural aligned across large-format porcelain and stone tiles.",
    description:
      "Brings seamless artwork continuity across grouted tile joints for spa and dining elevations.",
    tags: ["tiles", "porcelain", "lotus", "travertine", "spa"],
    compatibleSurfaces: ["Tiles", "Walls", "Glass"],
    dimensionsNote: "Custom-proportioned to your tiled elevation",
    coverImage: makeMedia(
      "designs/travertine-lotus-tile-edition",
      "/images/atelier/process-stage-05-execution.jpg",
      "Travertine & Lotus Tile Edition precision installation"
    ),
    galleryMedia: [
      makeMedia(
        "designs/travertine-lotus-tile-edition-01",
        "/images/atelier/process-stage-05-execution.jpg",
        "Travertine & Lotus Tile Edition — Installation View"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 33,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/process-stage-05-execution.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 34. Fluted Reed & Linen Glass Screen (Glass & Glazing - cat-11)
  {
    id: "design-slot-11-secondary",
    title: "Fluted Reed & Linen Glass Screen",
    slug: "fluted-reed-linen-glass-screen",
    categoryId: "category-slot-11",
    categorySlug: "cat-11",
    categorySlotNumber: 11,
    categoryCode: "CAT-11",
    categoryLabel: "Glass & Glazing",
    summary:
      "Translucent architectural arch and linear privacy screen printed with white-ink opacity grading on glass.",
    description:
      "Softens sightlines across conference enclosures and residential glass partitions while transmitting warm natural daylight.",
    tags: ["glass", "glazing", "privacy", "arch", "partition"],
    compatibleSurfaces: ["Glass", "Office Blinds"],
    dimensionsNote: "Custom-scaled for architectural glazing and partitions",
    coverImage: makeMedia(
      "designs/fluted-reed-linen-glass-screen",
      "/images/atelier/process-stage-01-consultation.jpg",
      "Fluted Reed & Linen Glass Screen studio material study"
    ),
    galleryMedia: [
      makeMedia(
        "designs/fluted-reed-linen-glass-screen-01",
        "/images/atelier/process-stage-01-consultation.jpg",
        "Fluted Reed & Linen Glass Screen — Studio Sample"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 34,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "pattern",
      textureUrl: "/images/atelier/surface-glass-interior.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 35. Translucent Lotus Glazing Mural (Glass & Glazing - cat-11)
  {
    id: "design-slot-11-tertiary",
    title: "Translucent Lotus Glazing Mural",
    slug: "translucent-lotus-glazing-mural",
    categoryId: "category-slot-11",
    categorySlug: "cat-11",
    categorySlotNumber: 11,
    categoryCode: "CAT-11",
    categoryLabel: "Glass & Glazing",
    summary:
      "Etched-look lotus and botanical silhouettes designed for acoustic glass walls and sliding studio doors.",
    description:
      "Combines delicate botanical artistry with precision UV glass ink adhesion.",
    tags: ["glass", "lotus", "glazing", "acoustic-glass", "botanical"],
    compatibleSurfaces: ["Glass", "Walls"],
    dimensionsNote: "Custom-scaled for architectural glazing and walls",
    coverImage: makeMedia(
      "designs/translucent-lotus-glazing-mural",
      "/images/atelier/artwork-lotus-atelier.jpg",
      "Translucent Lotus Glazing Mural botanical study"
    ),
    galleryMedia: [
      makeMedia(
        "designs/translucent-lotus-glazing-mural-01",
        "/images/atelier/artwork-lotus-atelier.jpg",
        "Translucent Lotus Glazing Mural — Elevation"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 35,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/artwork-lotus-atelier.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 36. Brushed Champagne Bronze Cladding (Timber & Metal - cat-12)
  {
    id: "design-slot-12-secondary",
    title: "Brushed Champagne Bronze Cladding",
    slug: "brushed-champagne-bronze-cladding",
    categoryId: "category-slot-12",
    categorySlug: "cat-12",
    categorySlotNumber: 12,
    categoryCode: "CAT-12",
    categoryLabel: "Timber & Metal",
    summary:
      "Precision architectural line geometry and warm tonal gradients printed directly on brushed bronze and aluminum panels.",
    description:
      "Engineered for luxury elevator lobbies, reception desks, and custom millwork elevations.",
    tags: ["metals", "bronze", "plywood", "cladding", "geometric"],
    compatibleSurfaces: ["Metals", "Plywood", "Walls"],
    dimensionsNote: "Custom-scaled to timber and metal panel dimensions",
    coverImage: makeMedia(
      "designs/brushed-champagne-bronze-cladding",
      "/images/atelier/surface-metals-brushed-bronze.jpg",
      "Brushed Champagne Bronze Cladding with printed geometric line art"
    ),
    galleryMedia: [
      makeMedia(
        "designs/brushed-champagne-bronze-cladding-01",
        "/images/atelier/surface-metals-brushed-bronze.jpg",
        "Brushed Champagne Bronze Cladding — Metallic Detail"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 36,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "pattern",
      textureUrl: "/images/atelier/surface-metals-brushed-bronze.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 37. Nordic Birch & Terracotta Inlay Study (Timber & Metal - cat-12)
  {
    id: "design-slot-12-tertiary",
    title: "Nordic Birch & Terracotta Millwork",
    slug: "nordic-birch-terracotta-millwork",
    categoryId: "category-slot-12",
    categorySlug: "cat-12",
    categorySlotNumber: 12,
    categoryCode: "CAT-12",
    categoryLabel: "Timber & Metal",
    summary:
      "Warm terracotta and charcoal organic forms printed directly onto architectural birch plywood cabinetry and wall panels.",
    description:
      "Allows natural wood grain to show through translucent matte UV pigments for bespoke joinery.",
    tags: ["plywood", "birch", "millwork", "terracotta", "metals"],
    compatibleSurfaces: ["Plywood", "Metals", "Walls"],
    dimensionsNote: "Custom-scaled to timber and metal panel dimensions",
    coverImage: makeMedia(
      "designs/nordic-birch-terracotta-millwork",
      "/images/atelier/artwork-geometric-harmony.jpg",
      "Nordic Birch & Terracotta Millwork architectural study"
    ),
    galleryMedia: [
      makeMedia(
        "designs/nordic-birch-terracotta-millwork-01",
        "/images/atelier/artwork-geometric-harmony.jpg",
        "Nordic Birch & Terracotta Millwork — Interior View"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 37,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/artwork-geometric-harmony.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 38. Botanical Solar Screen Blind Edition (Window Blinds - cat-13)
  {
    id: "design-slot-13-secondary",
    title: "Botanical Solar Screen Blind Edition",
    slug: "botanical-solar-screen-blind-edition",
    categoryId: "category-slot-13",
    categorySlug: "cat-13",
    categorySlotNumber: 13,
    categoryCode: "CAT-13",
    categoryLabel: "Window Blinds",
    summary:
      "Delicate overhanging foliage motif printed across architectural solar-screen roller blinds for sunlit studios.",
    description:
      "Transforms glare-control window blinds into a serene botanical frieze when lowered.",
    tags: ["office-blinds", "blinds", "botanical", "solar-screen", "studio"],
    compatibleSurfaces: ["Office Blinds", "Walls", "Glass"],
    dimensionsNote: "Custom-aligned across individual or multi-window bays",
    coverImage: makeMedia(
      "designs/botanical-solar-screen-blind-edition",
      "/images/atelier/artwork-botanical-canopy.jpg",
      "Botanical Solar Screen Blind Edition in a sunlit room"
    ),
    galleryMedia: [
      makeMedia(
        "designs/botanical-solar-screen-blind-edition-01",
        "/images/atelier/artwork-botanical-canopy.jpg",
        "Botanical Solar Screen Blind Edition — Elevation"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 38,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/artwork-botanical-canopy.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },

  // 39. Architectural Archway Roller Blind Triptych (Window Blinds - cat-13)
  {
    id: "design-slot-13-tertiary",
    title: "Architectural Arch Blind Triptych",
    slug: "architectural-arch-blind-triptych",
    categoryId: "category-slot-13",
    categorySlug: "cat-13",
    categorySlotNumber: 13,
    categoryCode: "CAT-13",
    categoryLabel: "Window Blinds",
    summary:
      "Three-bay synchronized limestone arch and colonnade composition engineered for executive window elevations.",
    description:
      "Registered bay-to-bay so multi-window roller blinds form a continuous architectural colonnade.",
    tags: ["office-blinds", "triptych", "arch", "executive", "walls"],
    compatibleSurfaces: ["Office Blinds", "Walls"],
    dimensionsNote: "Custom-aligned across individual or multi-window bays",
    coverImage: makeMedia(
      "designs/architectural-arch-blind-triptych",
      "/images/atelier/artwork-arch-limestone.jpg",
      "Architectural Arch Blind Triptych colonnade study"
    ),
    galleryMedia: [
      makeMedia(
        "designs/architectural-arch-blind-triptych-01",
        "/images/atelier/artwork-arch-limestone.jpg",
        "Architectural Arch Blind Triptych — Full Elevation"
      ),
    ],
    videoAsset: null,
    aspectRatio: "landscape",
    featured: false,
    published: true,
    sortOrder: 39,
    isDevelopmentFixture: true,
    visualizerConfig: {
      defaultMode: "mural",
      textureUrl: "/images/atelier/artwork-arch-limestone.jpg",
      width: 1600,
      height: 1000,
      mimeType: "image/jpeg",
    },
  },
];

/**
 * Resolves a category record from URL query parameters (`?category=cat-01`, `?category=botanical`, or `?slot=1`).
 */
export function resolveCategoryFromQuery(params: {
  categoryParam?: string | null;
  slotParam?: string | null;
}): CatalogueCategoryRecord | null {
  const rawCategory = params.categoryParam?.trim().toLowerCase();
  if (rawCategory && rawCategory !== "all") {
    const bySlugOrCodeOrName = DESIGN_CATEGORY_RECORDS.find(
      (cat) =>
        cat.slug.toLowerCase() === rawCategory ||
        cat.slotCode.toLowerCase() === rawCategory ||
        cat.name.toLowerCase() === rawCategory ||
        String(cat.slotNumber) === rawCategory
    );
    if (bySlugOrCodeOrName) return bySlugOrCodeOrName;
  }

  const slotNum = Number(params.slotParam || "0");
  if (Number.isInteger(slotNum) && slotNum >= 1 && slotNum <= 13) {
    return (
      DESIGN_CATEGORY_RECORDS.find((cat) => cat.slotNumber === slotNum) ?? null
    );
  }

  return null;
}

/**
 * Looks up a design record by slug, ID, or normalized title slug across the catalogue.
 */
export function findDesignBySlugOrId(
  identifier?: string | null,
  source: ReadonlyArray<CatalogueDesignItem> = DEVELOPMENT_FIXTURE_DESIGNS
): CatalogueDesignItem | null {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  if (!clean) return null;

  const normalizeSlug = (val: string) =>
    val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const cleanSlug = normalizeSlug(clean);
  const cleanWithoutSuffix = cleanSlug.replace(/-wall-mural$/, "");

  return (
    source.find((item) => {
      const titleSlug = normalizeSlug(item.title);
      return (
        item.slug.toLowerCase() === clean ||
        item.id.toLowerCase() === clean ||
        item.title.toLowerCase() === clean ||
        titleSlug === cleanSlug ||
        titleSlug === cleanWithoutSuffix ||
        normalizeSlug(item.slug) === cleanSlug
      );
    }) ?? null
  );
}

/**
 * Filters and sorts published designs by category slug, search query, surface filter, and sort order.
 */
export function filterCatalogueDesigns(
  designs: ReadonlyArray<CatalogueDesignItem>,
  options: {
    categorySlug?: string | null;
    searchQuery?: string;
    surfaceFilter?: string | null;
    sortBy?: "latest" | "alphabetical";
  }
): CatalogueDesignItem[] {
  const activeCat = options.categorySlug?.trim().toLowerCase() || "all";
  const query = options.searchQuery?.trim().toLowerCase() || "";
  const surface = options.surfaceFilter?.trim().toLowerCase() || "all";
  const sortBy = options.sortBy || "latest";

  const filtered = designs.filter((item) => {
    if (!item.published) return false;

    const matchesCategory =
      activeCat === "all" ||
      item.categorySlug.toLowerCase() === activeCat ||
      item.categoryCode.toLowerCase() === activeCat ||
      item.categoryLabel.toLowerCase() === activeCat;

    if (!matchesCategory) return false;

    const matchesSurface =
      surface === "all" ||
      item.compatibleSurfaces.some((s) => s.toLowerCase() === surface);

    if (!matchesSurface) return false;

    if (!query) return true;

    const searchableText = [
      item.title,
      item.summary,
      item.description,
      item.categoryLabel,
      item.visualizerConfig.defaultMode,
      ...item.tags,
      ...item.compatibleSurfaces,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(query);
  });

  if (sortBy === "alphabetical") {
    return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
  }

  return [...filtered].sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Editorial Header & Section Configuration for THE ATELIER ART VAULT (Sections 1 & 8).
 */
export const ATELIER_ART_VAULT_CONTENT = {
  eyebrow: "CURATED DESIGN COLLECTION / 01—13",
  vaultLabel: "THE ATELIER ART VAULT",
  headline: "13 Worlds of Wall Art.",
  supportingStatement:
    "Explore an extraordinary collection of expressive surfaces, textures and artistic stories. Find the design that belongs in your space.",
  subheading: "Drag to explore. Discover the details. Find your story.",
} as const;

export interface AtelierVaultCategoryItem {
  id: string;
  slotNumber: number;
  slotCode: string;
  number: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  coverImage: string;
  fallbackImage: string;
  altText: string;
  displayOrder: number;
  published: boolean;
  isConfigured: boolean;
  artworkCount: number;
  compatibleSurfaces: string[];
  featuredDesignSlug: string | null;
}

const DEFAULT_CATEGORY_FALLBACK_IMAGE =
  "/images/atelier/hero-botanical-living.jpg";

/**
 * Adapts canonical CMS/MongoDB category records and published artwork items into
 * normalized ZoomSlider items for THE ATELIER ART VAULT.
 *
 * Uses the exact same source of truth as the catalogue filters (`DESIGN_CATEGORY_RECORDS`
 * or live `/api/designs` response). Does not invent fake categories if fewer than 13
 * are published.
 */
export function buildAtelierVaultCategories(
  categories: ReadonlyArray<CatalogueCategoryRecord> = DESIGN_CATEGORY_RECORDS,
  designs: ReadonlyArray<CatalogueDesignItem> = DEVELOPMENT_FIXTURE_DESIGNS
): AtelierVaultCategoryItem[] {
  const publishedDesigns = designs.filter((d) => d.published);

  return [...categories]
    .filter((cat) => cat.isActive !== false)
    .sort(
      (a, b) =>
        (a.displayOrder ?? a.slotNumber) - (b.displayOrder ?? b.slotNumber)
    )
    .map((cat, idx) => {
      const matchingDesigns = publishedDesigns.filter(
        (d) =>
          d.categorySlug.toLowerCase() === cat.slug.toLowerCase() ||
          d.categoryId === cat.id ||
          d.categorySlotNumber === cat.slotNumber
      );

      const surfaceSet = new Set<string>();
      for (const design of matchingDesigns) {
        for (const s of design.compatibleSurfaces) {
          surfaceSet.add(s);
        }
      }

      const fallbackFromDesign =
        matchingDesigns[0]?.coverImage?.secureUrl ||
        DEFAULT_CATEGORY_FALLBACK_IMAGE;

      const coverUrl =
        cat.coverImage?.secureUrl?.trim() || fallbackFromDesign;

      const slotNumber = cat.slotNumber || idx + 1;
      const numberLabel = String(slotNumber).padStart(2, "0");

      return {
        id: cat.id,
        slotNumber,
        slotCode: cat.slotCode || `CAT-${numberLabel}`,
        number: numberLabel,
        slug: cat.slug,
        title: cat.name,
        shortTitle: cat.shortTitle || cat.name,
        description: cat.description,
        coverImage: coverUrl,
        fallbackImage: fallbackFromDesign,
        altText:
          cat.coverImage?.altText ||
          `${cat.name} wall art collection by Atelier Wall Story`,
        displayOrder: cat.displayOrder ?? slotNumber,
        published: Boolean(cat.isActive),
        isConfigured: Boolean(cat.isConfigured),
        artworkCount: matchingDesigns.length,
        compatibleSurfaces:
          surfaceSet.size > 0 ? Array.from(surfaceSet) : ["Walls"],
        featuredDesignSlug: matchingDesigns[0]?.slug ?? null,
      };
    });
}

