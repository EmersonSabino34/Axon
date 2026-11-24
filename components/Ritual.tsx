"use client";

import { formatPrice } from "@/lib/currency";
import { useCatalog } from "./CatalogProvider";
import { ArrowIcon } from "./LineIcons";
import { useProductDetails } from "./ProductDetailsProvider";

// Três pormenores da embalagem, em três colunas só de texto: as fotografias já estão na coleção logo acima.
// Os textos falam só da embalagem e do momento.
const steps = [
  {
    slug: "propolis",
    kicker: "Vidro âmbar",
    title: "Um gesto preciso, gota a gota.",
    text: "Os líquidos AXON vivem em vidro âmbar, com conta-gotas. Um gesto simples e rigoroso, que se repete com o mesmo cuidado todos os dias — em casa ou em viagem.",
  },
  {
    slug: "foco-estudos",
    kicker: "Dourado e verde-floresta",
    title: "Bonito demais para ficar na gaveta.",
    text: "Tampa dourada, verde profundo e o raminho AXON desenhado a ouro. Na secretária ou na mesa de cabeceira, cada frasco é um pequeno objeto de design.",
  },
  {
    slug: "libido-feminino",
    kicker: "O seu momento",
    title: "Alguns segundos só para si.",
    text: "Abrir, preparar, fazer uma pausa. É nos pequenos gestos repetidos todos os dias que se constrói uma vida extraordinária.",
  },
];

const pad = (value: number) => String(value).padStart(2, "0");

export function Ritual() {
  const products = useCatalog();
  const { openDetails } = useProductDetails();

  const items = steps.flatMap((step) => {
    const product = products.find((item) => item.slug === step.slug);
    return product ? [{ ...step, product }] : [];
  });

  return (
    <section id="ritual" className="section ritual" aria-labelledby="ritual-title">
      <div className="container">
        <header className="section-header section-header--center">
          <p className="eyebrow">Ao pormenor</p>
          <h2 id="ritual-title" className="section-title">
            Um frasco que apetece ter à vista.
          </h2>
        </header>

        <ol className="ritual__list">
          {items.map((item, index) => (
            <li key={item.slug} className="ritual__item">
              <p className="ritual__number" aria-hidden="true">
                {pad(index + 1)}
              </p>
              <p className="ritual__kicker">{item.kicker}</p>
              <h3 className="ritual__title">{item.title}</h3>
              <p className="ritual__text">{item.text}</p>
              <button
                type="button"
                className="text-button"
                aria-haspopup="dialog"
                onClick={() => openDetails(item.product)}
              >
                {item.product.name}
                {item.product.priceCents !== null && ` · ${formatPrice(item.product.priceCents)}`}
                <ArrowIcon width={16} height={16} />
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
