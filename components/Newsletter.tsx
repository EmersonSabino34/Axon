"use client";

import { useRef, useState, type FormEvent } from "react";
import { subscribeToNewsletter, validateEmail } from "@/lib/newsletter";
import { CheckIcon } from "./LineIcons";

type FormState = "idle" | "sending" | "demo" | "subscribed" | "error";
type FieldErrors = { email?: string; consent?: string };

const feedback: Partial<Record<FormState, string>> = {
  demo: "Obrigado! O endereço é válido. Nesta versão de demonstração não foi guardado nem enviado: a subscrição fica disponível quando o serviço de newsletter estiver integrado.",
  subscribed: "Pedido de subscrição recebido. Obrigado!",
  error: "Não foi possível concluir a subscrição. Tente novamente mais tarde.",
};

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<FormState>("idle");
  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FieldErrors = {
      email: validateEmail(email) ?? undefined,
      consent: consent ? undefined : "Para subscrever, confirme que aceita receber as novidades por e-mail.",
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.consent) {
      setState("idle");
      (nextErrors.email ? emailRef : consentRef).current?.focus();
      return;
    }

    setState("sending");
    const result = await subscribeToNewsletter({ email: email.trim(), consent: true });
    setState(result.status);
    if (result.status !== "error") {
      setEmail("");
      setConsent(false);
    }
  };

  const message = feedback[state];

  return (
    <section id="newsletter" className="newsletter" aria-labelledby="newsletter-title">
      <div className="container newsletter__inner">
        <div className="newsletter__intro">
          <p className="eyebrow">Newsletter</p>
          <h2 id="newsletter-title" className="section-title">
            Seja dos primeiros a saber.
          </h2>
          <p className="newsletter__text">
            Lançamentos, novidades da coleção e as histórias por trás de cada frasco, diretamente no seu e-mail. Sem
            excesso.
          </p>
        </div>

        <form className="newsletter-form" noValidate onSubmit={onSubmit}>
          <label htmlFor="newsletter-email" className="newsletter-form__label">
            O seu e-mail
          </label>
          <div className="newsletter-form__row">
            <input
              ref={emailRef}
              id="newsletter-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="nome@exemplo.pt"
              className="input"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errors.email) setErrors((current) => ({ ...current, email: undefined }));
              }}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "newsletter-email-error" : undefined}
            />
            <button type="submit" className="button button--primary" disabled={state === "sending"}>
              {state === "sending" ? "A validar…" : "Quero novidades"}
            </button>
          </div>
          {errors.email && (
            <p id="newsletter-email-error" className="field-error">
              {errors.email}
            </p>
          )}

          <label className="checkbox">
            <input
              ref={consentRef}
              type="checkbox"
              name="consent"
              checked={consent}
              onChange={(event) => {
                setConsent(event.target.checked);
                if (errors.consent) setErrors((current) => ({ ...current, consent: undefined }));
              }}
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? "newsletter-consent-error" : undefined}
            />
            <span>
              Aceito receber novidades da AXON por e-mail e sei que posso cancelar a qualquer momento. A Política de
              Privacidade será publicada antes de a subscrição ser ativada.
            </span>
          </label>
          {errors.consent && (
            <p id="newsletter-consent-error" className="field-error">
              {errors.consent}
            </p>
          )}

          <div className="newsletter-form__feedback" role="status">
            {message && (
              <p className={`form-message${state === "error" ? " form-message--error" : ""}`}>
                {state !== "error" && <CheckIcon width={18} height={18} />}
                {message}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
