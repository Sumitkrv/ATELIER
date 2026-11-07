/**
 * Canonical Navigation & Route Registry for Priyanka Wall Website.
 * Enforces the 8 primary public pages and the protected /admin modules.
 */

export interface NavItem {
  label: string;
  href: string;
  code: string;
  description: string;
  badge?: string;
}

export const PUBLIC_NAV_ITEMS: ReadonlyArray<NavItem> = [
  {
    code: "01",
    label: "Home",
    href: "/",
    description: "Promotional video hero, studio overview, featured collections, and wall visualizer entry.",
  },
  {
    code: "02",
    label: "Explore Designs",
    href: "/explore-designs",
    description: "Unified catalog for all 13 configurable design categories with search and Wall Preview.",
    badge: "13 Categories",
  },
  {
    code: "03",
    label: "Our Projects",
    href: "/projects",
    description: "Completed residential, hospitality, and commercial wall installations with photography and video.",
  },
  {
    code: "04",
    label: "Services",
    href: "/services",
    description: "Bespoke wall murals, surface treatments, architectural finishes, and end-to-end execution.",
  },
  {
    code: "05",
    label: "About Us",
    href: "/about",
    description: "Studio story, artistic philosophy, mission, vision, and craftsmanship standards.",
  },
  {
    code: "06",
    label: "Our Process",
    href: "/process",
    description: "Step-by-step workflow from consultation and customization to wall visualization and installation.",
  },
  {
    code: "07",
    label: "Blogs",
    href: "/blogs",
    description: "Editorial insights, material guides, and studio updates managed via the CMS.",
  },
  {
    code: "08",
    label: "Contact Us",
    href: "/contact",
    description: "Direct project consultation and design enquiry form with database persistence.",
  },
];

export interface AdminNavModule {
  id: string;
  label: string;
  href: string;
  collectionName: string;
  summary: string;
}

export const ADMIN_NAV_MODULES: ReadonlyArray<AdminNavModule> = [
  {
    id: "overview",
    label: "Dashboard Overview",
    href: "/admin",
    collectionName: "all",
    summary: "Real-time metrics for designs, projects, enquiries, published blogs, and recent CMS activity.",
  },
  {
    id: "designs",
    label: "Design Management",
    href: "/admin/designs",
    collectionName: "designs",
    summary: "Create, edit, reorder, and toggle visibility of designs with multi-image/video uploads and visualizer settings.",
  },
  {
    id: "categories",
    label: "Category Management",
    href: "/admin/categories",
    collectionName: "design_categories",
    summary: "Configure the 13 unified design categories: names, slugs, display order, cover images, and active status.",
  },
  {
    id: "projects",
    label: "Project Management",
    href: "/admin/projects",
    collectionName: "projects",
    summary: "Manage completed portfolio installations, project photography, videos, locations, and featured highlights.",
  },
  {
    id: "content",
    label: "Content Management",
    href: "/admin/content",
    collectionName: "page_contents",
    summary: "Edit homepage hero video/poster, headings, About Us story, Services, Process steps, FAQs, and verified testimonials.",
  },
  {
    id: "blogs",
    label: "Blog Management",
    href: "/admin/blogs",
    collectionName: "blog_posts",
    summary: "Author, draft, publish, and manage editorial articles, cover imagery, and per-article SEO metadata.",
  },
  {
    id: "enquiries",
    label: "Enquiry Management",
    href: "/admin/enquiries",
    collectionName: "enquiries",
    summary: "Lead inbox with search, status pipeline (New, Contacted, In Progress, Closed), internal notes, and source tracking.",
  },
  {
    id: "settings",
    label: "Site Settings & SEO",
    href: "/admin/settings",
    collectionName: "site_settings",
    summary: "Configure company logo, brand identity, phone/WhatsApp/email, social links, visualizer URL, and global SEO.",
  },
];

