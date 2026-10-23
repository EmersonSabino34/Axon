"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { formatLabels, getPhotos } from "@/lib/collection";
import { formatPrice } from "@/lib/currency";
import { useCart } from "./CartProvider";
import { useCatalog, useStoreOpen } from "./CatalogProvider";
import { ArrowIcon, ArrowLeftIcon } from "./LineIcons";
import { useProductDetails } from "./ProductDetailsProvider";
import { ProductGallery } from "./ProductGallery";
import { ProductHighlights } from "./ProductHighlights";

const pad = (value: number) => String(value).padStart(2, "0");

// Um slide por produto: galeria de 6 fotos à esquerda, apresentação à direita.
export function ProductShowcase() {
  const products = useCatalog();
  const storeOpen = useStoreOpen();
  const [index, setIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const { openDetails } = useProductDetails();
  const { items, addItem, openCart } = useCart();
  const [announcement, setAnnouncement] = useState("");

  const product = products[index];
  const total = products.length;
  const quantityInCart = items.find((item) => item.product.slug === product.slug)?.quantity ?? 0;

  const select = (next: number, focusTab = false) => {
    const wrapped = (next + total) % total;
    setIndex(wrapped);
    setAnnouncement("");
    if (focusTab) tabRefs.current[wrapped]?.focus();
  };

  // Separadores com ativação automática: setas, Home e End mudam de produto.
  const onTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: total - 1 }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    select(target, true);
  };

  const add = () => {
    addItem(product.slug);
    setAnnouncement(`${product.name} adicionado ao carrinho${storeOpen ? "" : " de demonstração"}.`);
  };

  return (
    <section id="em-detalhe" className="section showcase" aria-labelledby="showcase-title">
      <div className="container">
        <header className="section-header section-header--center">
          <p className="eyebrow eyebrow--light">Em detalhe</p>
          <h2 id="showcase-title" className="section-title section-title--light">
            Conheça cada produto
          </h2>
          <p className="section-intro showcase__intro">
            Seis olhares sobre cada embalagem e tudo o que já pode saber sobre a coleção AXON.
          </p>
        </header>

        <div className="showcase__tabs" role="tablist" aria-label="Produtos AXON" onKeyDown={onTabKeyDown}>
          {products.map((item, itemIndex) => (
            <button
              key={item.slug}
              ref={(element) => {
                tabRefs.current[itemIndex] = element;
              }}
              type="button"
              role="tab"
              id={`slide-tab-${item.slug}`}
              className="showcase__tab"
              aria-selected={itemIndex === index}
              aria-controls="slide-painel"
              tabIndex={itemIndex === index ? 0 : -1}
              onClick={() => select(itemIndex)}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div
          key={product.slug}
          id="slide-painel"
          role="tabpanel"
          aria-labelledby={`slide-tab-${product.slug}`}
          className="showcase__slide"
        >
          <ProductGallery
            key={product.slug}
            photos={getPhotos(product)}
            productName={product.name}
            sizes="(max-width: 899px) 100vw, 560px"
          />

          <div className="showcase__content">
            <div className="showcase__meta">
              <p className="eyebrow eyebrow--light">{formatLabels[product.format]}</p>
              <p className="showcase__index" aria-label={`Produto ${index + 1} de ${total}`}>
                {pad(index + 1)} / {pad(total)}
              </p>
            </div>
            <h3 className="showcase__name">{product.name}</h3>
            <p className="showcase__tagline">{product.tagline}</p>
            <p className="showcase__description">{product.description}</p>
            <ProductHighlights product={product} />
            <p className="status-badge status-badge--light">
              {product.status === "disponivel" ? "Disponível" : "Detalhes em preparação"} · {formatPrice(product.priceCents)}
            </p>

            <div className="showcase__actions">
              <button type="button" className="button button--gold" aria-haspopup="dialog" onClick={() => openDetails(product)}>
                Ver ficha completa
              </button>
              {storeOpen && product.status !== "disponivel" ? (
                <button type="button" className="button button--outline-light" disabled>
                  Ainda não disponível
                </button>
              ) : (
                <button type="button" className="button button--outline-light" onClick={add}>
                  {storeOpen ? "Adicionar ao carrinho" : "Adicionar ao carrinho (demonstração)"}
                </button>
              )}
            </div>
            {quantityInCart > 0 && (
              <button type="button" className="text-button text-button--light" onClick={openCart}>
                Ver carrinho ({quantityInCart})
                <ArrowIcon width={16} height={16} />
              </button>
            )}

            <div className="showcase__nav">
              <button type="button" className="icon-button icon-button--light" onClick={() => select(index - 1)} aria-label="Produto anterior">
                <ArrowLeftIcon />
              </button>
              <button type="button" className="icon-button icon-button--light" onClick={() => select(index + 1)} aria-label="Produto seguinte">
                <ArrowIcon />
              </button>
              <span className="showcase__next">
                A seguir: {products[(index + 1) % total].name}
              </span>
            </div>
            <p className="sr-only" role="status">
              {announcement}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
