import type { MetadataRoute } from "next";
import { DISTRICTS } from "@/lib/districts";
import { TODAY } from "@/lib/format";
import { SITE_URL } from "@/lib/site";

/** Solo páginas indexables: las fichas /vivienda/[id] quedan fuera (noindex). */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(TODAY);
  const pages = ["", "/borrados", "/estadisticas", "/explorar", "/metodologia", "/agencias", "/pro"];
  return [
    ...pages.map((p) => ({ url: SITE_URL + p, lastModified, changeFrequency: "daily" as const })),
    ...DISTRICTS.map((d) => ({ url: `${SITE_URL}/madrid/${d.slug}`, lastModified, changeFrequency: "daily" as const })),
  ];
}
