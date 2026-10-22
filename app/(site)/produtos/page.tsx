import type { Metadata } from "next";
import Link from "next/link";
import { getProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/ProductGrid";
import { CtaBand } from "@/components/Sections";

export const metadata: Metadata = {
  title: "Produtos",
  description: "Conheça os oito suplementos naturais AXON: Lugol, Própolis, Cravinho, Desintoxicação pelos Pés, Emagrecedor, Foco Estudos, Libido Feminina e Desparasitante.",
};

export default async function ProdutosPage() {
  const products = await getProducts();
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <nav className="crumbs" aria-label="Você está em">
            <Link href="/">Início</Link><span aria-hidden="true">/</span><span>Produtos</span>
          </nav>
          <p className="eyebrow">A linha AXON</p>
          <h1>Nossos produtos</h1>
          <p className="lead">Gotas, cápsulas e sachês. Cada produto com um propósito claro no seu dia a dia.</p>
        </div>
      </section>
      <section className="band">
        <div className="wrap">
          <ProductGrid products={products} />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
