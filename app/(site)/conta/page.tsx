import type { Metadata } from "next";
import Link from "next/link";
import { PasswordForm, ProfileForm } from "@/components/AccountForms";
import { requireCustomer } from "@/lib/auth";
import { db } from "@/lib/db";
import { brl, dateBR, statusLabel } from "@/lib/format";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Minha conta", robots: { index: false } };

type Props = { searchParams: Promise<{ bemvindo?: string; senha?: string }> };

export default async function ContaPage({ searchParams }: Props) {
  const { bemvindo, senha } = await searchParams;
  const customer = await requireCustomer();
  const orders = await db.order.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: { select: { name: true } } } } },
  });
  const notice = bemvindo ? "A sua conta foi criada. " : senha ? "A sua nova senha foi salva. " : "";
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <nav className="crumbs" aria-label="Você está em">
            <Link href="/">Início</Link><span aria-hidden="true">/</span><span>Minha conta</span>
          </nav>
          <p className="eyebrow">Minha conta</p>
          <h1>Olá, {customer.name.split(" ")[0]}</h1>
          <p className="lead">{notice}Aqui você acompanha os seus pedidos e atualiza os seus dados.</p>
        </div>
      </section>
      <section className="band tight my-orders">
        <div className="wrap">
          <p className="eyebrow">Pedidos</p>
          <h2>Os seus pedidos</h2>
          {orders.length === 0 ? (
            <p className="account-text">Ainda não há pedidos na sua conta. Quando você comprar com a AXON, o pedido aparece aqui.</p>
          ) : (
            <ul className="mo-list">
              {orders.map((o) => (
                <li key={o.id} className="mo">
                  <div className="mo-head">
                    <b>Pedido #{o.number}</b>
                    <span>{dateBR(o.createdAt)}</span>
                    <span className={`mo-status ${o.status}`}>{statusLabel(o.status)}</span>
                  </div>
                  <ul className="mo-items">
                    {o.items.map((i) => <li key={i.id}>{i.quantity} × AXON {i.product.name}</li>)}
                  </ul>
                  <strong className="mo-total">{brl(o.totalCents)}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <section className="band contact">
        <div className="wrap contact-inner">
          <div>
            <p className="eyebrow">Conta</p>
            <h2>{customer.name}</h2>
            <div className="info">
              <div><span>E-mail</span><strong>{customer.email}</strong></div>
              <div><span>Telefone</span><strong>{customer.phone ?? "Não informado"}</strong></div>
              <div><span>Cliente desde</span><strong>{dateBR(customer.createdAt)}</strong></div>
            </div>
            <form className="account-out" action={signOut}>
              <button className="btn outline-dark" type="submit">Sair da conta</button>
            </form>
          </div>
          <div className="account-forms">
            <ProfileForm customer={{ name: customer.name, email: customer.email, phone: customer.phone }} />
            <PasswordForm />
          </div>
        </div>
      </section>
    </>
  );
}
