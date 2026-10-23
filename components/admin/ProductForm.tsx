"use client";

import { useActionState, useRef, useState } from "react";
import { resetProductAction, updateProduct } from "@/app/painel/actions";
import type { Product, ProductStatus } from "@/lib/collection";
import { FormMessage, SubmitButton, TextField, useFocusFirstError, useSubmitWithoutReset } from "../forms/Fields";

const centsToInput = (cents: number | null) => (cents === null ? "" : (cents / 100).toFixed(2).replace(".", ","));

export function ProductForm({ product }: { product: Product }) {
  const [state, action, pending] = useActionState(updateProduct.bind(null, product.slug), undefined);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, state);
  const onSubmit = useSubmitWithoutReset(action);
  const errors = state?.fieldErrors ?? {};
  // Controlado, para a escolha não se perder quando a gravação devolve erros.
  const [status, setStatus] = useState<ProductStatus>(product.status);
  const [initialStatus, setInitialStatus] = useState<ProductStatus>(product.status);
  if (product.status !== initialStatus) {
    setInitialStatus(product.status);
    setStatus(product.status);
  }

  return (
    <form ref={formRef} action={action} onSubmit={onSubmit} className="form-stack" noValidate>
      <fieldset className="form-section">
        <legend className="form-section__title">Venda</legend>
        <div className="form-row">
          <TextField
            label="Preço (€)"
            name="price"
            inputMode="decimal"
            placeholder="Ex.: 19,90"
            defaultValue={centsToInput(product.priceCents)}
            hint="Deixe vazio para mostrar «Preço a confirmar»."
            error={errors.price}
          />
          <TextField
            label="Stock (unidades)"
            name="stock"
            inputMode="numeric"
            defaultValue={String(product.stock)}
            error={errors.stock}
          />
        </div>
        <div className="field">
          <span className="field__label" id={`estado-${product.slug}`}>
            Estado na loja
          </span>
          <div className="choice-group" role="radiogroup" aria-labelledby={`estado-${product.slug}`}>
            <label className="choice">
              <input
                type="radio"
                name="status"
                value="em-preparacao"
                checked={status === "em-preparacao"}
                onChange={() => setStatus("em-preparacao")}
              />
              <span>
                <strong>Em preparação</strong>
                Mostra «Detalhes em preparação».
              </span>
            </label>
            <label className="choice">
              <input
                type="radio"
                name="status"
                value="disponivel"
                checked={status === "disponivel"}
                onChange={() => setStatus("disponivel")}
              />
              <span>
                <strong>Disponível</strong>
                Mostra o preço. As encomendas online continuam inativas.
              </span>
            </label>
          </div>
          {errors.status && <p className="field__error">{errors.status}</p>}
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend className="form-section__title">Apresentação</legend>
        <TextField label="Frase de destaque" name="tagline" maxLength={120} defaultValue={product.tagline} error={errors.tagline} />
        <TextField
          label="Descrição"
          name="description"
          multiline
          rows={6}
          maxLength={900}
          defaultValue={product.description}
          hint="Fale da experiência e da embalagem. Não descreva efeitos no organismo."
          error={errors.description}
        />
        <TextField
          label="Pontos fortes"
          name="highlights"
          multiline
          rows={4}
          defaultValue={product.highlights.join("\n")}
          hint="Um por linha, até 4."
          error={errors.highlights}
        />
      </fieldset>

      <fieldset className="form-section">
        <legend className="form-section__title">O que faz (alegações validadas)</legend>
        <p className="form-section__note">
          Escreva apenas alegações autorizadas e validadas por quem responde pela regulamentação, uma por linha.
          Aparecem nos slides e na ficha com o título «O que faz». Deixe vazio enquanto não houver validação.
        </p>
        <TextField
          label="Alegações validadas"
          name="validatedClaims"
          multiline
          rows={3}
          defaultValue={product.validatedClaims.join("\n")}
          error={errors.validatedClaims}
        />
      </fieldset>

      <FormMessage state={state} />
      <div className="form-actions">
        <SubmitButton pending={pending}>Guardar alterações</SubmitButton>
      </div>
    </form>
  );
}

export function ResetProductButton({ slug, disabled }: { slug: string; disabled: boolean }) {
  return (
    <form
      action={resetProductAction.bind(null, slug)}
      onSubmit={(event) => {
        if (!window.confirm("Repor os valores de base deste produto? As alterações feitas no painel perdem-se.")) {
          event.preventDefault();
        }
      }}
    >
      <button type="submit" className="button button--outline button--small" disabled={disabled}>
        Repor valores de base
      </button>
    </form>
  );
}
