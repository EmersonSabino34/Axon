import "server-only";

import { createIfthenpayProvider, ifthenpayConfigured } from "./ifthenpay";
import { createTestProvider } from "./test";
import type { PaymentProvider } from "./types";

// Escolha do prestador de pagamentos:
// - PAYMENTS_PROVIDER=ifthenpay → pagamentos reais (precisa das chaves IFTHENPAY_*).
// - PAYMENTS_PROVIDER=teste     → simulação, sem dinheiro real.
// - Sem valor: modo de teste em desenvolvimento; em produção, ifthenpay se estiver configurada,
//   caso contrário nenhum (as encomendas ficam fechadas).

export function getPaymentProvider(): PaymentProvider | null {
  const choice = process.env.PAYMENTS_PROVIDER?.trim().toLowerCase();
  if (choice === "teste") return createTestProvider();
  if (choice === "ifthenpay") return ifthenpayConfigured() ? createIfthenpayProvider() : null;
  if (process.env.NODE_ENV !== "production") return createTestProvider();
  return ifthenpayConfigured() ? createIfthenpayProvider() : null;
}

export { PaymentError } from "./types";
export type { PaymentProvider } from "./types";
