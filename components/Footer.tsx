import Link from "next/link";

import { getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { Logo } from "./Logo";


export async function Footer() {
  const [products, site] = await Promise.all([getProducts(), getSettings()]);
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div className="footer-brand">
          <Link className="brand" href="/">
            <Logo size={96} full />
          </Link>
          <p>Suplementos naturais. Natureza e ciência em equilíbrio, para apoiar a sua rotina de bem-estar.</p>
        </div>
        <div>
          <h4>Produtos</h4>
          <ul className="footer-products">
            {products.map((p) => (
              <li key={p.slug}>
                <Link href={`/produtos/${p.slug}`}>{p.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>AXON</h4>
          <ul>
            <li><Link href="/sobre">Sobre</Link></li>
            <li><Link href="/#como-comprar">Como comprar</Link></li>
            <li><Link href="/#perguntas">Perguntas frequentes</Link></li>
            <li><Link href="/contato">Contato</Link></li>
          </ul>
        </div>
        <div>
          <h4>Atendimento</h4>
          <ul>
            <li>WhatsApp {site.whatsappDisplay}</li>
            <li>{site.email}</li>
            <li>{site.hours}</li>
          </ul>
        </div>
        <div className="legal">
          <p>
            Este produto não é um medicamento. Não exceder a recomendação diária de consumo indicada na embalagem. Mantenha fora do alcance de crianças.
            Gestantes, lactantes, crianças e pessoas em tratamento devem consultar um profissional de saúde antes do consumo.
          </p>
          <p>© {new Date().getFullYear()} AXON. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
