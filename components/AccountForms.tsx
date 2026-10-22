"use client";

import { useActionState } from "react";
import { changePassword, resetPassword, saveAccount, signIn, signUp, type AccountState } from "@/app/(site)/conta/actions";

function Submit({ pending, label, pendingLabel, state }: { pending: boolean; label: string; pendingLabel: string; state: AccountState }) {
  return (
    <div className="full form-actions">
      <button className="btn dark" type="submit" disabled={pending}>{pending ? pendingLabel : label}</button>
      <p className={`form-note${state.ok ? " ok" : ""}`} role="status">{state.error ?? state.ok}</p>
    </div>
  );
}

export function SignInForm() {
  const [state, action, pending] = useActionState<AccountState, FormData>(signIn, {});
  return (
    <form className="contact-form" action={action}>
      <label className="full">
        E-mail
        <input id="c-email" name="email" type="email" autoComplete="email" defaultValue={state.fields?.email} required />
      </label>
      <label className="full">
        Senha
        <input id="c-senha" name="senha" type="password" autoComplete="current-password" required />
      </label>
      <Submit pending={pending} label="Entrar" pendingLabel="Entrando…" state={state} />
    </form>
  );
}

export function SignUpForm() {
  const [state, action, pending] = useActionState<AccountState, FormData>(signUp, {});
  return (
    <form className="contact-form" action={action}>
      <label className="full">
        Nome
        <input id="c-nome" name="nome" autoComplete="name" defaultValue={state.fields?.nome} required />
      </label>
      <label>
        E-mail
        <input id="c-email" name="email" type="email" autoComplete="email" defaultValue={state.fields?.email} required />
      </label>
      <label>
        Telefone (WhatsApp)
        <input id="c-tel" name="telefone" type="tel" autoComplete="tel" defaultValue={state.fields?.telefone} />
      </label>
      <label>
        Senha (mín. 8 caracteres)
        <input id="c-senha" name="senha" type="password" autoComplete="new-password" minLength={8} required />
      </label>
      <label>
        Repita a senha
        <input id="c-confirmar" name="confirmar" type="password" autoComplete="new-password" minLength={8} required />
      </label>
      <Submit pending={pending} label="Criar conta" pendingLabel="Criando…" state={state} />
    </form>
  );
}

export function ProfileForm({ customer }: { customer: { name: string; email: string; phone: string | null } }) {
  const [state, action, pending] = useActionState<AccountState, FormData>(saveAccount, {});
  return (
    <form className="contact-form" action={action}>
      <h3>Os seus dados</h3>
      <label className="full">
        Nome
        <input id="p-nome" name="nome" autoComplete="name" defaultValue={state.fields?.nome ?? customer.name} required />
      </label>
      <label>
        E-mail
        <input id="p-email" name="email" type="email" autoComplete="email" defaultValue={state.fields?.email ?? customer.email} required />
      </label>
      <label>
        Telefone (WhatsApp)
        <input id="p-tel" name="telefone" type="tel" autoComplete="tel" defaultValue={state.fields?.telefone ?? customer.phone ?? ""} />
      </label>
      <Submit pending={pending} label="Salvar dados" pendingLabel="Salvando…" state={state} />
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<AccountState, FormData>(changePassword, {});
  return (
    <form className="contact-form" action={action}>
      <h3>Trocar a senha</h3>
      <label className="full">
        Senha atual
        <input id="s-atual" name="atual" type="password" autoComplete="current-password" required />
      </label>
      <label>
        Nova senha (mín. 8 caracteres)
        <input id="s-nova" name="nova" type="password" autoComplete="new-password" minLength={8} required />
      </label>
      <label>
        Repita a nova senha
        <input id="s-confirmar" name="confirmar" type="password" autoComplete="new-password" minLength={8} required />
      </label>
      <Submit pending={pending} label="Trocar senha" pendingLabel="Trocando…" state={state} />
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<AccountState, FormData>(resetPassword, {});
  return (
    <form className="contact-form" action={action}>
      <input type="hidden" name="token" value={token} />
      <label>
        Nova senha (mín. 8 caracteres)
        <input id="r-nova" name="nova" type="password" autoComplete="new-password" minLength={8} required />
      </label>
      <label>
        Repita a nova senha
        <input id="r-confirmar" name="confirmar" type="password" autoComplete="new-password" minLength={8} required />
      </label>
      <Submit pending={pending} label="Salvar nova senha" pendingLabel="Salvando…" state={state} />
    </form>
  );
}
