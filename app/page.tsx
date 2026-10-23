import { BrandStory } from "@/components/BrandStory";
import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/components/CartProvider";
import { Catalog } from "@/components/Catalog";
import { CatalogProvider } from "@/components/CatalogProvider";
import { Contacts } from "@/components/ContactDetails";
import { Faq } from "@/components/Faq";
import { Hero } from "@/components/Hero";
import { Newsletter } from "@/components/Newsletter";
import { ProductDetailsProvider } from "@/components/ProductDetailsProvider";
import { ProductShowcase } from "@/components/ProductShowcase";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TopBar } from "@/components/TopBar";
import { ValuesBand } from "@/components/ValuesBand";
import { getStoreOpenFlag } from "@/lib/server/commerce";
import { getCatalog, getSiteSettings } from "@/lib/server/store";

export default async function HomePage() {
  const [catalog, settings, storeOpen] = await Promise.all([getCatalog(), getSiteSettings(), getStoreOpenFlag()]);

  return (
    <CatalogProvider products={catalog} storeOpen={storeOpen}>
      <CartProvider>
        <ProductDetailsProvider>
          <a href="#conteudo" className="skip-link">
            Saltar para o conteúdo
          </a>
          <TopBar />
          <SiteHeader />
          <main id="conteudo" tabIndex={-1}>
            <Hero storeOpen={storeOpen} />
            <ValuesBand />
            <Catalog />
            <ProductShowcase />
            <BrandStory />
            <Newsletter />
            <Faq storeOpen={storeOpen} />
            <Contacts settings={settings} />
          </main>
          <SiteFooter settings={settings} storeOpen={storeOpen} />
          <CartDrawer />
        </ProductDetailsProvider>
      </CartProvider>
    </CatalogProvider>
  );
}
