import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { baseProducts, type Product, type ProductStatus } from "@/lib/collection";
import { defaultSettings, type SiteSettings } from "@/lib/site-config";
import { getDb, nowIso } from "./db";

// Catálogo e definições da loja: valores de base do código com as alterações feitas no painel.
// O site público lê as versões em cache (getCatalog, getSiteSettings); o painel invalida-as ao gravar.

export const CATALOG_TAG = "catalogo";
export const SETTINGS_TAG = "definicoes";

type OverrideRow = {
  slug: string;
  price_cents: number | null;
  stock: number;
  status: ProductStatus;
  tagline: string | null;
  description: string | null;
  highlights: string | null;
  validated_claims: string | null;
  updated_at: string;
};

export type ProductChanges = {
  priceCents: number | null;
  stock: number;
  status: ProductStatus;
  tagline: string;
  description: string;
  highlights: string[];
  validatedClaims: string[];
};

const parseList = (value: string | null): string[] | null => (value ? (JSON.parse(value) as string[]) : null);

export function readCatalog(): Product[] {
  const rows = getDb().prepare("SELECT * FROM product_overrides").all() as OverrideRow[];
  const overrides = new Map(rows.map((row) => [row.slug, row]));
  return baseProducts.map((product) => {
    const row = overrides.get(product.slug);
    if (!row) return product;
    return {
      ...product,
      priceCents: row.price_cents,
      stock: row.stock,
      status: row.status,
      tagline: row.tagline ?? product.tagline,
      description: row.description ?? product.description,
      highlights: parseList(row.highlights) ?? product.highlights,
      validatedClaims: parseList(row.validated_claims) ?? product.validatedClaims,
      updatedAt: row.updated_at,
    };
  });
}

export async function getCatalog(): Promise<Product[]> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("max");
  return readCatalog();
}

export function readProduct(slug: string): Product | null {
  return readCatalog().find((product) => product.slug === slug) ?? null;
}

export function saveProduct(slug: string, changes: ProductChanges) {
  const base = baseProducts.find((product) => product.slug === slug);
  if (!base) throw new Error(`Produto desconhecido: ${slug}`);
  // Textos iguais aos de base ficam a NULL, para acompanharem futuras alterações no código.
  const differs = (value: string, original: string) => (value === original ? null : value);
  const differsList = (value: string[], original: string[]) =>
    JSON.stringify(value) === JSON.stringify(original) ? null : JSON.stringify(value);

  getDb()
    .prepare(
      `INSERT INTO product_overrides (slug, price_cents, stock, status, tagline, description, highlights, validated_claims, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET price_cents = excluded.price_cents, stock = excluded.stock, status = excluded.status,
         tagline = excluded.tagline, description = excluded.description, highlights = excluded.highlights,
         validated_claims = excluded.validated_claims, updated_at = excluded.updated_at`,
    )
    .run(
      slug,
      changes.priceCents,
      changes.stock,
      changes.status,
      differs(changes.tagline, base.tagline),
      differs(changes.description, base.description),
      differsList(changes.highlights, base.highlights),
      differsList(changes.validatedClaims, base.validatedClaims),
      nowIso(),
    );
}

export function resetProduct(slug: string) {
  getDb().prepare("DELETE FROM product_overrides WHERE slug = ?").run(slug);
}

export function readSettings(): SiteSettings {
  const rows = getDb().prepare("SELECT key, value FROM settings").all() as { key: string; value: string }[];
  const stored = Object.fromEntries(rows.map((row) => [row.key, JSON.parse(row.value)]));
  return {
    contacts: { ...defaultSettings.contacts, ...stored.contacts },
    company: { ...defaultSettings.company, ...stored.company },
    legal: { ...defaultSettings.legal, ...stored.legal },
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(SETTINGS_TAG);
  cacheLife("max");
  return readSettings();
}

export function saveSettings(settings: SiteSettings) {
  const statement = getDb().prepare(
    "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
  );
  const now = nowIso();
  for (const key of ["contacts", "company", "legal"] as const) statement.run(key, JSON.stringify(settings[key]), now);
}

export function readChecklistDone(): Set<string> {
  const rows = getDb().prepare("SELECT id FROM checklist WHERE done_at IS NOT NULL").all() as { id: string }[];
  return new Set(rows.map((row) => row.id));
}

export function setChecklistItem(id: string, done: boolean) {
  getDb()
    .prepare("INSERT INTO checklist (id, done_at) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET done_at = excluded.done_at")
    .run(id, done ? nowIso() : null);
}
