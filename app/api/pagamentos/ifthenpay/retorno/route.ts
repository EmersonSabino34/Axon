import { NextResponse, type NextRequest } from "next/server";
import { canViewOrder, getOrderByNumber, markOrderFailed, markOrderPaid } from "@/lib/server/orders";
import { verifyCardReturn } from "@/lib/server/payments/ifthenpay";

// Regresso do cliente depois da página de pagamento com cartão da ifthenpay.
// A ifthenpay acrescenta id, amount, requestId e sk; a assinatura sk é verificada antes de marcar como paga.
// A confirmação definitiva continua a chegar também pela notificação (route.ts ao lado).
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const number = params.get("encomenda") ?? "";
  const token = params.get("t") ?? "";
  const orderPage = new URL(`/encomenda/${encodeURIComponent(number)}`, request.nextUrl.origin);
  orderPage.searchParams.set("t", token);

  if (!canViewOrder(number, token, null)) return new Response("Encomenda não encontrada", { status: 404 });
  const order = getOrderByNumber(number);
  if (!order) return new Response("Encomenda não encontrada", { status: 404 });

  const outcome = params.get("resultado");
  if (outcome === "sucesso") {
    const signed = {
      id: params.get("id") ?? "",
      amount: params.get("amount") ?? "",
      requestId: params.get("requestId") ?? "",
      sk: params.get("sk") ?? "",
    };
    const amountCents = Math.round(Number(signed.amount.replace(",", ".")) * 100);
    if (verifyCardReturn(signed) && signed.id === number && amountCents === order.totalCents) {
      markOrderPaid(number, `cartão (regresso) ${signed.requestId}`);
    }
    orderPage.searchParams.set("novo", "1");
  } else {
    markOrderFailed(number, outcome === "cancelado" ? "O pagamento com cartão foi cancelado." : "O pagamento com cartão não foi aceite.");
  }
  return NextResponse.redirect(orderPage, 303);
}
