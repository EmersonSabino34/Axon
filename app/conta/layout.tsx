import Link from "next/link";
import type { ReactNode } from "react";
import { LogoutIcon, StoreIcon } from "@/components/LineIcons";
import { BrandEmblem } from "@/components/BrandEmblem";
import { logout } from "./actions";
import "../contas.css";

export const instant = false;

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="account">
      <header className="account-header">
        <div className="container account-header__inner">
          <Link href="/" className="account-header__brand" aria-label="AXON, página inicial">
            <BrandEmblem />
          </Link>
          <nav className="account-header__actions" aria-label="Conta">
            <Link href="/" className="text-button text-button--muted">
              <StoreIcon width={18} height={18} />
              Ver loja
            </Link>
            <form action={logout}>
              <button type="submit" className="text-button text-button--muted">
                <LogoutIcon width={18} height={18} />
                Terminar sessão
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main id="conteudo" className="container account__main">
        {children}
      </main>
    </div>
  );
}
