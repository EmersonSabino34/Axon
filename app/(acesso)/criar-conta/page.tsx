import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/account/AuthForms";

export const metadata: Metadata = { title: "Criar conta · AXON" };

export default function SignupPage() {
  return (
    <>
      <p className="eyebrow">Nova conta</p>
      <h1 className="access__title">Junte-se à AXON</h1>
      <p className="access__intro">
        Crie a sua conta para acompanhar a coleção e, quando a loja abrir, as suas encomendas.
      </p>
      <SignupForm />
      <p className="access__note">
        Guardamos apenas o nome, o e-mail, a palavra-passe protegida e as datas de registo e de último acesso. Pode
        eliminar a conta a qualquer momento em «A minha conta».
      </p>
      <p className="access__switch">
        Já tem conta? <Link href="/entrar">Entrar</Link>
      </p>
    </>
  );
}
