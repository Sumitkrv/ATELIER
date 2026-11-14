/**
 * Central Service Configuration for the Atelier Wall Story
 * Cinematic 3D Services Scroll Experience (`AtelierServicesScrollExperience`).
 *
 * Maps all six confirmed visual service categories to their dedicated
 * photorealistic interior visuals, editorial statement placeholders, 3D showcase cards,
 * service detail modal content, and dynamic enquiry / WhatsApp actions.
 */

export interface AtelierScrollServiceItem {
  id: string;
  indexLabel: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  imageAlt: string;
  galleryImages: ReadonlyArray<{
    url: string;
    alt: string;
    caption: string;
  }>;
  supportedSurface: string;
  suitableApplications: ReadonlyArray<string>;
  slug: string;
  /** Phrase segment appearing immediately before this service's inline image chip */
  editorialLeadPhrase: string;
  /** Initial desktop scatter/depth parameters for Phases 1–3 */
  stageTransform: {
    initialRotateZ: number;
    midOffsetXPercent: number;
    midOffsetYPercent: number;
    midRotateY: number;
    midScale: number;
  };
}

export const ATELIER_SERVICES_SCROLL_PALETTE = {
  warmBeige: "#F3E4D5",
  luxuryCream: "#FCF6EF",
  deepMaroon: "#681A27",
  burgundy: "#791B2C",
  darkChocolate: "#32191B",
  mutedGold: "#C8A88B",
  brandCrimson: "#991D20",
} as const;

export const ATELIER_SCROLL_SERVICES: ReadonlyArray<AtelierScrollServiceItem> = [
  {
    id: "service-01-3d-wall-printing",
    indexLabel: "01",
    title: "3D Wall Printing",
    shortDescription:
      "Transform plain walls into captivating artistic statements with premium direct-to-wall printing.",
    fullDescription:
      "Atelier Wall Story brings intricate perspective-rich compositions and dimensional visual artwork directly onto prepared interior walls in Mumbai. By printing directly onto the wall surface without wallpaper seams or pasted panels, artwork integrates naturally with your room's proportions and lighting.",
    image: "/images/atelier/home/home-scroll-3d-wall-printing.webp",
    imageAlt:
      "3D Wall Printing — living room wall printed with a dimensional ivory and sand fan relief composition",
    galleryImages: [
      {
        url: "/images/atelier/home/home-scroll-3d-wall-printing.webp",
        alt: "3D Wall Printing — living room wall printed with a dimensional ivory and sand fan relief composition",
        caption: "Direct-to-wall dimensional fan relief composition",
      },
    ],
    supportedSurface: "Interior Plastered, Primed & Painted Walls",
    suitableApplications: [
      "Living room statement walls & double-height foyers",
      "Executive reception backdrops & hospitality lounges",
      "Dining elevations, bedrooms & private residences",
      "Curated gallery corridors & architectural niches",
    ],
    slug: "3d-wall-printing",
    editorialLeadPhrase: "From expressive walls",
    stageTransform: {
      initialRotateZ: -3.5,
      midOffsetXPercent: -145,
      midOffsetYPercent: -48,
      midRotateY: 10,
      midScale: 1.16,
    },
  },
  {
    id: "service-02-custom-murals",
    indexLabel: "02",
    title: "Custom Murals",
    shortDescription:
      "Express your personality through bespoke murals designed to transform everyday spaces.",
    fullDescription:
      "Each mural is curated or custom-proportioned around your room's sightlines, furniture placement, and architectural trim. From serene botanical horizons to expressive contemporary compositions, our direct surface printing turns blank walls into personal narratives.",
    image: "/images/atelier/home/home-scroll-custom-murals.webp",
    imageAlt:
      "Custom Murals — dining room with a full-wall misty forest and waterfall mural",
    galleryImages: [
      {
        url: "/images/atelier/home/home-scroll-custom-murals.webp",
        alt: "Custom Murals — dining room with a full-wall misty forest and waterfall mural",
        caption: "Custom misty forest and waterfall dining mural",
      },
    ],
    supportedSurface: "Interior Feature Walls & Multi-Panel Elevations",
    suitableApplications: [
      "Bespoke residential living & dining room murals",
      "Boutique hotel suites, cafes & signature dining spaces",
      "Creative studios, design offices & cultural spaces",
      "Custom-scaled conceptual wall art commissions",
    ],
    slug: "custom-murals",
    editorialLeadPhrase: "to artistic murals",
    stageTransform: {
      initialRotateZ: 2.2,
      midOffsetXPercent: -28,
      midOffsetYPercent: -62,
      midRotateY: -6,
      midScale: 1.2,
    },
  },
  {
    id: "service-03-tile-printing",
    indexLabel: "03",
    title: "Tile Printing",
    shortDescription:
      "Reimagine tiles with custom artwork and creative surface printing.",
    fullDescription:
      "Extend bespoke artwork onto ceramic, vitrified, and stone tile elevations. Whether composing a continuous mural across a tiled feature wall or introducing geometric and Mediterranean motifs, direct tile printing brings custom artistry to hard architectural surfaces.",
    image: "/images/atelier/home/home-scroll-tile-printing.webp",
    imageAlt:
      "Tile Printing — hotel lobby tiled wall printed with a cream and terracotta floral pattern across the joints",
    galleryImages: [
      {
        url: "/images/atelier/home/home-scroll-tile-printing.webp",
        alt: "Tile Printing — hotel lobby tiled wall printed with a cream and terracotta floral pattern across the joints",
        caption: "Continuous floral pattern printed across lobby tiles",
      },
    ],
    supportedSurface: "Ceramic, Vitrified & Architectural Stone Tiles",
    suitableApplications: [
      "Hospitality lobbies, spa walls & curated washrooms",
      "Culinary backsplashes & dining accent elevations",
      "Tiled courtyards, foyers & commercial feature walls",
      "Custom geometric patterns & continuous tile murals",
    ],
    slug: "tile-printing",
    editorialLeadPhrase: "from beautiful tiles",
    stageTransform: {
      initialRotateZ: -2.4,
      midOffsetXPercent: 95,
      midOffsetYPercent: -50,
      midRotateY: -10,
      midScale: 1.15,
    },
  },
  {
    id: "service-04-glass-printing",
    indexLabel: "04",
    title: "Glass Printing",
    shortDescription:
      "Add artistic character to glass partitions, interiors, and architectural features.",
    fullDescription:
      "Transform transparent cabin dividers, conference room glazing, and decorative interior glass panels into refined architectural features. Direct printing on glass allows layered line art, privacy bands, and bespoke graphic compositions while preserving natural light flow.",
    image: "/images/atelier/home/home-scroll-glass-printing.webp",
    imageAlt:
      "Glass Printing — atrium glass wall printed with burgundy-to-clear botanical silhouettes",
    galleryImages: [
      {
        url: "/images/atelier/home/home-scroll-glass-printing.webp",
        alt: "Glass Printing — atrium glass wall printed with burgundy-to-clear botanical silhouettes",
        caption: "Gradient botanical silhouettes printed on atrium glass",
      },
    ],
    supportedSurface: "Interior Glass Partitions, Sliding Doors & Glazing",
    suitableApplications: [
      "Executive cabin & boardroom glass partitions",
      "Residential glass room dividers & studio enclosures",
      "Boutique retail displays & reception glazing",
      "Artistic privacy screening with translucent depth",
    ],
    slug: "glass-printing",
    editorialLeadPhrase: "and elegant glass",
    stageTransform: {
      initialRotateZ: 3.1,
      midOffsetXPercent: -115,
      midOffsetYPercent: 36,
      midRotateY: 8,
      midScale: 1.14,
    },
  },
  {
    id: "service-05-plywood-metal-printing",
    indexLabel: "05",
    title: "Plywood & Metal Printing",
    shortDescription:
      "Explore distinctive decorative possibilities through direct printing on wood and metal.",
    fullDescription:
      "Unify custom millwork and architectural cladding with your interior wall art. We print directly onto prepared plywood panels, timber surfaces, and flat brushed or coated metal sheets—harmonizing warm wood grain and modern metallic textures with bespoke graphic detail.",
    image: "/images/atelier/home/home-scroll-plywood-metal-printing.webp",
    imageAlt:
      "Plywood & Metal Printing — birch plywood panels with botanical line drawings beside blackened steel with gold geometry",
    galleryImages: [
      {
        url: "/images/atelier/home/home-scroll-plywood-metal-printing.webp",
        alt: "Plywood & Metal Printing — birch plywood panels with botanical line drawings beside blackened steel with gold geometry",
        caption: "Botanical linework on plywood beside geometric steel panels",
      },
    ],
    supportedSurface: "Plywood Panels, Timber Millwork & Architectural Metals",
    suitableApplications: [
      "Bespoke cabinetry facades, wardrobes & timber wall panels",
      "Brushed aluminum & coated steel architectural feature plates",
      "Industrial lofts, studio dividers & elevator lobbies",
      "Coordinated multi-substrate commercial interiors",
    ],
    slug: "plywood-metal-printing",
    editorialLeadPhrase: "to printed wood and metal",
    stageTransform: {
      initialRotateZ: -1.8,
      midOffsetXPercent: 8,
      midOffsetYPercent: 44,
      midRotateY: -5,
      midScale: 1.18,
    },
  },
  {
    id: "service-06-office-blind-printing",
    indexLabel: "06",
    title: "Office Blind Printing",
    shortDescription:
      "Personalize professional spaces with visually striking, custom-printed blinds.",
    fullDescription:
      "Turn functional commercial roller blinds into cohesive artistic statements when drawn. Ideal for Mumbai studios, boardrooms, and street-facing workspaces, custom-printed office blinds combine daylight control with calm editorial graphics or brand storytelling.",
    image: "/images/atelier/home/home-scroll-office-blind-printing.webp",
    imageAlt:
      "Office Blind Printing — five roller blinds printed with one ochre and burgundy brushstroke composition",
    galleryImages: [
      {
        url: "/images/atelier/home/home-scroll-office-blind-printing.webp",
        alt: "Office Blind Printing — five roller blinds printed with one ochre and burgundy brushstroke composition",
        caption: "Continuous brushstroke artwork across studio roller blinds",
      },
    ],
    supportedSurface: "Commercial & Studio Window Roller Blinds",
    suitableApplications: [
      "Conference rooms, executive suites & boardrooms",
      "Architecture & design studios, agencies & co-working hubs",
      "Boutique storefronts, clinics & hospitality windows",
      "Multi-window panoramic artwork alignment",
    ],
    slug: "office-blind-printing",
    editorialLeadPhrase: "and bespoke office blinds",
    stageTransform: {
      initialRotateZ: 2.8,
      midOffsetXPercent: 128,
      midOffsetYPercent: 34,
      midRotateY: -9,
      midScale: 1.15,
    },
  },
] as const;

export const ATELIER_SCROLL_EDITORIAL_CLOSING =
  "— we bring your imagination to life.";

/**
 * Formats the dynamic WhatsApp enquiry URL for a specific service
 * per Section 08 ("Hello Atelier Wall Story, I am interested in your <Service> service...").
 */
export function buildServiceWhatsAppEnquiryUrl(
  serviceTitle: string,
  whatsappDigits: string = "918017463132"
): string {
  const message = `Hello Atelier Wall Story, I am interested in your ${serviceTitle} service. Could you please share more details and a quotation?`;
  return `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(message)}`;
}

/**
 * Formats the internal `/contact` enquiry URL prefilling the selected service.
 */
export function buildServiceContactQuoteHref(
  service: AtelierScrollServiceItem
): string {
  const params = new URLSearchParams({
    interest: `3D Printing — ${service.title}`,
    surface: service.supportedSurface,
    title: service.title,
  });
  return `/contact?${params.toString()}`;
}
