"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/collection";
import { ProductDialog } from "./ProductDialog";

type ProductDetailsContextValue = { openDetails: (product: Product) => void };

const ProductDetailsContext = createContext<ProductDetailsContextValue | null>(null);

// Uma única ficha de produto (janela) para a página, aberta a partir da coleção e dos slides.
export function ProductDetailsProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const value = useMemo<ProductDetailsContextValue>(
    () => ({
      openDetails: (product) => {
        setSelected(product);
        setOpen(true);
      },
    }),
    [],
  );

  return (
    <ProductDetailsContext value={value}>
      {children}
      <ProductDialog product={selected} open={open} onClose={() => setOpen(false)} />
    </ProductDetailsContext>
  );
}

export function useProductDetails() {
  const context = useContext(ProductDetailsContext);
  if (!context) throw new Error("useProductDetails tem de ser usado dentro de <ProductDetailsProvider>.");
  return context;
}
