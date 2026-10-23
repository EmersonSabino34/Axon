import type { Metadata } from "next";
import Link from "next/link";
import { BrandEmblem } from "@/components/BrandEmblem";

export const metadata: Metadata = { title: "Página não encontrada · AXON", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <main id="conteudo" className="not-found">
      <BrandEmblem variant="full" label="AXON" className="not-found__emblem" />
      <p className="eyebrow">Erro 404</p>
      <h1 className="not-found__title">Página não encontrada</h1>
      <p className="not-found__text">
        O endereço pode estar incompleto ou a página já não existe. Se veio de um link de encomenda, confirme que o abriu
        completo.
      </p>
      <Link href="/" className="button button--primary">
        Voltar à loja
      </Link>
    </main>
  );
}
