import Link from "next/link";
import { adjustStock, toggleProduct } from "@/app/admin/actions";
import { ProductVisual } from "@/components/ProductVisual";
import { toProduct } from "@/lib/catalog";
import { db } from "@/lib/db";
import { brl } from "@/lib/format";

export const metadata = { title: "Produtos" };

export default async function ProdutosAdmin({ searchParams }: { searchParams: Promise<{ salvo?: string }> }) {
  const { salvo } = await searchParams;
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const [rows, views] = await Promise.all([
    db.product.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    db.event.groupBy({ by: ["productId"], where: { type: "view", createdAt: { gte: since } }, _count: true }),
  ]);
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Produtos</h1>
          <p>{rows.filter((r) => r.active).length} publicados no site, {rows.filter((r) => !r.active).length} ocultos.</p>
        </div>
        <div className="adm-actions"><Link className="btn dark" href="/admin/produtos/novo">Novo produto</Link></div>
      </div>
      {salvo && <p className="notice">Produto salvo. As alterações já aparecem no site.</p>}
      {rows.some((r) => r.priceCents == null) && (
        <p className="notice">Produtos sem preço aparecem no site como “Sob consulta” e não podem ser usados em pedidos até ter preço.</p>
      )}
      <section className="panel">
        <div className="table-wrap">
          <table className="t">
            <thead>
              <tr><th>Produto</th><th>Formato</th><th className="num">Preço</th><th className="num">Estoque</th><th className="num">Visitas 30d</th><th>Site</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const p = toProduct(r);
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="prod">
                        <ProductVisual p={p} idSuffix="-adm" />
                        <div><Link href={`/admin/produtos/${r.id}`}>{r.name}</Link><div className="sub">{r.label}</div></div>
                      </div>
                    </td>
                    <td>{r.formatLabel}<div className="sub">{r.size}</div></td>
                    <td className="num">{brl(r.priceCents)}</td>
                    <td className="num">
                      <form action={adjustStock} className="inline"><input type="hidden" name="id" value={r.id} /><input type="hidden" name="delta" value="-1" /><button className="icon-btn" aria-label={`Tirar 1 do estoque de ${r.name}`}>−</button></form>{" "}
                      <span className={r.stock < 10 ? "pill low" : undefined}>{r.stock}</span>{" "}
                      <form action={adjustStock} className="inline"><input type="hidden" name="id" value={r.id} /><input type="hidden" name="delta" value="1" /><button className="icon-btn" aria-label={`Somar 1 ao estoque de ${r.name}`}>+</button></form>
                    </td>
                    <td className="num">{views.find((v) => v.productId === r.id)?._count ?? 0}</td>
                    <td>
                      <form action={toggleProduct}>
                        <input type="hidden" name="id" value={r.id} />
                        <button className="icon-btn" title={r.active ? "Ocultar do site" : "Publicar no site"}>
                          <span className={`pill ${r.active ? "on" : "off"}`}>{r.active ? "Publicado" : "Oculto"}</span>
                        </button>
                      </form>
                    </td>
                    <td className="num"><Link href={`/admin/produtos/${r.id}`}>Editar</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
