"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useRef, useState, useSyncExternalStore } from "react";
import { placeOrder } from "@/app/(compra)/actions";
import { paymentMethodLabels, shippingFor, type CommerceSettings, type PaymentMethod } from "@/lib/commerce";
import { getPhotos } from "@/lib/collection";
import { formatPrice } from "@/lib/currency";
import type { CompanyDetails } from "@/lib/site-config";
import { useCart } from "../CartProvider";
import { FormMessage, SubmitButton, TextField, useFocusFirstError, useSubmitWithoutReset } from "../forms/Fields";
import { AtmIcon, CardIcon, InfoIcon, LockIcon, PhoneIcon } from "../LineIcons";

type CheckoutFormProps = {
  methods: PaymentMethod[];
  commerce: CommerceSettings;
  testMode: boolean;
  defaults: { name: string; email: string };
  signedIn: boolean;
  legal: { termos: string | null; privacidade: string | null; envios: string | null };
  company: CompanyDetails;
};

const methodInfo: Record<PaymentMethod, { icon: typeof PhoneIcon; text: string }> = {
  mbway: { icon: PhoneIcon, text: "Aprove o pagamento na app MB WAY do seu telemóvel." },
  multibanco: { icon: AtmIcon, text: "Recebe a entidade e a referência para pagar no multibanco ou no homebanking." },
  cartao: { icon: CardIcon, text: "Visa ou Mastercard, na página segura do banco (3-D Secure)." },
};

// O carrinho vive no navegador: até ser lido, mostra-se um estado de espera em vez de «vazio».
const useHydrated = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

export function CheckoutForm({ methods, commerce, testMode, defaults, signedIn, legal, company }: CheckoutFormProps) {
  const hydrated = useHydrated();
  const { items, removeItem } = useCart();
  const [state, action, pending] = useActionState(placeOrder, undefined);
  const [method, setMethod] = useState<PaymentMethod>(methods[0]);
  const [terms, setTerms] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  useFocusFirstError(formRef, state);
  const onSubmit = useSubmitWithoutReset(action);
  const errors = state?.fieldErrors ?? {};

  if (!hydrated) return <p className="loading-note">A carregar o carrinho…</p>;

  if (items.length === 0) {
    return (
      <section className="purchase-closed">
        <h1 className="purchase__title">O seu carrinho está vazio</h1>
        <p className="purchase__lead">Escolha os produtos na coleção e volte aqui para finalizar a encomenda.</p>
        <Link href="/#colecao" className="button button--primary">
          Explorar coleção
        </Link>
      </section>
    );
  }

  const blocked = items.filter(
    ({ product, quantity }) => product.status !== "disponivel" || product.priceCents === null || product.stock < quantity,
  );
  const subtotal = items.reduce((sum, { product, quantity }) => sum + (product.priceCents ?? 0) * quantity, 0);
  const shipping = shippingFor(subtotal, commerce) ?? 0;
  const total = subtotal + shipping;
  const lines = items.map(({ product, quantity }) => ({ slug: product.slug, quantity }));

  return (
    <form ref={formRef} action={action} onSubmit={onSubmit} className="checkout" noValidate>
      <header className="checkout__header">
        <p className="eyebrow">Finalizar encomenda</p>
        <h1 className="purchase__title">Os seus dados e o pagamento</h1>
        {!signedIn && (
          <p className="purchase__lead">
            Já tem conta? <Link href="/entrar">Entre</Link> para guardar a encomenda na sua conta. Também pode continuar sem
            conta.
          </p>
        )}
      </header>

      {testMode && (
        <p className="test-banner" role="note">
          <InfoIcon width={18} height={18} />
          <span>
            <strong>Modo de teste.</strong> Os pagamentos são simulados: nenhum dinheiro é cobrado.
          </span>
        </p>
      )}

      <div className="checkout__grid">
        <div className="checkout__main">
          <fieldset className="checkout-card">
            <legend className="checkout-card__title">
              <span className="checkout-card__step">1</span> Contacto
            </legend>
            <div className="form-row">
              <TextField label="Nome completo" name="name" autoComplete="name" defaultValue={defaults.name} error={errors.name} />
              <TextField
                label="E-mail"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                defaultValue={defaults.email}
                hint="Para lhe enviarmos os dados da encomenda."
                error={errors.email}
              />
            </div>
            <div className="form-row">
              <TextField label="Telemóvel" name="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="912 345 678" error={errors.phone} />
              <TextField
                label="NIF (opcional)"
                name="nif"
                inputMode="numeric"
                maxLength={9}
                hint="Para a fatura em seu nome."
                error={errors.nif}
              />
            </div>
          </fieldset>

          <fieldset className="checkout-card">
            <legend className="checkout-card__title">
              <span className="checkout-card__step">2</span> Morada de entrega
            </legend>
            <TextField label="Morada" name="address" autoComplete="street-address" placeholder="Rua, número, andar" error={errors.address} />
            <div className="form-row">
              <TextField
                label="Código postal"
                name="postalCode"
                autoComplete="postal-code"
                inputMode="numeric"
                placeholder="0000-000"
                maxLength={8}
                error={errors.postalCode}
              />
              <TextField label="Localidade" name="city" autoComplete="address-level2" error={errors.city} />
            </div>
            <p className="form-section__note">Entregas em Portugal.</p>
          </fieldset>

          <fieldset className="checkout-card">
            <legend className="checkout-card__title">
              <span className="checkout-card__step">3</span> Pagamento
            </legend>
            <div className="pay-methods" role="radiogroup" aria-label="Método de pagamento">
              {methods.map((option) => {
                const { icon: Icon, text } = methodInfo[option];
                return (
                  <label key={option} className="pay-method">
                    <input
                      type="radio"
                      name="method"
                      value={option}
                      checked={method === option}
                      onChange={() => setMethod(option)}
                    />
                    <span className="pay-method__icon" aria-hidden="true">
                      <Icon width={22} height={22} />
                    </span>
                    <span className="pay-method__text">
                      <strong>{paymentMethodLabels[option]}</strong>
                      {text}
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.method && <p className="field__error">{errors.method}</p>}

            {method === "mbway" && (
              <TextField
                label="Telemóvel associado ao MB WAY"
                name="mbwayPhone"
                type="tel"
                inputMode="tel"
                placeholder="Se for diferente do telemóvel de contacto"
                hint="Vai receber o pedido de pagamento na app. Tem 5 minutos para o aprovar."
                error={errors.mbwayPhone}
              />
            )}
            {method === "multibanco" && (
              <p className="form-section__note">
                A referência é válida durante {commerce.multibancoExpiryDays}{" "}
                {commerce.multibancoExpiryDays === 1 ? "dia" : "dias"}. A encomenda é preparada assim que o pagamento for
                recebido.
              </p>
            )}
            {method === "cartao" && (
              <p className="form-section__note">
                <LockIcon width={14} height={14} /> Os dados do cartão são introduzidos na página do prestador de pagamentos e
                nunca passam pelo site da AXON.
              </p>
            )}
          </fieldset>
        </div>

        <aside className="checkout__summary" aria-labelledby="resumo-title">
          <h2 id="resumo-title" className="checkout-card__title">
            Resumo
          </h2>
          <ul className="summary-list">
            {items.map(({ product, quantity }) => {
              const problem =
                product.status !== "disponivel" || product.priceCents === null
                  ? "Ainda não disponível"
                  : product.stock < quantity
                    ? product.stock === 0
                      ? "Esgotado"
                      : `Só há ${product.stock} unidades`
                    : null;
              return (
                <li key={product.slug} className={`summary-line${problem ? " has-problem" : ""}`}>
                  <span className="summary-line__thumb">
                    <Image src={getPhotos(product)[0].src} alt="" fill sizes="56px" />
                    <span className="summary-line__qty" aria-label={`Quantidade: ${quantity}`}>
                      {quantity}
                    </span>
                  </span>
                  <span className="summary-line__info">
                    <strong>{product.name}</strong>
                    {problem ? (
                      <span className="summary-line__problem">
                        {problem} ·{" "}
                        <button type="button" className="text-button text-button--danger" onClick={() => removeItem(product.slug)}>
                          Retirar
                        </button>
                      </span>
                    ) : (
                      <span>{formatPrice(product.priceCents)} / unidade</span>
                    )}
                  </span>
                  <span className="summary-line__total">{formatPrice((product.priceCents ?? 0) * quantity)}</span>
                </li>
              );
            })}
          </ul>

          <dl className="summary-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div>
              <dt>Portes de envio</dt>
              <dd>{shipping === 0 ? "Grátis" : formatPrice(shipping)}</dd>
            </div>
            <div className="summary-totals__total">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>
          {commerce.freeShippingFromCents !== null && shipping > 0 && (
            <p className="summary-totals__hint">Envio grátis a partir de {formatPrice(commerce.freeShippingFromCents)}.</p>
          )}

          <div className="field">
            <label className="field__checkbox">
              <input
                type="checkbox"
                name="terms"
                checked={terms}
                onChange={(event) => setTerms(event.target.checked)}
                aria-invalid={errors.terms ? true : undefined}
              />
              <span>
                Li e aceito os{" "}
                {legal.termos ? (
                  <a href={legal.termos} target="_blank" rel="noopener">
                    Termos e Condições
                  </a>
                ) : (
                  "Termos e Condições"
                )}
                {legal.envios && (
                  <>
                    {" "}e a política de{" "}
                    <a href={legal.envios} target="_blank" rel="noopener">
                      envios e devoluções
                    </a>
                  </>
                )}
                .
              </span>
            </label>
            {errors.terms && <p className="field__error">{errors.terms}</p>}
          </div>

          <FormMessage state={state} />
          {state?.orderUrl && (
            <Link href={state.orderUrl} className="text-button">
              Ver a encomenda e tentar de novo
            </Link>
          )}
          {blocked.length > 0 && (
            <p className="field__error">Retire os produtos assinalados para poder encomendar.</p>
          )}

          <input type="hidden" name="cart" value={JSON.stringify(lines)} />
          <div className="checkout__submit">
            {blocked.length > 0 ? (
              <button type="button" className="button button--primary" disabled>
                Encomendar com obrigação de pagamento
              </button>
            ) : (
              <SubmitButton pending={pending} pendingLabel="A processar…">
                Encomendar com obrigação de pagamento
              </SubmitButton>
            )}
          </div>

          <p className="checkout__legal">
            Os seus dados são usados para processar e entregar a encomenda
            {legal.privacidade ? (
              <>
                , de acordo com a{" "}
                <a href={legal.privacidade} target="_blank" rel="noopener">
                  Política de Privacidade
                </a>
              </>
            ) : null}
            . Vendido por {company.legalName ?? "AXON"}
            {company.taxId ? ` · NIPC ${company.taxId}` : ""}.
          </p>
        </aside>
      </div>
    </form>
  );
}
