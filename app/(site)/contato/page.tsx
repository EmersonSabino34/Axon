import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { getCustomer } from "@/lib/auth";
import { getProducts } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a AXON pelo WhatsApp ou e-mail.",
};

type Props = { searchParams: Promise<{ produto?: string }> };

export default async function ContatoPage({ searchParams }: Props) {
  const { produto = "" } = await searchParams;
  const [site, products, customer] = await Promise.all([getSettings(), getProducts(), getCustomer()]);
  const note = site.whatsapp.startsWith("550000") ? <em>Dado provisório, edite no painel</em> : null;
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <nav className="crumbs" aria-label="Você está em">
            <Link href="/">Início</Link><span aria-hidden="true">/</span><span>Contato</span>
          </nav>
          <p className="eyebrow">Contato</p>
          <h1>Estamos aqui para ajudar</h1>
          <p className="lead">Dúvidas sobre um produto, pedidos ou parcerias. Respondemos em horário comercial.</p>
        </div>
      </section>
      <section className="band contact">
        <div className="wrap contact-inner">
          <div>
            <p className="eyebrow">Atendimento</p>
            <h2>Fale com a AXON</h2>
            <div className="info">
              <div><span>WhatsApp</span><strong>{site.whatsappDisplay}</strong>{note}</div>
              <div><span>E-mail</span><strong>{site.email}</strong>{note}</div>
              <div><span>Instagram</span><strong>{site.instagram}</strong>{note}</div>
              <div><span>Horário</span><strong>{site.hours}</strong></div>
            </div>
          </div>
          <ContactForm products={products.map((p) => ({ name: p.name, label: p.label }))} defaultProduct={produto} customer={customer && { name: customer.name, phone: customer.phone }} />
        </div>
      </section>
    </>
  );
}
