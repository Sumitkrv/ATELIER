import type { Metadata } from "next";
import { ATELIER_BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Our Process — From an Idea to an Extraordinary Wall",
  description:
    "Explore the creative journey at ATELIER — WALL STORY: from consultation, design exploration, and wall preview customization to direct-to-surface 3D printing.",
  alternates: {
    canonical: "/process",
  },
  openGraph: {
    title: `Our Process — From an Idea to an Extraordinary Wall | ${ATELIER_BRAND.name}`,
    description:
      "Explore the creative journey behind bringing meaningful 3D wall printing and surface artwork into your space.",
    url: "/process",
    type: "website",
  },
};

export default function ProcessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

