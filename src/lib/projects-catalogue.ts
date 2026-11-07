/**
 * Canonical Data & Content Architecture for:
 *  - Page 03: Our Projects (`/projects` & `/projects/[slug]`, plus `/our-projects` alias)
 *  - Page 04: Services (`/services`)
 *
 * Strictly adheres to ATELIER — WALL STORY brand governance:
 *  - Grounded exclusively in the confirmed service (`3D Wall Printing`) and the
 *    6 confirmed surfaces (`Walls`, `Tiles`, `Plywood`, `Office Blinds`, `Metals`, `Glass`).
 *  - Avoids unverified printer resolution, speed, durability, pricing, or warranty claims.
 */

import { MediaAssetRef } from "@/types/models";
import { ATELIER_BRAND, ATELIER_SURFACES } from "@/lib/brand";

export type ProjectSpaceCategory =
  | "Residential"
  | "Commercial"
  | "Hospitality"
  | "Office"
  | "Retail"
  | "Institutional";

export type ProjectRecordClassification =
  | "Verified Completed Installation"
  | "Studio Surface Study"
  | "Illustrative Application";

export interface PortfolioProjectRecord {
  id: string;
  title: string;
  shortTitle?: string;
  slug: string;
  projectType: string;
  spaceCategory?: ProjectSpaceCategory;
  recordClassification?: ProjectRecordClassification;
  artisticDirection?: string;
  surfaceId: string;
  surfaceName: string;
  locationNote: string;
  summary: string;
  description: string;
  architecturalNotes: ReadonlyArray<string>;
  coverImage: MediaAssetRef;
  exhibitionImage?: string;
  galleryMedia: ReadonlyArray<MediaAssetRef>;
  beforeAfterMedia: {
    beforeLabel: string;
    afterLabel: string;
    afterImageUrl: string;
  };
  videoAsset: MediaAssetRef | null;
  featured: boolean;
  published: boolean;
  displayOrder: number;
  isDevelopmentFixture: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectHeroSlide {
  id: string;
  slideNumber: string;
  title: string;
  classification: ProjectRecordClassification;
  locationOrContext: string;
  spaceCategory: ProjectSpaceCategory;
  surfaceName: string;
  imageUrl: string;
  imageAlt: string;
  projectSlug: string;
}

export const PROJECTS_HERO_SLIDES: ReadonlyArray<ProjectHeroSlide> = [
  {
    id: "hero-slide-01",
    slideNumber: "01",
    title: "The Crane Residence — Feature Wall Study",
    classification: "Studio Surface Study",
    locationOrContext: "Mumbai Studio • Direct Wall Print",
    spaceCategory: "Residential",
    surfaceName: "Walls",
    imageUrl: "/images/atelier/project-hero-crane-living.jpg",
    imageAlt:
      "Luxury living room featuring a custom 3D printed Japanese crane and crimson sun mural on warm lime plaster",
    projectSlug: "walls-architectural-elevation-study",
  },
  {
    id: "hero-slide-02",
    slideNumber: "02",
    title: "Sculpted Terracotta Arch — Boutique Study",
    classification: "Studio Surface Study",
    locationOrContext: "Mumbai Studio • Plywood & Wall Relief",
    spaceCategory: "Retail",
    surfaceName: "Plywood",
    imageUrl: "/images/atelier/project-retail-terracotta-arch.jpg",
    imageAlt:
      "Luxury retail and hospitality lounge with a 3D printed terracotta arch and wave mural",
    projectSlug: "plywood-architectural-elevation-study",
  },
  {
    id: "hero-slide-03",
    slideNumber: "03",
    title: "Dune Horizon — Executive Boardroom Study",
    classification: "Studio Surface Study",
    locationOrContext: "Mumbai Studio • Acoustic & Wall Elevation",
    spaceCategory: "Office",
    surfaceName: "Office Blinds",
    imageUrl: "/images/atelier/project-boardroom-relief-wall.jpg",
    imageAlt:
      "Executive boardroom featuring a backlit sand-dune horizon wall mural and tailored seating",
    projectSlug: "office-blinds-architectural-elevation-study",
  },
  {
    id: "hero-slide-04",
    slideNumber: "04",
    title: "Mediterranean Tile Fresco — Hospitality Study",
    classification: "Studio Surface Study",
    locationOrContext: "Mumbai Studio • Ceramic & Stone Tiles",
    spaceCategory: "Hospitality",
    surfaceName: "Tiles",
    imageUrl: "/images/atelier/surface-tiles-interior.jpg",
    imageAlt:
      "Boutique hospitality elevation with direct-to-tile botanical and terracotta geometric printing",
    projectSlug: "tiles-architectural-elevation-study",
  },
];

export const PROJECTS_PAGE_CONTENT = {
  hero: {
    eyebrow: "OUR PROJECTS",
    headlineLine1: "Real Spaces,",
    headlineLine2: "Lasting Impressions.",
    supportingText:
      "Explore architectural wall-art installations and curated surface studies that bring personality, texture, and artistic expression to remarkable spaces.",
    isProvisionalCopy: false,
  },
};

const SURFACE_SAMPLE_VISUALS: Record<
  string,
  {
    coverUrl: string;
    exhibitionUrl: string;
    secondaryUrls: string[];
    studyTitle: string;
    shortTitle: string;
    projectType: string;
    spaceCategory: ProjectSpaceCategory;
    artisticDirection: string;
    summary: string;
    description: string;
    notes: string[];
  }
> = {
  walls: {
    coverUrl: "/images/atelier/artwork-lotus-atelier.jpg",
    exhibitionUrl: "/images/atelier/artwork-lotus-atelier.jpg",
    secondaryUrls: [
      "/images/atelier/project-hero-crane-living.jpg",
      "/images/atelier/artwork-terracotta-wave.jpg",
      "/images/atelier/artwork-arch-limestone.jpg",
    ],
    studyTitle: "Lotus & Botanical Sanctuary — Residential Wall Study",
    shortTitle: "Lotus Residence Study",
    projectType: "Interior Feature Wall • Direct 3D Wall Printing",
    spaceCategory: "Residential",
    artisticDirection: "Painterly botanical flora, warm parchment tones & organic plaster depth",
    summary:
      "Full-height architectural mural composition designed for direct vertical printing onto prepared interior walls without wallpaper seams.",
    description:
      "This studio surface study illustrates how ATELIER — WALL STORY composes large-scale botanical and crane murals around ceiling height, natural daylight, and furniture sightlines for luxury residences and hospitality lounges.",
    notes: [
      "Substrate: Prepared & matte-primed interior wall elevation",
      "Application: Direct-to-wall 3D printing without adhesive vinyl or paper joints",
      "Visual Direction: Warm ivory, sage botanical greens, blush lotus, and espresso detail",
    ],
  },
  tiles: {
    coverUrl: "/images/atelier/surface-tiles-interior.jpg",
    exhibitionUrl: "/images/atelier/project-boardroom-relief-wall.jpg",
    secondaryUrls: [
      "/images/atelier/cat-mineral-travertine.jpg",
      "/images/atelier/project-boardroom-relief-wall.jpg",
      "/images/atelier/artwork-geometric-harmony.jpg",
    ],
    studyTitle: "Mediterranean Ceramic & Travertine Tile Elevation Study",
    shortTitle: "Hospitality Tile Study",
    projectType: "Tiled Surface Application • Direct 3D Printing",
    spaceCategory: "Hospitality",
    artisticDirection: "Mediterranean botanical fresco and warm travertine stone strata across tile joints",
    summary:
      "Continuous mineral and botanical graphic study proportioned for tiled elevations, culinary feature walls, and boutique spa interiors.",
    description:
      "Demonstrates how graphic and textural artwork transitions seamlessly across ceramic, vitrified, and stone tile joints while preserving architectural alignment.",
    notes: [
      "Substrate: Ceramic, vitrified & stone tile elevations",
      "Application: Continuous graphic printing across grouted tiled walls",
      "Visual Direction: Terracotta botanical motifs and warm travertine palette",
    ],
  },
  plywood: {
    coverUrl: "/images/atelier/project-retail-terracotta-arch.jpg",
    exhibitionUrl: "/images/atelier/project-retail-terracotta-arch.jpg",
    secondaryUrls: [
      "/images/atelier/surface-plywood-metal-interior.jpg",
      "/images/atelier/artwork-terracotta-wave.jpg",
      "/images/atelier/artwork-arch-limestone.jpg",
    ],
    studyTitle: "Sculpted Terracotta Arch & Timber Millwork Study",
    shortTitle: "Retail Experience Study",
    projectType: "Plywood & Timber Panels • Direct 3D Printing",
    spaceCategory: "Retail",
    artisticDirection: "Fluted terracotta arch relief paired with warm birch plywood and architectural lighting",
    summary:
      "Warm architectural arch and wave motif composed for bespoke plywood panelling, retail boutiques, and custom millwork facades.",
    description:
      "Illustrates direct artwork printing onto prepared plywood boards and timber veneer elevations—balancing warm wood grain character with sculptural graphic depth.",
    notes: [
      "Substrate: Prepared plywood sheets, timber panels & custom millwork",
      "Application: Direct surface printing for retail interiors and cabinetry",
      "Visual Direction: Warm timber grain, terracotta relief, and cove-lit arches",
    ],
  },
  "office-blinds": {
    coverUrl: "/images/atelier/surface-office-blinds-interior.jpg",
    exhibitionUrl: "/images/atelier/surface-office-blinds-interior.jpg",
    secondaryUrls: [
      "/images/atelier/artwork-mountain-silhouette.jpg",
      "/images/atelier/project-boardroom-relief-wall.jpg",
      "/images/atelier/artwork-geometric-harmony.jpg",
    ],
    studyTitle: "Panoramic Mountain Horizon Study for Office Blinds",
    shortTitle: "Office Workspace Study",
    projectType: "Office Window Blinds • Direct Surface Printing",
    spaceCategory: "Office",
    artisticDirection: "Continuous misty mountain horizon aligned across multi-bay commercial roller blinds",
    summary:
      "Calm architectural horizon artwork turning functional commercial roller blinds into cohesive interior visual statements.",
    description:
      "Shows how boardrooms, design studios, and executive suites can integrate continuous panoramic art across window blinds rather than leaving glazing treatments blank.",
    notes: [
      "Substrate: Commercial roller and architectural window blinds",
      "Application: Custom graphic and panoramic art printing on blind fabric",
      "Visual Direction: Serene misty mountain ridges in warm taupe and sand",
    ],
  },
  metals: {
    coverUrl: "/images/atelier/surface-metals-brushed-bronze.jpg",
    exhibitionUrl: "/images/atelier/surface-metals-brushed-bronze.jpg",
    secondaryUrls: [
      "/images/atelier/surface-plywood-metal-interior.jpg",
      "/images/atelier/cat-mineral-travertine.jpg",
      "/images/atelier/artwork-geometric-harmony.jpg",
    ],
    studyTitle: "Brushed Bronze & Metallic Cladding Elevation Study",
    shortTitle: "Metallic Cladding Study",
    projectType: "Architectural Metals • Direct Surface Printing",
    spaceCategory: "Commercial",
    artisticDirection: "Warm brushed bronze metallic sheen with precision geometric and mineral line art",
    summary:
      "Refined geometric and mineral composition conceived for coated aluminum, brushed bronze panels, and contemporary commercial lobbies.",
    description:
      "Demonstrates conceptual art printed directly onto flat metallic sheets and cladding panels for modern commercial foyers, elevator lobbies, and reception statements.",
    notes: [
      "Substrate: Flat aluminum, steel, and brushed bronze architectural panels",
      "Application: Direct graphic and conceptual art printing on metal",
      "Visual Direction: Warm bronze patina with fine architectural geometry",
    ],
  },
  glass: {
    coverUrl: "/images/atelier/surface-glass-interior.jpg",
    exhibitionUrl: "/images/atelier/surface-glass-interior.jpg",
    secondaryUrls: [
      "/images/atelier/artwork-botanical-canopy.jpg",
      "/images/atelier/artwork-lotus-atelier.jpg",
    ],
    studyTitle: "Botanical Relief & Frosted Glazing Partition Study",
    shortTitle: "Glass Partition Study",
    projectType: "Architectural Glass • Direct Surface Printing",
    spaceCategory: "Institutional",
    artisticDirection: "Translucent botanical foliage screen balancing studio privacy with natural daylight",
    summary:
      "Layered botanical and geometric artwork designed for glass cabin partitions, sliding doors, and decorative interior glazing.",
    description:
      "Illustrates how glass dividers in studios, galleries, offices, and residences can receive precision-printed artwork that balances visual privacy with natural light transmission.",
    notes: [
      "Substrate: Interior glass partitions, sliding doors & decorative glazing",
      "Application: Direct multi-surface art printing on glass",
      "Visual Direction: Delicate botanical screen study and translucent framing",
    ],
  },
};

export const DEVELOPMENT_PROJECT_FIXTURES: ReadonlyArray<PortfolioProjectRecord> =
  ATELIER_SURFACES.map((surface, index) => {
    const spec =
      SURFACE_SAMPLE_VISUALS[surface.id] ?? SURFACE_SAMPLE_VISUALS.walls;
    const slug = `${surface.id}-architectural-elevation-study`;

    const coverMedia: MediaAssetRef = {
      publicId: `projects/fixture-${surface.id}-cover`,
      secureUrl: spec.coverUrl,
      resourceType: "image",
      width: 1600,
      height: 1000,
      format: "jpg",
      altText: `${spec.studyTitle} (${surface.name} Surface Study)`,
    };

    const galleryMedia: MediaAssetRef[] = [
      coverMedia,
      ...spec.secondaryUrls.map((url, idx) => ({
        publicId: `projects/fixture-${surface.id}-0${idx + 2}`,
        secureUrl: url,
        resourceType: "image" as const,
        width: 1600,
        height: 1000,
        format: "jpg",
        altText: `${spec.studyTitle} — Detail View 0${idx + 2}`,
      })),
    ];

    return {
      id: `project-fixture-0${index + 1}`,
      title: spec.studyTitle,
      shortTitle: spec.shortTitle,
      slug,
      projectType: spec.projectType,
      spaceCategory: spec.spaceCategory,
      recordClassification: "Studio Surface Study",
      artisticDirection: spec.artisticDirection,
      surfaceId: surface.id,
      surfaceName: surface.name,
      locationNote: "Oshiwara, Andheri West, Mumbai • Studio Surface Study",
      summary: spec.summary,
      description: spec.description,
      architecturalNotes: spec.notes,
      coverImage: coverMedia,
      exhibitionImage: spec.exhibitionUrl,
      galleryMedia,
      beforeAfterMedia: {
        beforeLabel: `Prepared ${surface.name} Substrate (Before Printing)`,
        afterLabel: `3D Printed ${surface.name} Elevation`,
        afterImageUrl: spec.coverUrl,
      },
      videoAsset:
        index % 2 === 0
          ? {
              publicId: `projects/fixture-${surface.id}-video`,
              secureUrl: process.env.NEXT_PUBLIC_HERO_VIDEO_URL || "",
              resourceType: "video",
              width: 1920,
              height: 1080,
              format: "mp4",
              altText: `Execution showcase for ${spec.studyTitle}`,
              posterUrl: spec.coverUrl,
            }
          : null,
      featured: index < 4,
      published: true,
      displayOrder: index + 1,
      isDevelopmentFixture: true,
      seoTitle: `${spec.studyTitle} | ${ATELIER_BRAND.name}`,
      seoDescription: spec.summary,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
  });

export function findProjectBySlugOrId(
  identifier?: string | null,
  source: ReadonlyArray<PortfolioProjectRecord> = DEVELOPMENT_PROJECT_FIXTURES
): PortfolioProjectRecord | null {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  if (!clean) return null;
  return (
    source.find(
      (proj) =>
        proj.slug.toLowerCase() === clean || proj.id.toLowerCase() === clean
    ) ?? null
  );
}

export function filterPortfolioProjects(
  projects: ReadonlyArray<PortfolioProjectRecord>,
  surfaceFilter: string = "all",
  spaceFilter: string = "all"
): PortfolioProjectRecord[] {
  const cleanSurface = surfaceFilter.trim().toLowerCase();
  const cleanSpace = spaceFilter.trim().toLowerCase();

  return projects
    .filter((proj) => {
      if (!proj.published) return false;

      const matchesSurface =
        cleanSurface === "all" ||
        proj.surfaceId.toLowerCase() === cleanSurface ||
        proj.surfaceName.toLowerCase() === cleanSurface;

      if (!matchesSurface) return false;

      const matchesSpace =
        cleanSpace === "all" ||
        (proj.spaceCategory &&
          proj.spaceCategory.toLowerCase() === cleanSpace);

      return matchesSpace;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * Canonical Content Structure for Page 04 — Services (`/services`).
 * Grounded strictly in verified client offerings (`3D Wall Printing` on 6 surfaces).
 */
export interface ServiceFaqItem {
  id: string;
  question: string;
  answer: string;
  order: number;
  visible: boolean;
}

export const SERVICES_PAGE_CONTENT = {
  hero: {
    eyebrow: `${ATELIER_BRAND.name} • Confirmed Capabilities`,
    headlineLine1: "ART BEYOND",
    headlineLine2: "THE CANVAS.",
    supportingText:
      "From expressive murals to personalized surface printing, we bring creativity directly into the spaces around you.",
    isProvisionalCopy: false,
  },
  signatureService: {
    code: "PRIMARY SERVICE • 01",
    name: "3D Wall Printing",
    slug: "3d-wall-printing",
    headline: "Direct-to-Surface 3D Wall Printing, Murals & Conceptual Art",
    leadDescription:
      "ATELIER — Wall Story designs and creates expressive wall solutions that bring spaces to life through art, texture, and detail. We print murals and conceptual wall art directly onto your walls—as well as tiles, plywood, office blinds, metals, and glass.",
    secondaryDescription:
      "By printing directly onto the architectural substrate itself, artwork becomes an integral part of your interior elevation without pasted wallpaper seams, overlapping vinyl edges, or bulky external framing.",
    coverImageUrl: "/images/atelier/artwork-terracotta-wave.jpg",
    capabilities: [
      {
        code: "01",
        title: "Direct Printing on Walls",
        description:
          "Artwork is applied directly onto prepared interior wall elevations on-site in Mumbai, adapting cleanly to your room's exact dimensions.",
      },
      {
        code: "02",
        title: "Artistic Murals",
        description:
          "Large-scale residential, commercial, and hospitality murals proportioned around ceiling heights, sightlines, and interior architecture.",
      },
      {
        code: "03",
        title: "Conceptual Wall Art",
        description:
          "Curated minimalist, botanical, geometric, and textural studies organized across 13 studio design categories.",
      },
      {
        code: "04",
        title: "Design Customization Possibilities",
        description:
          "Tailor scale, crop, tonal balance, and placement for your specific surface—and preview the composition on your wall before execution.",
      },
    ],
    suitableSpaces: [
      "Residential living rooms, double-height foyers & bedrooms",
      "Corporate reception areas, boardrooms & executive offices",
      "Boutique hospitality lounges, restaurants & cafés",
      "Design studios, retail interiors & architectural corridors",
    ],
  },
  whyChooseAtelier: {
    eyebrow: "Why Choose Atelier",
    heading: "Design-Led Surface Printing Grounded in Architectural Restraint",
    supportingText:
      "We focus on thoughtful visual expression, material versatility, and transparent pre-print visualization—without exaggerated claims.",
    pillars: [
      {
        code: "I",
        title: "Creative Design Expression",
        description:
          "Every mural and surface study is approached as an editorial composition that complements your interior architecture rather than competing with it.",
      },
      {
        code: "II",
        title: "Wall Art Customization",
        description:
          "Artwork proportions, placement, and crops are tailored to your wall's real width, height, and surrounding architectural features.",
      },
      {
        code: "III",
        title: "Six Supported Print Surfaces",
        description:
          "Extend visual continuity beyond plastered walls onto ceramic tiles, plywood panels, office roller blinds, brushed metals, and glass partitions.",
      },
      {
        code: "IV",
        title: "Modern Visual Possibilities",
        description:
          "Direct-to-substrate printing eliminates wallpaper roll repeats and pasted seams, opening up cohesive multi-surface design possibilities.",
      },
      {
        code: "V",
        title: "Explore & Preview Before Enquiry",
        description:
          "Browse all 13 design categories on a single page and test selected artwork directly on a photo or live camera view of your wall.",
      },
    ],
  },
  howItWorks: {
    eyebrow: "How the Service Works",
    heading: "From Initial Consultation to On-Site Surface Printing",
    supportingText:
      "A five-stage studio workflow structured for architectural clarity—from initial consultation and digital wall visualization to direct on-site surface printing.",
    ctaLabel: "Explore Our Process",
    ctaHref: "/process",
    stages: [
      {
        step: "01",
        title: "Consultation",
        description:
          "Share your target surface (wall, tile, plywood, office blind, metal, or glass), dimensions, and Mumbai location with our studio.",
        isProvisional: true,
      },
      {
        step: "02",
        title: "Design Selection",
        description:
          "Select a composition from our 13-category catalogue or brief our creative team on a bespoke mural or conceptual artwork.",
        isProvisional: true,
      },
      {
        step: "03",
        title: "Customization",
        description:
          "Preview the selected design on your wall using our visualizer and refine scale, crop, and placement for your elevation.",
        isProvisional: true,
      },
      {
        step: "04",
        title: "Approval",
        description:
          "Review final proportioned layout proofs and surface preparation readiness before scheduling execution.",
        isProvisional: true,
      },
      {
        step: "05",
        title: "Printing / Execution",
        description:
          "Our team executes the 3D wall or surface print directly onto your prepared substrate.",
        isProvisional: true,
      },
    ],
  },
  visualizerCta: {
    eyebrow: "Interactive Spatial Preview",
    headlineLine1: "IMAGINE IT.",
    headlineLine2: "PREVIEW IT.",
    headlineLine3: "BRING IT TO LIFE.",
    supportingText:
      "Select any artwork from our catalogue and preview how it transforms your own wall image before committing to printing.",
    primaryCtaLabel: "Open Wall Visualizer",
    primaryCtaHref: "/visualizer",
    secondaryCtaLabel: "Browse 13 Design Categories",
    secondaryCtaHref: "/explore-designs",
  },
  faqs: [
    {
      id: "service-faq-1",
      question: "What surfaces does ATELIER — WALL STORY print on?",
      answer:
        "We specialize in 3D wall printing, murals, and conceptual wall art printed directly onto interior Walls, as well as Tiles, Plywood, Office Blinds, Metals, and Glass.",
      order: 1,
      visible: true,
    },
    {
      id: "service-faq-2",
      question: "Can I preview a design on my own wall before placing an enquiry?",
      answer:
        "Yes. Every design in our Explore Designs catalogue includes a 'Wall Preview' action that stages the artwork into our standalone Wall Visualizer (/visualizer), allowing you to preview the composition on a photo or camera view of your wall.",
      order: 2,
      visible: true,
    },
    {
      id: "service-faq-3",
      question: "Do you support custom murals as well as catalogue designs?",
      answer:
        "Yes. You can either choose a design from our 13 unified catalogue categories on /explore-designs or consult with our Mumbai team to customize a mural or conceptual wall artwork for your specific space and substrate.",
      order: 3,
      visible: true,
    },
    {
      id: "service-faq-4",
      question: "How do I discuss my wall dimensions, surface condition, and project requirements?",
      answer:
        "Use our validated enquiry form on /contact, message our customer WhatsApp lines (+91 80174 63132 or +91 86971 70746), or speak directly with Saikat Ray (+91 85919 71675 / +91 80174 63132) or Triparna Bardhan (+91 86971 70746) at our Oshiwara, Andheri West, Mumbai studio.",
      order: 4,
      visible: true,
    },
  ] satisfies ReadonlyArray<ServiceFaqItem>,
  finalEnquiry: {
    eyebrow: "Commission Your Surface Print",
    headlineLine1: "YOUR SPACE.",
    headlineLine2: "OUR NEXT CANVAS.",
    supportingText:
      "Connect with our studio in Oshiwara, Andheri West, Mumbai to discuss 3D wall printing across walls, tiles, plywood, office blinds, metals, or glass.",
    primaryCtaLabel: "Discuss Your Project",
    primaryCtaHref: "/contact?interest=3D+Wall+Printing",
  },
};
