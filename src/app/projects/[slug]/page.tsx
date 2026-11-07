import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layout/PublicShell";
import { ProjectDetailClient } from "@/components/projects/ProjectDetailClient";
import {
  DEVELOPMENT_PROJECT_FIXTURES,
  findProjectBySlugOrId,
} from "@/lib/projects-catalogue";

export async function generateStaticParams() {
  return DEVELOPMENT_PROJECT_FIXTURES.map((proj) => ({
    slug: proj.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = findProjectBySlugOrId(slug);
  if (!project) {
    return {
      title: "Project Not Found",
    };
  }
  return {
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.summary,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = findProjectBySlugOrId(slug);

  if (!project) {
    notFound();
  }

  const relatedProjects = DEVELOPMENT_PROJECT_FIXTURES.filter(
    (item) => item.slug !== project.slug
  ).slice(0, 3);

  return (
    <PublicShell>
      <ProjectDetailClient
        project={project}
        relatedProjects={relatedProjects}
      />
    </PublicShell>
  );
}

