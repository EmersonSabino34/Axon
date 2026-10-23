import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import type { PaymentMethod } from "@/lib/commerce";
import { PaymentError, toAmount, type PaymentProvider, type ProviderPaymentStatus } from "./types";

// Integração com a ifthenpay (MB WAY, Multibanco com referências dinâmicas e cartão).
// As chaves são atribuídas pela ifthenpay ao contratar o serviço (há chaves de teste a pedido) e ficam
// só no servidor, em variáveis de ambiente. Ao ativar, confirme os campos com a documentação atual
// (https://ifthenpay.com/docs/) e teste com o Webhook Tester da ifthenpay.

const MBWAY_URL = "https://api.ifthenpay.com/spg/payment/mbway";
const MBWAY_STATUS_URL = "https://api.ifthenpay.com/spg/payment/mbway/status";
const MULTIBANCO_URL = "https://api.ifthenpay.com/multibanco/reference/init";
const CARD_URL = "https://ifthenpay.com/api/creditcard/init/";

const keys = () => ({
  mbway: process.env.IFTHENPAY_MBWAY_KEY?.trim() || null,
  multibanco: process.env.IFTHENPAY_MB_KEY?.trim() || null,
  card: process.env.IFTHENPAY_CCARD_KEY?.trim() || null,
  antiPhishing: process.env.IFTHENPAY_ANTI_PHISHING_KEY?.trim() || null,
});

export const ifthenpayConfigured = () => {
  const k = keys();
  return Boolean(k.antiPhishing && (k.mbway || k.multibanco || k.card));
};

async function request(url: string, init: RequestInit): Promise<Record<string, unknown>> {
  let response: Response;
  try {
    response = await fetch(url, { ...init, signal: AbortSignal.timeout(15_000), cache: "no-store" });
  } catch {
    throw new PaymentError("O serviço de pagamentos não respondeu. Tente novamente dentro de momentos.");
  }
  if (!response.ok) throw new PaymentError("O serviço de pagamentos recusou o pedido. Tente outro método.");
  return (await response.json()) as Record<string, unknown>;
}

const postJson = (url: string, body: unknown) =>
  request(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

const text = (value: unknown) => (typeof value === "string" || typeof value === "number" ? String(value) : "");

/** A ifthenpay devolve a validade como "dd-mm-aaaa"; guarda-se o fim desse dia (hora de Lisboa ≈ UTC). */
function parseExpiry(value: string): string | null {
  const match = /^(\d{2})-(\d{2})-(\d{4})/.exec(value);
  if (!match) return null;
  return new Date(`${match[3]}-${match[2]}-${match[1]}T23:59:59Z`).toISOString();
}

function required(key: string | null, method: string): string {
  if (!key) throw new PaymentError(`${method} não está disponível neste momento.`);
  return key;
}

export function createIfthenpayProvider(): PaymentProvider {
  const k = keys();
  const methods: PaymentMethod[] = [];
  if (k.mbway) methods.push("mbway");
  if (k.multibanco) methods.push("multibanco");
  if (k.card) methods.push("cartao");

  return {
    id: "ifthenpay",
    label: "ifthenpay",
    live: true,
    methods,

    async startMbway({ orderNumber, amountCents, phone, email }) {
      const result = await postJson(MBWAY_URL, {
        mbWayKey: required(k.mbway, "O MB WAY"),
        orderId: orderNumber,
        amount: toAmount(amountCents),
        mobileNumber: phone,
        email,
        description: `Encomenda AXON ${orderNumber}`,
      });
      // "000": pedido enviado para a app MB WAY do cliente.
      if (text(result.Status) !== "000" || !text(result.RequestId)) {
        throw new PaymentError(text(result.Message) || "Não foi possível enviar o pedido MB WAY.");
      }
      return { kind: "mbway", requestId: text(result.RequestId) };
    },

    async mbwayStatus(requestId) {
      const params = new URLSearchParams({ mbWayKey: required(k.mbway, "O MB WAY"), requestId });
      const result = await request(`${MBWAY_STATUS_URL}?${params}`, { method: "GET" });
      const status = text(result.Status);
      if (status === "000") return "pago";
      // 020 recusado pelo cliente, 101 expirado, 122 recusado.
      if (["020", "101", "122"].includes(status)) return "falhado";
      return "pendente" satisfies ProviderPaymentStatus;
    },

    async createMultibanco({ orderNumber, amountCents, expiryDays, email, name }) {
      const result = await postJson(MULTIBANCO_URL, {
        mbKey: required(k.multibanco, "O Multibanco"),
        orderId: orderNumber,
        amount: toAmount(amountCents),
        description: `Encomenda AXON ${orderNumber}`,
        clientName: name,
        clientEmail: email,
        expiryDays: String(expiryDays),
      });
      const entity = text(result.Entity);
      const reference = text(result.Reference);
      if (!entity || !reference) {
        throw new PaymentError(text(result.Message) || "Não foi possível gerar a referência Multibanco.");
      }
      return {
        kind: "multibanco",
        requestId: text(result.RequestId) || null,
        entity,
        reference,
        expiresAt: parseExpiry(text(result.ExpiryDate)),
      };
    },

    async startCard({ orderNumber, amountCents, successUrl, errorUrl, cancelUrl }) {
      const result = await postJson(CARD_URL + encodeURIComponent(required(k.card, "O pagamento com cartão")), {
        orderId: orderNumber,
        amount: toAmount(amountCents),
        successUrl,
        errorUrl,
        cancelUrl,
        language: "pt",
      });
      const url = text(result.PaymentUrl);
      if (!url.startsWith("https://")) {
        throw new PaymentError(text(result.Message) || "Não foi possível abrir o pagamento com cartão.");
      }
      return { kind: "redirect", requestId: text(result.RequestId) || null, url };
    },
  };
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** Chave anti-phishing enviada pela ifthenpay em cada notificação de pagamento. */
export function verifyAntiPhishingKey(received: string | null): boolean {
  const expected = keys().antiPhishing;
  return Boolean(expected && received && safeEqual(received, expected));
}

/** Assinatura `sk` do regresso do pagamento com cartão: HMAC-SHA256 de id + amount + requestId com a chave CCARD. */
export function verifyCardReturn(params: { id: string; amount: string; requestId: string; sk: string }): boolean {
  const key = keys().card;
  if (!key || !params.sk) return false;
  const expected = createHmac("sha256", key).update(params.id + params.amount + params.requestId).digest("hex");
  return safeEqual(params.sk.toLowerCase(), expected);
}
