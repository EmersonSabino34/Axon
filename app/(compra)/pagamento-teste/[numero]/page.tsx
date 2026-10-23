import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CardIcon, InfoIcon } from "@/components/LineIcons";
import { formatPrice } from "@/lib/currency";
import { canViewOrder, getOrderByNumber } from "@/lib/server/orders";
import { getPaymentProvider } from "@/lib/server/payments";
import { getCurrentUser } from "@/lib/server/session";
import { simulateTestPayment } from "../../actions";

export const metadata: Metadata = { title: "Pagamento com cartão (teste) · AXON" };

// Substitui a página de cartão do prestador no modo de teste. Não existe com pagamentos reais.
export default function TestCardPage(props: PageProps<"/pagamento-teste/[numero]">) {
  return (
    <Suspense fallback={<p className="loading-note">A carregar…</p>}>
      <TestCardContent {...props} />
    </Suspense>
  );
}

async function TestCardContent({ params, searchParams }: PageProps<"/pagamento-teste/[numero]">) {
  const { numero } = await params;
  const query = await searchParams;
  const token = typeof query.t === "string" ? query.t : "";
  const user = await getCurrentUser();
  const order = getOrderByNumber(numero);
  if (getPaymentProvider()?.id !== "teste" || order?.provider !== "teste" || !canViewOrder(numero, token, user)) notFound();

  return (
    <section className="test-card" aria-labelledby="teste-title">
      <p className="test-banner" role="note">
        <InfoIcon width={18} height={18} />
        <span>
          <strong>Modo de teste.</strong> Esta página simula a página segura do banco. Não introduza dados de cartão.
        </span>
      </p>
      <div className="checkout-card">
        <h1 id="teste-title" className="checkout-card__title">
          <CardIcon /> Pagamento com cartão
        </h1>
        <p>
          Encomenda {order.number} · <strong>{formatPrice(order.totalCents)}</strong>
        </p>
        <div className="form-actions">
          <form action={simulateTestPayment.bind(null, numero, token, "pago")}>
            <button type="submit" className="button button--primary">
              Simular pagamento aprovado
            </button>
          </form>
          <form action={simulateTestPayment.bind(null, numero, token, "falhado")}>
            <button type="submit" className="button button--outline">
              Simular recusa
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
