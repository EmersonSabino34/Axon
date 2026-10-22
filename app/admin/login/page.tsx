import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/Logo";
import { getAdmin } from "@/lib/auth";
import "../admin.css";

export const metadata: Metadata = { title: "Entrar | Painel AXON", robots: { index: false } };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <div className="login">
      <div className="login-box">
        <Logo size={80} className="logo" />
        <h1>Painel AXON</h1>
        <p className="sub">Acesso restrito à equipe.</p>
        <LoginForm />
      </div>
    </div>
  );
}
