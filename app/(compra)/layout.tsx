import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { BrandEmblem } from "@/components/BrandEmblem";
import { ArrowLeftIcon, LockIcon } from "@/components/LineIcons";
import "../contas.css";
import "./compra.css";

export const instant = false;

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Checkout, página da encomenda e simulador de pagamento: cabeçalho simples, sem distrações.
export default function PurchaseLayout({ children }: { children: ReactNode }) {
  return (
    <div className="purchase">
      <header className="account-header">
        <div className="container account-header__inner">
          <Link href="/" className="account-header__brand" aria-label="AXON, página inicial">
            <BrandEmblem />
          </Link>
          <p className="purchase__secure">
            <LockIcon width={16} height={16} />
            Compra segura
          </p>
          <Link href="/#colecao" className="text-button text-button--muted">
            <ArrowLeftIcon width={16} height={16} />
            Continuar a comprar
          </Link>
        </div>
      </header>
      <main id="conteudo" className="container purchase__main">
        {children}
      </main>
    </div>
  );
}
