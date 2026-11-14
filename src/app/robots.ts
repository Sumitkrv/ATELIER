import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/public-seo";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/*?preview="] }, sitemap: `${siteOrigin()}/sitemap.xml` }; }
