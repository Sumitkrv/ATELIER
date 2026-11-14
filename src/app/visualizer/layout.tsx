import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/public-seo";
export async function generateMetadata() { return pageMetadata("visualizer", "Visualizer", "Explore ATELIER — WALL STORY."); }
export default function Layout({ children }: { children: ReactNode }) { return children; }
