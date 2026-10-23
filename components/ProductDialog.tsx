"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { formatLabels, getPhotos, pendingCommon, type Product } from "@/lib/collection";
import { formatPrice } from "@/lib/currency";
import { useCart } from "./CartProvider";
import { useStoreOpen } from "./CatalogProvider";
import { CloseIcon, InfoIcon } from "./LineIcons";
import { ProductGallery } from "./ProductGallery";
import { ProductHighlights } from "./ProductHighlights";

type ProductDialogProps = {
  product: Product | null;
  open: boolean;
  onClose: () => void;
};

export function ProductDialog({ product, open, onClose }: ProductDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { items, addItem, openCart } = useCart();
  const storeOpen = useStoreOpen();
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const close = () => {
    setAnnouncement("");
    onClose();
  };

  // Um clique no fundo escurecido chega ao próprio <dialog>; dentro do conteúdo chega aos filhos.
  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) close();
  };

  const available = product?.status === "disponivel";
  const quantityInCart = product ? (items.find((item) => item.product.slug === product.slug)?.quantity ?? 0) : 0;
  const pending = product ? [...(product.pendingExtra ?? []), ...pendingCommon] : [];

  const add = () => {
    if (!product) return;
    addItem(product.slug);
    setAnnouncement(`${product.name} adicionado ao carrinho${storeOpen ? "" : " de demonstração"}.`);
  };

  const viewCart = () => {
    close();
    openCart();
  };

  return (
    <dialog
      ref={dialogRef}
      className="dialog product-dialog"
      aria-labelledby="product-dialog-title"
      onClose={close}
      onClick={onBackdropClick}
    >
      {product && (
        <div className="product-dialog__inner">
          <button type="button" className="icon-button dialog__close" onClick={close} aria-label="Fechar detalhes">
            <CloseIcon />
          </button>

          <div className="product-dialog__media">
            <ProductGallery
              key={product.slug}
              photos={getPhotos(product)}
              productName={product.name}
              sizes="(max-width: 759px) 100vw, 440px"
            />
            <p className="product-dialog__media-note">
              Imagens ilustrativas da embalagem proposta. As indicações impressas no rótulo (como quantidade ou
              categoria) ainda não estão confirmadas.
            </p>
          </div>

          <div className="product-dialog__content">
            <p className="eyebrow">{formatLabels[product.format]}</p>
            <h2 id="product-dialog-title" className="product-dialog__title">
              {product.name}
            </h2>
            <p className="product-dialog__tagline">{product.tagline}</p>
            <p className={`status-badge${available ? " status-badge--available" : ""}`}>
              {available
                ? storeOpen
                  ? "Disponível para encomenda"
                  : "Disponível · As encomendas online ainda não estão ativas"
                : "Detalhes em preparação · Ainda não disponível para venda"}
            </p>
            <p className="product-dialog__summary">{product.description}</p>
            <ProductHighlights product={product} />

            <h3 className="product-dialog__heading">Informação disponível</h3>
            <dl className="spec-list">
              <div>
                <dt>Formato</dt>
                <dd>{product.formatNote ?? formatLabels[product.format]}</dd>
              </div>
              <div>
                <dt>Embalagem</dt>
                <dd>{product.packaging} (proposta)</dd>
              </div>
              <div>
                <dt>Preço</dt>
                <dd>{formatPrice(product.priceCents)}</dd>
              </div>
              <div>
                <dt>Disponibilidade</dt>
                <dd>
                  {available
                    ? storeOpen
                      ? "Disponível"
                      : "Disponível (encomendas online ainda não ativas)"
                    : "Ainda não disponível para venda"}
                </dd>
              </div>
            </dl>

            <h3 className="product-dialog__heading">Dados por confirmar</h3>
            <ul className="pending-list">
              {pending.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            {product.regulatoryNote && (
              <div className={`notice${product.regulatoryPriority ? " notice--priority" : ""}`}>
                <InfoIcon width={18} height={18} />
                <div>
                  <p className="notice__title">
                    {product.regulatoryPriority ? "Verificação regulamentar prioritária" : "Designação a validar"}
                  </p>
                  <p>{product.regulatoryNote}</p>
                </div>
              </div>
            )}

            <div className="product-dialog__actions">
              {storeOpen && !available ? (
                <button type="button" className="button button--primary" disabled>
                  Ainda não disponível para encomenda
                </button>
              ) : (
                <button type="button" className="button button--primary" onClick={add}>
                  {storeOpen ? "Adicionar ao carrinho" : "Adicionar ao carrinho (demonstração)"}
                </button>
              )}
              {quantityInCart > 0 && (
                <button type="button" className="button button--outline" onClick={viewCart}>
                  Ver carrinho ({quantityInCart})
                </button>
              )}
            </div>
            <p className="product-dialog__fineprint">
              {storeOpen
                ? "Pagamento por MB WAY, referência Multibanco ou cartão. Portes calculados no checkout."
                : "O carrinho serve apenas para testar a experiência de compra. Nenhuma encomenda é processada."}
            </p>
            <p className="sr-only" role="status">
              {announcement}
            </p>
          </div>
        </div>
      )}
    </dialog>
  );
}
