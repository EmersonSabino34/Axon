import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CartProvider } from "@/components/CartProvider";
import { CatalogProvider } from "@/components/CatalogProvider";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { InfoIcon } from "@/components/LineIcons";
import { readCheckoutReadiness } from "@/lib/server/commerce";
import { getCurrentUser } from "@/lib/server/session";
import { readCatalog, readSettings } from "@/lib/server/store";

export const metadata: Metadata = { title: "Finalizar encomenda · AXON" };

export default function CheckoutPage() {
  return (
    <Suspense fallback={<p className="loading-note">A preparar a sua encomenda…</p>}>
      <CheckoutContent />
    </Suspense>
  );
}

async function CheckoutContent() {
  const user = await getCurrentUser();
  const readiness = readCheckoutReadiness();

  if (!readiness.open) {
    return (
      <section className="purchase-closed" aria-labelledby="fechada-title">
        <p className="eyebrow">Encomendas</p>
        <h1 id="fechada-title" className="purchase__title">
          As encomendas online ainda não estão ativas
        </h1>
        <p className="purchase__lead">
          A loja AXON está em preparação. Os produtos que guardou no carrinho continuam lá para quando abrirmos.
        </p>
        {user?.role === "admin" && (
          <div className="notice notice--priority">
            <InfoIcon width={18} height={18} />
            <div>
              <p className="notice__title">Para abrir as encomendas falta:</p>
              <ul className="notice__list">
                {readiness.missing.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p>
                <Link href="/painel/definicoes" className="text-button">
                  Ir para as definições da loja
                </Link>
              </p>
            </div>
          </div>
        )}
        <Link href="/#colecao" className="button button--outline">
          Voltar à coleção
        </Link>
      </section>
    );
  }

  const site = readSettings();
  return (
    <CatalogProvider products={readCatalog()}>
      <CartProvider>
        <CheckoutForm
          methods={readiness.methods}
          commerce={readiness.settings}
          testMode={readiness.testMode}
          defaults={{ name: user?.name ?? "", email: user?.email ?? "" }}
          signedIn={Boolean(user)}
          legal={{ termos: site.legal.termos, privacidade: site.legal.privacidade, envios: site.legal.envios }}
          company={site.company}
        />
      </CartProvider>
    </CatalogProvider>
  );
}
