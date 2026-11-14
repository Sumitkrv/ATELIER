"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AdminAuthBanner } from "@/components/admin/AdminChromeClient";
import {
  adminButtonClass,
  adminCardClass,
  adminInputClass,
  adminLabelClass,
  AdminPageHeader,
} from "@/components/admin/AdminUiPrimitives";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ATELIER_CONTACTS } from "@/lib/brand";
import { SiteSettingsDocument } from "@/types/models";
import { Building2, Check, Globe, Phone, Search } from "lucide-react";

type SettingsTab = "general" | "contact" | "seo";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettingsDocument | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const loadSettings = useCallback(() => {
    fetch("/api/admin/cms?collection=settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) {
          setSettings(data.settings);
          setAuthenticated(Boolean(data.authenticated));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSavedNotice(null);
    setErrorNotice(null);
    try {
      const res = await fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection: "settings", settings }),
      });
      if (!res.ok) {
        setErrorNotice("Unable to save settings.");
        return;
      }
      setSavedNotice("Brand, contact, and global SEO settings updated.");
      await loadSettings();
    } catch {
      setErrorNotice("Network error while saving settings.");
    } finally {
      setSaving(false);
    }
  };

  const tabs: Array<{
    id: SettingsTab;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: "general", label: "General & Branding", Icon: Building2 },
    { id: "contact", label: "Contact & Social", Icon: Phone },
    { id: "seo", label: "SEO & Visualizer", Icon: Search },
  ];

  return (
    <div className="space-y-6">
      <AdminAuthBanner authenticated={authenticated} />

      <AdminPageHeader
        eyebrow="Studio Configuration"
        title="Site Settings & Global SEO"
        description="Manage brand identity details, Mumbai studio representatives, social channels, and search engine defaults."
      />

      {savedNotice ? (
        <div
          role="status"
          className="rounded-2xl border border-[#C9DBC9] bg-[#E9F0EA]/70 px-4 py-3 font-sans text-xs font-medium text-[#264E32]"
        >
          {savedNotice}
        </div>
      ) : null}

      {errorNotice ? (
        <div
          role="alert"
          className="rounded-2xl border border-[#9B1C1C]/30 bg-[#9B1C1C]/[0.07] px-4 py-3 font-sans text-xs font-medium text-[#9B1C1C]"
        >
          {errorNotice}
        </div>
      ) : null}

      <div className={`${adminCardClass} overflow-hidden`}>
        {/* Clean Tab Bar */}
        <div className="px-6 pt-5 pb-0 border-b border-[#E8DED3] bg-[#FAF6F0]/55 flex flex-wrap gap-2">
          {tabs.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`inline-flex items-center gap-2 px-4 py-3 border-b-2 font-sans text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? "border-[#9B1C1C] text-[#9B1C1C]"
                    : "border-transparent text-[#746B64] hover:text-[#1A1A1A]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {settings ? (
          <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
            {activeTab === "general" ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <div className="rounded-2xl border border-[#E8DED3] bg-[#FAF6F0] p-5">
                    <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9B1C1C]">
                      Cream / Light Logo
                    </span>
                    <div className="mt-4">
                      <BrandLogo variant="primary" size="md" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#2A2421] bg-[#1A1A1A] p-5 text-[#FFFDF9]">
                    <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D7CCC0]">
                      Dark Surface Logo
                    </span>
                    <div className="mt-4">
                      <BrandLogo variant="white" size="md" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#E8DED3] bg-[#FAF6F0] p-5 space-y-2">
                    <span className="block font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9B1C1C]">
                      Studio Representatives
                    </span>
                    {ATELIER_CONTACTS.map((c) => (
                      <p
                        key={c.name}
                        className="font-sans text-xs text-[#574F49] admin-tabular"
                      >
                        <strong className="font-semibold text-[#1A1A1A]">
                          {c.name}:
                        </strong>{" "}
                        {c.phones.map((p) => p.display).join(" / ")}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={adminLabelClass}>Brand Name</label>
                    <input
                      type="text"
                      disabled={!authenticated}
                      value={settings.brandName}
                      onChange={(e) =>
                        setSettings({ ...settings, brandName: e.target.value })
                      }
                      className={`${adminInputClass} disabled:opacity-60`}
                    />
                  </div>
                  <div>
                    <label className={adminLabelClass}>Studio Tagline</label>
                    <input
                      type="text"
                      disabled={!authenticated}
                      value={settings.tagline || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, tagline: e.target.value })
                      }
                      className={`${adminInputClass} disabled:opacity-60`}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === "contact" ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={adminLabelClass}>Primary Phone</label>
                    <input
                      type="text"
                      disabled={!authenticated}
                      value={settings.contact.primaryPhone || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contact: {
                            ...settings.contact,
                            primaryPhone: e.target.value,
                          },
                        })
                      }
                      className={`${adminInputClass} admin-tabular disabled:opacity-60`}
                    />
                  </div>

                  <div>
                    <label className={adminLabelClass}>WhatsApp Number</label>
                    <input
                      type="text"
                      disabled={!authenticated}
                      value={settings.contact.whatsappNumber || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contact: {
                            ...settings.contact,
                            whatsappNumber: e.target.value,
                          },
                        })
                      }
                      className={`${adminInputClass} admin-tabular disabled:opacity-60`}
                    />
                  </div>

                  <div>
                    <label className={adminLabelClass}>Studio Email</label>
                    <input
                      type="email"
                      disabled={!authenticated}
                      value={settings.contact.email || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contact: {
                            ...settings.contact,
                            email: e.target.value,
                          },
                        })
                      }
                      className={`${adminInputClass} disabled:opacity-60`}
                    />
                  </div>

                  <div>
                    <label className={adminLabelClass}>Working Hours</label>
                    <input
                      type="text"
                      disabled={!authenticated}
                      value={settings.contact.workingHours || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contact: {
                            ...settings.contact,
                            workingHours: e.target.value,
                          },
                        })
                      }
                      className={`${adminInputClass} disabled:opacity-60`}
                    />
                  </div>
                </div>

                <div>
                  <label className={adminLabelClass}>Mumbai Studio Address</label>
                  <input
                    type="text"
                    disabled={!authenticated}
                    value={settings.contact.studioAddress || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        contact: {
                          ...settings.contact,
                          studioAddress: e.target.value,
                        },
                      })
                    }
                    className={`${adminInputClass} disabled:opacity-60`}
                  />
                </div>

                <div className="pt-2 border-t border-[#E8DED3] grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className={adminLabelClass}>Instagram URL</label>
                    <input
                      type="url"
                      disabled={!authenticated}
                      value={settings.socialLinks.instagram || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialLinks: {
                            ...settings.socialLinks,
                            instagram: e.target.value,
                          },
                        })
                      }
                      placeholder="https://instagram.com/..."
                      className={`${adminInputClass} disabled:opacity-60`}
                    />
                  </div>
                  <div>
                    <label className={adminLabelClass}>LinkedIn URL</label>
                    <input
                      type="url"
                      disabled={!authenticated}
                      value={settings.socialLinks.linkedin || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialLinks: {
                            ...settings.socialLinks,
                            linkedin: e.target.value,
                          },
                        })
                      }
                      placeholder="https://linkedin.com/company/..."
                      className={`${adminInputClass} disabled:opacity-60`}
                    />
                  </div>
                  <div>
                    <label className={adminLabelClass}>YouTube URL</label>
                    <input
                      type="url"
                      disabled={!authenticated}
                      value={settings.socialLinks.youtube || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialLinks: {
                            ...settings.socialLinks,
                            youtube: e.target.value,
                          },
                        })
                      }
                      placeholder="https://youtube.com/..."
                      className={`${adminInputClass} disabled:opacity-60`}
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === "seo" ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={adminLabelClass}>
                      Default SEO Meta Title
                    </label>
                    <input
                      type="text"
                      disabled={!authenticated}
                      value={settings.defaultSeo.metaTitle || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          defaultSeo: {
                            ...settings.defaultSeo,
                            metaTitle: e.target.value,
                          },
                        })
                      }
                      className={`${adminInputClass} disabled:opacity-60`}
                    />
                  </div>

                  <div>
                    <label className={adminLabelClass}>
                      Default SEO Meta Description
                    </label>
                    <input
                      type="text"
                      disabled={!authenticated}
                      value={settings.defaultSeo.metaDescription || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          defaultSeo: {
                            ...settings.defaultSeo,
                            metaDescription: e.target.value,
                          },
                        })
                      }
                      className={`${adminInputClass} disabled:opacity-60`}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E8DED3] bg-[#FAF6F0]/75 p-5 space-y-4">
                  <div className="flex items-center gap-2 text-[#9B1C1C]">
                    <Globe className="w-4 h-4" />
                    <span className="font-sans text-xs font-semibold uppercase tracking-[0.14em]">
                      Wall Visualizer Integration
                    </span>
                  </div>

                  <div>
                    <label className={adminLabelClass}>
                      External / Studio Visualizer URL
                    </label>
                    <input
                      type="text"
                      disabled={!authenticated}
                      value={settings.visualizer.externalVisualizerUrl || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          visualizer: {
                            ...settings.visualizer,
                            externalVisualizerUrl: e.target.value,
                          },
                        })
                      }
                      className={`${adminInputClass} bg-[#FFFDF9] font-mono text-xs disabled:opacity-60`}
                    />
                  </div>

                  <label className="inline-flex items-center gap-2.5 font-sans text-sm text-[#1A1A1A] cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!authenticated}
                      checked={Boolean(
                        settings.visualizer.enableEmbeddedPreview
                      )}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          visualizer: {
                            ...settings.visualizer,
                            enableEmbeddedPreview: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 accent-[#9B1C1C]"
                    />
                    <span>Enable interactive studio wall preview mode</span>
                  </label>
                </div>
              </div>
            ) : null}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-[#E8DED3]">
              <span className="font-sans text-xs text-[#746B64] admin-tabular">
                Last updated:{" "}
                {new Date(settings.updatedAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <button
                type="submit"
                disabled={!authenticated || saving}
                className={adminButtonClass("primary")}
              >
                <Check className="h-4 w-4" />
                <span>{saving ? "Saving Settings…" : "Save Settings"}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-12 text-center font-sans text-sm text-[#746B64]">
            Loading studio settings…
          </div>
        )}
      </div>
    </div>
  );
}
