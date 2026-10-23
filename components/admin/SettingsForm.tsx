"use client";

import { useActionState, useRef } from "react";
import { updateSettings } from "@/app/painel/actions";
import { contactLabels, legalPages, type SiteSettings } from "@/lib/site-config";
import { FormMessage, SubmitButton, TextField, useFocusFirstError, useSubmitWithoutReset } from "../forms/Fields";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action, pending] = useActionState(updateSettings, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, state);
  const onSubmit = useSubmitWithoutReset(action);
  const errors = state?.fieldErrors ?? {};

  return (
    <form ref={formRef} action={action} onSubmit={onSubmit} className="form-stack" noValidate>
      <fieldset className="form-section">
        <legend className="form-section__title">Contactos</legend>
        <div className="form-row">
          <TextField
            label={contactLabels.email}
            name="email"
            type="email"
            inputMode="email"
            defaultValue={settings.contacts.email ?? ""}
            error={errors.email}
          />
          <TextField
            label={contactLabels.phone}
            name="phone"
            type="tel"
            placeholder="+351 …"
            defaultValue={settings.contacts.phone ?? ""}
            error={errors.phone}
          />
        </div>
        <TextField label={contactLabels.address} name="address" defaultValue={settings.contacts.address ?? ""} error={errors.address} />
        <TextField
          label={contactLabels.hours}
          name="hours"
          placeholder="Ex.: dias úteis, 9h00–18h00"
          defaultValue={settings.contacts.hours ?? ""}
          error={errors.hours}
        />
      </fieldset>

      <fieldset className="form-section">
        <legend className="form-section__title">Identificação da empresa</legend>
        <TextField label="Denominação social" name="legalName" defaultValue={settings.company.legalName ?? ""} error={errors.legalName} />
        <div className="form-row">
          <TextField
            label="NIPC"
            name="taxId"
            inputMode="numeric"
            defaultValue={settings.company.taxId ?? ""}
            error={errors.taxId}
          />
          <TextField
            label="Sede"
            name="registeredOffice"
            defaultValue={settings.company.registeredOffice ?? ""}
            error={errors.registeredOffice}
          />
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend className="form-section__title">Páginas legais</legend>
        <p className="form-section__note">
          Indique o caminho da página no site (por exemplo, /privacidade) ou um endereço https:// externo, como o do
          Livro de Reclamações Eletrónico. Sem endereço, o rodapé mostra «Pendente».
        </p>
        {legalPages.map((page) => (
          <TextField
            key={page.id}
            label={page.label}
            name={`legal-${page.id}`}
            placeholder="/pagina ou https://…"
            defaultValue={settings.legal[page.id] ?? ""}
            error={errors[`legal-${page.id}`]}
          />
        ))}
      </fieldset>

      <FormMessage state={state} />
      <div className="form-actions">
        <SubmitButton pending={pending}>Guardar definições</SubmitButton>
      </div>
    </form>
  );
}
