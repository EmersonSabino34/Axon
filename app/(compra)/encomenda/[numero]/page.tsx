import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { OrderView } from "@/components/checkout/OrderView";
import { canViewOrder, expireOverduePayment } from "@/lib/server/orders";
import { getPaymentProvider } from "@/lib/server/payments";
import { getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "A sua encomenda · AXON" };

export default function OrderPage(props: PageProps<"/encomenda/[numero]">) {
  return (
    <Suspense fallback={<p className="loading-note">A carregar a encomenda…</p>}>
      <OrderContent {...props} />
    </Suspense>
  );
}

async function OrderContent({ params, searchParams }: PageProps<"/encomenda/[numero]">) {
  const { numero } = await params;
  const query = await searchParams;
  const token = typeof query.t === "string" ? query.t : "";
  const user = await getCurrentUser();
  if (!canViewOrder(numero, token || null, user)) notFound();

  // Compara os prazos de pagamento com a hora atual: tem de ser calculado em cada pedido.
  await connection();
  const order = expireOverduePayment(numero);
  if (!order) notFound();
  const provider = getPaymentProvider();

  return (
    <OrderView
      order={order}
      token={token}
      isNew={query.novo === "1"}
      retryMethods={provider?.methods ?? []}
      testMode={order.provider === "teste" && provider?.id === "teste"}
    />
  );
}
