"use server";

import { refresh, updateTag } from "next/cache";
import { hasErrors, type FormState } from "@/lib/forms";
import { launchChecklist } from "@/lib/launch-checklist";
import { validateEmail } from "@/lib/newsletter";
import { requireAdmin } from "@/lib/server/session";
import { CATALOG_TAG, readProduct, resetProduct, saveProduct, saveSettings, setChecklistItem, SETTINGS_TAG } from "@/lib/server/store";
import { deleteUser, getUserById } from "@/lib/server/users";
import { saveCommerceSettings } from "@/lib/server/commerce";
import { getOrderByNumber, markOrderPaid, setOrderStatus } from "@/lib/server/orders";
import { legalPages, type LegalId, type SiteSettings } from "@/lib/site-config";

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const lines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

/** "19,90", "19.90" ou "1 234,50" → cêntimos. Vazio → null. */
function parsePrice(value: string): number | null | "invalid" {
  if (!value) return null;
  const normalized = value.replace(/\s|€/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return "invalid";
  return Math.round(Number(normalized) * 100);
}

export async function updateProduct(slug: string, _state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  if (!readProduct(slug)) return { error: "Produto não encontrado." };

  const price = parsePrice(text(formData, "price"));
  const stockText = text(formData, "stock") || "0";
  const stock = Number(stockText);
  const status = text(formData, "status") === "disponivel" ? "disponivel" : "em-preparacao";
  const tagline = text(formData, "tagline");
  const description = text(formData, "description");
  const highlights = lines(text(formData, "highlights"));
  const validatedClaims = lines(text(formData, "validatedClaims"));

  const fieldErrors: Partial<Record<string, string>> = {};
  if (price === "invalid") fieldErrors.price = "Use um valor como 19,90.";
  else if (price !== null && price > 10_000_000) fieldErrors.price = "O preço parece demasiado alto.";
  if (!/^\d+$/.test(stockText) || stock > 1_000_000) fieldErrors.stock = "Indique um número inteiro de unidades.";
  if (status === "disponivel" && price === null) fieldErrors.status = "Defina o preço antes de marcar o produto como disponível.";
  if (tagline.length < 3 || tagline.length > 120) fieldErrors.tagline = "A frase deve ter entre 3 e 120 caracteres.";
  if (description.length < 20 || description.length > 900) fieldErrors.description = "A descrição deve ter entre 20 e 900 caracteres.";
  if (highlights.length === 0 || highlights.length > 4) fieldErrors.highlights = "Escreva entre 1 e 4 pontos fortes, um por linha.";
  if (validatedClaims.length > 6) fieldErrors.validatedClaims = "Use no máximo 6 alegações.";
  if (hasErrors(fieldErrors) || price === "invalid") return { fieldErrors };

  saveProduct(slug, { priceCents: price, stock, status, tagline, description, highlights, validatedClaims });
  updateTag(CATALOG_TAG);
  refresh();
  return { success: "Alterações guardadas. A loja já mostra os novos dados." };
}

export async function resetProductAction(slug: string) {
  await requireAdmin();
  resetProduct(slug);
  updateTag(CATALOG_TAG);
  refresh();
}

const isLink = (value: string) => value.startsWith("/") ? !value.startsWith("//") : /^https:\/\/[^\s]+$/.test(value);

export async function updateSettings(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const value = (key: string) => text(formData, key) || null;

  const settings: SiteSettings = {
    contacts: { email: value("email"), phone: value("phone"), address: value("address"), hours: value("hours") },
    company: { legalName: value("legalName"), taxId: value("taxId"), registeredOffice: value("registeredOffice") },
    legal: Object.fromEntries(legalPages.map((page) => [page.id, value(`legal-${page.id}`)])) as Record<LegalId, string | null>,
  };

  const fieldErrors: Partial<Record<string, string>> = {};
  if (settings.contacts.email) fieldErrors.email = validateEmail(settings.contacts.email) ?? undefined;
  if (settings.contacts.phone && !/^\+?[\d\s()-]{9,20}$/.test(settings.contacts.phone)) {
    fieldErrors.phone = "Use apenas números, espaços e o indicativo (ex.: +351 210 000 000).";
  }
  if (settings.company.taxId && !/^\d{9}$/.test(settings.company.taxId.replace(/\s/g, ""))) {
    fieldErrors.taxId = "O NIPC tem 9 algarismos.";
  }
  for (const page of legalPages) {
    const href = settings.legal[page.id];
    if (href && !isLink(href)) fieldErrors[`legal-${page.id}`] = "Use um caminho do site (/privacidade) ou um endereço https://.";
  }
  for (const [key, entry] of Object.entries({ ...settings.contacts, ...settings.company })) {
    if (entry && entry.length > 200) fieldErrors[key] = "Máximo de 200 caracteres.";
  }
  if (hasErrors(fieldErrors)) return { fieldErrors };

  if (settings.company.taxId) settings.company.taxId = settings.company.taxId.replace(/\s/g, "");
  saveSettings(settings);
  updateTag(SETTINGS_TAG);
  refresh();
  return { success: "Definições guardadas. O rodapé e a secção de contactos já estão atualizados." };
}

const manualTaskIds = new Set(launchChecklist.flatMap((group) => group.items.filter((item) => !item.auto).map((item) => item.id)));

export async function toggleChecklistItem(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  if (!manualTaskIds.has(id)) return;
  setChecklistItem(id, text(formData, "done") === "true");
  refresh();
}

export async function deleteCustomer(formData: FormData) {
  await requireAdmin();
  const id = Number(text(formData, "id"));
  const customer = Number.isInteger(id) ? getUserById(id) : null;
  if (!customer || customer.role !== "cliente") return;
  deleteUser(customer.id);
  refresh();
}

export async function updateCommerce(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const shipping = parsePrice(text(formData, "shipping"));
  const freeFrom = parsePrice(text(formData, "freeShippingFrom"));
  const expiryDays = Number(text(formData, "multibancoExpiryDays") || "3");

  const fieldErrors: Partial<Record<string, string>> = {};
  if (shipping === "invalid") fieldErrors.shipping = "Use um valor como 4,90 (ou 0 para envio grátis).";
  if (freeFrom === "invalid") fieldErrors.freeShippingFrom = "Use um valor como 50,00, ou deixe vazio.";
  if (!Number.isInteger(expiryDays) || expiryDays < 1 || expiryDays > 30) {
    fieldErrors.multibancoExpiryDays = "Indique entre 1 e 30 dias.";
  }
  if (hasErrors(fieldErrors) || shipping === "invalid" || freeFrom === "invalid") return { fieldErrors };

  const storeOpen = formData.get("storeOpen") === "on";
  saveCommerceSettings({ storeOpen, shippingCents: shipping, freeShippingFromCents: freeFrom, multibancoExpiryDays: expiryDays });
  updateTag(SETTINGS_TAG);
  refresh();
  return { success: storeOpen ? "Loja online guardada. As encomendas abrem quando todos os requisitos estiverem cumpridos." : "Loja online guardada." };
}

export async function shipOrder(number: string, _state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const order = getOrderByNumber(number);
  if (!order || order.status !== "pago") return { error: "Só encomendas pagas podem ser marcadas como enviadas." };
  const note = text(formData, "note").slice(0, 300) || null;
  setOrderStatus(number, "enviado", note);
  refresh();
  return { success: "Encomenda marcada como enviada." };
}

export async function cancelOrderAction(formData: FormData) {
  await requireAdmin();
  const number = text(formData, "number");
  const order = getOrderByNumber(number);
  if (!order || order.status === "enviado" || order.status === "cancelado") return;
  setOrderStatus(number, "cancelado", text(formData, "note").slice(0, 300) || null);
  refresh();
}

export async function confirmPaymentManually(formData: FormData) {
  const admin = await requireAdmin();
  const number = text(formData, "number");
  markOrderPaid(number, `confirmado manualmente por ${admin.email}`);
  refresh();
}
