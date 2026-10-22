import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteOrder, updateOrderStatus } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { brl, dateTimeBR, orderStatuses, statusLabel } from "@/lib/format";
import { whatsappLink } from "@/lib/settings";

export const metadata = { title: "Pedido" };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const [o, customers] = await Promise.all([
    db.order.findUnique({ where: { id: (await params).id }, include: { items: { include: { product: true } }, customer: { select: { name: true, email: true } } } }),
    db.customer.findMany({ orderBy: { name: "asc" }, take: 500, select: { id: true, name: true, email: true, phone: true } }),
  ]);
  if (!o) notFound();
  // Sugere primeiro as contas com o mesmo e-mail ou telefone do pedido.
  const tail = (phone: string | null) => (phone ?? "").replace(/\D/g, "").slice(-10);
  const sameContact = (c: (typeof customers)[number]) =>
    (!!o.email && c.email === o.email.toLowerCase()) || (tail(c.phone).length === 10 && tail(c.phone) === tail(o.phone));
  const options = [...customers.filter(sameContact), ...customers.filter((c) => !sameContact(c))];
  const digits = o.phone.replace(/\D/g, "");
  const wa = digits.length >= 10 ? whatsappLink(digits.startsWith("55") ? digits : `55${digits}`, `Olá, ${o.customerName.split(" ")[0]}! Aqui é da AXON, sobre o seu pedido #${o.number}.`) : null;
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Pedido #{o.number}</h1>
          <p>Registrado em {dateTimeBR(o.createdAt)} · <span className={`pill ${o.status}`}>{statusLabel(o.status)}</span></p>
        </div>
        <div className="adm-actions">
          <Link className="btn ghost-adm" href="/admin/pedidos">Voltar</Link>
          {wa && <a className="btn dark" href={wa} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>}
        </div>
      </div>
      <div className="cols">
        <section className="panel c8">
          <h2>Itens</h2>
          <div className="table-wrap">
            <table className="t">
              <thead><tr><th>Produto</th><th className="num">Qtd.</th><th className="num">Preço</th><th className="num">Subtotal</th></tr></thead>
              <tbody>
                {o.items.map((i) => (
                  <tr key={i.id}>
                    <td><Link href={`/admin/produtos/${i.productId}`}>{i.product.name}</Link><div className="sub">{i.product.formatLabel} · {i.product.size}</div></td>
                    <td className="num">{i.quantity}</td>
                    <td className="num">{brl(i.unitPriceCents)}</td>
                    <td className="num">{brl(i.quantity * i.unitPriceCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="order-sum" style={{ marginTop: 16 }}>
            <div className="total"><span>Total</span><span>{brl(o.totalCents)}</span></div>
          </div>
        </section>
        <section className="panel c4">
          <h2>Cliente</h2>
          <dl className="dl">
            <dt>Nome</dt><dd>{o.customerName}</dd>
            <dt>Telefone</dt><dd>{o.phone}</dd>
            {o.email && <><dt>E-mail</dt><dd>{o.email}</dd></>}
            {o.city && <><dt>Cidade</dt><dd>{o.city}</dd></>}
            <dt>Canal</dt><dd>{o.channel === "whatsapp" ? "WhatsApp" : o.channel}</dd>
            <dt>Conta no site</dt><dd>{o.customer ? <Link href="/admin/clientes">{o.customer.name} · {o.customer.email}</Link> : "Sem conta"}</dd>
          </dl>
          <h2 style={{ marginTop: 26 }}>Atualizar</h2>
          <form className="form" action={updateOrderStatus} style={{ gridTemplateColumns: "1fr" }}>
            <input type="hidden" name="id" value={o.id} />
            <label>Status
              <select id="os-status" name="status" defaultValue={o.status}>
                {orderStatuses.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </label>
            <label>Observações<textarea id="os-notes" name="notes" defaultValue={o.notes ?? ""} rows={4} /></label>
            <label>Conta do cliente no site<small>O pedido aparece em Minha conta desse cliente.</small>
              <select id="os-customer" name="customerId" defaultValue={o.customerId ?? ""}>
                <option value="">Sem conta</option>
                {options.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.email}{sameContact(c) ? " · mesmo contato do pedido" : ""}</option>)}
              </select>
            </label>
            <div className="form-bar"><button className="btn dark" type="submit">Salvar</button></div>
          </form>
          <form action={deleteOrder} style={{ marginTop: 20 }}>
            <input type="hidden" name="id" value={o.id} />
            <button className="btn danger" type="submit">Excluir pedido</button>
          </form>
        </section>
      </div>
    </>
  );
}
