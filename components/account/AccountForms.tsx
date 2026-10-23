"use client";

import { useActionState, useRef } from "react";
import { changePassword, deleteAccount, updateName } from "@/app/conta/actions";
import { PASSWORD_MIN_LENGTH } from "@/lib/forms";
import { CheckboxField, FormMessage, PasswordField, SubmitButton, TextField, useFocusFirstError } from "../forms/Fields";

export function NameForm({ name, email }: { name: string; email: string }) {
  const [state, action] = useActionState(updateName, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, state);

  return (
    <form ref={formRef} action={action} className="form-stack" noValidate>
      <TextField label="Nome" name="name" autoComplete="name" maxLength={80} defaultValue={name} error={state?.fieldErrors?.name} />
      <div className="field">
        <span className="field__label">E-mail</span>
        <p className="field__static">{email}</p>
      </div>
      <FormMessage state={state} />
      <SubmitButton variant="outline">Guardar nome</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePassword, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, state);

  return (
    <form ref={formRef} action={action} className="form-stack" noValidate>
      <PasswordField label="Palavra-passe atual" name="current" autoComplete="current-password" error={state?.fieldErrors?.current} />
      <PasswordField
        label="Nova palavra-passe"
        name="password"
        autoComplete="new-password"
        hint={`Pelo menos ${PASSWORD_MIN_LENGTH} caracteres, com letras e números.`}
        error={state?.fieldErrors?.password}
      />
      <PasswordField
        label="Confirmar nova palavra-passe"
        name="confirmation"
        autoComplete="new-password"
        error={state?.fieldErrors?.confirmation}
      />
      <FormMessage state={state} />
      <SubmitButton variant="outline">Alterar palavra-passe</SubmitButton>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, action] = useActionState(deleteAccount, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, state);

  return (
    <form ref={formRef} action={action} className="form-stack" noValidate>
      <PasswordField label="Palavra-passe" name="password" autoComplete="current-password" error={state?.fieldErrors?.password} />
      <CheckboxField name="confirm" error={state?.fieldErrors?.confirm}>
        Confirmo que quero eliminar a minha conta e os dados associados. Esta ação não pode ser anulada.
      </CheckboxField>
      <FormMessage state={state} />
      <SubmitButton variant="danger" pendingLabel="A eliminar…">
        Eliminar conta
      </SubmitButton>
    </form>
  );
}
