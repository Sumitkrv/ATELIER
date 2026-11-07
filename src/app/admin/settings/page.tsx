import React from "react";
import { AdminModuleShell } from "@/components/admin/AdminModuleShell";
import { ATELIER_BRAND, ATELIER_CONTACTS } from "@/lib/brand";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Live Brand Configuration Preview Card */}
      <div className="rounded-sm border border-white/10 bg-obsidian-900 p-6 sm:p-8">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-brand-crimson">
          Official Integrated Brand Configuration
        </span>
        <h2 className="mt-1 font-serif text-2xl font-light text-brand-offwhite">
          {ATELIER_BRAND.name} — Active Brand & Contact Defaults
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Light Logo Preview */}
          <div className="rounded-sm border border-brand-charcoal/15 bg-brand-offwhite p-5 text-brand-charcoal">
            <span className="font-mono text-[10px] uppercase tracking-wider text-brand-crimson">
              Light Surface Logo (/brand/atelier-logo-primary.png)
            </span>
            <div className="mt-4">
              <BrandLogo variant="primary" size="md" />
            </div>
          </div>

          {/* Dark Logo Preview */}
          <div className="rounded-sm border border-white/15 bg-brand-charcoal p-5 text-brand-offwhite">
            <span className="font-mono text-[10px] uppercase tracking-wider text-brand-beige/70">
              Dark Surface Logo (/brand/atelier-logo-white.png)
            </span>
            <div className="mt-4">
              <BrandLogo variant="white" size="md" />
            </div>
          </div>

          {/* Verified Contact & Email Status */}
          <div className="rounded-sm border border-white/15 bg-brand-charcoal p-5 text-xs text-brand-beige/85 space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-brand-crimson">
              Verified Contacts & Mailbox Status
            </span>
            {ATELIER_CONTACTS.map((c) => (
              <p key={c.name}>
                <strong className="text-brand-offwhite">{c.name}:</strong>{" "}
                {c.phones.map((p) => p.display).join(" / ")}
              </p>
            ))}
            <p className="pt-1 border-t border-white/10 text-[11px] text-amber-300">
              Proposed Email ({ATELIER_BRAND.email.proposedAddress}): Pending
              creation & verification.
            </p>
          </div>
        </div>
      </div>

      <AdminModuleShell
        moduleCode="MODULE 08"
        moduleTitle="Site Settings, Brand Identity & Global SEO"
        mongoCollection="site_settings"
        summary="Configure ATELIER — WALL STORY branding, light/dark logos, verified phone and WhatsApp numbers, official email verification flag, Oshiwara studio address, social media links (once created), Wall Visualizer endpoint URL, and default SEO metadata."
        capabilities={[
          {
            title: "Brand Identity & Studio Logos",
            description:
              "Manage brand name (ATELIER — WALL STORY), tagline, primary/white/black logo assets, and favicon.",
            schemaFields: [
              "brandName",
              "tagline",
              "logoLight",
              "logoDark",
              "favicon",
            ],
          },
          {
            title: "Contact Details, Social Links & Global SEO",
            description:
              "Configure official phones (Saikat Ray & Triparna Bardhan), WhatsApp numbers, verified email status, Oshiwara Mumbai address, social links, and default OpenGraph/SEO metadata.",
            schemaFields: [
              "contact.primaryPhone",
              "contact.whatsappNumber",
              "contact.email",
              "contact.isEmailVerified",
              "contact.studioAddress",
              "socialLinks",
              "visualizer.externalVisualizerUrl",
              "defaultSeo",
            ],
          },
        ]}
      />
    </div>
  );
}
