"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ADMIN_NAV_MODULES } from "@/lib/navigation";
import {
  BookOpen,
  Building2,
  Check,
  Copy,
  Database,
  ExternalLink,
  FileText,
  FolderKanban,
  Images,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  MessageSquare,
  Palette,
  Settings,
  ShieldAlert,
  Upload,
  X,
} from "lucide-react";
import { AdminMediaLibraryModal } from "@/components/admin/AdminMediaLibraryModal";
import {
  adminButtonClass,
  adminInputClass,
  adminLabelClass,
} from "@/components/admin/AdminUiPrimitives";

type NavGroupTitle = "Overview" | "Content" | "Business" | "System";

interface NavMeta {
  shortLabel: string;
  group: NavGroupTitle;
  Icon: React.ComponentType<{ className?: string }>;
}

const NAV_META_BY_ID: Record<string, NavMeta> = {
  overview: { shortLabel: "Dashboard", group: "Overview", Icon: LayoutDashboard },
  content: { shortLabel: "Pages & Content", group: "Content", Icon: FileText },
  designs: { shortLabel: "Design Collection", group: "Content", Icon: Palette },
  categories: { shortLabel: "Categories", group: "Content", Icon: FolderKanban },
  projects: { shortLabel: "Projects", group: "Content", Icon: Building2 },
  blogs: { shortLabel: "Journal", group: "Content", Icon: BookOpen },
  enquiries: { shortLabel: "Enquiries", group: "Business", Icon: MessageSquare },
  settings: { shortLabel: "Site Settings & SEO", group: "System", Icon: Settings },
};

const ORDERED_IDS = [
  "overview",
  "content",
  "designs",
  "categories",
  "projects",
  "blogs",
  "enquiries",
  "settings",
] as const;

const GROUPS: NavGroupTitle[] = ["Overview", "Content", "Business", "System"];

export function AdminShellLayout({
  children,
  mongodbConfigured,
  adminAuthConfigured,
}: {
  children: React.ReactNode;
  mongodbConfigured: boolean;
  adminAuthConfigured: boolean;
}) {
  const pathname = usePathname() || "/admin";
  const router = useRouter();
  const isLoginRoute = pathname === "/admin/login" || pathname.startsWith("/admin/login/");

  const [openedForPath, setOpenedForPath] = useState<string | null>(null);
  const mobileNavOpen = openedForPath === pathname;
  const [mediaOpen, setMediaOpen] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [openEnquiriesCount, setOpenEnquiriesCount] = useState<number | null>(null);

  const refreshChromeState = useCallback(() => {
    if (isLoginRoute) return;
    fetch("/api/admin/auth", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setSessionEmail(data?.authenticated ? data?.session?.email ?? null : null);
      })
      .catch(() => {});

    fetch("/api/admin/cms?collection=overview", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (typeof data?.counts?.enquiriesOpen === "number") {
          setOpenEnquiriesCount(data.counts.enquiriesOpen);
        }
      })
      .catch(() => {});
  }, [isLoginRoute]);

  useEffect(() => {
    refreshChromeState();
  }, [pathname, refreshChromeState]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenedForPath(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setSessionEmail(null);
    router.push("/admin/login");
    router.refresh();
  };

  if (isLoginRoute) {
    return (
      <div className="atelier-admin-theme min-h-screen bg-[#FAF6F0] text-[#1A1A1A] selection:bg-[#9B1C1C] selection:text-[#FFFDF9]">
        {children}
      </div>
    );
  }

  const orderedModules = ORDERED_IDS.map((id) =>
    ADMIN_NAV_MODULES.find((mod) => mod.id === id)
  ).filter((mod): mod is (typeof ADMIN_NAV_MODULES)[number] => Boolean(mod));

  const activeModule =
    orderedModules.find((mod) =>
      mod.href === "/admin" ? pathname === "/admin" : pathname.startsWith(mod.href)
    ) || orderedModules[0];
  const activeMeta = NAV_META_BY_ID[activeModule?.id || "overview"];

  const renderNavContent = (onNavigate?: () => void) => (
    <div className="flex flex-col h-full">
      {/* Studio Brand */}
      <div className="px-5 py-5 border-b border-[#E8DED3] flex items-center justify-between">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="inline-flex flex-col gap-1 focus:outline-none"
        >
          <BrandLogo variant="primary" size="md" priority />
          <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-[#746B64]">
            Studio CMS
          </span>
        </Link>
        {onNavigate ? (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close navigation menu"
            className="lg:hidden p-2 rounded-xl border border-[#DFD0C0] text-[#746B64] hover:text-[#1A1A1A]"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Grouped Navigation */}
      <nav
        aria-label="Admin Studio Navigation"
        className="flex-1 overflow-y-auto px-3.5 py-5 space-y-6"
      >
        {GROUPS.map((group) => {
          const items = orderedModules.filter(
            (mod) => NAV_META_BY_ID[mod.id]?.group === group
          );
          if (items.length === 0) return null;

          return (
            <div key={group}>
              <p className="px-3 mb-2 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[#746B64]">
                {group}
              </p>
              <div className="space-y-1">
                {items.map((mod) => {
                  const meta = NAV_META_BY_ID[mod.id];
                  const Icon = meta.Icon;
                  const isActive =
                    mod.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(mod.href);

                  return (
                    <Link
                      key={mod.id}
                      href={mod.href}
                      onClick={onNavigate}
                      className={`group relative flex items-center justify-between gap-2.5 rounded-xl px-3 py-2.5 font-sans text-[13px] transition-colors ${
                        isActive
                          ? "bg-[#9B1C1C]/[0.08] text-[#9B1C1C] font-semibold"
                          : "text-[#574F49] hover:bg-[#FAF6F0] hover:text-[#1A1A1A] font-medium"
                      }`}
                    >
                      {isActive ? (
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[#9B1C1C]"
                        />
                      ) : null}
                      <span className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive
                              ? "text-[#9B1C1C]"
                              : "text-[#746B64] group-hover:text-[#1A1A1A]"
                          }`}
                        />
                        <span className="truncate">{meta.shortLabel}</span>
                      </span>
                      {mod.id === "enquiries" &&
                      typeof openEnquiriesCount === "number" &&
                      openEnquiriesCount > 0 ? (
                        <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-[#9B1C1C]/12 text-[#9B1C1C] font-sans text-[11px] font-semibold admin-tabular">
                          {openEnquiriesCount}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Quick Asset Library Modal Launcher */}
        <div>
          <p className="px-3 mb-2 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-[#746B64]">
            Assets
          </p>
          <button
            type="button"
            onClick={() => {
              onNavigate?.();
              setMediaOpen(true);
            }}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 font-sans text-[13px] font-medium text-[#574F49] hover:bg-[#FAF6F0] hover:text-[#1A1A1A] transition-colors cursor-pointer"
          >
            <Images className="w-4 h-4 shrink-0 text-[#746B64]" />
            <span>Media Library</span>
          </button>
        </div>
      </nav>

      {/* Bottom Session Footer */}
      <div className="p-4 border-t border-[#E8DED3] bg-[#FAF6F0]/60 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#9B1C1C]/10 border border-[#9B1C1C]/20 flex items-center justify-center shrink-0 font-serif text-base text-[#9B1C1C] uppercase">
            {sessionEmail ? sessionEmail.charAt(0) : "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-sans text-xs font-medium text-[#1A1A1A] truncate">
              {sessionEmail || "Preview Session"}
            </p>
            <p className="font-sans text-[11px] text-[#746B64]">
              {sessionEmail ? "Administrator" : adminAuthConfigured ? "Read-only" : "Local config"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] px-3 py-2 font-sans text-xs font-medium text-[#1A1A1A] hover:border-[#9B1C1C]/40 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#746B64]" />
            <span>Live Site</span>
          </Link>
          {sessionEmail ? (
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              aria-label="Sign Out"
              className="inline-flex items-center justify-center rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] p-2 text-[#746B64] hover:text-[#9B1C1C] hover:border-[#9B1C1C]/40 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href={`/admin/login?next=${encodeURIComponent(pathname)}`}
              title="Sign In"
              aria-label="Sign In"
              className="inline-flex items-center justify-center rounded-xl bg-[#9B1C1C] p-2 text-[#FFFDF9] hover:bg-[#801619] transition-colors"
            >
              <KeyRound className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="atelier-admin-theme min-h-screen bg-[#FAF6F0] text-[#1A1A1A] flex">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-[260px] shrink-0 border-r border-[#DFD0C0] bg-[#FFFDF9] sticky top-0 h-screen">
        {renderNavContent()}
      </aside>

      {/* Mobile / Tablet Slide-Over Drawer */}
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#1A1A1A]/40 backdrop-blur-[2px]"
            onClick={() => setOpenedForPath(null)}
          />
          <aside className="relative z-10 w-[280px] max-w-[85vw] h-full bg-[#FFFDF9] border-r border-[#DFD0C0] shadow-[0_24px_60px_rgba(26,26,26,0.22)]">
            {renderNavContent(() => setOpenedForPath(null))}
          </aside>
        </div>
      ) : null}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Clean Editorial Topbar */}
        <header className="sticky top-0 z-30 h-[68px] border-b border-[#E8DED3] bg-[#FFFDF9]/92 backdrop-blur-md">
          <div className="h-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setOpenedForPath(pathname)}
                aria-label="Open Studio Navigation"
                className="lg:hidden p-2 rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] text-[#1A1A1A] hover:bg-[#FAF6F0] cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-sans min-w-0">
                <Link
                  href="/admin"
                  className="hidden sm:inline text-[#746B64] hover:text-[#9B1C1C] transition-colors"
                >
                  Studio
                </Link>
                <span className="hidden sm:inline text-[#DFD0C0]">/</span>
                <span className="font-medium text-[#1A1A1A] truncate">
                  {activeMeta?.shortLabel || "Dashboard"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              <span
                className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[#DFD0C0] bg-[#FAF6F0] px-3 py-1.5 font-sans text-[11px] font-medium text-[#574F49]"
                title={
                  mongodbConfigured
                    ? "MongoDB configuration is present. Availability is checked when saving content."
                    : "MongoDB must be configured before content can be saved."
                }
              >
                <Database className="w-3 h-3 text-[#9B1C1C]" />
                <span>{mongodbConfigured ? "Database Configured" : "Database Setup Needed"}</span>
              </span>

              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] px-3 sm:px-3.5 py-2 font-sans text-xs font-medium text-[#1A1A1A] hover:border-[#9B1C1C]/40 hover:bg-[#FAF6F0] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#746B64]" />
                <span className="hidden sm:inline">Preview Website</span>
                <span className="sm:hidden">Site</span>
              </Link>

              {sessionEmail ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#DFD0C0] bg-[#FFFDF9] px-3 sm:px-3.5 py-2 font-sans text-xs font-medium text-[#746B64] hover:text-[#9B1C1C] hover:border-[#9B1C1C]/35 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              ) : (
                <Link
                  href={`/admin/login?next=${encodeURIComponent(pathname)}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#9B1C1C] px-3.5 py-2 font-sans text-xs font-medium text-[#FFFDF9] hover:bg-[#801619] transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>

      <AdminMediaLibraryModal
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
      />
    </div>
  );
}

export function AdminAuthBanner({
  authenticated,
}: {
  authenticated: boolean;
}) {
  const pathname = usePathname();
  if (authenticated) return null;

  return (
    <div className="rounded-2xl border border-[#9B1C1C]/30 bg-[#FFFDF9] p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-[0_4px_16px_rgba(32,28,26,0.03)]">
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#9B1C1C]/10 flex items-center justify-center shrink-0 text-[#9B1C1C]">
          <ShieldAlert className="h-4 w-4" />
        </div>
        <div>
          <p className="font-sans text-sm font-medium text-[#1A1A1A]">
            Administrator sign-in required
          </p>
          <p className="font-sans text-xs text-[#746B64]">
            Sign in with your administrator credentials to publish, edit, upload imagery, or update enquiries.
          </p>
        </div>
      </div>
      <Link
        href={`/admin/login?next=${encodeURIComponent(pathname || "/admin")}`}
        className={adminButtonClass("primary", "sm")}
      >
        <KeyRound className="h-3.5 w-3.5" />
        <span>Sign In to Edit</span>
      </Link>
    </div>
  );
}

export function AdminImageUploadField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setUploadError(data?.error || "Upload failed.");
      } else if (data?.media?.secureUrl) {
        onChange(data.media.secureUrl);
      }
    } catch {
      setUploadError("Network error while uploading image.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  async function handleCopy() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failures in restricted frames
    }
  }

  return (
    <div className="space-y-2.5">
      <label className={adminLabelClass}>{label}</label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/images/atelier/... or upload image"
          className={`${adminInputClass} disabled:opacity-60`}
        />
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setLibraryOpen(true)}
            className={adminButtonClass("secondary", "sm")}
          >
            <Images className="h-3.5 w-3.5 text-[#9B1C1C]" />
            <span>Library</span>
          </button>
          <label
            className={`${adminButtonClass("secondary", "sm")} ${
              disabled || uploading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
          >
            <Upload className="h-3.5 w-3.5 text-[#9B1C1C]" />
            <span>{uploading ? "Uploading…" : "Upload"}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              disabled={disabled || uploading}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {uploadError ? (
        <p role="alert" className="font-sans text-xs text-[#9B1C1C]">
          {uploadError}
        </p>
      ) : null}

      {value ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E8DED3] bg-[#FAF6F0] p-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={value}
              alt="Selected asset preview"
              className="h-12 w-16 rounded-lg border border-[#DFD0C0] object-cover shrink-0 bg-[#F2EAE1]"
            />
            <span className="truncate font-sans text-xs text-[#746B64]">
              {value}
            </span>
          </div>
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="inline-flex items-center gap-1 rounded-lg border border-[#DFD0C0] bg-[#FFFDF9] px-2.5 py-1.5 font-sans text-[11px] font-medium text-[#574F49] hover:text-[#1A1A1A] cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[#264E32]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy URL</span>
              </>
            )}
          </button>
        </div>
      ) : null}

      <AdminMediaLibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={(url) => onChange(url)}
        title={`Select Asset — ${label}`}
      />
    </div>
  );
}
