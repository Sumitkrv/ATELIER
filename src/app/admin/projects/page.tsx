import React from "react";
import { AdminModuleShell } from "@/components/admin/AdminModuleShell";

export default function AdminProjectsPage() {
  return (
    <AdminModuleShell
      moduleCode="MODULE 04"
      moduleTitle="Project Portfolio Management"
      mongoCollection="projects, media_assets"
      summary="Manage completed residential, hospitality, corporate, and institutional wall installations with high-resolution photography, project videos, optional location/year metadata, and homepage featured highlights."
      capabilities={[
        {
          title: "Portfolio CRUD & Metadata",
          description:
            "Create and update completed project case studies with descriptions, optional city/location, completion year, and service tags.",
          schemaFields: [
            "title",
            "slug",
            "summary",
            "description",
            "location",
            "year",
            "serviceCategory",
          ],
        },
        {
          title: "Project Photography & Video Reels",
          description:
            "Attach cover photography, multi-image installation galleries, and walkthrough videos via Cloudinary.",
          schemaFields: [
            "coverImage",
            "galleryImages[]",
            "videos[]",
            "isFeatured",
            "isActive",
            "displayOrder",
          ],
        },
      ]}
    />
  );
}

