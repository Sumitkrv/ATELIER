/**
 * Official Brand Configuration & Verified Company Details for ATELIER — WALL STORY.
 * Source of truth: web/public/brand/ATELIER_SITE_BRIEF.md & atelier-brand-board.png
 */

export interface BrandContactPerson {
  name: string;
  role: string;
  phones: ReadonlyArray<{
    display: string;
    telHref: string;
    isWhatsApp: boolean;
    whatsappDigits?: string;
  }>;
}

export interface PrintableSurfaceSpec {
  id: string;
  code: string;
  name: string;
  shortLabel: string;
  summary: string;
  applications: string;
  technicalNote: string;
}

export const ATELIER_SURFACES: ReadonlyArray<PrintableSurfaceSpec> = [
  {
    id: "walls",
    code: "SURFACE 01",
    name: "Walls",
    shortLabel: "Interior & Feature Walls",
    summary:
      "Bespoke 3D wall printing, architectural murals, and conceptual wall art printed directly onto prepared interior wall surfaces without wallpaper seams.",
    applications:
      "Living rooms, double-height foyers, bedrooms, corporate reception walls, hospitality lounges, and curated gallery corridors.",
    technicalNote:
      "Direct vertical UV-cured ink deposition adapts to smooth plastered, primed, and matte-painted architectural walls.",
  },
  {
    id: "tiles",
    code: "SURFACE 02",
    name: "Tiles",
    shortLabel: "Ceramic, Vitrified & Stone Tiles",
    summary:
      "High-definition graphic and textured mural printing directly across tiled elevations, preserving grout alignment and surface durability.",
    applications:
      "Feature bathrooms, culinary backsplashes, spa environments, lobbies, and tiled commercial accent walls.",
    technicalNote:
      "Precision optical distance sensors maintain consistent print head clearance across tile joints and micro-textures.",
  },
  {
    id: "plywood",
    code: "SURFACE 03",
    name: "Plywood",
    shortLabel: "Timber, Veneer & Plywood Panels",
    summary:
      "Direct artwork and architectural motif printing on plywood boards, acoustic timber panels, and bespoke millwork.",
    applications:
      "Custom cabinetry facades, architectural room dividers, studio walls, retail fixtures, and warm timber interiors.",
    technicalNote:
      "Controlled white-ink underbase option preserves either natural wood grain translucency or full-opacity color fidelity.",
  },
  {
    id: "office-blinds",
    code: "SURFACE 04",
    name: "Office Blinds",
    shortLabel: "Commercial Roller & Window Blinds",
    summary:
      "Transform functional office window blinds into cohesive architectural art, spatial branding, or calm editorial compositions.",
    applications:
      "Boardrooms, executive suites, co-working studios, design agencies, and street-facing commercial glazing.",
    technicalNote:
      "Flexible UV-cured ink formulation engineered to withstand repeated rolling and sunlight exposure without cracking.",
  },
  {
    id: "metals",
    code: "SURFACE 05",
    name: "Metals",
    shortLabel: "Aluminum, Steel & Architectural Metal",
    summary:
      "Sharp, industrial-grade conceptual art and graphic installations printed directly onto coated and brushed metallic substrates.",
    applications:
      "Industrial lofts, architectural signage panels, elevator lobbies, metallic cladding, and modern commercial spaces.",
    technicalNote:
      "Direct surface bonding delivers crisp geometric detail and tactile ink relief on flat metallic sheets.",
  },
  {
    id: "glass",
    code: "SURFACE 06",
    name: "Glass",
    shortLabel: "Architectural Partitions & Glazing",
    summary:
      "Precision multi-layer printing on glass partitions, sliding doors, and decorative architectural glass panels.",
    applications:
      "Office cabin partitions, conference room privacy art, residential glass dividers, and boutique display panels.",
    technicalNote:
      "Supports translucent, frosted-effect, and opaque layered print passes tailored to ambient interior light.",
  },
] as const;

export const ATELIER_CONTACTS: ReadonlyArray<BrandContactPerson> = [
  {
    name: "Saikat Ray",
    role: "Client Consultation & Project Direction",
    phones: [
      {
        display: "+91 85919 71675",
        telHref: "tel:+918591971675",
        isWhatsApp: false,
      },
      {
        display: "+91 80174 63132",
        telHref: "tel:+918017463132",
        isWhatsApp: true,
        whatsappDigits: "918017463132",
      },
    ],
  },
  {
    name: "Triparna Bardhan",
    role: "Client Consultation & Creative Coordination",
    phones: [
      {
        display: "+91 86971 70746",
        telHref: "tel:+918697170746",
        isWhatsApp: true,
        whatsappDigits: "918697170746",
      },
    ],
  },
] as const;

export const ATELIER_WHATSAPP_NUMBERS = [
  {
    label: "Saikat Ray (+91 80174 63132)",
    display: "+91 80174 63132",
    digits: "918017463132",
  },
  {
    label: "Triparna Bardhan (+91 86971 70746)",
    display: "+91 86971 70746",
    digits: "918697170746",
  },
] as const;

export function buildWhatsAppUrl(
  digits: string = ATELIER_WHATSAPP_NUMBERS[0].digits,
  message: string = "Hello ATELIER — WALL STORY, I would like to enquire about 3D wall printing for my space."
): string {
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export const ATELIER_BRAND = {
  name: "ATELIER — WALL STORY",
  shortName: "ATELIER",
  subtitle: "WALL STORY",
  city: "Mumbai",
  primaryService: "3D Wall Printing",
  brandStory:
    "ATELIER — Wall Story designs and creates expressive wall solutions that bring spaces to life through art, texture, and detail.",
  factualDescription:
    "3D wall printing, architectural murals, and conceptual wall art in Mumbai — printed directly onto your walls as well as tiles, plywood, office blinds, metals, and glass.",
  editorialHeadline:
    "Expressive 3D Wall Printing & Architectural Surface Art in Mumbai",
  address: {
    line1: "#410, Reliable Business Centre",
    line2: "Anand Nagar, Oshiwara, Andheri West",
    cityPin: "Mumbai - 400102",
    full: "#410, Reliable Business Centre, Anand Nagar, Oshiwara, Andheri West, Mumbai - 400102",
  },
  email: {
    proposedAddress: "admin@atelierwallstory.com",
    isVerifiedAndActive: false,
    statusNote:
      "Proposed official mailbox (admin@atelierwallstory.com) is pending creation and verification. Not activated as a live recipient yet.",
  },
  social: {
    isCreated: false,
    statusNote:
      "Official social media accounts have not been created yet. Dead links and placeholder social icons are intentionally omitted.",
  },
  assets: {
    logoPrimary: "/brand/atelier-logo-primary.png",
    logoWhite: "/brand/atelier-logo-white.png",
    logoBlack: "/brand/atelier-logo-black.png",
    logoOriginalSvg: "/brand/atelier-logo-original.svg",
    brandBoard: "/brand/atelier-brand-board.png",
    logoWidth: 1750,
    logoHeight: 408,
  },
  colors: {
    crimson: "#9B1C1C",
    warmBeige: "#E8E2D9",
    offWhite: "#FAF9F6",
    charcoal: "#1A1A1A",
  },
  typography: {
    preferred: "Futura Light",
    webGeometricAlternative: "Jost (Light 300 / Regular 400 / Medium 500)",
  },
} as const;

