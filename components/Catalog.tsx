"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { filters, formatLabels, getPhotos, matchesFilter, type FilterKey, type Product } from "@/lib/collection";
import { formatPrice } from "@/lib/currency";
import { useCart } from "./CartProvider";
import { useCatalog, useStoreOpen } from "./CatalogProvider";
import { BagIcon, CheckIcon } from "./LineIcons";
import { useProductDetails } from "./ProductDetailsProvider";

export function Catalog() {
  const products = useCatalog();
  const [filter, setFilter] = useState<FilterKey>("todos");
  const { openDetails } = useProductDetails();
  const { addItem } = useCart();
  const storeOpen = useStoreOpen();
  const [announcement, setAnnouncement] = useState("");

  const add = (product: Product) => {
    addItem(product.slug);
    setAnnouncement(`${product.name} adicionado ao carrinho${storeOpen ? "" : " de demonstração"}.`);
  };

  const visible = products.filter((product) => matchesFilter(product, filter));
  const formatPending = filter === "todos" ? [] : products.filter((product) => product.format === "por-confirmar");

  return (
    <section id="colecao" className="section catalog" aria-labelledby="catalog-title">
      <div className="container">
        <header className="catalog__header">
          <div>
            <p className="eyebrow">A coleção</p>
            <h2 id="catalog-title" className="section-title" tabIndex={-1}>
              Escolha o seu ritual.
            </h2>
            <p className="section-intro">
              {products.length} criações, a mesma assinatura: vidro âmbar ou verde-floresta e pormenores dourados.
            </p>
          </div>

          <div className="filter-group" role="group" aria-label="Filtrar produtos por formato">
            {filters.map((item) => (
              <button
                key={item.key}
                type="button"
                className="filter-button"
                aria-pressed={filter === item.key}
                onClick={() => setFilter(item.key)}
              >
                {item.label}
                <span className="filter-button__count" aria-hidden="true">
                  {products.filter((product) => matchesFilter(product, item.key)).length}
                </span>
              </button>
            ))}
          </div>
        </header>

        <p className="sr-only" role="status">
          A mostrar {visible.length} de {products.length} produtos
        </p>

        <ul key={filter} className="product-grid">
          {visible.map((product, index) => (
            <li key={product.slug} className="product-grid__item" style={{ animationDelay: `${index * 50}ms` }}>
              <ProductCard
                product={product}
                storeOpen={storeOpen}
                onOpen={() => openDetails(product)}
                onAdd={() => add(product)}
              />
            </li>
          ))}
        </ul>

        <p className="sr-only" role="status">
          {announcement}
        </p>

        <div className="catalog__notes">
          <p>Imagens ilustrativas das embalagens propostas. As fichas técnicas são publicadas depois de confirmadas.</p>
          {formatPending.length > 0 && (
            <p>
              {formatPending.map((product) => product.name).join(", ")} aparece apenas em «Todos» enquanto o formato
              não for confirmado.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

type ProductCardProps = { product: Product; storeOpen: boolean; onOpen: () => void; onAdd: () => void };

function ProductCard({ product, storeOpen, onOpen, onAdd }: ProductCardProps) {
  const [cover] = getPhotos(product);
  const [added, setAdded] = useState(false);
  const available = product.status === "disponivel";
  // Com a loja aberta, só os produtos disponíveis vão para o carrinho (como na ficha).
  const unavailable = storeOpen && !available;
  const addLabel = unavailable
    ? `${product.name}: ainda não disponível`
    : `Adicionar ${product.name} ao carrinho${storeOpen ? "" : " de demonstração"}`;

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(timer);
  }, [added]);

  return (
    <article className="product-card">
      <div className="product-card__media">
        {/* Atalho para o rato: a fotografia abre a ficha, tal como o nome. */}
        <button type="button" className="product-card__open" tabIndex={-1} aria-hidden="true" onClick={onOpen}>
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(max-width: 699px) 46vw, (max-width: 1099px) 31vw, 290px"
            className="product-card__image"
          />
        </button>
        <button
          type="button"
          className={`product-card__add${added ? " is-added" : ""}`}
          aria-label={addLabel}
          title={addLabel}
          disabled={unavailable}
          onClick={() => {
            onAdd();
            setAdded(true);
          }}
        >
          {added ? <CheckIcon width={18} height={18} /> : <BagIcon width={18} height={18} />}
          <span className="product-card__add-label" aria-hidden="true">
            {unavailable ? "Indisponível" : added ? "Adicionado" : "Adicionar"}
          </span>
        </button>
      </div>
      <div className="product-card__body">
        <h3 className="product-card__name">
          <button type="button" className="product-card__link" aria-haspopup="dialog" onClick={onOpen}>
            {product.name}
          </button>
        </h3>
        <p className={`product-card__price${product.priceCents === null ? " is-pending" : ""}`}>
          {formatPrice(product.priceCents)}
        </p>
        <p className="product-card__summary">{product.tagline}</p>
        <p className={`product-card__meta${available ? " is-available" : ""}`}>
          {formatLabels[product.format]} · {available ? "Disponível" : "Em preparação"}
        </p>
      </div>
    </article>
  );
}
