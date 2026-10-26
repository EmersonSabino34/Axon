import Image from "next/image";
import type { CSSProperties } from "react";
import { formatPrice } from "@/lib/currency";
import { ArrowIcon } from "./LineIcons";
import { BrandEmblem } from "./BrandEmblem";

// Partículas douradas que sobem devagar sobre a fotografia (decorativas, só CSS).
const sparks = [
  { x: 6, delay: 0, duration: 11, size: 3 },
  { x: 14, delay: 4.2, duration: 13, size: 2 },
  { x: 22, delay: 1.6, duration: 10, size: 4 },
  { x: 31, delay: 6.4, duration: 14, size: 2 },
  { x: 39, delay: 2.8, duration: 12, size: 3 },
  { x: 47, delay: 8.1, duration: 11, size: 2 },
  { x: 54, delay: 0.9, duration: 15, size: 3 },
  { x: 62, delay: 5.3, duration: 10, size: 4 },
  { x: 70, delay: 3.5, duration: 13, size: 2 },
  { x: 78, delay: 7.2, duration: 12, size: 3 },
  { x: 86, delay: 1.1, duration: 14, size: 2 },
  { x: 93, delay: 4.8, duration: 11, size: 3 },
];

type HeroProps = {
  storeOpen?: boolean;
  productCount: number;
  /** Preço mais baixo da coleção, em cêntimos. */
  fromPriceCents: number | null;
};

export function Hero({ storeOpen = false, productCount, fromPriceCents }: HeroProps) {
  return (
    <section id="inicio" className="hero" aria-labelledby="hero-title">
      <div className="container hero__inner">
        <div className="hero__intro">
          <p className="eyebrow eyebrow--light hero__eyebrow">Coleção AXON</p>
          <h1 id="hero-title" className="hero__title">
            <span>Pequenos rituais.</span> <em>Uma vida extraordinária.</em>
          </h1>
          <p className="hero__text">
            Vidro âmbar, tampas douradas e o verde profundo da floresta: uma coleção pensada para transformar um
            gesto de todos os dias num momento só seu.
          </p>
          <div className="hero__actions">
            <a href="#colecao" className="button button--gold button--glow">
              Descobrir a coleção
              <ArrowIcon width={16} height={16} />
            </a>
            <a href="#ritual" className="button button--outline-light">
              Ver ao pormenor
            </a>
          </div>
          <ul className="hero__facts">
            <li>
              <strong>{productCount}</strong> criações
            </li>
            {fromPriceCents !== null && (
              <li>
                Desde <strong>{formatPrice(fromPriceCents)}</strong>
              </li>
            )}
            <li>{storeOpen ? "MB WAY, Multibanco ou cartão" : "Lançamento em breve"}</li>
          </ul>
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
            <span className="hero-photo__sheen" aria-hidden="true" />
            <span className="hero-photo__sparks" aria-hidden="true">
              {sparks.map((spark) => (
                <span
                  key={spark.x}
                  style={
                    {
                      "--x": `${spark.x}%`,
                      "--delay": `${spark.delay}s`,
                      "--duration": `${spark.duration}s`,
                      "--size": `${spark.size}px`,
                    } as CSSProperties
                  }
                />
              ))}
            </span>
            <span className="hero-photo__logo" aria-hidden="true">
              <BrandEmblem variant="full" />
            </span>
            <span className="tag tag--mockup hero-photo__tag">Maqueta visual</span>
          </div>
          <figcaption className="hero-photo__caption">
            Composição ilustrativa com as embalagens propostas; o design final ainda está em aprovação.
            {!storeOpen && " Esta versão é uma demonstração e ainda não aceita encomendas."}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
