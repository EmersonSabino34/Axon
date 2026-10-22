import { getProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/ProductGrid";
import { About, CtaBand, Faq, Hero, HowToBuy, Values } from "@/components/Sections";

export default async function Home() {
  const products = await getProducts();
  return (
    <>
      <Hero products={products} />
      <Values />
      <section className="band" id="produtos">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <p className="eyebrow">A linha AXON</p>
              <h2>{products.length === 8 ? "Oito produtos" : `${products.length} produtos`}, uma mesma filosofia.</h2>
            </div>
            <p>Cada produto nasce de um ingrediente de referência e de um propósito claro no seu dia a dia. Escolha pelo formato ou explore a linha completa.</p>
          </div>
          <ProductGrid products={products} />
        </div>
      </section>
      <About />
      <HowToBuy />
      <Faq />
      <CtaBand />
    </>
  );
}
