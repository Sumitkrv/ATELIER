import React, { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layout/PublicShell";
import { ProjectDetailClient } from "@/components/projects/ProjectDetailClient";
import {
  DEVELOPMENT_PROJECT_FIXTURES,
  findProjectBySlugOrId,
} from "@/lib/projects-catalogue";
import {
  findStoredProjectBySlug,
  listStoredProjects,
} from "@/lib/cms-store";

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
  const project =
    (await findStoredProjectBySlug(slug)) ?? findProjectBySlugOrId(slug);
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

async function ProjectDetailResolved({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project =
    (await findStoredProjectBySlug(slug)) ?? findProjectBySlugOrId(slug);

  if (!project) {
    notFound();
  }

  const allProjects = await listStoredProjects();
  const relatedProjects = allProjects
    .filter((item) => item.published && item.slug !== project.slug)
    .slice(0, 3);

  return (
    <ProjectDetailClient
      project={project}
      relatedProjects={relatedProjects}
    />
  );
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <PublicShell>
      <Suspense fallback={<div className="min-h-[70svh] bg-[#FAF9F6]" />}>
        <ProjectDetailResolved params={params} />
      </Suspense>
    </PublicShell>
  );
}

