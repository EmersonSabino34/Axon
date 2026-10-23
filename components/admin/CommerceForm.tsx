"use client";

import { useActionState, useRef, useState } from "react";
import { updateCommerce } from "@/app/painel/actions";
import { paymentMethodLabels, type CommerceSettings, type PaymentMethod } from "@/lib/commerce";
import { FormMessage, SubmitButton, TextField, useFocusFirstError, useSubmitWithoutReset } from "../forms/Fields";
import { CheckIcon, InfoIcon } from "../LineIcons";

type CommerceFormProps = {
  settings: CommerceSettings;
  missing: string[];
  providerLabel: string | null;
  testMode: boolean;
  methods: PaymentMethod[];
};

const centsToInput = (cents: number | null) => (cents === null ? "" : (cents / 100).toFixed(2).replace(".", ","));

export function CommerceForm({ settings, missing, providerLabel, testMode, methods }: CommerceFormProps) {
  const [state, action, pending] = useActionState(updateCommerce, undefined);
  const [storeOpen, setStoreOpen] = useState(settings.storeOpen);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, state);
  const onSubmit = useSubmitWithoutReset(action);
  const errors = state?.fieldErrors ?? {};
  // A opção «Aceitar encomendas» conta como cumprida quando está ligada no formulário.
  const pendingItems = missing.filter((item) => !item.startsWith("Ativar «Aceitar encomendas»"));

  return (
    <form ref={formRef} action={action} onSubmit={onSubmit} className="form-stack" noValidate>
      <div className="commerce-status">
        <p className="commerce-status__line">
          <span className={`status-pill ${providerLabel ? (testMode ? "status-pill--em-preparacao" : "status-pill--disponivel") : "status-pill--inactive"}`}>
            {providerLabel ? (testMode ? "Pagamentos em modo de teste" : `Pagamentos reais · ${providerLabel}`) : "Pagamentos por configurar"}
          </span>
          {methods.length > 0 && <span>{methods.map((method) => paymentMethodLabels[method]).join(" · ")}</span>}
        </p>
        {pendingItems.length > 0 ? (
          <div className="notice notice--priority">
            <InfoIcon width={18} height={18} />
            <div>
              <p className="notice__title">Para as encomendas abrirem falta:</p>
              <ul className="notice__list">
                {pendingItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="form-alert form-alert--success">
            <CheckIcon width={18} height={18} />
            Todos os requisitos estão cumpridos.
          </p>
        )}
      </div>

      <label className="switch">
        <input type="checkbox" name="storeOpen" checked={storeOpen} onChange={(event) => setStoreOpen(event.target.checked)} />
        <span className="switch__track" aria-hidden="true" />
        <span>
          <strong>Aceitar encomendas</strong>
          {testMode
            ? "Em modo de teste, os pagamentos são simulados e ninguém é cobrado."
            : "Os clientes passam a poder encomendar e pagar os produtos marcados como disponíveis."}
        </span>
      </label>

      <div className="form-row">
        <TextField
          label="Portes de envio (€)"
          name="shipping"
          inputMode="decimal"
          placeholder="Ex.: 4,90"
          defaultValue={centsToInput(settings.shippingCents)}
          hint="Valor por encomenda, para Portugal. 0 = envio grátis."
          error={errors.shipping}
        />
        <TextField
          label="Envio grátis a partir de (€)"
          name="freeShippingFrom"
          inputMode="decimal"
          placeholder="Opcional"
          defaultValue={centsToInput(settings.freeShippingFromCents)}
          error={errors.freeShippingFrom}
        />
      </div>
      <TextField
        label="Validade das referências Multibanco (dias)"
        name="multibancoExpiryDays"
        inputMode="numeric"
        defaultValue={String(settings.multibancoExpiryDays)}
        error={errors.multibancoExpiryDays}
      />

      <FormMessage state={state} />
      <div className="form-actions">
        <SubmitButton pending={pending}>Guardar loja online</SubmitButton>
      </div>
    </form>
  );
}
