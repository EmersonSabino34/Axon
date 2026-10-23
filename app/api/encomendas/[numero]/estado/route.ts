import { NextResponse, type NextRequest } from "next/server";
import { MBWAY_TIMEOUT_MINUTES, orderStatusLabels } from "@/lib/commerce";
import { canViewOrder, getOrderByNumber, markOrderFailed, markOrderPaid } from "@/lib/server/orders";
import { getPaymentProvider } from "@/lib/server/payments";
import { getCurrentUser } from "@/lib/server/session";

// Estado da encomenda para a página da encomenda (consultado de poucos em poucos segundos).
// Nos pedidos MB WAY pendentes, pergunta também ao prestador, caso a notificação ainda não tenha chegado.
export async function GET(request: NextRequest, { params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params;
  const token = request.nextUrl.searchParams.get("t");
  const user = await getCurrentUser();
  if (!canViewOrder(numero, token, user)) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });

  let order = getOrderByNumber(numero);
  if (order?.status === "pendente" && order.paymentMethod === "mbway" && order.paymentRequestId) {
    const provider = getPaymentProvider();
    if (provider?.id === order.provider && provider.live) {
      try {
        const status = await provider.mbwayStatus(order.paymentRequestId);
        if (status === "pago") markOrderPaid(numero, "MB WAY (consulta de estado)");
        if (status === "falhado") markOrderFailed(numero, "O pedido MB WAY foi recusado ou expirou.");
      } catch {
        // Sem resposta do prestador: mantém-se pendente e volta a perguntar na próxima consulta.
      }
    }
    order = getOrderByNumber(numero);
    const ageMinutes = order ? (Date.now() - new Date(order.updatedAt).getTime()) / 60_000 : 0;
    if (order?.status === "pendente" && ageMinutes > MBWAY_TIMEOUT_MINUTES + 1) {
      markOrderFailed(numero, "O pedido MB WAY expirou sem ser aprovado.");
      order = getOrderByNumber(numero);
    }
  }

  if (!order) return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
  return NextResponse.json(
    { status: order.status, label: orderStatusLabels[order.status], paymentError: order.paymentError },
    { headers: { "Cache-Control": "no-store" } },
  );
}
