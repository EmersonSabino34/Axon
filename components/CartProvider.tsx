"use client";

import { createContext, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import type { Product } from "@/lib/collection";
import * as cartStore from "@/lib/cart-store";
import { useCatalog } from "./CatalogProvider";

export type CartItem = { product: Product; quantity: number };

type CartContextValue = {
  items: CartItem[];
  count: number;
  /** Subtotal em cêntimos, ou `null` enquanto algum artigo não tiver preço configurado. */
  subtotalCents: number | null;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const lines = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
  const catalog = useCatalog();
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo<CartContextValue>(() => {
    const items = lines.flatMap((line) => {
      // Artigos de produtos que já não existem no catálogo são ignorados.
      const product = catalog.find((item) => item.slug === line.slug);
      return product ? [{ product, quantity: line.quantity }] : [];
    });
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const allPriced = items.length > 0 && items.every((item) => item.product.priceCents !== null);
    const subtotalCents = allPriced
      ? items.reduce((sum, item) => sum + (item.product.priceCents ?? 0) * item.quantity, 0)
      : null;

    return {
      items,
      count,
      subtotalCents,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem: cartStore.addItem,
      setQuantity: cartStore.setQuantity,
      removeItem: cartStore.removeItem,
      clearCart: cartStore.clearCart,
    };
  }, [lines, isOpen, catalog]);

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart tem de ser usado dentro de <CartProvider>.");
  return context;
}
