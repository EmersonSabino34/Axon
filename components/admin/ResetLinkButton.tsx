"use client";

import { useActionState, useState } from "react";
import { createResetLink, type ResetLinkState } from "@/app/admin/actions";

// Gera o link de nova senha de um cliente e mostra-o para copiar ou mandar no WhatsApp.
export function ResetLinkButton({ customerId }: { customerId: string }) {
  const [state, action, pending] = useActionState<ResetLinkState, FormData>(createResetLink, {});
  const [copied, setCopied] = useState("");
  const copy = async (link: string) => {
    await navigator.clipboard.writeText(link);
    setCopied(link);
  };
  return (
    <form className="reset-link" action={action}>
      <input type="hidden" name="id" value={customerId} />
      <button className="icon-btn" type="submit" disabled={pending}>{pending ? "Gerando…" : state.link ? "Gerar outro link" : "Link de nova senha"}</button>
      {state.error && <p className="msg-err" role="alert">{state.error}</p>}
      {state.link && (
        <div className="reset-out">
          <input readOnly value={state.link} aria-label="Link de nova senha" onFocus={(e) => e.currentTarget.select()} />
          <button className="icon-btn" type="button" onClick={() => copy(state.link!)}>{copied === state.link ? "Copiado" : "Copiar"}</button>
          {state.whatsapp
            ? <a className="icon-btn" href={state.whatsapp} target="_blank" rel="noopener noreferrer">Enviar no WhatsApp</a>
            : <span className="sub">Sem telefone na conta: copie o link e envie ao cliente.</span>}
        </div>
      )}
    </form>
  );
}
