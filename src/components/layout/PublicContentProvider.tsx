"use client";
import Script from "next/script";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { PageContentDocument, SiteSettingsDocument } from "@/types/models";
type PublicSettings = Pick<SiteSettingsDocument, "brandName" | "tagline" | "logoLight" | "logoDark" | "contact" | "socialLinks" | "visualizer" | "defaultSeo" | "favicon" | "footerText" | "copyrightText" | "analyticsId">;
interface ContentState { pages: PageContentDocument[]; settings: PublicSettings | null; preview: boolean }
const PublicContent = createContext<ContentState>({ pages: [], settings: null, preview: false });
export function useSiteSettings() { return useContext(PublicContent).settings; }
export function usePageContent(key: PageContentDocument["pageKey"]) { return useContext(PublicContent).pages.find(page => page.pageKey === key); }
export function PublicContentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ContentState>({ pages: [], settings: null, preview: false });
  useEffect(() => { let active = true; fetch("/api/site-content", { cache: "no-store" }).then(async response => { if (response.ok && active) { const data = await response.json(); if (active) setState(data); } }).catch(() => {}); return () => { active = false; }; }, []);
  return <PublicContent.Provider value={state}>{state.preview && <aside className="sticky top-0 z-[100] flex items-center justify-center gap-4 bg-[#681A27] p-2 text-xs text-white">Private draft preview<a className="underline" href="/api/admin/preview?exit=1">Exit preview</a></aside>}{children}{state.settings?.analyticsId && /^G-[A-Z0-9]+$/.test(state.settings.analyticsId) && <><Script src={`https://www.googletagmanager.com/gtag/js?id=${state.settings.analyticsId}`} strategy="afterInteractive"/><Script id="atelier-analytics" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(state.settings.analyticsId)});`}</Script></>}</PublicContent.Provider>;
}
