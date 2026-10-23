import Image from "next/image";
import { InfoIcon } from "./LineIcons";
import { BrandEmblem } from "./BrandEmblem";

export function Hero({ storeOpen = false }: { storeOpen?: boolean }) {
  return (
    <section id="inicio" className="hero" aria-labelledby="hero-title">
      <div className="container hero__inner">
        <div className="hero__intro">
          <p className="eyebrow hero__eyebrow">Uma Vida Extraordinária</p>
          <h1 id="hero-title" className="hero__title">
            <span>Escolhas conscientes.</span> <em>Vida extraordinária.</em>
          </h1>
        </div>

        <div className="hero__aside">
          <p className="hero__text">
            Uma marca criada para acompanhar o seu dia a dia com uma apresentação cuidada, informação clara e uma
            experiência de compra simples.
          </p>
          <div className="hero__actions">
            <a href="#colecao" className="button button--primary">
              Explorar coleção
            </a>
            <a href="#marca" className="button button--outline">
              Conhecer a AXON
            </a>
          </div>
          <p className="hero__notice">
            <InfoIcon width={18} height={18} />
            {storeOpen
              ? "Pagamento seguro por MB WAY, referência Multibanco ou cartão. Entregas em Portugal."
              : "Coleção em preparação. Esta versão é uma demonstração e não aceita encomendas."}
          </p>
        </div>

        <figure className="hero-photo">
          <div className="hero-photo__frame">
            <Image
              src="/marca/colecao-axon.webp"
              alt="Coleção AXON: frascos de Própolis, Foco Estudos, Lugol, Libido Feminino e Cravinho, lado a lado sobre pedra, num fundo verde com folhas."
              fill
              sizes="(max-width: 1240px) 100vw, 1160px"
              loading="eager"
              fetchPriority="high"
              className="hero-photo__image"
            />
            <span className="hero-photo__logo" aria-hidden="true">
              <BrandEmblem variant="full" />
            </span>
            <span className="tag tag--mockup hero-photo__tag">Maqueta visual</span>
          </div>
          <figcaption className="hero-photo__caption">
            Composição ilustrativa com as embalagens propostas. O design final ainda está em aprovação.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
