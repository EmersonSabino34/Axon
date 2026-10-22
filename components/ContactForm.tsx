"use client";

import { useActionState } from "react";
import { sendContact, type ContactState } from "@/app/(site)/contato/actions";

export function ContactForm({ products, defaultProduct = "", customer }: { products: { name: string; label: string }[]; defaultProduct?: string; customer?: { name: string; phone: string | null } | null }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, { ok: false });

  if (state.ok) {
    return (
      <div className="contact-form contact-done">
        <h3>Mensagem recebida.</h3>
        <p>Obrigado pelo contato. Respondemos em horário comercial. Se preferir uma resposta mais rápida, continue a conversa pelo WhatsApp.</p>
        <a className="btn dark" href={state.whatsapp} target="_blank" rel="noopener noreferrer">Continuar no WhatsApp</a>
      </div>
    );
  }

  return (
    <form className="contact-form" action={action} noValidate>
      <label>
        Nome
        <input id="f-nome" name="nome" autoComplete="name" defaultValue={customer?.name} required />
      </label>
      <label>
        Telefone
        <input id="f-tel" name="telefone" type="tel" autoComplete="tel" defaultValue={customer?.phone ?? undefined} />
      </label>
      <label className="full">
        Produto de interesse
        <select id="f-produto" name="produto" defaultValue={defaultProduct}>
          <option value="">Ainda não sei, quero orientação</option>
          {products.map((p) => (
            <option key={p.name} value={p.name}>{p.name} · {p.label}</option>
          ))}
        </select>
      </label>
      <label className="full">
        Mensagem
        <textarea id="f-msg" name="mensagem" required rows={5} />
      </label>
      <div className="full form-actions">
        <button className="btn dark" type="submit" disabled={pending}>{pending ? "Enviando…" : "Enviar mensagem"}</button>
        <p className="form-note" role="status">{state.error}</p>
      </div>
    </form>
  );
}
