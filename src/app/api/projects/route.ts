import { NextResponse } from "next/server";
import { getEnvironmentReadiness } from "@/lib/env";
import { listStoredProjects } from "@/lib/cms-store";

export async function GET() {
  const readiness = getEnvironmentReadiness();
  const projects = await listStoredProjects();
  const publishedProjects = projects.filter((p) => p.published);

  return NextResponse.json({
    status: "ok",
    readiness: {
      mongodbConfigured: readiness.mongodbConfigured,
      localCmsEnabled: readiness.localCmsEnabled,
      cloudinaryConfigured: readiness.cloudinaryConfigured,
    },
    approvedClientProjects: publishedProjects,
    developmentFixtures: [],
  });
}
