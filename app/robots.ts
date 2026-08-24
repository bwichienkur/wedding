import { wedding } from "@/data/wedding";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const allowIndexing = wedding.site.mode === "public";

  return {
    rules: {
      userAgent: "*",
      allow: allowIndexing ? "/" : undefined,
      disallow: allowIndexing ? ["/admin/", "/api/"] : "/",
    },
    sitemap: allowIndexing
      ? `${wedding.site.canonicalUrl}/sitemap.xml`
      : undefined,
  };
}
