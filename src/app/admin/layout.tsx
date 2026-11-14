import React from "react";
import type { Metadata } from "next";
import { getEnvironmentReadiness } from "@/lib/env";
import { AdminShellLayout } from "@/components/admin/AdminChromeClient";
import "@/components/admin/admin-theme.css";

export const metadata: Metadata = {
  title: {
    default: "Studio CMS | ATELIER — WALL STORY",
    template: "%s | ATELIER Studio CMS",
  },
  description:
    "ATELIER — WALL STORY editorial administration workspace for designs, categories, portfolio projects, page content, journal articles, enquiries, and site settings.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const readiness = getEnvironmentReadiness();

  return (
    <AdminShellLayout
      mongodbConfigured={readiness.mongodbConfigured}
      adminAuthConfigured={readiness.adminAuthConfigured}
    >
      {children}
    </AdminShellLayout>
  );
}
