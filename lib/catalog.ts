import type { Product as DbProduct } from "@prisma/client";
import { db } from "./db";
import type { Benefit, Format, Product } from "./products";

export function toProduct(p: DbProduct): Product {
  const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
  const benefits = p.benefits.split(",").map((b) => b.trim()).filter(Boolean).slice(0, 3) as Benefit[];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    label: p.label,
    tagline: p.tagline,
    format: p.format as Format,
    formatLabel: p.formatLabel,
    size: p.size,
    reference: p.reference,
    benefits: benefits as Product["benefits"],
    intro: p.intro,
    details: lines(p.details),
    routine: lines(p.routine),
    supplement: p.supplement,
    toConfirm: p.toConfirm ?? undefined,
    image: p.image,
    priceCents: p.priceCents,
    stock: p.stock,
    active: p.active,
  };
}

export async function getProducts() {
  const rows = await db.product.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string) {
  const row = await db.product.findFirst({ where: { slug, active: true } });
  return row ? toProduct(row) : null;
}

export function pickRelated(all: Product[], p: Product, count = 3) {
  const others = all.filter((x) => x.slug !== p.slug);
  return [...others.filter((x) => x.format === p.format), ...others.filter((x) => x.format !== p.format)].slice(0, count);
}
