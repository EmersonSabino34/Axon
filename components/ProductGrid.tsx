"use client";

import { useState } from "react";
import { formatGroups, type Format, type Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products, showFilters = true }: { products: Product[]; showFilters?: boolean }) {
  const [filter, setFilter] = useState<Format | "todos">("todos");
  const list = filter === "todos" ? products : products.filter((p) => p.format === filter);

  return (
    <>
      {showFilters && (
        <div className="filters" role="group" aria-label="Filtrar por formato">
          {formatGroups.filter((g) => g.key === "todos" || products.some((p) => p.format === g.key)).map((g) => (
            <button key={g.key} type="button" aria-pressed={filter === g.key} onClick={() => setFilter(g.key)}>
              {g.label}
            </button>
          ))}
        </div>
      )}
      <div className="grid">
        {list.map((p) => (
          <ProductCard key={p.slug} p={p} />
        ))}
      </div>
    </>
  );
}
