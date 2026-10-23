import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DeleteAccountForm, NameForm, PasswordForm } from "@/components/account/AccountForms";
import { ArrowIcon, BagIcon, GridIcon } from "@/components/LineIcons";
import { orderStatusLabels } from "@/lib/commerce";
import { formatPrice } from "@/lib/currency";
import { formatDate, formatDateTime } from "@/lib/dates";
import { listOrdersForUser } from "@/lib/server/orders";
import { requireUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "A minha conta · AXON" };

export default function AccountPage() {
  return (
    <Suspense fallback={<p className="loading-note">A carregar a sua conta…</p>}>
      <AccountContent />
    </Suspense>
  );
}

async function AccountContent() {
  const user = await requireUser();
  const firstName = user.name.split(" ")[0];
  const orders = listOrdersForUser(user.id);

  return (
    <>
      <header className="account__intro">
        <p className="eyebrow">A minha conta</p>
        <h1 className="account__title">Olá, {firstName}</h1>
        <p className="account__lead">Cliente AXON desde {formatDate(user.createdAt)}.</p>
      </header>

      {user.role === "admin" && (
        <Link href="/painel" className="account-banner">
          <GridIcon />
          <span>
            <strong>Painel da loja</strong>
            Produtos, clientes, definições e preparação do lançamento.
          </span>
          <ArrowIcon />
        </Link>
      )}

      <div className="account-grid">
        <section className="account-card" aria-labelledby="dados-title">
          <h2 id="dados-title" className="account-card__title">
            Os seus dados
          </h2>
          <NameForm name={user.name} email={user.email} />
        </section>

        <section className="account-card" aria-labelledby="encomendas-title">
          <h2 id="encomendas-title" className="account-card__title">
            Encomendas
          </h2>
          {orders.length > 0 ? (
            <ul className="account-orders">
              {orders.map((order) => (
                <li key={order.number}>
                  <Link href={`/encomenda/${order.number}`} className="account-orders__link">
                    <span>
                      <strong>{order.number}</strong>
                      <span>
                        {formatDateTime(order.createdAt)} · {order.itemCount} {order.itemCount === 1 ? "artigo" : "artigos"}
                      </span>
                    </span>
                    <span className={`status-pill status-pill--order-${order.status}`}>{orderStatusLabels[order.status]}</span>
                    <strong>{formatPrice(order.totalCents)}</strong>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <span className="empty-state__icon">
                <BagIcon width={26} height={26} />
              </span>
              <p className="empty-state__title">Ainda não há encomendas</p>
              <p className="empty-state__text">
                As encomendas que fizer com sessão iniciada aparecem aqui, com o estado do pagamento e do envio.
              </p>
              <Link href="/#colecao" className="button button--outline">
                Explorar coleção
              </Link>
            </div>
          )}
        </section>

        <section className="account-card" aria-labelledby="seguranca-title">
          <h2 id="seguranca-title" className="account-card__title">
            Palavra-passe
          </h2>
          <PasswordForm />
        </section>

        <section className="account-card" aria-labelledby="privacidade-title">
          <h2 id="privacidade-title" className="account-card__title">
            Privacidade
          </h2>
          <p className="account-card__text">
            Guardamos o seu nome, e-mail, a palavra-passe protegida e as datas de registo
            {user.lastLoginAt ? ` e de último acesso (${formatDate(user.lastLoginAt)})` : ""}. Não guardamos dados de
            pagamento.
          </p>
          {user.role === "admin" ? (
            <p className="account-card__text">As contas de administrador são geridas por quem gere a loja.</p>
          ) : (
            <details className="danger-zone">
              <summary>Eliminar a minha conta</summary>
              <DeleteAccountForm />
            </details>
          )}
        </section>
      </div>
    </>
  );
}
