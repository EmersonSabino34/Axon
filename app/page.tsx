import { BrandStory } from "@/components/BrandStory";
import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/components/CartProvider";
import { Catalog } from "@/components/Catalog";
import { CatalogProvider } from "@/components/CatalogProvider";
import { Contacts } from "@/components/ContactDetails";
import { Faq } from "@/components/Faq";
import { Hero } from "@/components/Hero";
import { Invitation } from "@/components/Invitation";
import { Marquee } from "@/components/Marquee";
import { Newsletter } from "@/components/Newsletter";
import { Origins } from "@/components/Origins";
import { ProductDetailsProvider } from "@/components/ProductDetailsProvider";
import { ProductShowcase } from "@/components/ProductShowcase";
import { Ritual } from "@/components/Ritual";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StickyCta } from "@/components/StickyCta";
import { TopBar } from "@/components/TopBar";
import { lowestPriceCents } from "@/lib/collection";
import { getStoreOpenFlag } from "@/lib/server/commerce";
import { getCatalog, getSiteSettings } from "@/lib/server/store";

export default async function HomePage() {
  const [catalog, settings, storeOpen] = await Promise.all([getCatalog(), getSiteSettings(), getStoreOpenFlag()]);
  const fromPriceCents = lowestPriceCents(catalog);

  return (
    <CatalogProvider products={catalog} storeOpen={storeOpen}>
      <CartProvider>
        <ProductDetailsProvider>
          <a href="#conteudo" className="skip-link">
            Saltar para o conteúdo
          </a>
          <TopBar storeOpen={storeOpen} />
          <SiteHeader />
          <main id="conteudo" tabIndex={-1}>
            <Hero storeOpen={storeOpen} productCount={catalog.length} fromPriceCents={fromPriceCents} />
            <Marquee />
            <Ritual />
            <Catalog />
            <ProductShowcase />
            <Origins />
            <BrandStory />
            <Newsletter />
            <Faq storeOpen={storeOpen} />
            <Invitation storeOpen={storeOpen} />
            <Contacts settings={settings} />
          </main>
          <SiteFooter settings={settings} storeOpen={storeOpen} />
          <StickyCta fromPriceCents={fromPriceCents} />
          <CartDrawer />
        </ProductDetailsProvider>
      </CartProvider>
    </CatalogProvider>
  );
}
