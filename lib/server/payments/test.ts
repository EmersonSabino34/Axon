import "server-only";

import { createHash, randomBytes } from "node:crypto";
import type { PaymentProvider } from "./types";

// Modo de teste: simula os três métodos sem contactar nenhum banco. A entidade 00000 não existe,
// por isso a referência não pode ser paga por engano num multibanco. O pagamento é confirmado com o
// botão «Simular pagamento», visível apenas neste modo.

export const TEST_ENTITY = "00000";

export function createTestProvider(): PaymentProvider {
  return {
    id: "teste",
    label: "Modo de teste",
    live: false,
    methods: ["mbway", "multibanco", "cartao"],

    async startMbway() {
      return { kind: "mbway", requestId: `teste-${randomBytes(6).toString("hex")}` };
    },

    async mbwayStatus() {
      return "pendente";
    },

    async createMultibanco({ orderNumber, expiryDays }) {
      const digits = BigInt(`0x${createHash("sha256").update(orderNumber).digest("hex").slice(0, 12)}`).toString().slice(-9);
      const expires = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
      return {
        kind: "multibanco",
        requestId: null,
        entity: TEST_ENTITY,
        reference: digits.padStart(9, "0"),
        expiresAt: expires.toISOString(),
      };
    },

    async startCard({ simulatorUrl }) {
      return { kind: "redirect", requestId: `teste-${randomBytes(6).toString("hex")}`, url: simulatorUrl };
    },
  };
}
