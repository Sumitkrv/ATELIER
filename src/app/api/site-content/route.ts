import { NextResponse } from "next/server";
import { getPublicPages, getPublicSiteSettings, isPrivatePreview } from "@/lib/public-cms";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const [pages, settings, preview] = await Promise.all([getPublicPages(), getPublicSiteSettings(), isPrivatePreview()]);
    // Only explicitly public settings leave the server. Notification destinations stay private.
    const { brandName, tagline, logoLight, logoDark, contact, socialLinks, visualizer, defaultSeo, favicon, footerText, copyrightText, analyticsId } = settings;
    return NextResponse.json({ pages, settings: { brandName, tagline, logoLight, logoDark, contact, socialLinks, visualizer, defaultSeo, favicon, footerText, copyrightText, analyticsId }, preview }, { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } });
  } catch {
    return NextResponse.json({ error: "Website content is temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
