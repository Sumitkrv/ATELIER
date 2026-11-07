/**
 * Typed Admin-Editable Homepage Content Architecture (`page_contents` where `pageKey === "home"`).
 *
 * Separates default studio copy and curated showcase visuals from
 * published database records (`designs`, `projects`, `page_contents`, `site_settings`)
 * so the Admin CMS (/admin/content) can override every homepage section without source code edits.
 */

import { ATELIER_BRAND } from "@/lib/brand";

export interface FeaturedSampleDesignItem {
  id: string;
  slug: string;
  title: string;
  slotNumber: number;
  slotCode: string;
  surfaceTag: string;
  defaultMode: "mural" | "pattern";
  aspectClass: "tall" | "wide" | "square";
  sampleImageUrl: string;
  caption: string;
  isTemporarySample: true;
}

export interface WallPrintingPillarItem {
  code: string;
  title: string;
  description: string;
  surfaceNote: string;
}

export interface ProcessStagePreviewItem {
  step: string;
  title: string;
  description: string;
  isProvisional: true;
}

export interface WhyAtelierPillarItem {
  code: string;
  title: string;
  summary: string;
  detail: string;
}

export interface HomepageContentConfig {
  hero: {
    headlineLine1: string;
    headlineLine2: string;
    subheading: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    videoUrl?: string;
    posterUrl?: string;
    isProvisionalCopy: boolean;
  };
  philosophy: {
    sectionLabel: string;
    heading: string;
    leadParagraph: string;
    secondaryParagraph: string;
    ctaLabel: string;
    ctaHref: string;
    visualPlaceholderUrl: string;
    visualCaption: string;
  };
  collectionPreview: {
    sectionLabel: string;
    heading: string;
    supportingText: string;
    ctaLabel: string;
    ctaHref: string;
    sampleItems: ReadonlyArray<FeaturedSampleDesignItem>;
  };
  wallPrintingArt: {
    sectionLabel: string;
    heading: string;
    supportingText: string;
    ctaLabel: string;
    ctaHref: string;
    pillars: ReadonlyArray<WallPrintingPillarItem>;
  };
  selectedProjects: {
    sectionLabel: string;
    heading: string;
    supportingText: string;
    ctaLabel: string;
    ctaHref: string;
    verifiedProjects: ReadonlyArray<{
      id: string;
      slug: string;
      title: string;
      surfaceType: string;
      location?: string;
      year?: string;
      coverImageUrl: string;
      videoUrl?: string;
      description: string;
    }>;
  };
  visualizerSection: {
    sectionLabel: string;
    heading: string;
    supportingText: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
  };
  processSection: {
    sectionLabel: string;
    heading: string;
    supportingText: string;
    ctaLabel: string;
    ctaHref: string;
    stages: ReadonlyArray<ProcessStagePreviewItem>;
  };
  whyAtelierSection: {
    sectionLabel: string;
    heading: string;
    supportingText: string;
    pillars: ReadonlyArray<WhyAtelierPillarItem>;
  };
  contactCtaSection: {
    sectionLabel: string;
    headlineLine1: string;
    headlineLine2: string;
    supportingText: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
  };
}

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContentConfig = {
  hero: {
    headlineLine1: "YOUR WALL.",
    headlineLine2: "A STORY WORTH TELLING.",
    subheading:
      "Transforming ordinary spaces into extraordinary expressions of art through direct-to-surface 3D wall printing.",
    primaryCtaLabel: "EXPLORE DESIGNS",
    primaryCtaHref: "/explore-designs",
    secondaryCtaLabel: "PREVIEW ON YOUR WALL",
    secondaryCtaHref: "/visualizer",
    videoUrl:
      process.env.NEXT_PUBLIC_HERO_VIDEO_URL ||
      "/videos/atelier-wall-printing-hero.mp4",
    posterUrl:
      process.env.NEXT_PUBLIC_HERO_POSTER_URL ||
      "/images/atelier-wall-printing-poster.webp",
    isProvisionalCopy: false,
  },
  philosophy: {
    sectionLabel: "The Atelier Philosophy",
    heading:
      "Where Architectural Surfaces Become Canvas for Expressive Art, Texture, and Detail",
    leadParagraph: ATELIER_BRAND.brandStory,
    secondaryParagraph:
      "Operating from Oshiwara, Andheri West, Mumbai, ATELIER — WALL STORY approaches every interior elevation as an integral architectural statement. Through direct-to-surface 3D wall printing, murals and conceptual wall art are printed directly onto walls, tiles, plywood, office blinds, metals, and glass—uniting artistic authorship with material permanence.",
    ctaLabel: "About Us",
    ctaHref: "/about",
    visualPlaceholderUrl: "/images/atelier/studio-about-interior.jpg",
    visualCaption:
      "Architectural Surface & Wall Mural Studio — Oshiwara, Andheri West, Mumbai",
  },
  collectionPreview: {
    sectionLabel: "Explore Our Wall Art Collection",
    heading: "Curated Compositions Across 13 Unified Design Categories",
    supportingText:
      "Our complete design catalogue brings together 13 curated categories on a single interactive page. Explore how architectural murals, textured reliefs, and botanical compositions transition seamlessly from selection to live wall preview.",
    ctaLabel: "Explore All Designs",
    ctaHref: "/explore-designs",
    sampleItems: [
      {
        id: "sample-study-01",
        slug: "category-1-featured-design",
        title: "Terracotta Wave Relief",
        slotNumber: 1,
        slotCode: "Textured",
        surfaceTag: "Walls & Plywood",
        defaultMode: "mural",
        aspectClass: "tall",
        sampleImageUrl: "/images/atelier/artwork-terracotta-wave.jpg",
        caption: "Textured Relief • Walls & Plywood",
        isTemporarySample: true,
      },
      {
        id: "sample-study-02",
        slug: "category-2-featured-design",
        title: "Botanical Canopy",
        slotNumber: 2,
        slotCode: "Botanical",
        surfaceTag: "Walls, Tiles & Glass",
        defaultMode: "mural",
        aspectClass: "square",
        sampleImageUrl: "/images/atelier/artwork-botanical-canopy.jpg",
        caption: "Botanical Mural • Walls & Tiles",
        isTemporarySample: true,
      },
      {
        id: "sample-study-03",
        slug: "category-3-featured-design",
        title: "Arch Series – Limestone",
        slotNumber: 3,
        slotCode: "Architectural",
        surfaceTag: "Plastered Interior Walls",
        defaultMode: "mural",
        aspectClass: "square",
        sampleImageUrl: "/images/atelier/artwork-arch-limestone.jpg",
        caption: "Architectural • Plastered Walls",
        isTemporarySample: true,
      },
      {
        id: "sample-study-04",
        slug: "category-4-featured-design",
        title: "Geometric Harmony",
        slotNumber: 4,
        slotCode: "Geometric",
        surfaceTag: "Walls, Office Blinds & Glass",
        defaultMode: "mural",
        aspectClass: "wide",
        sampleImageUrl: "/images/atelier/artwork-geometric-harmony.jpg",
        caption: "Geometric • Walls & Office Blinds",
        isTemporarySample: true,
      },
    ],
  },
  wallPrintingArt: {
    sectionLabel: "The Art of Wall Printing",
    heading: "Direct-to-Surface 3D Printing Without Seams, Vinyl, or Framing",
    supportingText:
      "Traditional wall coverings rely on pasted paper rolls or adhesive vinyl sheets that reveal seams and lift over time. ATELIER — WALL STORY prints directly onto the vertical surface itself—adapting to your wall's architecture and substrate texture.",
    ctaLabel: "Learn More",
    ctaHref: "/services",
    pillars: [
      {
        code: "01",
        title: "Direct-to-Wall Printing",
        description:
          "Artwork is printed directly onto prepared interior walls without seams, adhesive backing, or overlapping panel edges.",
        surfaceNote: "Plastered, primed & painted interior walls",
      },
      {
        code: "02",
        title: "Architectural Murals",
        description:
          "Large-scale murals proportioned around your room's exact ceiling height, sightlines, doorways, and ambient lighting.",
        surfaceNote: "Residences, lobbies, hospitality & workspaces",
      },
      {
        code: "03",
        title: "Conceptual Wall Art",
        description:
          "Expressive graphic, minimalist, and textural compositions that turn blank elevations into curated gallery moments.",
        surfaceNote: "Curated across 13 studio categories",
      },
      {
        code: "04",
        title: "Personalized Visual Expression",
        description:
          "Custom-commissioned visual storytelling tailored to your spatial palette and printed across six distinct architectural materials.",
        surfaceNote: "Walls, Tiles, Plywood, Blinds, Metals & Glass",
      },
    ],
  },
  selectedProjects: {
    sectionLabel: "Selected Projects",
    heading: "Executed Wall & Multi-Surface Installations",
    supportingText:
      "Explore our architectural surface installations and multi-substrate commissions across residential, commercial, and hospitality interiors.",
    ctaLabel: "View All Projects",
    ctaHref: "/projects",
    verifiedProjects: [],
  },
  visualizerSection: {
    sectionLabel: "Live Spatial Preview",
    heading: "SEE IT ON YOUR WALL.",
    supportingText:
      "Discover how your chosen design can transform your space before making a decision.",
    primaryCtaLabel: "Launch Wall Visualizer",
    primaryCtaHref: "/visualizer",
    secondaryCtaLabel: "Choose a Design to Preview",
    secondaryCtaHref: "/explore-designs",
  },
  processSection: {
    sectionLabel: "Our Creative Process",
    heading: "A Considered Path from First Conversation to Printed Wall",
    supportingText:
      "A five-stage studio workflow structured for architectural clarity—from initial spatial consultation and digital wall visualization to direct on-site surface printing.",
    ctaLabel: "Discover Our Process",
    ctaHref: "/process",
    stages: [
      {
        step: "01",
        title: "Consultation",
        description:
          "Discuss your space, target substrate (wall, tile, wood, blind, metal, or glass), and dimensions with our Mumbai studio.",
        isProvisional: true,
      },
      {
        step: "02",
        title: "Design Selection",
        description:
          "Explore our unified 13-category catalogue or brief our team on a custom mural or conceptual artwork.",
        isProvisional: true,
      },
      {
        step: "03",
        title: "Customization",
        description:
          "Preview the artwork on your wall via our visualizer and refine scale, crop, and proportion for your elevation.",
        isProvisional: true,
      },
      {
        step: "04",
        title: "Approval",
        description:
          "Review final dimensioned proofs and surface preparation guidelines prior to scheduling on-site printing.",
        isProvisional: true,
      },
      {
        step: "05",
        title: "Execution",
        description:
          "Our vertical 3D wall printer prints the artwork directly onto your prepared surface in Mumbai.",
        isProvisional: true,
      },
    ],
  },
  whyAtelierSection: {
    sectionLabel: "Why Atelier",
    heading: "An Architectural Approach to Surface Art & Wall Printing",
    supportingText:
      "Grounded in verified material capabilities, curated design exploration, and direct studio collaboration.",
    pillars: [
      {
        code: "I",
        title: "Creative Wall Applications",
        summary: "Direct vertical printing tailored to real architectural spaces.",
        detail:
          "From double-height residential living walls to refined corporate reception elevations, every print is composed around spatial geometry rather than generic stock templates.",
      },
      {
        code: "II",
        title: "Design-Led Visual Expression",
        summary: "Art, texture, and detail curated with editorial restraint.",
        detail:
          "Our unified 13-category catalogue and custom design service prioritize visual harmony with your interior architecture, furnishings, and lighting.",
      },
      {
        code: "III",
        title: "Multiple Supported Printing Surfaces",
        summary: "Walls, tiles, plywood, office blinds, metals, and glass.",
        detail:
          "Extend visual continuity beyond plastered walls onto ceramic tiles, bespoke timber millwork, roller blinds, brushed metal panels, and glass partitions.",
      },
      {
        code: "IV",
        title: "Customized Design Exploration",
        summary: "Interactive wall preview before you commit to printing.",
        detail:
          "Bridge directly from our design catalogue into the interactive Wall Visualizer to inspect perspective-accurate murals and repeating patterns on your own wall.",
      },
    ],
  },
  contactCtaSection: {
    sectionLabel: "Commission Your Wall Story",
    headlineLine1: "LET'S CREATE",
    headlineLine2: "SOMETHING REMARKABLE.",
    supportingText:
      "Speak directly with our studio in Oshiwara, Andheri West, Mumbai to discuss 3D wall printing for your residence, office, or commercial space.",
    primaryCtaLabel: "Contact Us",
    primaryCtaHref: "/contact",
  },
};
