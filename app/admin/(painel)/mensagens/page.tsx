import { deleteMessage, toggleMessage } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { dateTimeBR } from "@/lib/format";
import { whatsappLink } from "@/lib/settings";

export const metadata = { title: "Mensagens" };

export default async function Mensagens() {
  const msgs = await db.message.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  const unread = msgs.filter((m) => !m.read).length;
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Mensagens</h1>
          <p>Enviadas pelo formulário de contato do site. {unread} por ler.</p>
        </div>
      </div>
      {msgs.length === 0 ? <section className="panel"><p className="empty">Nenhuma mensagem ainda. Elas aparecem aqui quando alguém usa o formulário de contato.</p></section> : (
        <div className="msgs">
          {msgs.map((m) => {
            const digits = (m.phone ?? "").replace(/\D/g, "");
            const wa = digits.length >= 10 ? whatsappLink(digits.startsWith("55") ? digits : `55${digits}`, `Olá, ${m.name.split(" ")[0]}! Aqui é da AXON, sobre a sua mensagem.`) : null;
            return (
              <article key={m.id} className={`msg${m.read ? "" : " unread"}`}>
                <header>
                  <b>{m.name}</b>
                  {m.product && <span>sobre {m.product}</span>}
                  {m.phone && <span>{m.phone}</span>}
                  <span>{dateTimeBR(m.createdAt)}</span>
                </header>
                <div className="ops">
                  {wa && <a className="icon-btn" href={wa} target="_blank" rel="noopener noreferrer">Responder no WhatsApp</a>}
                  <form action={toggleMessage}><input type="hidden" name="id" value={m.id} /><button className="icon-btn">{m.read ? "Marcar como não lida" : "Marcar como lida"}</button></form>
                  <form action={deleteMessage}><input type="hidden" name="id" value={m.id} /><button className="icon-btn">Excluir</button></form>
                </div>
                <p>{m.body}</p>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
