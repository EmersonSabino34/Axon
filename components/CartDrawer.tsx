"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { formatLabels, getPhotos } from "@/lib/collection";
import { formatPrice } from "@/lib/currency";
import { MAX_QUANTITY } from "@/lib/cart-store";
import { commerceSetupSteps } from "@/lib/site-config";
import { useCart } from "./CartProvider";
import { useStoreOpen } from "./CatalogProvider";
import { BagIcon, CloseIcon, InfoIcon, MinusIcon, PlusIcon } from "./LineIcons";

export function CartDrawer() {
  const { items, count, subtotalCents, isOpen, closeCart, setQuantity, removeItem, clearCart } = useCart();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const storeOpen = useStoreOpen();
  const [checkoutNotice, setCheckoutNotice] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const close = () => {
    setCheckoutNotice(false);
    setAnnouncement("");
    closeCart();
    // Se o elemento que abriu o carrinho já não estiver visível (ex.: estava numa janela fechada),
    // devolve o foco ao botão do carrinho no cabeçalho.
    requestAnimationFrame(() => {
      const active = document.activeElement;
      if (!active || active === document.body || active.closest("dialog:not([open])")) {
        document.getElementById("cart-toggle")?.focus();
      }
    });
  };

  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) close();
  };

  const remove = (slug: string, name: string) => {
    removeItem(slug);
    setAnnouncement(`${name} removido do carrinho.`);
  };

  const exploreCollection = () => {
    close();
    requestAnimationFrame(() => {
      document.getElementById("catalog-title")?.focus({ preventScroll: true });
      document.getElementById("colecao")?.scrollIntoView();
    });
  };

  return (
    <dialog ref={dialogRef} className="dialog cart-drawer" aria-labelledby="cart-title" onClose={close} onClick={onBackdropClick}>
      <div className="cart-drawer__inner">
        <header className="cart-drawer__header">
          <h2 id="cart-title" className="cart-drawer__title">
            Carrinho <span className="cart-drawer__count">({count})</span>
          </h2>
          <button type="button" className="icon-button" onClick={close} aria-label="Fechar carrinho">
            <CloseIcon />
          </button>
        </header>

        {!storeOpen && (
          <p className="cart-drawer__banner">
            <InfoIcon width={16} height={16} />
            Demonstração: esta versão não processa encomendas.
          </p>
        )}

        {items.length === 0 ? (
          <div className="cart-empty">
            <span className="cart-empty__icon">
              <BagIcon width={28} height={28} />
            </span>
            <p className="cart-empty__title">O seu carrinho está vazio.</p>
            <p className="cart-empty__text">Explore a coleção e abra a ficha de um produto para o adicionar.</p>
            <button type="button" className="button button--outline" onClick={exploreCollection}>
              Explorar coleção
            </button>
          </div>
        ) : (
          <ul className="cart-list">
            {items.map(({ product, quantity }) => (
              <li key={product.slug} className="cart-line">
                <div className="cart-line__media">
                  <Image src={getPhotos(product)[0].src} alt="" fill sizes="72px" />
                </div>
                <div className="cart-line__info">
                  <p className="cart-line__name">{product.name}</p>
                  <p className="cart-line__meta">{formatLabels[product.format]}</p>
                  <p className="cart-line__price">{formatPrice(product.priceCents)}</p>
                  <div className="cart-line__controls">
                    <div className="stepper" role="group" aria-label={`Quantidade de ${product.name}`}>
                      <button
                        type="button"
                        className="stepper__button"
                        onClick={() => setQuantity(product.slug, quantity - 1)}
                        aria-label={quantity === 1 ? `Remover ${product.name}` : `Diminuir quantidade de ${product.name}`}
                      >
                        <MinusIcon width={16} height={16} />
                      </button>
                      <span className="stepper__value" aria-live="polite">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        className="stepper__button"
                        onClick={() => setQuantity(product.slug, quantity + 1)}
                        disabled={quantity >= MAX_QUANTITY}
                        aria-label={`Aumentar quantidade de ${product.name}`}
                      >
                        <PlusIcon width={16} height={16} />
                      </button>
                    </div>
                    <button type="button" className="text-button text-button--muted" onClick={() => remove(product.slug, product.name)}>
                      Remover<span className="sr-only"> {product.name}</span>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {items.length > 0 && (
          <footer className="cart-drawer__footer">
            <div className="cart-summary">
              <span>Subtotal</span>
              <strong>{subtotalCents === null ? "A confirmar" : formatPrice(subtotalCents)}</strong>
            </div>
            {subtotalCents === null && (
              <p className="cart-summary__note">O subtotal é calculado quando os preços dos produtos estiverem configurados.</p>
            )}

            {storeOpen ? (
              <Link href="/checkout" className="button button--primary button--block" onClick={closeCart}>
                Finalizar encomenda
              </Link>
            ) : checkoutNotice ? (
              <div className="notice notice--priority" role="alert">
                <InfoIcon width={18} height={18} />
                <div>
                  <p className="notice__title">As encomendas ainda não estão ativas</p>
                  <p>Antes de aceitar encomendas reais é necessário configurar:</p>
                  <ul className="notice__list">
                    {commerceSetupSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="button button--primary button--block"
                onClick={() => setCheckoutNotice(true)}
                aria-describedby="checkout-help"
              >
                Finalizar encomenda
              </button>
            )}
            <p id="checkout-help" className="cart-drawer__fineprint">
              {storeOpen
                ? "Pagamento seguro por MB WAY, referência Multibanco ou cartão."
                : "Nenhum pagamento é pedido e o carrinho não recolhe dados pessoais."}
            </p>
            <button type="button" className="text-button text-button--muted cart-drawer__clear" onClick={clearCart}>
              Esvaziar carrinho
            </button>
          </footer>
        )}

        <p className="sr-only" role="status">
          {announcement}
        </p>
      </div>
    </dialog>
  );
}
