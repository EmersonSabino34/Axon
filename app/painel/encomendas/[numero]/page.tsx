import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { ShipOrderForm } from "@/components/admin/ShipOrderForm";
import { ArrowLeftIcon } from "@/components/LineIcons";
import { formatPhone, formatReference, orderStatusLabels, paymentMethodLabels } from "@/lib/commerce";
import { formatPrice } from "@/lib/currency";
import { formatDateTime } from "@/lib/dates";
import { getOrderByNumber, listPaymentEvents } from "@/lib/server/orders";
import { requireAdmin } from "@/lib/server/session";
import { cancelOrderAction, confirmPaymentManually } from "../../actions";

export const metadata: Metadata = { title: "Encomenda" };

export default async function AdminOrderPage({ params }: PageProps<"/painel/encomendas/[numero]">) {
  await requireAdmin();
  const { numero } = await params;
  const order = getOrderByNumber(numero);
  if (!order) notFound();
  const events = listPaymentEvents(order.id);
  const awaitingPayment = order.status === "pendente" || order.status === "falhado";

  return (
    <>
      <Link href="/painel/encomendas" className="back-link">
        <ArrowLeftIcon width={16} height={16} />
        Encomendas
      </Link>

      <header className="admin-page__header">
        <div>
          <p className="eyebrow">Encomenda · {formatDateTime(order.createdAt)}</p>
          <h1 className="admin-page__title">{order.number}</h1>
          <p className="admin-page__lead">
            <span className={`status-pill status-pill--order-${order.status}`}>{orderStatusLabels[order.status]}</span>{" "}
            {paymentMethodLabels[order.paymentMethod]} · {formatPrice(order.totalCents)}
            {order.provider === "teste" && " · modo de teste"}
          </p>
        </div>
      </header>

      <div className="admin-columns admin-columns--form">
        <div className="admin-side">
          <section className="admin-card" aria-labelledby="artigos-title">
            <h2 id="artigos-title" className="admin-card__title">
              Artigos
            </h2>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Produto</th>
                    <th scope="col" className="data-table__number">
                      Quantidade
                    </th>
                    <th scope="col" className="data-table__number">
                      Preço
                    </th>
                    <th scope="col" className="data-table__number">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.slug}>
                      <td>{item.name}</td>
                      <td className="data-table__number">{item.quantity}</td>
                      <td className="data-table__number">{formatPrice(item.unitPriceCents)}</td>
                      <td className="data-table__number">{formatPrice(item.unitPriceCents * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3}>Portes de envio</td>
                    <td className="data-table__number">{formatPrice(order.shippingCents)}</td>
                  </tr>
                  <tr className="data-table__total">
                    <td colSpan={3}>Total</td>
                    <td className="data-table__number">{formatPrice(order.totalCents)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <section className="admin-card" aria-labelledby="cliente-title">
            <h2 id="cliente-title" className="admin-card__title">
              Cliente e entrega
            </h2>
            <div className="order__columns">
              <p>
                <strong>{order.customer.name}</strong>
                <br />
                {order.shipping.address}
                <br />
                {order.shipping.postalCode} {order.shipping.city}
              </p>
              <p>
                <a href={`mailto:${order.customer.email}`}>{order.customer.email}</a>
                <br />
                <a href={`tel:${order.customer.phone}`}>{formatPhone(order.customer.phone)}</a>
                <br />
                {order.customer.nif ? `NIF ${order.customer.nif}` : "Sem NIF (consumidor final)"}
              </p>
            </div>
          </section>

          <section className="admin-card" aria-labelledby="historico-title">
            <h2 id="historico-title" className="admin-card__title">
              Histórico
            </h2>
            <ul className="task-list">
              {events.map((event, index) => (
                <li key={index}>
                  <span className="task-list__dot" aria-hidden="true" />
                  <span>
                    <strong>{event.kind}</strong> · {formatDateTime(event.createdAt)}
                    {event.detail && <span className="data-table__sub">{event.detail}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="admin-side">
          <section className="admin-card" aria-labelledby="pagamento-title">
            <h2 id="pagamento-title" className="admin-card__title">
              Pagamento
            </h2>
            <dl className="spec-list">
              <div>
                <dt>Método</dt>
                <dd>{paymentMethodLabels[order.paymentMethod]}</dd>
              </div>
              {order.mbEntity && order.mbReference && (
                <div>
                  <dt>Entidade / ref.</dt>
                  <dd>
                    {order.mbEntity} · {formatReference(order.mbReference)}
                  </dd>
                </div>
              )}
              {order.mbwayPhone && (
                <div>
                  <dt>MB WAY</dt>
                  <dd>{formatPhone(order.mbwayPhone)}</dd>
                </div>
              )}
              {order.paymentRequestId && (
                <div>
                  <dt>Pedido</dt>
                  <dd>{order.paymentRequestId}</dd>
                </div>
              )}
              <div>
                <dt>Pago em</dt>
                <dd>{order.paidAt ? formatDateTime(order.paidAt) : "—"}</dd>
              </div>
              {order.paymentError && (
                <div>
                  <dt>Último erro</dt>
                  <dd>{order.paymentError}</dd>
                </div>
              )}
            </dl>
            {awaitingPayment && (
              <form action={confirmPaymentManually} className="admin-card__actions">
                <input type="hidden" name="number" value={order.number} />
                <ConfirmSubmit
                  message={`Confirmar o pagamento de ${formatPrice(order.totalCents)} da encomenda ${order.number}? Use só depois de o ver no backoffice da ifthenpay.`}
                  className="button button--outline button--small"
                >
                  Confirmar pagamento manualmente
                </ConfirmSubmit>
              </form>
            )}
          </section>

          {order.status === "pago" && (
            <section className="admin-card" aria-labelledby="envio-title">
              <h2 id="envio-title" className="admin-card__title">
                Envio
              </h2>
              <ShipOrderForm number={order.number} />
            </section>
          )}

          {order.status === "enviado" && order.adminNote && (
            <section className="admin-card">
              <h2 className="admin-card__title">Envio</h2>
              <p className="admin-card__text">{order.adminNote}</p>
            </section>
          )}

          {order.status !== "enviado" && order.status !== "cancelado" && (
            <section className="admin-card admin-card--muted">
              <h2 className="admin-card__title">Cancelar</h2>
              <p className="admin-card__text">
                {order.status === "pago"
                  ? "A encomenda já foi paga: faça o reembolso no backoffice da ifthenpay antes de cancelar."
                  : "Cancela a encomenda. A referência ou o pedido de pagamento deixam de ser aceites pela loja."}
              </p>
              <form action={cancelOrderAction}>
                <input type="hidden" name="number" value={order.number} />
                <ConfirmSubmit message={`Cancelar a encomenda ${order.number}?`} className="text-button text-button--danger">
                  Cancelar encomenda
                </ConfirmSubmit>
              </form>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
