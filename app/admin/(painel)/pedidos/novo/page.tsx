import Link from "next/link";
import { createOrder } from "@/app/admin/actions";
import { ActionForm } from "@/components/admin/ActionForm";
import { db } from "@/lib/db";
import { brl, orderStatuses } from "@/lib/format";

export const metadata = { title: "Registrar pedido" };

export default async function NewOrder() {
  const products = await db.product.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <>
      <div className="adm-head">
        <div><h1>Registrar pedido</h1><p>O total é calculado pelos preços atuais e o estoque é descontado.</p></div>
        <div className="adm-actions"><Link className="btn ghost-adm" href="/admin/pedidos">Voltar</Link></div>
      </div>
      <section className="panel">
        <ActionForm action={createOrder} submit="Registrar pedido">
          <label>Nome do cliente<input id="o-name" name="customerName" required /></label>
          <label>Telefone / WhatsApp<input id="o-phone" name="phone" type="tel" required /></label>
          <label>E-mail<small>Opcional</small><input id="o-email" name="email" type="email" /></label>
          <label>Cidade / UF<input id="o-city" name="city" /></label>
          <div className="full field">
            Produtos
            <div className="items-rows">
              {[0, 1, 2, 3].map((i) => (
                <div className="row" key={i}>
                  <select id={`o-p${i}`} name={`product${i}`} aria-label={`Produto ${i + 1}`} defaultValue="">
                    <option value="">{i === 0 ? "Escolher produto…" : "Outro produto (opcional)"}</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id} disabled={p.priceCents == null}>
                        {p.name} · {brl(p.priceCents)} · {p.stock} em estoque
                      </option>
                    ))}
                  </select>
                  <input id={`o-q${i}`} name={`qty${i}`} type="number" min={0} defaultValue={i === 0 ? 1 : 0} aria-label={`Quantidade ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>
          <label>Status
            <select id="o-status" name="status" defaultValue="novo">
              {orderStatuses.filter((s) => s.key !== "cancelado").map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </label>
          <label className="full">Observações<textarea id="o-notes" name="notes" rows={3} placeholder="Forma de pagamento, endereço, frete…" /></label>
        </ActionForm>
      </section>
    </>
  );
}
