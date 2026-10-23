import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "Entrar · AXON" };

export default function LoginPage() {
  return (
    <>
      <p className="eyebrow">A minha conta</p>
      <h1 className="access__title">Bem-vindo de volta</h1>
      <p className="access__intro">Entre com o e-mail e a palavra-passe da sua conta AXON.</p>
      <LoginForm />
      <p className="access__note">
        Esqueceu-se da palavra-passe? A recuperação por e-mail fica disponível quando o serviço de e-mail da loja
        estiver configurado.
      </p>
      <p className="access__switch">
        Ainda não tem conta? <Link href="/criar-conta">Criar conta</Link>
      </p>
    </>
  );
}
