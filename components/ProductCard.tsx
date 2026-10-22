import Link from "next/link";
import type { Product } from "@/lib/products";
import { ProductVisual } from "./ProductVisual";

export function ProductCard({ p, idSuffix = "" }: { p: Product; idSuffix?: string }) {
  return (
    <Link className="card" href={`/produtos/${p.slug}`} data-format={p.format}>
      <div className="card-art">
        <ProductVisual p={p} className="card-pack" idSuffix={idSuffix} />
      </div>
      <div className="card-body">
        <h3>{p.name}</h3>
        <p className="card-tagline">{p.tagline}</p>
        <p className="card-format">
          {p.formatLabel} · {p.size}
        </p>
      </div>
    </Link>
  );
}
