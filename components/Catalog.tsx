"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { filters, formatLabels, getPhotos, matchesFilter, type FilterKey, type Product } from "@/lib/collection";
import { formatPrice } from "@/lib/currency";
import { useCart } from "./CartProvider";
import { useCatalog, useStoreOpen } from "./CatalogProvider";
import { ArrowIcon, BagIcon, CheckIcon, InfoIcon } from "./LineIcons";
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
        <header className="section-header section-header--center">
          <p className="eyebrow">Coleção AXON</p>
          <h2 id="catalog-title" className="section-title" tabIndex={-1}>
            Escolha o seu ritual.
          </h2>
          <p className="section-intro">
            Todas com a mesma assinatura: vidro âmbar ou verde-floresta, pormenores dourados e um design que se
            reconhece à primeira vista. As fichas técnicas são publicadas depois de confirmadas.
          </p>
        </header>

        <div className="catalog__toolbar">
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
          <p className="catalog__status" role="status">
            A mostrar {visible.length} de {products.length} produtos
          </p>
        </div>

        <ul key={filter} className="product-grid">
          {visible.map((product, index) => (
            <li key={product.slug} className="product-grid__item" style={{ animationDelay: `${index * 45}ms` }}>
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

        {formatPending.length > 0 && (
          <p className="catalog__note">
            <InfoIcon width={18} height={18} />
            <span>
              {formatPending.map((product) => product.name).join(", ")} aparece apenas em «Todos» enquanto o
              formato não for confirmado.
            </span>
          </p>
        )}
      </div>
    </section>
  );
}

type ProductCardProps = { product: Product; storeOpen: boolean; onOpen: () => void; onAdd: () => void };

function ProductCard({ product, storeOpen, onOpen, onAdd }: ProductCardProps) {
  const [cover] = getPhotos(product);
  const [added, setAdded] = useState(false);
  // Com a loja aberta, só os produtos disponíveis vão para o carrinho (como nos slides).
  const unavailable = storeOpen && product.status !== "disponivel";
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
        {/* Atalho para o rato: a fotografia abre a ficha, tal como «Saber mais». */}
        <button type="button" className="product-card__open" tabIndex={-1} aria-hidden="true" onClick={onOpen}>
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(max-width: 539px) 36vw, (max-width: 819px) 50vw, (max-width: 1099px) 33vw, 300px"
            className="product-card__image"
          />
        </button>
        <span className="tag tag--mockup product-card__tag">Maqueta</span>
      </div>
      <div className="product-card__body">
        <p className="product-card__category">{formatLabels[product.format]}</p>
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__summary">{product.tagline}</p>
        <p className={`status-badge${product.status === "disponivel" ? " status-badge--available" : ""}`}>
          {product.status === "disponivel" ? "Disponível" : "Detalhes em preparação"}
        </p>
        <div className="product-card__footer">
          <span className={`product-card__price${product.priceCents === null ? " is-pending" : ""}`}>
            {formatPrice(product.priceCents)}
          </span>
          <div className="product-card__actions">
            <button type="button" className="text-button" aria-haspopup="dialog" onClick={onOpen}>
              Saber mais<span className="sr-only"> sobre {product.name}</span>
              <ArrowIcon width={16} height={16} />
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
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
