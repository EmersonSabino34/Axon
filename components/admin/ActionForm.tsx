"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/admin/actions";

// Formulário genérico do painel: liga uma server action e mostra erro ou confirmação.
export function ActionForm({
  action, children, submit, className = "form", extra,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  children: React.ReactNode;
  submit: string;
  className?: string;
  extra?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form className={className} action={formAction}>
      {children}
      <div className="form-bar">
        <button className="btn dark" type="submit" disabled={pending}>{pending ? "Salvando…" : submit}</button>
        {extra}
        {state.error && <p className="msg-err" role="alert">{state.error}</p>}
        {state.ok && <p className="msg-ok" role="status">{state.ok}</p>}
      </div>
    </form>
  );
}
