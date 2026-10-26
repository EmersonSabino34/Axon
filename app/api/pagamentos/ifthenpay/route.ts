import type { NextRequest } from "next/server";
import { orderStatusLabels } from "@/lib/commerce";
import { getOrderByNumber, listPaymentEvents, logPaymentEvent, markOrderPaid } from "@/lib/server/orders";
import { verifyAntiPhishingKey } from "@/lib/server/payments/ifthenpay";

// Notificação de pagamento («callback») da ifthenpay. A ifthenpay ativa-a por método, a pedido, e substitui os
// marcadores entre [ ]. O parâmetro «method» é fixo em cada URL (só o cartão tem marcador próprio):
// MB WAY:     https://O-SEU-DOMINIO/api/pagamentos/ifthenpay?key=[ANTI_PHISHING_KEY]&orderId=[ORDER_ID]&amount=[AMOUNT]&requestId=[REQUEST_ID]&method=mbway
// Multibanco: https://O-SEU-DOMINIO/api/pagamentos/ifthenpay?key=[ANTI_PHISHING_KEY]&orderId=[ORDER_ID]&amount=[AMOUNT]&requestId=[REQUEST_ID]&entity=[ENTITY]&reference=[REFERENCE]&method=multibanco
// Cartão:     https://O-SEU-DOMINIO/api/pagamentos/ifthenpay?key=[ANTI_PHISHING_KEY]&orderId=[ORDER_ID]&amount=[AMOUNT]&requestId=[REQUEST_ID]&method=cartao
// Responde 200 para a ifthenpay não repetir a notificação; só marca como paga se a chave, a encomenda e o valor baterem certo.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  if (!verifyAntiPhishingKey(params.get("key"))) return new Response("Chave inválida", { status: 403 });

  const number = params.get("orderId")?.trim() ?? "";
  const order = getOrderByNumber(number);
  if (!order) return new Response("Encomenda desconhecida", { status: 404 });

  const amountCents = Math.round(Number((params.get("amount") ?? "").replace(",", ".")) * 100);
  const reference = params.get("reference") ? `ref. ${params.get("entity") ?? ""} ${params.get("reference")}` : "";
  const detail = ["ifthenpay", params.get("method"), params.get("requestId"), reference].filter(Boolean).join(" ");
  if (amountCents !== order.totalCents) {
    logPaymentEvent(order.id, "valor-diferente", `${detail} · recebido ${params.get("amount")}`);
    return new Response("Valor diferente do da encomenda", { status: 200 });
  }

  if (!markOrderPaid(number, detail)) {
    // Encomenda cancelada antes do pagamento, ou segundo pagamento (ex.: pagou a referência e também o MB WAY).
    // Repetições da mesma notificação trazem o mesmo requestId e não são registadas outra vez.
    const requestId = params.get("requestId") ?? "";
    const repeated = Boolean(requestId) && listPaymentEvents(order.id).some((event) => event.detail?.includes(requestId));
    if (!repeated) {
      logPaymentEvent(
        order.id,
        "pagamento-a-verificar",
        `${detail} · recebido com a encomenda «${orderStatusLabels[order.status]}»: confirme no backoffice e reembolse se for o caso`,
      );
    }
  }
  return new Response("OK", { status: 200 });
}
