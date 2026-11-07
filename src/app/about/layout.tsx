import type { Metadata } from "next";
import { ATELIER_BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "About Us — Every Wall Has a Story",
  description:
    "Learn about ATELIER — WALL STORY in Mumbai: expressive 3D wall printing, artistic murals, and conceptual wall art printed directly onto walls, tiles, plywood, office blinds, metals, and glass.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: `About Us — Every Wall Has a Story | ${ATELIER_BRAND.name}`,
    description:
      "Where artistic imagination meets the possibilities of modern 3D wall printing in Mumbai.",
    url: "/about",
    type: "website",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

