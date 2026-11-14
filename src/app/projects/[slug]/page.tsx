import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layout/PublicShell";
import { ProjectDetailClient } from "@/components/projects/ProjectDetailClient";
import { getPublicProjects, isPrivatePreview } from "@/lib/public-cms";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = (await getPublicProjects()).find(item => item.slug === slug);
  if (!project) return { title: "Project Not Found", robots: { index: false } };
  return { title: project.seoTitle || project.title, description: project.seoDescription || project.summary, alternates: { canonical: `/projects/${project.slug}` }, openGraph: { title: project.seoTitle || project.title, description: project.seoDescription || project.summary, images: [{ url: project.coverImage.secureUrl, alt: project.coverImage.altText }], url: `/projects/${project.slug}` }, robots: (await isPrivatePreview()) ? { index: false, follow: false } : undefined };
}
export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projects = await getPublicProjects();
  const project = projects.find(item => item.slug === slug);
  if (!project) notFound();
  return <PublicShell><ProjectDetailClient project={project} relatedProjects={projects.filter(item => item.id !== project.id).slice(0, 3)} /></PublicShell>;
}
