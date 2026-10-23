"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { retryPayment, simulateTestPayment } from "@/app/(compra)/actions";
import { clearCart } from "@/lib/cart-store";
import { getPhotos, baseProducts } from "@/lib/collection";
import {
  formatPhone,
  formatReference,
  MBWAY_TIMEOUT_MINUTES,
  orderStatusLabels,
  paymentMethodLabels,
  type PaymentMethod,
} from "@/lib/commerce";
import { formatPrice } from "@/lib/currency";
import { formatDateTime } from "@/lib/dates";
import type { Order } from "@/lib/server/orders";
import { FormMessage, SubmitButton, TextField } from "../forms/Fields";
import { AtmIcon, CheckIcon, CopyIcon, InfoIcon, PhoneIcon, TruckIcon } from "../LineIcons";

type OrderViewProps = {
  order: Order;
  token: string;
  isNew: boolean;
  retryMethods: PaymentMethod[];
  testMode: boolean;
};

function photoFor(slug: string) {
  const product = baseProducts.find((entry) => entry.slug === slug);
  return product ? getPhotos(product)[0].src : null;
}

function CopyValue({ label, value, display }: { label: string; value: string; display?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="pay-data__row">
      <dt>{label}</dt>
      <dd>
        <span className="pay-data__value">{display ?? value}</span>
        <button
          type="button"
          className="icon-button pay-data__copy"
          aria-label={`Copiar ${label.toLowerCase()}`}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              // Sem acesso à área de transferência: o valor continua visível para copiar à mão.
            }
          }}
        >
          {copied ? <CheckIcon width={16} height={16} /> : <CopyIcon width={16} height={16} />}
        </button>
      </dd>
    </div>
  );
}

function MbwayCountdown({ since }: { since: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const remaining = Math.max(0, MBWAY_TIMEOUT_MINUTES * 60_000 - (now - new Date(since).getTime()));
  const minutes = Math.floor(remaining / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);
  return (
    <p className="countdown" suppressHydrationWarning>
      {remaining > 0 ? `Tempo restante: ${minutes}:${String(seconds).padStart(2, "0")}` : "O tempo para aprovar terminou."}
    </p>
  );
}

function RetryForm({ order, token, methods }: { order: Order; token: string; methods: PaymentMethod[] }) {
  const [state, action, pending] = useActionState(retryPayment.bind(null, order.number, token), undefined);
  const [method, setMethod] = useState<PaymentMethod>(methods.includes(order.paymentMethod) ? order.paymentMethod : methods[0]);
  if (methods.length === 0) return null;

  return (
    <form action={action} className="form-stack retry-form">
      <div className="pay-methods pay-methods--compact" role="radiogroup" aria-label="Método de pagamento">
        {methods.map((option) => (
          <label key={option} className="pay-method">
            <input type="radio" name="method" value={option} checked={method === option} onChange={() => setMethod(option)} />
            <span className="pay-method__text">
              <strong>{paymentMethodLabels[option]}</strong>
            </span>
          </label>
        ))}
      </div>
      {state?.fieldErrors?.method && <p className="field__error">{state.fieldErrors.method}</p>}
      {method === "mbway" && (
        <TextField
          label="Telemóvel associado ao MB WAY"
          name="mbwayPhone"
          type="tel"
          inputMode="tel"
          defaultValue={order.mbwayPhone ?? order.customer.phone}
          error={state?.fieldErrors?.mbwayPhone}
        />
      )}
      <FormMessage state={state} />
      <div>
        <SubmitButton pending={pending} pendingLabel="A iniciar…">
          Pagar {formatPrice(order.totalCents)}
        </SubmitButton>
      </div>
    </form>
  );
}

export function OrderView({ order, token, isNew, retryMethods, testMode }: OrderViewProps) {
  const router = useRouter();
  const pending = order.status === "pendente";

  // Na primeira visita depois de encomendar, o carrinho fica vazio.
  useEffect(() => {
    if (isNew) clearCart();
  }, [isNew]);

  // Enquanto aguarda pagamento, consulta o estado e atualiza a página quando muda.
  useEffect(() => {
    if (!pending) return;
    const every = order.paymentMethod === "multibanco" ? 20_000 : 4_000;
    const timer = setInterval(async () => {
      try {
        const response = await fetch(`/api/encomendas/${order.number}/estado?t=${encodeURIComponent(token)}`, { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { status: string };
        if (data.status !== order.status) router.refresh();
      } catch {
        // Falha de rede: tenta de novo no próximo intervalo.
      }
    }, every);
    return () => clearInterval(timer);
  }, [pending, order.number, order.status, order.paymentMethod, token, router]);

  return (
    <div className="order">
      <header className="order__header">
        <p className="eyebrow">Encomenda {order.number}</p>
        <h1 className="purchase__title">
          {order.status === "pago" && "Pagamento recebido. Obrigado!"}
          {order.status === "enviado" && "A sua encomenda está a caminho"}
          {order.status === "cancelado" && "Encomenda cancelada"}
          {order.status === "falhado" && "O pagamento não foi concluído"}
          {pending && order.paymentMethod === "mbway" && "Aprove o pagamento na app MB WAY"}
          {pending && order.paymentMethod === "multibanco" && "Pague com a referência Multibanco"}
          {pending && order.paymentMethod === "cartao" && "A confirmar o pagamento com cartão"}
        </h1>
        <p className={`status-pill status-pill--order-${order.status}`} role="status">
          {orderStatusLabels[order.status]}
        </p>
      </header>

      {testMode && (
        <div className="test-banner" role="note">
          <InfoIcon width={18} height={18} />
          <span>
            <strong>Modo de teste.</strong> Nenhum dinheiro é cobrado. Use os botões para simular a resposta do banco.
          </span>
          {pending && (
            <span className="test-banner__actions">
              <form action={simulateTestPayment.bind(null, order.number, token, "pago")}>
                <button type="submit" className="button button--small button--primary">
                  Simular pagamento aprovado
                </button>
              </form>
              <form action={simulateTestPayment.bind(null, order.number, token, "falhado")}>
                <button type="submit" className="button button--small button--outline">
                  Simular recusa
                </button>
              </form>
            </span>
          )}
        </div>
      )}

      <div className="order__grid">
        <div className="order__main">
          {pending && order.paymentMethod === "multibanco" && order.mbEntity && order.mbReference && (
            <section className="checkout-card pay-card" aria-labelledby="mb-title">
              <h2 id="mb-title" className="checkout-card__title">
                <AtmIcon /> Dados para pagamento
              </h2>
              <dl className="pay-data">
                <CopyValue label="Entidade" value={order.mbEntity} />
                <CopyValue label="Referência" value={order.mbReference} display={formatReference(order.mbReference)} />
                <CopyValue label="Montante" value={(order.totalCents / 100).toFixed(2)} display={formatPrice(order.totalCents)} />
              </dl>
              <p className="form-section__note">
                Pague num multibanco ou no homebanking, em «Pagamento de serviços».
                {order.mbExpiresAt && <> Válida até {formatDateTime(order.mbExpiresAt)}.</>} Assim que o pagamento for recebido,
                esta página é atualizada.
              </p>
            </section>
          )}

          {pending && order.paymentMethod === "mbway" && (
            <section className="checkout-card pay-card" aria-labelledby="mbway-title">
              <h2 id="mbway-title" className="checkout-card__title">
                <PhoneIcon /> Pedido enviado para {formatPhone(order.mbwayPhone ?? order.customer.phone)}
              </h2>
              <p>
                Abra a app MB WAY e aprove o pagamento de <strong>{formatPrice(order.totalCents)}</strong>. Esta página
                atualiza-se sozinha quando o pagamento for confirmado.
              </p>
              <MbwayCountdown since={order.updatedAt} />
            </section>
          )}

          {pending && order.paymentMethod === "cartao" && (
            <section className="checkout-card pay-card">
              <p>Estamos a aguardar a confirmação do banco. Esta página atualiza-se sozinha dentro de momentos.</p>
            </section>
          )}

          {(order.status === "pago" || order.status === "enviado") && (
            <section className="checkout-card pay-card pay-card--done">
              <h2 className="checkout-card__title">
                {order.status === "enviado" ? <TruckIcon /> : <CheckIcon />}
                {order.status === "enviado" ? "Encomenda enviada" : "Vamos preparar a sua encomenda"}
              </h2>
              <p>
                {order.status === "enviado"
                  ? `Enviada${order.shippedAt ? ` em ${formatDateTime(order.shippedAt)}` : ""}.`
                  : `Pagamento recebido${order.paidAt ? ` em ${formatDateTime(order.paidAt)}` : ""}. Enviamos a encomenda para a morada indicada.`}
              </p>
              {order.status === "enviado" && order.adminNote && <p className="order__note">{order.adminNote}</p>}
            </section>
          )}

          {order.status === "falhado" && (
            <section className="checkout-card pay-card pay-card--failed" aria-labelledby="retry-title">
              <h2 id="retry-title" className="checkout-card__title">
                Tentar de novo
              </h2>
              {order.paymentError && <p>{order.paymentError}</p>}
              <p className="form-section__note">A encomenda continua guardada. Escolha como quer pagar:</p>
              <RetryForm order={order} token={token} methods={retryMethods} />
            </section>
          )}

          {pending && retryMethods.length > 1 && (
            <details className="checkout-card other-method">
              <summary>Prefere pagar de outra forma?</summary>
              <RetryForm order={order} token={token} methods={retryMethods} />
            </details>
          )}

          <section className="checkout-card" aria-labelledby="entrega-title">
            <h2 id="entrega-title" className="checkout-card__title">
              Entrega e contacto
            </h2>
            <div className="order__columns">
              <p>
                {order.customer.name}
                <br />
                {order.shipping.address}
                <br />
                {order.shipping.postalCode} {order.shipping.city}
              </p>
              <p>
                {order.customer.email}
                <br />
                {formatPhone(order.customer.phone)}
                {order.customer.nif && (
                  <>
                    <br />
                    NIF {order.customer.nif}
                  </>
                )}
              </p>
            </div>
          </section>
        </div>

        <aside className="checkout__summary" aria-labelledby="resumo-encomenda">
          <h2 id="resumo-encomenda" className="checkout-card__title">
            Resumo
          </h2>
          <ul className="summary-list">
            {order.items.map((item) => {
              const photo = photoFor(item.slug);
              return (
                <li key={item.slug} className="summary-line">
                  <span className="summary-line__thumb">
                    {photo && <Image src={photo} alt="" fill sizes="56px" />}
                    <span className="summary-line__qty" aria-label={`Quantidade: ${item.quantity}`}>
                      {item.quantity}
                    </span>
                  </span>
                  <span className="summary-line__info">
                    <strong>{item.name}</strong>
                    <span>{formatPrice(item.unitPriceCents)} / unidade</span>
                  </span>
                  <span className="summary-line__total">{formatPrice(item.unitPriceCents * item.quantity)}</span>
                </li>
              );
            })}
          </ul>
          <dl className="summary-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatPrice(order.subtotalCents)}</dd>
            </div>
            <div>
              <dt>Portes de envio</dt>
              <dd>{order.shippingCents === 0 ? "Grátis" : formatPrice(order.shippingCents)}</dd>
            </div>
            <div className="summary-totals__total">
              <dt>Total</dt>
              <dd>{formatPrice(order.totalCents)}</dd>
            </div>
          </dl>
          <p className="checkout__legal">
            {paymentMethodLabels[order.paymentMethod]} · Encomenda feita em {formatDateTime(order.createdAt)}.
          </p>
          <p className="checkout__legal">
            Guarde o link desta página: dá acesso à sua encomenda.{" "}
            {order.userId ? (
              <Link href="/conta">Ver em «A minha conta»</Link>
            ) : (
              <Link href="/criar-conta">Crie uma conta para acompanhar as próximas encomendas.</Link>
            )}
          </p>
        </aside>
      </div>
    </div>
  );
}
