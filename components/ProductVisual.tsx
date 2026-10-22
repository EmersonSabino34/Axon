import type { Product } from "@/lib/products";
import { Pack } from "./Pack";

// Foto do frasco quando existe; senão, a embalagem desenhada em SVG.
export function ProductVisual({ p, className, idSuffix = "", priority = false }: { p: Product; className?: string; idSuffix?: string; priority?: boolean }) {
  if (p.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img className={`${className ?? ""} photo`} src={p.image} alt={`AXON ${p.name} ${p.label.toLowerCase()}`} loading={priority ? "eager" : "lazy"} />
    );
  }
  return <Pack p={p} className={className} idSuffix={idSuffix} />;
}
