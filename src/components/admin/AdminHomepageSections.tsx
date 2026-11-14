"use client";
import type { PageContentDocument } from "@/types/models";
import { DEFAULT_HOMEPAGE_CONTENT } from "@/lib/homepage-content";
import { adminInputClass, adminLabelClass, adminTextareaClass } from "./AdminUiPrimitives";
const LABELS: Record<string, string> = {
  philosophy: "Studio philosophy", wallPrintingArt: "Service highlights",
  selectedProjects: "Featured projects",
  whyAtelierSection: "Why Atelier", contactCtaSection: "Contact invitation",
};
const fieldLabel = (key: string) => key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, c => c.toUpperCase()).replace(/Href$/, "destination");
export function AdminHomepageSections({ doc, onChange }: { doc: PageContentDocument; onChange: (doc: PageContentDocument) => void }) {
  if (doc.pageKey !== "home") return null;
  const homepage = doc.homepage || {};
  return <div className="space-y-4 border-t border-[#E8DED3] pt-5"><h3 className="font-serif text-xl">Homepage sections</h3><p className="text-xs text-[#746B64]">Featured designs and projects come from their published collections. Edit section copy and supporting visuals below.</p>
    {Object.entries(LABELS).map(([sectionKey, label]) => {
      const defaults = DEFAULT_HOMEPAGE_CONTENT[sectionKey as keyof typeof DEFAULT_HOMEPAGE_CONTENT] as unknown as Record<string, unknown>;
      const existing = (homepage as Record<string, unknown>)[sectionKey] as Record<string, unknown> | undefined;
      const current = { ...defaults, ...existing };
      return <details key={sectionKey} className="rounded-xl border border-[#DFD0C0] p-4"><summary className="cursor-pointer text-sm font-medium">{label}</summary><div className="mt-4 grid gap-3 sm:grid-cols-2">{Object.entries(current).filter(([, value]) => typeof value === "string").map(([key, value]) => <label key={key} className={adminLabelClass}>{fieldLabel(key)}<textarea rows={key.toLowerCase().includes("paragraph") || key.toLowerCase().includes("text") ? 3 : 1} value={String(value)} onChange={e => onChange({ ...doc, homepage: { ...homepage, [sectionKey]: { ...current, [key]: e.target.value } } })} className={adminTextareaClass}/></label>)}
      </div></details>;
    })}
    <div><h4 className="mb-3 text-sm font-medium">Service and studio pillars</h4>{(["wallPrintingArt", "whyAtelierSection"] as const).map(sectionKey => {
      const defaults = DEFAULT_HOMEPAGE_CONTENT[sectionKey] as unknown as Record<string, unknown>;
      const existing = (homepage as Record<string, unknown>)[sectionKey] as Record<string, unknown> | undefined;
      const key = "pillars";
      const current = { ...defaults, ...existing };
      const items = current[key] as Record<string, unknown>[];
      return <details key={sectionKey} className="mb-3 rounded-xl border border-[#DFD0C0] p-4"><summary className="cursor-pointer text-sm">{LABELS[sectionKey]} items</summary><div className="mt-3 space-y-3">{items.map((item, index) => <div key={index} className="grid gap-2 rounded-lg bg-[#FFFDF9] p-3 sm:grid-cols-2">{Object.entries(item).filter(([, value]) => typeof value === "string").map(([field, value]) => <label key={field} className={adminLabelClass}>{fieldLabel(field)}<input className={adminInputClass} value={String(value)} onChange={e => onChange({ ...doc, homepage: { ...homepage, [sectionKey]: { ...current, [key]: items.map((entry, idx) => idx === index ? { ...entry, [field]: e.target.value } : entry) } } })}/></label>)}</div>)}</div></details>;
    })}</div>
  </div>;
}
