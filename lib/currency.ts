import { siteConfig } from "./site-config";

const formatter = new Intl.NumberFormat(siteConfig.commerce.locale, {
  style: "currency",
  currency: siteConfig.commerce.currency,
});

export const PRICE_PENDING = "Preço a confirmar";

export function formatPrice(cents: number | null): string {
  return cents === null ? PRICE_PENDING : formatter.format(cents / 100);
}
