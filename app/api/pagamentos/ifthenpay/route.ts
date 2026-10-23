import type { NextRequest } from "next/server";
import { getOrderByNumber, logPaymentEvent, markOrderPaid } from "@/lib/server/orders";
import { verifyAntiPhishingKey } from "@/lib/server/payments/ifthenpay";

// Notificação de pagamento («callback») da ifthenpay, igual para MB WAY, Multibanco e cartão.
// URL a registar na ifthenpay (os marcadores entre [ ] são substituídos por ela):
// https://O-SEU-DOMINIO/api/pagamentos/ifthenpay?key=[ANTI_PHISHING_KEY]&orderId=[ORDER_ID]&amount=[AMOUNT]&requestId=[REQUEST_ID]&method=[PAYMENT_METHOD]
// Responde 200 para a ifthenpay não repetir a notificação; só marca como paga se a chave, a encomenda e o valor baterem certo.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  if (!verifyAntiPhishingKey(params.get("key"))) return new Response("Chave inválida", { status: 403 });

  const number = params.get("orderId")?.trim() ?? "";
  const order = getOrderByNumber(number);
  if (!order) return new Response("Encomenda desconhecida", { status: 404 });

  const amountCents = Math.round(Number((params.get("amount") ?? "").replace(",", ".")) * 100);
  const detail = `ifthenpay ${params.get("method") ?? ""} ${params.get("requestId") ?? ""}`.trim();
  if (amountCents !== order.totalCents) {
    logPaymentEvent(order.id, "valor-diferente", `${detail} · recebido ${params.get("amount")}`);
    return new Response("Valor diferente do da encomenda", { status: 200 });
  }

  markOrderPaid(number, detail);
  return new Response("OK", { status: 200 });
}
