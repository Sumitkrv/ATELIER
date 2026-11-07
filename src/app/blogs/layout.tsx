import type { Metadata } from "next";
import { ATELIER_BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Blogs — Ideas, Art & Inspiration",
  description:
    "Discover perspectives on 3D wall printing, architectural murals, creative spaces, multi-surface printing materials, and interior design from ATELIER — WALL STORY.",
  alternates: {
    canonical: "/blogs",
  },
  openGraph: {
    title: `Blogs — Ideas, Art & Inspiration | ${ATELIER_BRAND.name}`,
    description:
      "Discover perspectives on wall art, creative spaces, materials and design.",
    url: "/blogs",
    type: "website",
  },
};

export default function BlogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

