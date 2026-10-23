"use client";

import {
  startTransition,
  useEffect,
  useId,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type RefObject,
} from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/lib/forms";
import { CheckIcon, InfoIcon } from "../LineIcons";

type FieldProps = {
  label: string;
  name: string;
  error?: string;
  hint?: ReactNode;
};

// Campos de texto controlados: mantêm o que foi escrito quando a ação devolve erros
// (o React limpa os campos não controlados depois de cada envio).
export function TextField({
  label,
  name,
  error,
  hint,
  defaultValue = "",
  multiline = false,
  rows = 4,
  ...input
}: FieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "defaultValue"> & {
    defaultValue?: string;
    multiline?: boolean;
    rows?: number;
  }) {
  const id = useId();
  const [value, setValue] = useState(defaultValue);
  // Quando o servidor devolve um novo valor de partida (ex.: depois de repor os valores de base),
  // o campo passa a mostrá-lo; o que foi escrito mantém-se enquanto o valor de partida não mudar.
  const [initial, setInitial] = useState(defaultValue);
  if (defaultValue !== initial) {
    setInitial(defaultValue);
    setValue(defaultValue);
  }
  const describedBy = [error && `${id}-erro`, hint && `${id}-ajuda`].filter(Boolean).join(" ") || undefined;
  const common = {
    id,
    name,
    value,
    className: "field__input",
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  };

  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      {multiline ? (
        <textarea
          {...common}
          rows={rows}
          maxLength={input.maxLength}
          placeholder={input.placeholder}
          onChange={(event) => setValue(event.target.value)}
        />
      ) : (
        <input {...input} {...common} onChange={(event) => setValue(event.target.value)} />
      )}
      {hint && (
        <p id={`${id}-ajuda`} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-erro`} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}

export function PasswordField({
  label,
  name,
  error,
  hint,
  autoComplete,
}: FieldProps & { autoComplete: "current-password" | "new-password" }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const describedBy = [error && `${id}-erro`, hint && `${id}-ajuda`].filter(Boolean).join(" ") || undefined;

  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      <div className="field__password">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          className="field__input"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
        <button
          type="button"
          className="field__toggle"
          aria-pressed={visible}
          aria-controls={id}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      {hint && (
        <p id={`${id}-ajuda`} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-erro`} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}

export function CheckboxField({ name, error, children }: { name: string; error?: string; children: ReactNode }) {
  const id = useId();
  const [checked, setChecked] = useState(false);
  return (
    <div className="field">
      <label className="field__checkbox">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-erro` : undefined}
        />
        <span>{children}</span>
      </label>
      {error && (
        <p id={`${id}-erro`} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}

export function SubmitButton({
  children,
  pendingLabel = "A guardar…",
  variant = "primary",
  pending: pendingOverride,
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "outline" | "danger";
  /** Estado de envio, quando o formulário é enviado com `useSubmitWithoutReset`. */
  pending?: boolean;
}) {
  const status = useFormStatus();
  const pending = pendingOverride ?? status.pending;
  return (
    <button type="submit" className={`button button--${variant}`} disabled={pending} aria-disabled={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  return (
    <div role="status" className="form-status">
      {state?.error && (
        <p className="form-alert form-alert--error">
          <InfoIcon width={18} height={18} />
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="form-alert form-alert--success">
          <CheckIcon width={18} height={18} />
          {state.success}
        </p>
      )}
    </div>
  );
}

/**
 * Envia o formulário sem a reposição automática que o React faz depois de cada ação, para que
 * escolhas como botões de opção não se percam quando há erros. Sem JavaScript, o atributo `action`
 * do formulário continua a funcionar.
 */
export function useSubmitWithoutReset(formAction: (formData: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  };
}

/** Depois de uma resposta com erros, leva o foco para o primeiro campo inválido. */
export function useFocusFirstError(formRef: RefObject<HTMLFormElement | null>, state: FormState) {
  useEffect(() => {
    if (!state?.fieldErrors) return;
    formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [formRef, state]);
}
