import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import type { PaymentMethod } from "@/lib/commerce";
import { PaymentError, toAmount, type PaymentProvider, type ProviderPaymentStatus } from "./types";

// Integração com a ifthenpay (MB WAY, Multibanco com referências dinâmicas e cartão).
// As chaves são atribuídas pela ifthenpay ao contratar o serviço (há chaves de teste a pedido) e ficam
// só no servidor, em variáveis de ambiente. Campos conforme a documentação de maio de 2026
// (https://ifthenpay.com/docs/en/); teste as notificações com o Webhook Tester da ifthenpay.
//
// Com IFTHENPAY_SANDBOX=1, o Multibanco e o cartão usam a sandbox da ifthenpay (sem dinheiro real).
// O MB WAY não tem sandbox, por isso fica desligado nesse modo.

const API = "https://api.ifthenpay.com";
const MBWAY_URL = `${API}/spg/payment/mbway`;
const MBWAY_STATUS_URL = `${API}/spg/payment/mbway/status`;
const multibancoUrl = (sandbox: boolean) => `${API}/multibanco/reference/${sandbox ? "sandbox" : "init"}`;
const cardUrl = (sandbox: boolean, key: string) => `${API}/creditcard/${sandbox ? "sandbox/init" : "init"}/${encodeURIComponent(key)}`;

const keys = () => ({
  mbway: process.env.IFTHENPAY_MBWAY_KEY?.trim() || null,
  multibanco: process.env.IFTHENPAY_MB_KEY?.trim() || null,
  card: process.env.IFTHENPAY_CCARD_KEY?.trim() || null,
  antiPhishing: process.env.IFTHENPAY_ANTI_PHISHING_KEY?.trim() || null,
  sandbox: ["1", "true", "sim"].includes(process.env.IFTHENPAY_SANDBOX?.trim().toLowerCase() ?? ""),
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
  if (k.mbway && !k.sandbox) methods.push("mbway");
  if (k.multibanco) methods.push("multibanco");
  if (k.card) methods.push("cartao");

  return {
    id: "ifthenpay",
    label: k.sandbox ? "ifthenpay (sandbox)" : "ifthenpay",
    live: !k.sandbox,
    methods,

    async startMbway({ orderNumber, amountCents, phone, email }) {
      if (k.sandbox) throw new PaymentError("O MB WAY não está disponível no modo sandbox.");
      const result = await postJson(MBWAY_URL, {
        mbWayKey: required(k.mbway, "O MB WAY"),
        orderId: orderNumber,
        amount: toAmount(amountCents),
        // Indicativo e número separados por «#».
        mobileNumber: `351#${phone}`,
        email: email.slice(0, 100),
        description: `Encomenda AXON ${orderNumber}`,
      });
      // "000": pedido enviado para a app MB WAY do cliente. 100 e 999: falha temporária. 122: recusado.
      const status = text(result.Status);
      if (status !== "000" || !text(result.RequestId)) {
        throw new PaymentError(
          status === "122"
            ? "O pedido MB WAY foi recusado. Confirme se o número tem MB WAY ativo ou escolha outro método."
            : `Não foi possível enviar o pedido MB WAY${status ? ` (código ${status})` : ""}. Tente novamente.`,
        );
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
      const result = await postJson(multibancoUrl(k.sandbox), {
        mbKey: required(k.multibanco, "O Multibanco"),
        orderId: orderNumber,
        amount: toAmount(amountCents),
        description: `Encomenda AXON ${orderNumber}`,
        clientName: name.slice(0, 200),
        clientEmail: email.slice(0, 200),
        expiryDays: String(expiryDays),
      });
      // "0": referência criada.
      const status = text(result.Status);
      const entity = text(result.Entity);
      const reference = text(result.Reference);
      if (status !== "0" || !entity || !reference) {
        throw new PaymentError(`Não foi possível gerar a referência Multibanco${status ? ` (código ${status})` : ""}. Tente outro método.`);
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
      const result = await postJson(cardUrl(k.sandbox, required(k.card, "O pagamento com cartão")), {
        orderId: orderNumber,
        amount: toAmount(amountCents),
        successUrl,
        errorUrl,
        cancelUrl,
        language: "pt",
      });
      // "0": página de pagamento criada; o cliente é encaminhado para PaymentUrl (sempre por GET).
      const status = text(result.Status);
      const url = text(result.PaymentUrl);
      if (status !== "0" || !url.startsWith("https://")) {
        throw new PaymentError(`Não foi possível abrir o pagamento com cartão${status ? ` (código ${status})` : ""}. Tente outro método.`);
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
