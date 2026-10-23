import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { defaultCommerceSettings, type CommerceSettings, type PaymentMethod } from "@/lib/commerce";
import type { ChecklistContext } from "@/lib/launch-checklist";
import { getDb, nowIso } from "./db";
import { getPaymentProvider } from "./payments";
import { readCatalog, readSettings, SETTINGS_TAG } from "./store";

export function readCommerceSettings(): CommerceSettings {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = 'commerce'").get() as { value: string } | undefined;
  return { ...defaultCommerceSettings, ...(row ? (JSON.parse(row.value) as Partial<CommerceSettings>) : {}) };
}

export function saveCommerceSettings(settings: CommerceSettings) {
  getDb()
    .prepare(
      "INSERT INTO settings (key, value, updated_at) VALUES ('commerce', ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
    )
    .run(JSON.stringify(settings), nowIso());
}

/** Indica se a loja aceita encomendas (só a definição do painel), para os textos da página inicial. */
export async function getStoreOpenFlag(): Promise<boolean> {
  "use cache";
  cacheTag(SETTINGS_TAG);
  cacheLife("max");
  return readCommerceSettings().storeOpen;
}

export type CheckoutReadiness = {
  /** Pode receber encomendas agora. */
  open: boolean;
  /** Pagamentos simulados (sem dinheiro real). */
  testMode: boolean;
  providerLabel: string | null;
  methods: PaymentMethod[];
  settings: CommerceSettings;
  /** O que falta para abrir, em linguagem do painel. */
  missing: string[];
};

/** Lê no momento do pedido (inclui as variáveis de ambiente do prestador de pagamentos). */
export function readCheckoutReadiness(): CheckoutReadiness {
  const settings = readCommerceSettings();
  const site = readSettings();
  const provider = getPaymentProvider();

  const missing: string[] = [];
  if (!settings.storeOpen) missing.push("Ativar «Aceitar encomendas» em Painel › Definições");
  if (!provider) missing.push("Configurar o prestador de pagamentos (variáveis IFTHENPAY_* no servidor)");
  if (provider && provider.methods.length === 0) missing.push("Ativar pelo menos um método de pagamento");
  if (settings.shippingCents === null) missing.push("Definir os portes de envio");
  if (!site.legal.termos) missing.push("Publicar os Termos e Condições");
  if (!site.legal.privacidade) missing.push("Publicar a Política de Privacidade");
  if (!site.company.legalName || !site.company.taxId) missing.push("Indicar a denominação e o NIPC da empresa");

  return {
    open: missing.length === 0,
    testMode: provider ? !provider.live : false,
    providerLabel: provider?.label ?? null,
    methods: provider?.methods ?? [],
    settings,
    missing,
  };
}

/** Dados para avaliar a lista de lançamento (painel). */
export function readChecklistContext(): ChecklistContext {
  return {
    catalog: readCatalog(),
    settings: readSettings(),
    commerce: readCommerceSettings(),
    livePayments: getPaymentProvider()?.live === true,
  };
}
