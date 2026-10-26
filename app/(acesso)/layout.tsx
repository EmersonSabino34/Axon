import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeftIcon } from "@/components/LineIcons";
import "../contas.css";

// Páginas de entrar e criar conta: nome, frase e fotografia da coleção à esquerda, formulário à direita.
// A fotografia é larga: fica inteira na base do painel, a fundir-se com o verde, em vez de ampliada e cortada.
export default function AccessLayout({ children }: { children: ReactNode }) {
  return (
    <div className="access">
      <aside className="access__visual" aria-hidden="true">
        <p className="access__wordmark">AXON</p>
        <p className="access__quote">
          Escolhas conscientes. <em>Vida extraordinária.</em>
        </p>
        <div className="access__photo">
          <Image src="/marca/colecao-axon.webp" alt="" fill sizes="(max-width: 899px) 100vw, 50vw" className="access__image" />
        </div>
      </aside>

      <main id="conteudo" className="access__main">
        <header className="access__header">
          <Link href="/" className="access__back">
            <ArrowLeftIcon width={18} height={18} />
            Voltar à loja
          </Link>
          <Link href="/" className="access__logo" aria-label="AXON, página inicial">
            AXON
          </Link>
        </header>
        <div className="access__content">{children}</div>
        <p className="access__footnote">
          Versão de pré-lançamento. A loja ainda não aceita encomendas nem pagamentos.
        </p>
      </main>
    </div>
  );
}
