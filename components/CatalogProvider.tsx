"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Product } from "@/lib/collection";

// Catálogo com as alterações do painel, lido no servidor e partilhado com os componentes do navegador,
// e se a loja está a aceitar encomendas (muda os textos de demonstração e o botão do carrinho).
type CatalogContextValue = { products: Product[]; storeOpen: boolean };

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({
  products,
  storeOpen = false,
  children,
}: {
  products: Product[];
  storeOpen?: boolean;
  children: ReactNode;
}) {
  return <CatalogContext value={{ products, storeOpen }}>{children}</CatalogContext>;
}

function useCatalogContext(): CatalogContextValue {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalog tem de ser usado dentro de <CatalogProvider>.");
  return context;
}

export const useCatalog = (): Product[] => useCatalogContext().products;

export const useStoreOpen = (): boolean => useCatalogContext().storeOpen;
