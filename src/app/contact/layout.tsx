import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Contact Our Mumbai Studio | ATELIER — WALL STORY • 3D Wall & Surface Printing",
  description:
    "Connect with ATELIER — WALL STORY in Oshiwara, Andheri West, Mumbai. Share your wall or surface brief for bespoke 3D printing on walls, tiles, plywood, office blinds, metals, and glass.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact ATELIER — WALL STORY | Mumbai 3D Wall Printing Studio",
    description:
      "Tell us about your space, surface, and creative ideas. Speak directly with Saikat Ray and Triparna Bardhan at our Oshiwara, Andheri West studio.",
    url: "/contact",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
