export const dynamic = "force-dynamic";

import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const pages = ["", "/produtos", "/sobre", "/contato"].map((path) => ({ url: `${site.url}${path}`, lastModified: new Date() }));
  return [...pages, ...products.map((p) => ({ url: `${site.url}/produtos/${p.slug}`, lastModified: new Date() }))];
}
