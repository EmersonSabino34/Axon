"use client";

import { useActionState, useRef } from "react";
import { login, signup } from "@/app/conta/actions";
import { PASSWORD_MIN_LENGTH } from "@/lib/forms";
import { CheckboxField, FormMessage, PasswordField, SubmitButton, TextField, useFocusFirstError } from "../forms/Fields";

export function LoginForm() {
  const [state, action] = useActionState(login, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, state);

  return (
    <form ref={formRef} action={action} className="form-stack" noValidate>
      <FormMessage state={state} />
      <TextField
        label="E-mail"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        error={state?.fieldErrors?.email}
      />
      <PasswordField
        label="Palavra-passe"
        name="password"
        autoComplete="current-password"
        error={state?.fieldErrors?.password}
      />
      <SubmitButton pendingLabel="A entrar…">Entrar</SubmitButton>
    </form>
  );
}

export function SignupForm() {
  const [state, action] = useActionState(signup, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, state);

  return (
    <form ref={formRef} action={action} className="form-stack" noValidate>
      <FormMessage state={state} />
      <TextField label="Nome" name="name" autoComplete="name" maxLength={80} error={state?.fieldErrors?.name} />
      <TextField
        label="E-mail"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        error={state?.fieldErrors?.email}
      />
      <PasswordField
        label="Palavra-passe"
        name="password"
        autoComplete="new-password"
        hint={`Pelo menos ${PASSWORD_MIN_LENGTH} caracteres, com letras e números.`}
        error={state?.fieldErrors?.password}
      />
      <PasswordField
        label="Confirmar palavra-passe"
        name="confirmation"
        autoComplete="new-password"
        error={state?.fieldErrors?.confirmation}
      />
      <CheckboxField name="terms" error={state?.fieldErrors?.terms}>
        Aceito os Termos e Condições e a Política de Privacidade da AXON. As páginas serão publicadas antes do
        lançamento da loja.
      </CheckboxField>
      <SubmitButton pendingLabel="A criar conta…">Criar conta</SubmitButton>
    </form>
  );
}
