"use client";

import { useActionState } from "react";
import { login, type FormState } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});
  return (
    <form className="form" action={action}>
      <label>E-mail<input id="l-email" name="email" type="email" autoComplete="username" required /></label>
      <label>Senha<input id="l-pass" name="password" type="password" autoComplete="current-password" required /></label>
      {state.error && <p className="msg-err" role="alert">{state.error}</p>}
      <button className="btn dark" type="submit" disabled={pending}>{pending ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}
