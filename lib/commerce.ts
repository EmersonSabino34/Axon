// Tipos, textos e validações da loja online, partilhados entre o servidor e o navegador.

export type PaymentMethod = "mbway" | "multibanco" | "cartao";
export type OrderStatus = "pendente" | "pago" | "enviado" | "cancelado" | "falhado";

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  mbway: "MB WAY",
  multibanco: "Multibanco",
  cartao: "Cartão de crédito ou débito",
};

export const orderStatusLabels: Record<OrderStatus, string> = {
  pendente: "A aguardar pagamento",
  pago: "Paga",
  enviado: "Enviada",
  cancelado: "Cancelada",
  falhado: "Pagamento não concluído",
};

/** Definições da loja online, editadas em Painel › Definições. */
export type CommerceSettings = {
  /** Aceitar encomendas. Só abre de facto quando todos os requisitos estão cumpridos. */
  storeOpen: boolean;
  /** Portes para Portugal, em cêntimos. `null` enquanto não estiverem definidos. */
  shippingCents: number | null;
  /** Envio grátis a partir deste subtotal (cêntimos). `null` = nunca. */
  freeShippingFromCents: number | null;
  /** Dias de validade das referências Multibanco. */
  multibancoExpiryDays: number;
};

export const defaultCommerceSettings: CommerceSettings = {
  storeOpen: false,
  shippingCents: null,
  freeShippingFromCents: null,
  multibancoExpiryDays: 3,
};

/** Tempo que o cliente tem para aprovar o pedido na app MB WAY. */
export const MBWAY_TIMEOUT_MINUTES = 5;

export function shippingFor(subtotalCents: number, settings: CommerceSettings): number | null {
  if (settings.shippingCents === null) return null;
  if (settings.freeShippingFromCents !== null && subtotalCents >= settings.freeShippingFromCents) return 0;
  return settings.shippingCents;
}

/** "123456789" → "123 456 789". */
export const formatReference = (reference: string) => reference.replace(/\s/g, "").replace(/(\d{3})(?=\d)/g, "$1 ");

/** "912345678" → "912 345 678". */
export const formatPhone = (phone: string) => phone.replace(/(\d{3})(?=\d)/g, "$1 ");

export const normalizePhone = (value: string) => value.replace(/[\s.-]/g, "").replace(/^(\+351|00351)/, "");

export function validateMobile(value: string): string | null {
  const phone = normalizePhone(value);
  if (!phone) return "Indique o número de telemóvel.";
  if (!/^9[1236]\d{7}$/.test(phone)) return "Use um telemóvel português com 9 algarismos (ex.: 912 345 678).";
  return null;
}

export function validatePostalCode(value: string): string | null {
  if (!/^\d{4}-\d{3}$/.test(value.trim())) return "Use o formato 0000-000.";
  return null;
}

/** NIF português: 9 algarismos com dígito de controlo (módulo 11). */
export function validateNif(value: string): string | null {
  const nif = value.replace(/\s/g, "");
  if (!nif) return null;
  if (!/^[1-35-9]\d{8}$/.test(nif)) return "O NIF tem 9 algarismos.";
  const sum = nif
    .slice(0, 8)
    .split("")
    .reduce((total, digit, index) => total + Number(digit) * (9 - index), 0);
  const check = 11 - (sum % 11);
  if ((check >= 10 ? 0 : check) !== Number(nif[8])) return "Este NIF não é válido.";
  return null;
}

/** Linhas do carrinho enviadas pelo navegador (os preços são sempre recalculados no servidor). */
export type CheckoutLine = { slug: string; quantity: number };
