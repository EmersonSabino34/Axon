import Link from "next/link";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { db } from "@/lib/db";
import { brl, dateTimeBR, orderStatuses, statusLabel } from "@/lib/format";

export const metadata = { title: "Dashboard" };

const DAY = 86400000;

function delta(now: number, before: number) {
  if (before < 5) return null;
  return Math.round(((now - before) / before) * 100);
}

function Delta({ v }: { v: number | null }) {
  if (v == null) return <em>sem período anterior</em>;
  return <em className={v >= 0 ? "up" : "down"}>{v >= 0 ? "▲" : "▼"} {Math.abs(v)}% vs. 30 dias anteriores</em>;
}

export default async function Dashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today.getTime() - 29 * DAY);
  const prevStart = new Date(start.getTime() - 30 * DAY);

  const [orders, prevOrders, views, clicks, prevClicks, unread, products, recent, statusCounts, items] = await Promise.all([
    db.order.findMany({ where: { createdAt: { gte: start }, status: { not: "cancelado" } }, select: { totalCents: true, createdAt: true } }),
    db.order.findMany({ where: { createdAt: { gte: prevStart, lt: start }, status: { not: "cancelado" } }, select: { totalCents: true } }),
    db.event.groupBy({ by: ["productId"], where: { type: "view", createdAt: { gte: start } }, _count: true }),
    db.event.count({ where: { type: "whatsapp", createdAt: { gte: start } } }),
    db.event.count({ where: { type: "whatsapp", createdAt: { gte: prevStart, lt: start } } }),
    db.message.count({ where: { read: false } }),
    db.product.findMany({ orderBy: { sortOrder: "asc" } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db.order.groupBy({ by: ["status"], _count: true }),
    db.orderItem.groupBy({ by: ["productId"], where: { order: { createdAt: { gte: start }, status: { not: "cancelado" } } }, _sum: { quantity: true, unitPriceCents: true } }),
  ]);

  const revenue = orders.reduce((s, o) => s + o.totalCents, 0);
  const prevRevenue = prevOrders.reduce((s, o) => s + o.totalCents, 0);
  const totalViews = views.reduce((s, v) => s + v._count, 0);
  const ticket = orders.length ? Math.round(revenue / orders.length) : 0;
  const prevTicket = prevOrders.length ? Math.round(prevRevenue / prevOrders.length) : 0;

  const series = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(start.getTime() + i * DAY);
    const dayOrders = orders.filter((o) => o.createdAt >= d && o.createdAt < new Date(d.getTime() + DAY));
    return {
      label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      value: dayOrders.reduce((s, o) => s + o.totalCents, 0),
      orders: dayOrders.length,
    };
  });

  const units = products
    .map((p) => ({ p, units: items.find((i) => i.productId === p.id)?._sum.quantity ?? 0, views: views.find((v) => v.productId === p.id)?._count ?? 0 }))
    .sort((a, b) => b.units - a.units);
  const maxUnits = Math.max(1, ...units.map((u) => u.units));
  const low = products.filter((p) => p.active && p.stock < 10);

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Dashboard</h1>
          <p>Últimos 30 dias, até hoje.</p>
        </div>
        <div className="adm-actions">
          <Link className="btn ghost-adm" href="/admin/produtos">Gerenciar produtos</Link>
          <Link className="btn dark" href="/admin/pedidos/novo">Registrar pedido</Link>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi"><span>Faturamento</span><strong>{brl(revenue)}</strong><Delta v={delta(revenue, prevRevenue)} /></div>
        <div className="kpi"><span>Pedidos</span><strong>{orders.length}</strong><Delta v={delta(orders.length, prevOrders.length)} /></div>
        <div className="kpi"><span>Ticket médio</span><strong>{brl(ticket)}</strong><Delta v={delta(ticket, prevTicket)} /></div>
        <div className="kpi"><span>Cliques no WhatsApp</span><strong>{clicks}</strong><Delta v={delta(clicks, prevClicks)} /></div>
      </div>

      <div className="cols">
        <section className="panel c8">
          <h2>Faturamento por dia <small>pedidos não cancelados</small></h2>
          <RevenueChart data={series} />
        </section>

        <section className="panel c4">
          <h2>Pedidos por status <Link href="/admin/pedidos">Ver todos</Link></h2>
          <div className="status-list">
            {orderStatuses.map((s) => (
              <div key={s.key}>
                <span className={`pill ${s.key}`}>{s.label}</span>
                <strong>{statusCounts.find((c) => c.status === s.key)?._count ?? 0}</strong>
              </div>
            ))}
          </div>
          <h2 style={{ marginTop: 28 }}>Visitas ao site</h2>
          <div className="status-list">
            <div><span>Visualizações de produtos</span><strong>{totalViews}</strong></div>
            <div><span>Cliques no WhatsApp por visita</span><strong>{totalViews ? `${Math.round((clicks / totalViews) * 100)}%` : "–"}</strong></div>
            <div><span>Mensagens por ler</span><strong>{unread}</strong></div>
          </div>
        </section>

        <section className="panel c6">
          <h2>Mais vendidos <small>unidades em 30 dias</small></h2>
          <ul className="hbars">
            {units.map(({ p, units: u }) => (
              <li key={p.id}>
                <b>{p.name}</b>
                <div className="track"><div className="fill" style={{ width: `${(u / maxUnits) * 100}%` }} /></div>
                <span className="val">{u} un.</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel c6">
          <h2>Produtos mais vistos <small>visualizações em 30 dias</small></h2>
          <ul className="hbars">
            {[...units].sort((a, b) => b.views - a.views).map(({ p, views: v }) => (
              <li key={p.id}>
                <b>{p.name}</b>
                <div className="track"><div className="fill" style={{ width: `${(v / Math.max(1, ...units.map((x) => x.views))) * 100}%` }} /></div>
                <span className="val">{v}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel c8">
          <h2>Últimos pedidos <Link href="/admin/pedidos">Ver todos</Link></h2>
          {recent.length === 0 ? <p className="empty">Nenhum pedido registrado ainda.</p> : (
            <div className="table-wrap">
              <table className="t">
                <thead><tr><th>Pedido</th><th>Cliente</th><th>Data</th><th>Status</th><th className="num">Total</th></tr></thead>
                <tbody>
                  {recent.map((o) => (
                    <tr key={o.id}>
                      <td><Link href={`/admin/pedidos/${o.id}`}>#{o.number}</Link></td>
                      <td>{o.customerName}<div className="sub">{o.city}</div></td>
                      <td>{dateTimeBR(o.createdAt)}</td>
                      <td><span className={`pill ${o.status}`}>{statusLabel(o.status)}</span></td>
                      <td className="num">{brl(o.totalCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel c4">
          <h2>Estoque baixo <Link href="/admin/produtos">Ajustar</Link></h2>
          {low.length === 0 ? <p className="empty">Todos os produtos com 10 ou mais unidades.</p> : (
            <div className="status-list">
              {low.map((p) => (
                <div key={p.id}><span>{p.name}</span><span className="pill low">{p.stock} un.</span></div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
