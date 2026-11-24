import { cacheLife } from "next/cache";
import Link from "next/link";
import { legalPages, navItems, siteConfig, type SiteSettings } from "@/lib/site-config";
import { ContactList } from "./ContactDetails";
import { BrandEmblem } from "./BrandEmblem";

// O ano fica na parte estática da página e é recalculado, no máximo, uma vez por dia.
async function getCurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function SiteFooter({ settings, storeOpen = false }: { settings: SiteSettings; storeOpen?: boolean }) {
  const year = await getCurrentYear();
  const { company } = settings;
  const companyDetails = [company.legalName, company.taxId && `NIPC ${company.taxId}`, company.registeredOffice]
    .filter(Boolean)
    .join(" · ");

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <BrandEmblem variant="full" label="AXON — Uma Vida Extraordinária" className="site-footer__emblem" />
          <p className="site-footer__about">
            {storeOpen
              ? "Pagamento por MB WAY, referência Multibanco ou cartão. Entregas em Portugal."
              : "Coleção em preparação. Esta versão do site é uma demonstração e não processa encomendas."}
          </p>
        </div>

        <nav className="site-footer__column" aria-labelledby="footer-nav-title">
          <h2 id="footer-nav-title" className="site-footer__heading">
            Navegação
          </h2>
          <ul className="site-footer__links">
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
            <li>
              <Link href="/conta">A minha conta</Link>
            </li>
          </ul>
        </nav>

        <div id="contactos" className="site-footer__column">
          <h2 className="site-footer__heading">Contactos</h2>
          <ContactList contacts={settings.contacts} className="contact-list--footer" />
        </div>

        <div className="site-footer__column">
          <h2 className="site-footer__heading">Informação legal</h2>
          <ul className="site-footer__links">
            {legalPages.map((page) => {
              const href = settings.legal[page.id];
              return (
                <li key={page.id}>
                  {href ? (
                    <a href={href}>{page.label}</a>
                  ) : (
                    <span className="legal-pending">
                      {page.label} <span className="legal-pending__tag">· pendente</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="container site-footer__bottom">
        <p>
          Entidade responsável:{" "}
          {companyDetails || <span className="pending-text">denominação, NIPC e sede por publicar</span>}
        </p>
        <p>Imagens de produto ilustrativas: embalagens propostas, design final em aprovação.</p>
        <p>
          © {year} {siteConfig.name}. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
