import React from "react";
import { AdminModuleShell } from "@/components/admin/AdminModuleShell";

export default function AdminDesignsPage() {
  return (
    <AdminModuleShell
      moduleCode="MODULE 02"
      moduleTitle="Design Management"
      mongoCollection="designs, media_assets"
      summary="Create, update, reorder, and delete designs across the 13 unified categories. Supports multiple Cloudinary images per design, optional video reels, WebGL Wall Visualizer texture configurations, and featured/visibility flags."
      capabilities={[
        {
          title: "Design CRUD & Category Assignment",
          description:
            "Assign each design to one of the 13 configurable categories (`DesignCategory`), manage titles, slugs, SKUs, and specifications.",
          schemaFields: [
            "title",
            "slug",
            "sku",
            "categoryId",
            "summary",
            "description",
            "specifications",
          ],
        },
        {
          title: "Multi-Image & Video Media Upload",
          description:
            "Upload primary images, multi-image galleries, and optional surface video demonstrations to Cloudinary (`media_assets`).",
          schemaFields: [
            "primaryImage",
            "galleryImages[]",
            "videoAsset",
          ],
        },
        {
          title: "Wall Visualizer Configuration",
          description:
            "Configure how the design projects in `Wall-Priyanka`: Full Wall Mural vs. Repeating Pattern mode, texture URL, and intrinsic dimensions.",
          schemaFields: [
            "visualizerConfig.defaultMode",
            "visualizerConfig.textureUrl",
            "visualizerConfig.width",
            "visualizerConfig.height",
          ],
        },
        {
          title: "Ordering, Featured & Visibility Controls",
          description:
            "Control homepage featured status, catalog display ordering, active/inactive visibility, and per-design SEO metadata.",
          schemaFields: [
            "displayOrder",
            "isFeatured",
            "isActive",
            "seo",
          ],
        },
      ]}
    />
  );
}

