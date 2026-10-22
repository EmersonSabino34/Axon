import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/AccountForms";
import { getCustomer } from "@/lib/auth";
import { getSettings, whatsappLink } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Entre na sua conta AXON.",
  robots: { index: false },
};

export default async function EntrarPage() {
  if (await getCustomer()) redirect("/conta");
  const settings = await getSettings();
  const forgot = whatsappLink(settings.whatsapp, "Olá! Esqueci a senha da minha conta no site da AXON. O meu e-mail de cadastro é: ");
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <nav className="crumbs" aria-label="Você está em">
            <Link href="/">Início</Link><span aria-hidden="true">/</span><span>Entrar</span>
          </nav>
          <p className="eyebrow">Minha conta</p>
          <h1>Entrar na sua conta</h1>
          <p className="lead">Use o e-mail e a senha que escolheu no cadastro.</p>
        </div>
      </section>
      <section className="band contact">
        <div className="wrap contact-inner">
          <div>
            <p className="eyebrow">Ainda não tem conta?</p>
            <h2>Crie a sua em um minuto</h2>
            <p className="account-text">Com a conta, os seus dados ficam guardados e o formulário de contato já vem preenchido.</p>
            <Link className="btn outline-dark" href="/cadastro">Criar conta</Link>
            <div className="account-help">
              <p className="eyebrow">Esqueceu a senha?</p>
              <p className="account-text">Fale com a AXON pelo WhatsApp. Enviamos um link para você criar uma nova senha.</p>
              <a className="btn outline-dark" href={forgot} target="_blank" rel="noopener noreferrer">Pedir pelo WhatsApp</a>
            </div>
          </div>
          <SignInForm />
        </div>
      </section>
    </>
  );
}
