import { ResetLinkButton } from "@/components/admin/ResetLinkButton";
import { db } from "@/lib/db";
import { dateBR } from "@/lib/format";
import { whatsappLink } from "@/lib/settings";

export const metadata = { title: "Clientes" };

export default async function Clientes() {
  const [customers, total] = await Promise.all([
    db.customer.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
      select: { id: true, name: true, email: true, phone: true, createdAt: true, _count: { select: { orders: true } } },
    }),
    db.customer.count(),
  ]);
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Clientes</h1>
          <p>Contas criadas no site, em /cadastro. {total} no total.</p>
        </div>
      </div>
      <p className="notice">
        Cliente esqueceu a senha? Clique em “Link de nova senha” e envie o link pelo WhatsApp. Para um pedido aparecer em Minha conta, escolha o cliente ao registrar o pedido ou na página do pedido.
      </p>
      <section className="panel">
        {customers.length === 0 ? <p className="empty">Nenhum cliente ainda. Eles aparecem aqui quando alguém cria uma conta no site.</p> : (
          <div className="table-wrap">
            <table className="t">
              <thead>
                <tr><th>Nome</th><th>E-mail</th><th>Telefone</th><th>Cadastro</th><th className="num">Pedidos</th><th></th></tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const digits = (c.phone ?? "").replace(/\D/g, "");
                  const wa = digits.length >= 10 ? whatsappLink(digits.startsWith("55") ? digits : `55${digits}`, `Olá, ${c.name.split(" ")[0]}! Aqui é da AXON.`) : null;
                  return (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td><a href={`mailto:${c.email}`}>{c.email}</a></td>
                      <td>{c.phone ?? "–"}</td>
                      <td>{dateBR(c.createdAt)}</td>
                      <td className="num">{c._count.orders}</td>
                      <td>
                        <div className="cust-ops">
                          {wa && <a className="icon-btn" href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
                          <ResetLinkButton customerId={c.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
