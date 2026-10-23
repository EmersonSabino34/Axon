import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { LogoutIcon, StoreIcon, UserIcon } from "@/components/LineIcons";
import { getCurrentUser } from "@/lib/server/session";
import { logout } from "../conta/actions";
import "./painel.css";

export const instant = false;

export const metadata: Metadata = {
  title: { template: "%s · Painel AXON", default: "Painel AXON" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin">
      <AdminSidebar
        footer={
          <>
            <Suspense fallback={null}>
              <SignedInAs />
            </Suspense>
            <Link href="/" className="admin-nav__link">
              <StoreIcon />
              Ver loja
            </Link>
            <Link href="/conta" className="admin-nav__link">
              <UserIcon />
              A minha conta
            </Link>
            <form action={logout}>
              <button type="submit" className="admin-nav__link">
                <LogoutIcon />
                Terminar sessão
              </button>
            </form>
          </>
        }
      />
      <main id="conteudo" className="admin__main">
        <Suspense fallback={<p className="loading-note">A carregar…</p>}>{children}</Suspense>
      </main>
    </div>
  );
}

async function SignedInAs() {
  const user = await getCurrentUser();
  if (!user) return null;
  return (
    <p className="admin-sidebar__user">
      <span>Sessão iniciada como</span>
      <strong>{user.name}</strong>
    </p>
  );
}
