import Link from "next/link";
import { db } from "@/lib/db";
import { brl, dateTimeBR, orderStatuses, statusLabel } from "@/lib/format";

export const metadata = { title: "Pedidos" };

export default async function PedidosAdmin({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status = "", q = "" } = await searchParams;
  const where = {
    ...(status ? { status } : {}),
    ...(q ? { OR: [{ customerName: { contains: q } }, { phone: { contains: q } }, ...(Number(q) ? [{ number: Number(q) }] : [])] } : {}),
  };
  const [orders, counts] = await Promise.all([
    db.order.findMany({ where, orderBy: { createdAt: "desc" }, take: 200, include: { items: { include: { product: { select: { name: true } } } } } }),
    db.order.groupBy({ by: ["status"], _count: true }),
  ]);
  const total = counts.reduce((s, c) => s + c._count, 0);
  const tab = (key: string, label: string, n: number) => (
    <Link key={key} href={key ? `/admin/pedidos?status=${key}` : "/admin/pedidos"} aria-current={status === key ? "true" : undefined}>
      {label} ({n})
    </Link>
  );
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Pedidos</h1>
          <p>Os pedidos chegam pelo WhatsApp. Registre-os aqui para acompanhar status, faturamento e estoque.</p>
        </div>
        <div className="adm-actions"><Link className="btn dark" href="/admin/pedidos/novo">Registrar pedido</Link></div>
      </div>
      <div className="tabs">
        {tab("", "Todos", total)}
        {orderStatuses.map((s) => tab(s.key, s.label, counts.find((c) => c.status === s.key)?._count ?? 0))}
      </div>
      <section className="panel">
        <form className="form" style={{ gridTemplateColumns: "1fr auto", marginBottom: 16 }}>
          {status && <input type="hidden" name="status" value={status} />}
          <input id="o-q" name="q" defaultValue={q} placeholder="Procurar por cliente, telefone ou número" aria-label="Procurar pedidos" />
          <button className="btn ghost-adm" type="submit">Procurar</button>
        </form>
        {orders.length === 0 ? <p className="empty">Nenhum pedido encontrado.</p> : (
          <div className="table-wrap">
            <table className="t">
              <thead><tr><th>Pedido</th><th>Cliente</th><th>Produtos</th><th>Data</th><th>Status</th><th className="num">Total</th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td><Link href={`/admin/pedidos/${o.id}`}>#{o.number}</Link></td>
                    <td>{o.customerName}<div className="sub">{o.phone}{o.city ? ` · ${o.city}` : ""}</div></td>
                    <td className="sub">{o.items.map((i) => `${i.quantity}× ${i.product.name}`).join(", ")}</td>
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
    </>
  );
}
