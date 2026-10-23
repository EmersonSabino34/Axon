import type { Metadata } from "next";
import Link from "next/link";
import { orderStatusLabels, paymentMethodLabels, type OrderStatus } from "@/lib/commerce";
import { formatPrice } from "@/lib/currency";
import { formatDateTime } from "@/lib/dates";
import { listOrders, orderStats } from "@/lib/server/orders";
import { requireAdmin } from "@/lib/server/session";

export const metadata: Metadata = { title: "Encomendas" };

const tabs: { key: OrderStatus | "todas"; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "pago", label: "Por enviar" },
  { key: "pendente", label: "A aguardar pagamento" },
  { key: "enviado", label: "Enviadas" },
  { key: "falhado", label: "Pagamento não concluído" },
  { key: "cancelado", label: "Canceladas" },
];

export default async function AdminOrdersPage({ searchParams }: PageProps<"/painel/encomendas">) {
  await requireAdmin();
  const { estado } = await searchParams;
  const active = tabs.find((tab) => tab.key === estado)?.key ?? "todas";
  const orders = listOrders(active === "todas" ? undefined : active);
  const stats = orderStats(30);

  return (
    <>
      <header className="admin-page__header">
        <div>
          <p className="eyebrow">Vendas</p>
          <h1 className="admin-page__title">Encomendas</h1>
          <p className="admin-page__lead">
            {stats.toShipCount} por enviar · {stats.pendingCount} a aguardar pagamento · {formatPrice(stats.revenueCents)}{" "}
            faturados nos últimos 30 dias.
          </p>
        </div>
      </header>

      <nav className="admin-tabs" aria-label="Filtrar por estado">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "todas" ? "/painel/encomendas" : `/painel/encomendas?estado=${tab.key}`}
            className="admin-tabs__link"
            aria-current={active === tab.key ? "page" : undefined}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <section className="admin-card">
        {orders.length === 0 ? (
          <p className="admin-card__empty">
            {active === "todas" ? "Ainda não há encomendas." : "Não há encomendas neste estado."}
          </p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Encomenda</th>
                  <th scope="col">Data</th>
                  <th scope="col">Cliente</th>
                  <th scope="col">Pagamento</th>
                  <th scope="col" className="data-table__number">
                    Total
                  </th>
                  <th scope="col">Estado</th>
                  <th scope="col">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.number}>
                    <td>
                      <strong>{order.number}</strong>
                      <span className="data-table__sub">
                        {order.itemCount} {order.itemCount === 1 ? "artigo" : "artigos"}
                      </span>
                    </td>
                    <td>{formatDateTime(order.createdAt)}</td>
                    <td>
                      {order.customerName}
                      <span className="data-table__sub">{order.customerEmail}</span>
                    </td>
                    <td>{paymentMethodLabels[order.paymentMethod]}</td>
                    <td className="data-table__number">{formatPrice(order.totalCents)}</td>
                    <td>
                      <span className={`status-pill status-pill--order-${order.status}`}>{orderStatusLabels[order.status]}</span>
                    </td>
                    <td className="data-table__action">
                      <Link href={`/painel/encomendas/${order.number}`} className="button button--outline button--small">
                        Ver<span className="sr-only"> encomenda {order.number}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
