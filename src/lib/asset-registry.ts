/**
 * Centralized Visual Asset Registry for ATELIER — WALL STORY (Section 23).
 *
 * Tracks every curated architectural interior & artwork image across the website:
 * - Filename & local URL
 * - Intended section (prevents repeating the same hero image across pages)
 * - Asset type & origin
 * - License / approval status
 * - Accessible alt text & fallback URL
 * - CMS field connection
 */

export interface AtelierAssetEntry {
  id: string;
  filename: string;
  url: string;
  intendedSection: string;
  type:
    | "hero"
    | "category"
    | "artwork"
    | "surface"
    | "comparison"
    | "studio"
    | "project";
  origin: "atelier_curated_concept" | "design_02_reference" | "brand_supplied";
  licenseOrApproval: string;
  altText: string;
  fallbackUrl: string;
  cmsFieldMapping: string;
}

export const ATELIER_ASSET_REGISTRY: Record<string, AtelierAssetEntry> = {
  exploreHeroBotanical: {
    id: "explore-hero-botanical",
    filename: "hero-botanical-living.jpg",
    url: "/images/atelier/hero-botanical-living.jpg",
    intendedSection: "Explore Designs Hero (/explore-designs)",
    type: "hero",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Design 02 Hero Concept Visual",
    altText:
      "Sunlit luxury contemporary living room featuring a bespoke botanical wall mural above a curved cream sofa and travertine coffee table",
    fallbackUrl: "/images/atelier/ref-hero-botanical.jpg",
    cmsFieldMapping: "page_contents.explore-designs.hero.posterImage",
  },
  artworkTerracottaWave: {
    id: "artwork-terracotta-wave",
    filename: "artwork-terracotta-wave.jpg",
    url: "/images/atelier/artwork-terracotta-wave.jpg",
    intendedSection: "Artwork Catalogue & Homepage Feature Wall",
    type: "artwork",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Catalogue Concept Visual",
    altText:
      "Terracotta Wave Relief — organic terracotta and warm sand wave wall mural in a minimalist living room",
    fallbackUrl: "/images/atelier/card-01-terracotta-wave.jpg",
    cmsFieldMapping: "designs.primaryImage",
  },
  artworkBotanicalCanopy: {
    id: "artwork-botanical-canopy",
    filename: "artwork-botanical-canopy.jpg",
    url: "/images/atelier/artwork-botanical-canopy.jpg",
    intendedSection: "Artwork Catalogue — Botanical Canopy",
    type: "artwork",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Catalogue Concept Visual",
    altText:
      "Botanical Canopy — overhanging leafy botanical mural on a warm cream dining room wall",
    fallbackUrl: "/images/atelier/card-02-botanical-canopy.jpg",
    cmsFieldMapping: "designs.primaryImage",
  },
  artworkArchLimestone: {
    id: "artwork-arch-limestone",
    filename: "artwork-arch-limestone.jpg",
    url: "/images/atelier/artwork-arch-limestone.jpg",
    intendedSection: "Artwork Catalogue — Arch Series Limestone",
    type: "artwork",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Catalogue Concept Visual",
    altText:
      "Arch Series – Limestone — 3D perspective fluted limestone arch mural in a sunlit living room",
    fallbackUrl: "/images/atelier/card-03-arch-limestone.jpg",
    cmsFieldMapping: "designs.primaryImage",
  },
  artworkMountainSilhouette: {
    id: "artwork-mountain-silhouette",
    filename: "artwork-mountain-silhouette.jpg",
    url: "/images/atelier/artwork-mountain-silhouette.jpg",
    intendedSection: "Artwork Catalogue — Mountain Silhouette",
    type: "artwork",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Catalogue Concept Visual",
    altText:
      "Mountain Silhouette — layered misty mountain horizon mural behind a modern linen sofa",
    fallbackUrl: "/images/atelier/card-04-mountain-silhouette.jpg",
    cmsFieldMapping: "designs.primaryImage",
  },
  artworkLotusAtelier: {
    id: "artwork-lotus-atelier",
    filename: "artwork-lotus-atelier.jpg",
    url: "/images/atelier/artwork-lotus-atelier.jpg",
    intendedSection: "Artwork Catalogue — Lotus Atelier Study",
    type: "artwork",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Catalogue Concept Visual",
    altText:
      "Lotus Atelier Study — delicate blush lotus and sage botanical mural in a refined living room",
    fallbackUrl: "/images/atelier/card-05-lotus-atelier.jpg",
    cmsFieldMapping: "designs.primaryImage",
  },
  artworkGeometricHarmony: {
    id: "artwork-geometric-harmony",
    filename: "artwork-geometric-harmony.jpg",
    url: "/images/atelier/artwork-geometric-harmony.jpg",
    intendedSection: "Artwork Catalogue — Geometric Harmony",
    type: "artwork",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Catalogue Concept Visual",
    altText:
      "Geometric Harmony — terracotta, rust, and warm sand geometric arch mural with natural window shadows",
    fallbackUrl: "/images/atelier/card-06-geometric-harmony.jpg",
    cmsFieldMapping: "designs.primaryImage",
  },
  wallPreviewBefore: {
    id: "wall-preview-before",
    filename: "wall-preview-before.jpg",
    url: "/images/atelier/wall-preview-before.jpg",
    intendedSection: "Interactive Wall Visualizer Comparison (Before)",
    type: "comparison",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Wall Comparison Concept Visual",
    altText:
      "Before — sunlit warm neutral living room wall prior to mural printing",
    fallbackUrl: "/images/atelier/wall-before-scene.jpg",
    cmsFieldMapping: "page_contents.visualizer.beforeImage",
  },
  wallPreviewAfter: {
    id: "wall-preview-after",
    filename: "wall-preview-after.jpg",
    url: "/images/atelier/wall-preview-after.jpg",
    intendedSection: "Interactive Wall Visualizer Comparison (After)",
    type: "comparison",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Wall Comparison Concept Visual",
    altText:
      "After — the same sunlit architectural wall transformed with a bespoke botanical mural",
    fallbackUrl: "/images/atelier/wall-after-scene.jpg",
    cmsFieldMapping: "page_contents.visualizer.afterImage",
  },
  wallPreviewMatchedAfter: {
    id: "wall-preview-matched-after",
    filename: "wall-preview-matched-after.jpg",
    url: "/images/atelier/wall-preview-matched-after.jpg",
    intendedSection: "Explore Designs — Pixel-Aligned Before/After Wall Comparison",
    type: "comparison",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Pixel-Matched Wall Comparison Study",
    altText:
      "After — the exact same sunlit architectural plaster wall with potted olive tree transformed with a custom terracotta and ochre geometric arch mural",
    fallbackUrl: "/images/atelier/wall-preview-after.jpg",
    cmsFieldMapping: "page_contents.explore-designs.comparison.afterImage",
  },
  catTexturedPlaster: {
    id: "cat-textured-plaster",
    filename: "cat-textured-plaster.jpg",
    url: "/images/atelier/cat-textured-plaster.jpg",
    intendedSection: "Textured Category & Surface Detail",
    type: "category",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Material Study Visual",
    altText:
      "Sculpted warm beige lime-plaster wall texture with soft raking daylight",
    fallbackUrl: "/images/atelier/cat-03-textured.jpg",
    cmsFieldMapping: "design_categories.coverImage",
  },
  catMineralTravertine: {
    id: "cat-mineral-travertine",
    filename: "cat-mineral-travertine.jpg",
    url: "/images/atelier/cat-mineral-travertine.jpg",
    intendedSection: "Mineral Category & Stone Surface Detail",
    type: "category",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Material Study Visual",
    altText:
      "Warm beige travertine stone strata with delicate diagonal mineral veining",
    fallbackUrl: "/images/atelier/cat-05-mineral.jpg",
    cmsFieldMapping: "design_categories.coverImage",
  },
  surfaceTilesInterior: {
    id: "surface-tiles-interior",
    filename: "surface-tiles-interior.jpg",
    url: "/images/atelier/surface-tiles-interior.jpg",
    intendedSection: "Tiles Surface Showcase & Services",
    type: "surface",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Surface Concept Visual",
    altText:
      "Custom terracotta and botanical artwork printed directly across large-format ceramic wall tiles",
    fallbackUrl: "/samples/services/service-03-tile-printing.svg",
    cmsFieldMapping: "services.coverImage",
  },
  surfaceGlassInterior: {
    id: "surface-glass-interior",
    filename: "surface-glass-interior.jpg",
    url: "/images/atelier/surface-glass-interior.jpg",
    intendedSection: "Glass Surface Showcase & Services",
    type: "surface",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Surface Concept Visual",
    altText:
      "Sunlit studio with black-framed glass partition walls printed with frosted botanical privacy art",
    fallbackUrl: "/samples/services/service-04-glass-printing.svg",
    cmsFieldMapping: "services.coverImage",
  },
  surfacePlywoodMetalInterior: {
    id: "surface-plywood-metal-interior",
    filename: "surface-plywood-metal-interior.jpg",
    url: "/images/atelier/surface-plywood-metal-interior.jpg",
    intendedSection: "Plywood & Metal Surface Showcase & Services",
    type: "surface",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Surface Concept Visual",
    altText:
      "Warm birch plywood and brushed bronze-metal panels printed with minimalist geometric arch artwork",
    fallbackUrl: "/samples/services/service-05-plywood-metal-printing.svg",
    cmsFieldMapping: "services.coverImage",
  },
  surfaceOfficeBlindsInterior: {
    id: "surface-office-blinds-interior",
    filename: "surface-office-blinds-interior.jpg",
    url: "/images/atelier/surface-office-blinds-interior.jpg",
    intendedSection: "Office Blinds Surface Showcase & Services",
    type: "surface",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Surface Concept Visual",
    altText:
      "Executive boardroom windows fitted with custom-printed roller blinds showing a continuous mountain horizon mural",
    fallbackUrl: "/samples/services/service-06-office-blind-printing.svg",
    cmsFieldMapping: "services.coverImage",
  },
  studioAboutInterior: {
    id: "studio-about-interior",
    filename: "studio-about-interior.jpg",
    url: "/images/atelier/studio-about-interior.jpg",
    intendedSection: "About Us & Studio Introduction",
    type: "studio",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Studio Concept Visual",
    altText:
      "Sunlit architectural design atelier table with travertine, tile, and timber samples alongside framed wall mural studies",
    fallbackUrl: "/images/atelier/hero-botanical-living.jpg",
    cmsFieldMapping: "page_contents.about.hero.posterImage",
  },
  projectHeroCraneLiving: {
    id: "project-hero-crane-living",
    filename: "project-hero-crane-living.jpg",
    url: "/images/atelier/project-hero-crane-living.jpg",
    intendedSection: "Our Projects — Cinematic Dark Architectural Hero",
    type: "hero",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Architectural Portfolio Study Visual",
    altText:
      "Luxury living room featuring a custom 3D printed Japanese crane, cherry blossom, and crimson sun mural on warm plaster",
    fallbackUrl: "/images/atelier/hero-botanical-living.jpg",
    cmsFieldMapping: "page_contents.projects.hero.image",
  },
  projectRetailTerracottaArch: {
    id: "project-retail-terracotta-arch",
    filename: "project-retail-terracotta-arch.jpg",
    url: "/images/atelier/project-retail-terracotta-arch.jpg",
    intendedSection: "Our Projects — Retail & Hospitality Relief Study",
    type: "project",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Architectural Portfolio Study Visual",
    altText:
      "Luxury retail boutique and hospitality lounge with a 3D printed terracotta arch and wave relief mural",
    fallbackUrl: "/images/atelier/artwork-terracotta-wave.jpg",
    cmsFieldMapping: "projects.coverImage",
  },
  projectBoardroomReliefWall: {
    id: "project-boardroom-relief-wall",
    filename: "project-boardroom-relief-wall.jpg",
    url: "/images/atelier/project-boardroom-relief-wall.jpg",
    intendedSection: "Our Projects — Executive Boardroom Elevation Study",
    type: "project",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Architectural Portfolio Study Visual",
    altText:
      "Executive boardroom featuring a backlit sand-dune horizon wall mural and tailored seating",
    fallbackUrl: "/images/atelier/artwork-mountain-silhouette.jpg",
    cmsFieldMapping: "projects.coverImage",
  },
  surfaceMetalsBrushedBronze: {
    id: "surface-metals-brushed-bronze",
    filename: "surface-metals-brushed-bronze.jpg",
    url: "/images/atelier/surface-metals-brushed-bronze.jpg",
    intendedSection: "Our Projects — Brushed Metal Cladding Surface Study",
    type: "surface",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Surface Concept Visual",
    altText:
      "Brushed warm bronze and champagne-gold metallic cladding panel with precision-printed geometric line art",
    fallbackUrl: "/images/atelier/surface-plywood-metal-interior.jpg",
    cmsFieldMapping: "services.coverImage",
  },
  servicesHeroSculpturalLotus: {
    id: "services-hero-sculptural-lotus",
    filename: "services-hero-sculptural-lotus.jpg",
    url: "/images/atelier/services-hero-sculptural-lotus.jpg",
    intendedSection: "Services Hero — Sculptural Curved Oval Arch (/services)",
    type: "hero",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER 3D Architectural Services Visual",
    altText:
      "Sculptural curved lime-plaster oval arch framing a luxury living room with a bespoke blush lotus and sage botanical mural",
    fallbackUrl: "/images/atelier/artwork-lotus-atelier.jpg",
    cmsFieldMapping: "page_contents.services.hero.posterImage",
  },
  servicesSpiralStaircase: {
    id: "services-spiral-staircase",
    filename: "services-spiral-staircase.jpg",
    url: "/images/atelier/services-spiral-staircase.jpg",
    intendedSection: "Services — Architectural Spiral Process Journey (/services)",
    type: "studio",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER 3D Architectural Services Visual",
    altText:
      "Sculptural curved travertine and warm plaster spiral staircase with warm recessed LED step illumination and botanical wall relief",
    fallbackUrl: "/images/atelier/studio-about-interior.jpg",
    cmsFieldMapping: "page_contents.services.howItWorks.stageImage",
  },
  processHeroSculpturalArch: {
    id: "process-hero-sculptural-arch",
    filename: "process-hero-sculptural-arch.jpg",
    url: "/images/atelier/process-hero-sculptural-arch.jpg",
    intendedSection: "Our Process Hero — Sculptural LED Arch (/process)",
    type: "hero",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Process Architectural Journey Visual",
    altText:
      "Sweeping curved lime-plaster archway with recessed golden LED lighting framing a sunlit living room with a bespoke terracotta and sage botanical mural",
    fallbackUrl: "/images/atelier/services-hero-sculptural-lotus.jpg",
    cmsFieldMapping: "page_contents.process.hero.heroImageUrl",
  },
  processHeroIdeaToWall: {
    id: "process-hero-idea-to-wall",
    filename: "process-hero-idea-to-wall.jpg",
    url: "/images/atelier/process-hero-idea-to-wall.jpg",
    intendedSection: "Our Process Hero — From Idea to Wall Sculptural Archway (/process)",
    type: "hero",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Process Luxury Architectural Hero Visual",
    altText:
      "Sunlit luxury living room framed by a sculptural cream plaster archway featuring a bespoke terracotta, sandstone, and muted olive botanical arch mural behind a curved bouclé sofa and travertine coffee table",
    fallbackUrl: "/images/atelier/process-hero-sculptural-arch.jpg",
    cmsFieldMapping: "page_contents.process.hero.posterImage",
  },
  processStage01Consultation: {
    id: "process-stage-01-consultation",
    filename: "process-stage-01-consultation.jpg",
    url: "/images/atelier/process-stage-01-consultation.jpg",
    intendedSection: "Our Process — Stage 01 Consultation (/process)",
    type: "studio",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Process Stage 01 Visual",
    altText:
      "Architectural studio consultation table with linen sketchbook, travertine and ceramic tile swatches, birch plywood blocks, and warm brass lamp",
    fallbackUrl: "/images/atelier/studio-about-interior.jpg",
    cmsFieldMapping: "page_contents.process.stages[0].imageUrl",
  },
  processStage04Approval: {
    id: "process-stage-04-approval",
    filename: "process-stage-04-approval.jpg",
    url: "/images/atelier/process-stage-04-approval.jpg",
    intendedSection: "Our Process — Stage 04 Design Approval (/process)",
    type: "studio",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Process Stage 04 Visual",
    altText:
      "Architectural design approval flat-lay on honed travertine desk with mural elevation proof sheet, pigment swatches, and brass scale ruler",
    fallbackUrl: "/images/atelier/artwork-arch-limestone.jpg",
    cmsFieldMapping: "page_contents.process.stages[3].imageUrl",
  },
  processStage05Execution: {
    id: "process-stage-05-execution",
    filename: "process-stage-05-execution.jpg",
    url: "/images/atelier/process-stage-05-execution.jpg",
    intendedSection: "Our Process — Stage 05 Printing & Installation (/process)",
    type: "project",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Process Stage 05 Visual",
    altText:
      "Double-height sunlit architectural sanctuary featuring a completed direct-to-wall 3D relief mural of organic sandstone arches and botanical foliage",
    fallbackUrl: "/images/atelier/artwork-terracotta-wave.jpg",
    cmsFieldMapping: "page_contents.process.stages[4].imageUrl",
  },
  aboutHeroLotusArch: {
    id: "about-hero-lotus-arch",
    filename: "about-hero-lotus-arch.jpg",
    url: "/images/atelier/about-hero-lotus-arch.jpg",
    intendedSection: "About Us Hero — Sculptural Arch & Lotus Mural (/about)",
    type: "hero",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER About Design 02 Hero Visual",
    altText:
      "Luxury architectural living room with a sweeping cream plaster archway on the left and a blush-pink lotus and sage botanical mural above a curved bouclé sofa on the right",
    fallbackUrl: "/images/atelier/studio-about-interior.jpg",
    cmsFieldMapping: "page_contents.about.hero.heroImageUrl",
  },
  aboutStoryArchVase: {
    id: "about-story-arch-vase",
    filename: "about-story-arch-vase.jpg",
    url: "/images/atelier/about-story-arch-vase.jpg",
    intendedSection: "About Us — Sculptural Studio Story Arch (/about)",
    type: "studio",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER About Design 02 Studio Visual",
    altText:
      "Sunlit sculptural cream plaster archway with recessed floor lighting and a handcrafted ceramic vase holding dried botanical branches",
    fallbackUrl: "/images/atelier/studio-about-interior.jpg",
    cmsFieldMapping: "page_contents.about.studioStory.archVisualUrl",
  },
  aboutStorySketchbook: {
    id: "about-story-sketchbook",
    filename: "about-story-sketchbook.jpg",
    url: "/images/atelier/about-story-sketchbook.jpg",
    intendedSection: "About Us — Studio Story Sketchbook (/about)",
    type: "studio",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER About Design 02 Sketchbook Visual",
    altText:
      "Open linen-bound artist sketchbook on honed travertine showing a graphite lotus drawing on the left page and warm terracotta pigment waves on the right page",
    fallbackUrl: "/images/atelier/process-stage-01-consultation.jpg",
    cmsFieldMapping: "page_contents.about.studioStory.sketchbookVisualUrl",
  },
  journalHeroBurgundyAlcove: {
    id: "journal-hero-burgundy-alcove",
    filename: "journal-hero-burgundy-alcove.jpg",
    url: "/images/atelier/journal-hero-burgundy-alcove.jpg",
    intendedSection: "Journal Hero — Sculptural Burgundy Alcove (/blogs)",
    type: "hero",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Journal Sculptural Hero Visual",
    altText:
      "Sculptural curved ivory plaster wall opening into a deep burgundy arched alcove with diagonal sunlight shadows and a ceramic vase of dried blush blossoms on a travertine plinth",
    fallbackUrl: "/images/atelier/about-story-arch-vase.jpg",
    cmsFieldMapping: "page_contents.blogs.hero.heroImageUrl",
  },
  journalDividerStillLife: {
    id: "journal-divider-still-life",
    filename: "journal-divider-still-life.jpg",
    url: "/images/atelier/journal-divider-still-life.jpg",
    intendedSection: "Journal — Sculptural Editorial Divider Still Life (/blogs)",
    type: "studio",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Journal Editorial Divider Visual",
    altText:
      "Round honed travertine pedestal table with two stacked linen design books, a warm brushed-brass dome lamp, and dried botanical twigs",
    fallbackUrl: "/images/atelier/studio-about-interior.jpg",
    cmsFieldMapping: "page_contents.blogs.editorialDivider.imageUrl",
  },
  visualizerHeroBurgundyAlcove: {
    id: "visualizer-hero-burgundy-alcove",
    filename: "visualizer-hero-burgundy-alcove.jpg",
    url: "/images/atelier/visualizer-hero-burgundy-alcove.jpg",
    intendedSection: "Wall Visualizer Hero — Sculptural Plaster Arch & Burgundy Alcove (/visualizer)",
    type: "hero",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Wall Visualizer Sculptural Hero Visual",
    altText:
      "Sculptural warm cream Venetian plaster wall with palm leaf morning shadows curving into a deep burgundy arched alcove with a ceramic vase of dried golden blossoms on a travertine plinth",
    fallbackUrl: "/images/atelier/journal-hero-burgundy-alcove.jpg",
    cmsFieldMapping: "page_contents.visualizer.hero.heroImageUrl",
  },
  contactStudioDiningMural: {
    id: "contact-studio-dining-mural",
    filename: "contact-studio-dining-mural.jpg",
    url: "/images/atelier/contact-studio-dining-mural.jpg",
    intendedSection: "Contact Us — Architectural Studio & Dining Mural Feature (/contact)",
    type: "studio",
    origin: "atelier_curated_concept",
    licenseOrApproval: "Approved ATELIER Contact Us Architectural Feature Visual",
    altText:
      "Sunlit architectural consultation and dining room featuring a bespoke lotus botanical wall mural inside a backlit plaster arch beside floor-to-ceiling windows and fluted oak panelling",
    fallbackUrl: "/images/atelier/about-hero-lotus-arch.jpg",
    cmsFieldMapping: "page_contents.contact.featureImageUrl",
  },
} as const;

