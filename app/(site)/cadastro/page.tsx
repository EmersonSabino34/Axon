import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/AccountForms";
import { getCustomer } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie a sua conta AXON.",
  robots: { index: false },
};

export default async function CadastroPage() {
  if (await getCustomer()) redirect("/conta");
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <nav className="crumbs" aria-label="Você está em">
            <Link href="/">Início</Link><span aria-hidden="true">/</span><span>Criar conta</span>
          </nav>
          <p className="eyebrow">Minha conta</p>
          <h1>Criar a sua conta</h1>
          <p className="lead">Guardamos o seu nome, e-mail e telefone para agilizar o atendimento.</p>
        </div>
      </section>
      <section className="band contact">
        <div className="wrap contact-inner">
          <div>
            <p className="eyebrow">Já tem conta?</p>
            <h2>Entre com o seu e-mail</h2>
            <p className="account-text">Se já criou a sua conta antes, basta entrar com o e-mail e a senha.</p>
            <Link className="btn outline-dark" href="/entrar">Entrar</Link>
          </div>
          <SignUpForm />
        </div>
      </section>
    </>
  );
}
