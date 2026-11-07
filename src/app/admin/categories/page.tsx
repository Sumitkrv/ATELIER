import React from "react";
import { AdminModuleShell } from "@/components/admin/AdminModuleShell";

export default function AdminCategoriesPage() {
  return (
    <AdminModuleShell
      moduleCode="MODULE 03"
      moduleTitle="Category Management (13 Design Categories)"
      mongoCollection="design_categories"
      summary="Manage the 13 unified design categories displayed on /explore-designs. Administrators can edit official category names, URL slugs, display order, cover images, descriptions, and active/inactive visibility."
      capabilities={[
        {
          title: "13 Category Slots Registry",
          description:
            "Configure each of the 13 category slots without hardcoding or inventing unofficial category names.",
          schemaFields: [
            "slotNumber (1..13)",
            "name",
            "slug",
            "description",
          ],
        },
        {
          title: "Ordering, Cover Media & Visibility",
          description:
            "Reorder filter tabs on /explore-designs, attach Cloudinary category cover imagery, and toggle active/inactive status.",
          schemaFields: [
            "coverImage",
            "displayOrder",
            "isActive",
            "updatedAt",
          ],
        },
      ]}
    />
  );
}

