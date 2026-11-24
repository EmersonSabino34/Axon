import { formatPrice } from "@/lib/currency";
import { HeroSlider } from "./HeroSlider";
import { ArrowIcon } from "./LineIcons";

type HeroProps = {
  storeOpen?: boolean;
  /** Preço mais baixo da coleção, em cêntimos. */
  fromPriceCents: number | null;
};

export function Hero({ storeOpen = false, fromPriceCents }: HeroProps) {
  return (
    <section id="inicio" className="hero" aria-labelledby="hero-title">
      <div className="container hero__inner">
        <div className="hero__intro">
          <p className="eyebrow eyebrow--light">Coleção AXON</p>
          <h1 id="hero-title" className="hero__title">
            Pequenos rituais. <em>Uma vida extraordinária.</em>
          </h1>
          <p className="hero__text">
            Vidro âmbar, tampas douradas e o verde profundo da floresta. Uma coleção pensada para transformar um gesto
            de todos os dias num momento só seu.
          </p>
          <div className="hero__actions">
            <a href="#colecao" className="button button--light">
              {storeOpen ? "Comprar a coleção" : "Descobrir a coleção"}
              <ArrowIcon width={16} height={16} />
            </a>
            {fromPriceCents !== null && (
              <p className="hero__price">
                Desde <strong>{formatPrice(fromPriceCents)}</strong>
              </p>
            )}
          </div>
          <p className="hero__note">
            Imagens ilustrativas das embalagens propostas; o design final ainda está em aprovação.
            {!storeOpen && " Esta versão é uma demonstração e ainda não aceita encomendas."}
          </p>
        </div>

        <HeroSlider />
      </div>
    </section>
  );
}
