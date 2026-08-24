import { wedding } from "@/data/wedding";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  if (wedding.site.mode !== "public") {
    return [];
  }

  const base = wedding.site.canonicalUrl;

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
