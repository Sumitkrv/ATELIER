import { z } from "zod";

/**
 * Canonical TypeScript interfaces & Zod validation schemas for all 10 persistent
 * MongoDB models in Priyanka Wall Website.
 */

export interface SeoMetadata {
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export interface MediaAssetRef {
  assetId?: string;
  publicId: string;
  secureUrl: string;
  resourceType: "image" | "video";
  width?: number;
  height?: number;
  format?: string;
  altText: string;
  posterUrl?: string;
}

/** 1. AdminUser */
export interface AdminUserDocument {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "editor";
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** 2. DesignCategory (13 Admin-Configurable Slots) */
export interface DesignCategoryDocument {
  id: string;
  /** Slot 1..13 representing the 13 unified design categories */
  slotNumber: number;
  name: string;
  slug: string;
  description: string;
  coverImage: MediaAssetRef | null;
  displayOrder: number;
  isActive: boolean;
  isConfigured: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 3. Design */
export interface DesignDocument {
  id: string;
  title: string;
  slug: string;
  sku?: string | null;
  categoryId: string;
  categorySlotNumber: number;
  categoryName: string;
  summary: string;
  description: string;
  primaryImage: MediaAssetRef;
  galleryImages: MediaAssetRef[];
  videoAsset: MediaAssetRef | null;
  visualizerConfig: {
    defaultMode: "mural" | "pattern";
    textureUrl: string;
    width: number;
    height: number;
    mimeType: string;
  };
  specifications: {
    material?: string;
    finish?: string;
    customSizable: boolean;
    leadTime?: string;
  };
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  seo?: SeoMetadata;
  createdAt: string;
  updatedAt: string;
}

/** 4. MediaAsset */
export interface MediaAssetDocument {
  id: string;
  publicId: string;
  secureUrl: string;
  resourceType: "image" | "video";
  format: string;
  width: number;
  height: number;
  durationSeconds?: number | null;
  bytes: number;
  altText: string;
  folder: "designs" | "projects" | "hero" | "services" | "blogs" | "branding";
  createdAt: string;
  updatedAt: string;
}

/** 5. Project */
export interface ProjectDocument {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  location?: string | null;
  year?: number | null;
  serviceCategory?: string | null;
  coverImage: MediaAssetRef;
  galleryImages: MediaAssetRef[];
  videos: MediaAssetRef[];
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  seo?: SeoMetadata;
  createdAt: string;
  updatedAt: string;
}

/** 6. Service */
export interface ServiceDocument {
  id: string;
  indexLabel: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  benefits: { title: string; description: string }[];
  processHighlights: string[];
  coverImage: MediaAssetRef | null;
  galleryImages: MediaAssetRef[];
  videoAsset: MediaAssetRef | null;
  relatedProjectIds: string[];
  ctaLabel: string;
  displayOrder: number;
  isActive: boolean;
  seo?: SeoMetadata;
  createdAt: string;
  updatedAt: string;
}

/** 7. PageContent */
export interface ProcessStageItem {
  stepNumber: number;
  code: string;
  title: string;
  description: string;
  deliverables: string[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

export interface VerifiedTestimonialItem {
  id: string;
  quote: string;
  clientName: string;
  clientRoleOrLocation?: string;
  projectReference?: string;
  isVerified: boolean;
}

export interface PageContentDocument {
  id: string;
  pageKey:
    | "home"
    | "explore-designs"
    | "projects"
    | "services"
    | "about"
    | "process"
    | "blogs"
    | "contact";
  hero: {
    eyebrow: string;
    heading: string;
    highlightedText?: string | null;
    subheading: string;
    videoAsset: MediaAssetRef | null;
    posterImage: MediaAssetRef | null;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  processStages?: ProcessStageItem[];
  faqs?: FaqItem[];
  testimonials?: VerifiedTestimonialItem[];
  seo?: SeoMetadata;
  updatedAt: string;
}

/** 8. BlogPost */
export interface BlogPostDocument {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: MediaAssetRef | null;
  category: string;
  tags: string[];
  authorName: string;
  status: "draft" | "published";
  isFeatured: boolean;
  publishedAt: string | null;
  seo?: SeoMetadata;
  createdAt: string;
  updatedAt: string;
}

/** 9. Enquiry */
export type EnquiryStatus = "New" | "Contacted" | "In Progress" | "Closed" | "new";

export interface EnquiryDocument {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  interestType: "design" | "service" | "custom_project" | "general";
  serviceInterest?: string | null;
  serviceOrDesignInterest: string;
  selectedDesignSlug?: string | null;
  selectedDesignTitle?: string | null;
  selectedProjectSlug?: string | null;
  selectedProjectTitle?: string | null;
  message: string;
  consentGiven?: boolean;
  status: EnquiryStatus;
  adminNotes: { note: string; authorName: string; createdAt: string }[];
  sourcePage: string;
  emailSent?: boolean;
  emailNotificationSent: boolean;
  createdAt: string;
  updatedAt: string;
}

/** 10. SiteSettings */
export interface SiteSettingsDocument {
  id: string;
  singletonKey: "global";
  brandName: string;
  tagline: string;
  logoLight: MediaAssetRef | null;
  logoDark: MediaAssetRef | null;
  contact: {
    primaryPhone: string | null;
    whatsappNumber: string | null;
    email: string | null;
    studioAddress: string | null;
    workingHours: string | null;
  };
  socialLinks: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    pinterest?: string;
  };
  visualizer: {
    externalVisualizerUrl: string;
    enableEmbeddedPreview: boolean;
  };
  defaultSeo: SeoMetadata;
  updatedAt: string;
}

/**
 * Zod Validation Schema for Public Customer Enquiries (Page 08 & Modal CTAs)
 */
export const enquirySubmissionSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name (at least 2 characters).")
    .max(120, "Name is too long."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address."),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid contact phone number.")
    .max(24, "Phone number is too long."),
  serviceInterest: z
    .string()
    .trim()
    .max(200, "Service interest is too long.")
    .optional(),
  serviceOrDesignInterest: z
    .string()
    .trim()
    .max(200, "Service or design interest is too long.")
    .optional(),
  selectedDesignSlug: z
    .string()
    .trim()
    .max(140, "Design slug is too long.")
    .optional(),
  selectedProjectSlug: z
    .string()
    .trim()
    .max(140, "Project slug is too long.")
    .optional(),
  selectedDesignReference: z
    .string()
    .trim()
    .max(240, "Selected design or project reference is too long.")
    .optional(),
  message: z
    .string()
    .trim()
    .min(10, "Please share a few details about your wall or project (min 10 characters).")
    .max(3000, "Message must be under 3000 characters."),
  consentGiven: z.boolean().optional(),
  sourcePage: z.string().trim().max(120).optional(),
  honeypot: z.string().max(200).optional(),
});

export type EnquirySubmissionInput = z.infer<typeof enquirySubmissionSchema>;

/**
 * 13 Configurable Category Slots (Structural Registry Only — Not Fabricated Official Names).
 * Official category titles, slugs, cover images, and descriptions are managed via `/admin/categories`
 * and persisted in MongoDB.
 */
export const CONFIGURABLE_CATEGORY_SLOTS: ReadonlyArray<{
  slotNumber: number;
  slotCode: string;
  adminPlaceholderLabel: string;
  status: "awaiting_admin_configuration";
}> = Array.from({ length: 13 }, (_, index) => {
  const num = index + 1;
  const code = num < 10 ? `0${num}` : `${num}`;
  return {
    slotNumber: num,
    slotCode: `CAT-${code}`,
    adminPlaceholderLabel: `Category Slot ${code}`,
    status: "awaiting_admin_configuration",
  };
});

