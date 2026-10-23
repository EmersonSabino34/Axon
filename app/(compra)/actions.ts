"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  normalizePhone,
  shippingFor,
  validateMobile,
  validateNif,
  validatePostalCode,
  type CheckoutLine,
  type PaymentMethod,
} from "@/lib/commerce";
import { hasErrors, validateName, type FormState } from "@/lib/forms";
import { validateEmail } from "@/lib/newsletter";
import { readCheckoutReadiness } from "@/lib/server/commerce";
import { attachPayment, canViewOrder, createOrder, getOrderByNumber, markOrderFailed, markOrderPaid, type Order } from "@/lib/server/orders";
import { getPaymentProvider, PaymentError, type PaymentProvider } from "@/lib/server/payments";
import { getCurrentUser } from "@/lib/server/session";
import { readCatalog } from "@/lib/server/store";

/** Estado do checkout: além dos erros, pode trazer o link da encomenda já criada. */
export type CheckoutState = (NonNullable<FormState> & { orderUrl?: string }) | undefined;

const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();
const METHODS: PaymentMethod[] = ["mbway", "multibanco", "cartao"];

async function siteOrigin(): Promise<string> {
  const configured = process.env.SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function parseLines(raw: string): CheckoutLine[] | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0 || parsed.length > 20) return null;
    const lines = parsed.map((line) => ({ slug: String(line?.slug ?? ""), quantity: Number(line?.quantity) }));
    return lines.every((line) => line.slug && Number.isInteger(line.quantity) && line.quantity > 0 && line.quantity <= 20)
      ? lines
      : null;
  } catch {
    return null;
  }
}

/**
 * Inicia o pagamento da encomenda no prestador e devolve para onde levar o cliente.
 * Em caso de erro do prestador, a encomenda fica «Pagamento não concluído» e pode ser repetida.
 */
async function startPayment(
  provider: PaymentProvider,
  order: Order,
  token: string,
  method: PaymentMethod,
  mbwayPhone: string | null,
  expiryDays: number,
): Promise<{ destination: string } | { error: string }> {
  const origin = await siteOrigin();
  const orderPath = `/encomenda/${order.number}?t=${encodeURIComponent(token)}`;
  const base = { orderNumber: order.number, amountCents: order.totalCents, email: order.customer.email, name: order.customer.name };

  try {
    if (method === "mbway") {
      const phone = mbwayPhone ?? order.customer.phone;
      const result = await provider.startMbway({ ...base, phone });
      if (result.kind !== "mbway") throw new PaymentError("Resposta inesperada do serviço de pagamentos.");
      attachPayment(order.number, { method, requestId: result.requestId, mbwayPhone: phone });
      return { destination: `${orderPath}&novo=1` };
    }
    if (method === "multibanco") {
      const result = await provider.createMultibanco({ ...base, expiryDays });
      if (result.kind !== "multibanco") throw new PaymentError("Resposta inesperada do serviço de pagamentos.");
      attachPayment(order.number, {
        method,
        requestId: result.requestId,
        entity: result.entity,
        reference: result.reference,
        expiresAt: result.expiresAt,
      });
      return { destination: `${orderPath}&novo=1` };
    }
    const back = (resultado: string) =>
      `${origin}/api/pagamentos/ifthenpay/retorno?resultado=${resultado}&encomenda=${order.number}&t=${encodeURIComponent(token)}`;
    const result = await provider.startCard({
      ...base,
      successUrl: back("sucesso"),
      errorUrl: back("erro"),
      cancelUrl: back("cancelado"),
      simulatorUrl: `${origin}/pagamento-teste/${order.number}?t=${encodeURIComponent(token)}`,
    });
    if (result.kind !== "redirect") throw new PaymentError("Resposta inesperada do serviço de pagamentos.");
    attachPayment(order.number, { method, requestId: result.requestId });
    return { destination: result.url };
  } catch (error) {
    if (!(error instanceof PaymentError)) throw error;
    markOrderFailed(order.number, error.message);
    return { error: error.message };
  }
}

export async function placeOrder(_state: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const readiness = readCheckoutReadiness();
  const provider = getPaymentProvider();
  if (!readiness.open || !provider) return { error: "A loja ainda não está a aceitar encomendas." };

  const lines = parseLines(text(formData, "cart"));
  if (!lines) return { error: "O carrinho está vazio ou é inválido. Volte à loja e adicione os produtos." };

  const method = text(formData, "method") as PaymentMethod;
  const customer = {
    name: text(formData, "name"),
    email: text(formData, "email").toLowerCase(),
    phone: normalizePhone(text(formData, "phone")),
    nif: text(formData, "nif").replace(/\s/g, "") || null,
  };
  const shipping = {
    address: text(formData, "address"),
    postalCode: text(formData, "postalCode"),
    city: text(formData, "city"),
  };
  const mbwayPhone = method === "mbway" ? normalizePhone(text(formData, "mbwayPhone") || customer.phone) : null;

  const fieldErrors: Partial<Record<string, string>> = {
    name: validateName(customer.name) ?? undefined,
    email: validateEmail(customer.email) ?? undefined,
    phone: validateMobile(customer.phone) ?? undefined,
    nif: customer.nif ? (validateNif(customer.nif) ?? undefined) : undefined,
    address: shipping.address.length < 5 ? "Indique a morada completa." : undefined,
    postalCode: validatePostalCode(shipping.postalCode) ?? undefined,
    city: shipping.city.length < 2 ? "Indique a localidade." : undefined,
    method: METHODS.includes(method) && provider.methods.includes(method) ? undefined : "Escolha um método de pagamento.",
    mbwayPhone: mbwayPhone ? (validateMobile(mbwayPhone) ?? undefined) : undefined,
    terms: formData.get("terms") === "on" ? undefined : "Para encomendar, aceite os Termos e Condições.",
  };
  if (hasErrors(fieldErrors)) return { fieldErrors, error: "Verifique os campos assinalados." };

  // Preços, disponibilidade e stock vêm sempre do servidor.
  const catalog = readCatalog();
  const items = [];
  for (const line of lines) {
    const product = catalog.find((entry) => entry.slug === line.slug);
    if (!product || product.status !== "disponivel" || product.priceCents === null) {
      return { error: `${product?.name ?? "Um dos produtos"} ainda não está disponível. Retire-o do carrinho para continuar.` };
    }
    if (product.stock < line.quantity) {
      return {
        error:
          product.stock === 0
            ? `${product.name} está esgotado. Retire-o do carrinho para continuar.`
            : `Só há ${product.stock} unidades de ${product.name}. Ajuste a quantidade para continuar.`,
      };
    }
    items.push({ slug: product.slug, name: product.name, unitPriceCents: product.priceCents, quantity: line.quantity });
  }
  const subtotalCents = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
  const shippingCents = shippingFor(subtotalCents, readiness.settings) ?? 0;

  const user = await getCurrentUser();
  const { order, token } = createOrder({
    userId: user?.id ?? null,
    paymentMethod: method,
    provider: provider.id,
    customer,
    shipping,
    items,
    subtotalCents,
    shippingCents,
  });

  const result = await startPayment(provider, order, token, method, mbwayPhone, readiness.settings.multibancoExpiryDays);
  if ("error" in result) {
    return {
      error: `${result.error} A encomenda ${order.number} ficou guardada: pode tentar de novo na página da encomenda.`,
      orderUrl: `/encomenda/${order.number}?t=${encodeURIComponent(token)}&novo=1`,
    };
  }
  redirect(result.destination);
}

/** Nova tentativa de pagamento (ex.: MB WAY expirado) ou troca de método. */
export async function retryPayment(number: string, token: string, _state: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!canViewOrder(number, token, user)) return { error: "Encomenda não encontrada." };
  const order = getOrderByNumber(number);
  const provider = getPaymentProvider();
  if (!order || !provider) return { error: "Os pagamentos não estão disponíveis neste momento." };
  if (!["pendente", "falhado"].includes(order.status)) return { error: "Esta encomenda já não aguarda pagamento." };

  const method = text(formData, "method") as PaymentMethod;
  if (!provider.methods.includes(method)) return { fieldErrors: { method: "Escolha um método de pagamento." } };
  const mbwayPhone = method === "mbway" ? normalizePhone(text(formData, "mbwayPhone") || order.customer.phone) : null;
  if (mbwayPhone) {
    const error = validateMobile(mbwayPhone);
    if (error) return { fieldErrors: { mbwayPhone: error } };
  }

  const readiness = readCheckoutReadiness();
  const result = await startPayment(provider, order, token, method, mbwayPhone, readiness.settings.multibancoExpiryDays);
  if ("error" in result) return { error: result.error };
  redirect(result.destination.replace("&novo=1", ""));
}

/** Só no modo de teste: confirma ou recusa o pagamento como faria o banco. */
export async function simulateTestPayment(number: string, token: string, outcome: "pago" | "falhado") {
  const provider = getPaymentProvider();
  const order = getOrderByNumber(number);
  const user = await getCurrentUser();
  if (provider?.id !== "teste" || order?.provider !== "teste" || !canViewOrder(number, token, user)) return;
  if (outcome === "pago") markOrderPaid(number, "simulação (modo de teste)");
  else markOrderFailed(number, "Pagamento recusado (simulação do modo de teste).");
  redirect(`/encomenda/${number}?t=${encodeURIComponent(token)}`);
}
