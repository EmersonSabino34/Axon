"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { getPhotos } from "@/lib/collection";
import { formatPrice } from "@/lib/currency";
import { useCatalog } from "./CatalogProvider";
import { ArrowIcon } from "./LineIcons";
import { useProductDetails } from "./ProductDetailsProvider";

// Três pormenores da embalagem, contados ao percorrer a página: no computador a fotografia fica fixa
// e muda com o texto; no telemóvel cada passo traz a sua. Os textos falam só da embalagem e do momento.
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
    text: "Tampa dourada, verde profundo e o raminho AXON desenhado a ouro. Na secretária, na mesa de cabeceira ou na bancada da cozinha, cada frasco é um pequeno objeto de design.",
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
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  const items = steps.flatMap((step) => {
    const product = products.find((item) => item.slug === step.slug);
    return product ? [{ ...step, product, photo: getPhotos(product)[0] }] : [];
  });

  // O passo que atravessa o meio do ecrã escolhe a fotografia.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActive(Number((visible.target as HTMLElement).dataset.step));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    stepRefs.current.forEach((step) => {
      if (step) observer.observe(step);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section id="ritual" className="section ritual" aria-labelledby="ritual-title">
      <div className="container">
        <header className="section-header section-header--center">
          <p className="eyebrow">Ao pormenor</p>
          <h2 id="ritual-title" className="section-title">
            Um frasco que apetece ter à vista.
          </h2>
          <p className="section-intro">
            Cada pormenor da coleção AXON foi desenhado para transformar um gesto simples num pequeno prazer diário.
          </p>
        </header>

        <div className="ritual__layout">
          <div className="ritual__stage" aria-hidden="true">
            <div className="ritual__frame">
              {items.map((item, index) => (
                <Image
                  key={item.slug}
                  src={item.photo.src}
                  alt=""
                  fill
                  sizes="560px"
                  className={`ritual__image${index === active ? " is-active" : ""}`}
                />
              ))}
              <span className="tag tag--mockup ritual__tag">Maqueta</span>
            </div>
            <ol className="ritual__dots">
              {items.map((item, index) => (
                <li key={item.slug} className={index === active ? "is-active" : undefined} />
              ))}
            </ol>
          </div>

          <ol className="ritual__steps">
            {items.map((item, index) => (
              <li
                key={item.slug}
                ref={(element) => {
                  stepRefs.current[index] = element;
                }}
                data-step={index}
                className={`ritual__step${index === active ? " is-active" : ""}`}
              >
                <div className="ritual__step-media">
                  <Image src={item.photo.src} alt={item.photo.alt} fill sizes="92vw" />
                  <span className="tag tag--mockup ritual__tag">Maqueta</span>
                </div>
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
                  Ver {item.product.name}
                  {item.product.priceCents !== null && ` · ${formatPrice(item.product.priceCents)}`}
                  <ArrowIcon width={16} height={16} />
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
