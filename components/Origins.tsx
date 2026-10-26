"use client";

import Image from "next/image";
import { getPhotos } from "@/lib/collection";
import { formatPrice } from "@/lib/currency";
import { useCatalog } from "./CatalogProvider";
import { ArrowIcon } from "./LineIcons";
import { useProductDetails } from "./ProductDetailsProvider";

// A história de dois ingredientes: etimologia e rota das especiarias. Factos culturais e históricos,
// sem qualquer referência a efeitos no organismo.
const stories = [
  {
    slug: "propolis",
    kicker: "Própolis · do grego",
    title: "Em defesa da cidade.",
    text: "Pro, «diante de»; polis, «cidade». As abelhas recolhem resinas das árvores e usam-nas para selar e proteger a colmeia — a sua cidade. Um ingrediente apreciado há gerações, agora num frasco âmbar AXON.",
  },
  {
    slug: "cravinho",
    kicker: "Cravinho · ilhas Molucas",
    title: "Disputado por impérios.",
    text: "O cravinho é o botão floral seco do craveiro-da-índia, árvore das ilhas Molucas, na atual Indonésia. No início do século XVI, os navegadores portugueses chegaram a estas ilhas e o cravinho tornou-se uma das especiarias mais cobiçadas da Europa.",
  },
];

export function Origins() {
  const products = useCatalog();
  const { openDetails } = useProductDetails();

  const items = stories.flatMap((story) => {
    const product = products.find((item) => item.slug === story.slug);
    return product ? [{ ...story, product, photo: getPhotos(product)[0] }] : [];
  });

  return (
    <section id="origens" className="section origins" aria-labelledby="origins-title">
      <div className="container">
        <header className="section-header section-header--center">
          <p className="eyebrow">Ingredientes com história</p>
          <h2 id="origins-title" className="section-title">
            Há tesouros que atravessam séculos.
          </h2>
          <p className="section-intro">
            Antes de chegarem a um frasco AXON, alguns ingredientes fizeram uma longa viagem. Estas são duas das suas
            histórias.
          </p>
        </header>

        <ul className="origins__list">
          {items.map((item) => (
            <li key={item.slug} className="origin-card">
              <div className="origin-card__media">
                <Image
                  src={item.photo.src}
                  alt={item.photo.alt}
                  fill
                  sizes="(max-width: 899px) 100vw, 600px"
                  className="origin-card__image"
                />
                <span className="tag tag--mockup origin-card__tag">Maqueta</span>
              </div>
              <div className="origin-card__body">
                <p className="origin-card__kicker">{item.kicker}</p>
                <h3 className="origin-card__title">{item.title}</h3>
                <p className="origin-card__text">{item.text}</p>
                <button
                  type="button"
                  className="button button--gold origin-card__button"
                  aria-haspopup="dialog"
                  onClick={() => openDetails(item.product)}
                >
                  Descobrir {item.product.name}
                  {item.product.priceCents !== null && ` · ${formatPrice(item.product.priceCents)}`}
                  <ArrowIcon width={16} height={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
