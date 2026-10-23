import "server-only";

import type { PaymentMethod } from "@/lib/commerce";

export type PaymentStart =
  | { kind: "mbway"; requestId: string }
  | { kind: "multibanco"; requestId: string | null; entity: string; reference: string; expiresAt: string | null }
  | { kind: "redirect"; requestId: string | null; url: string };

export type ProviderPaymentStatus = "pago" | "pendente" | "falhado";

type BaseInput = { orderNumber: string; amountCents: number; email: string; name: string };

export interface PaymentProvider {
  id: "ifthenpay" | "teste";
  /** Nome mostrado no painel. */
  label: string;
  /** `false` no modo de teste: nenhum dinheiro é movimentado. */
  live: boolean;
  /** Métodos com chave configurada. */
  methods: PaymentMethod[];
  startMbway(input: BaseInput & { phone: string }): Promise<PaymentStart>;
  createMultibanco(input: BaseInput & { expiryDays: number }): Promise<PaymentStart>;
  startCard(input: BaseInput & { successUrl: string; errorUrl: string; cancelUrl: string; simulatorUrl: string }): Promise<PaymentStart>;
  /** Estado de um pedido MB WAY, quando o prestador permite consultá-lo. */
  mbwayStatus(requestId: string): Promise<ProviderPaymentStatus>;
}

/** Erro devolvido pelo prestador. A mensagem pode ser mostrada ao cliente. */
export class PaymentError extends Error {}

export const toAmount = (cents: number) => (cents / 100).toFixed(2);
