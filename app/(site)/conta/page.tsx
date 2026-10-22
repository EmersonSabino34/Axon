import type { Metadata } from "next";
import Link from "next/link";
import { PasswordForm, ProfileForm } from "@/components/AccountForms";
import { requireCustomer } from "@/lib/auth";
import { dateBR } from "@/lib/format";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Minha conta", robots: { index: false } };

type Props = { searchParams: Promise<{ bemvindo?: string }> };

export default async function ContaPage({ searchParams }: Props) {
  const { bemvindo } = await searchParams;
  const customer = await requireCustomer();
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <nav className="crumbs" aria-label="Você está em">
            <Link href="/">Início</Link><span aria-hidden="true">/</span><span>Minha conta</span>
          </nav>
          <p className="eyebrow">Minha conta</p>
          <h1>Olá, {customer.name.split(" ")[0]}</h1>
          <p className="lead">{bemvindo ? "A sua conta foi criada. " : ""}Aqui você atualiza os seus dados e a sua senha.</p>
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
