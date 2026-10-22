import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/AccountForms";
import { findPasswordReset, RESET_HOURS } from "@/lib/auth";
import { getSettings, whatsappLink } from "@/lib/settings";

// O código vai no endereço, por isso a página não passa o endereço a outros sites.
export const metadata: Metadata = { title: "Nova senha", robots: { index: false }, referrer: "no-referrer" };

type Props = { searchParams: Promise<{ token?: string }> };

export default async function NovaSenhaPage({ searchParams }: Props) {
  const { token = "" } = await searchParams;
  const [customer, settings] = await Promise.all([findPasswordReset(token), getSettings()]);
  const askAgain = whatsappLink(settings.whatsapp, "Olá! O meu link para criar uma nova senha no site da AXON não funcionou. Pode enviar outro?");
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <nav className="crumbs" aria-label="Você está em">
            <Link href="/">Início</Link><span aria-hidden="true">/</span><span>Nova senha</span>
          </nav>
          <p className="eyebrow">Minha conta</p>
          <h1>{customer ? `Nova senha para ${customer.name.split(" ")[0]}` : "Link de nova senha"}</h1>
          <p className="lead">{customer ? "Escolha a senha que vai usar para entrar na sua conta." : "Não foi possível usar este link."}</p>
        </div>
      </section>
      <section className="band contact">
        <div className="wrap contact-inner">
          {customer ? (
            <>
              <div>
                <p className="eyebrow">Quase lá</p>
                <h2>Escolha a sua nova senha</h2>
                <p className="account-text">Depois de salvar, você já entra na sua conta. Este link só pode ser usado uma vez.</p>
              </div>
              <ResetPasswordForm token={token} />
            </>
          ) : (
            <div>
              <p className="eyebrow">Link inválido</p>
              <h2>Este link não vale mais</h2>
              <p className="account-text">O link pode ter expirado (vale por {RESET_HOURS} horas) ou já ter sido usado. Peça um novo à AXON pelo WhatsApp.</p>
              <a className="btn dark" href={askAgain} target="_blank" rel="noopener noreferrer">Pedir novo link</a>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
