import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyButton, TrackView } from "@/components/Tracking";
import { BenefitIcon } from "@/components/Icons";
import { ProductVisual } from "@/components/ProductVisual";
import { ProductCard } from "@/components/ProductCard";
import { getProductBySlug, getProducts, pickRelated } from "@/lib/catalog";
import { brl } from "@/lib/format";
import { benefitLabels } from "@/lib/products";
import { getSettings, whatsappLink } from "@/lib/settings";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  if (!p) return {};
  return { title: `${p.name} · ${p.label}`, description: `${p.tagline} ${p.intro}` };
}

export default async function ProductPage({ params }: Props) {
  const p = await getProductBySlug((await params).slug);
  if (!p) notFound();
  const [all, settings] = await Promise.all([getProducts(), getSettings()]);

  const buy = whatsappLink(settings.whatsapp, `Olá! Quero comprar o AXON ${p.name} (${p.formatLabel.toLowerCase()}, ${p.size}).`);

  return (
    <>
      <TrackView productId={p.id!} />
      <div className="pd-hero">
        <div className="wrap">
          <nav className="crumbs" aria-label="Você está em">
            <Link href="/">Início</Link><span aria-hidden="true">/</span>
            <Link href="/produtos">Produtos</Link><span aria-hidden="true">/</span>
            <span>{p.name}</span>
          </nav>
        </div>
      </div>

      <div className="wrap pd">
        <div className="pd-visual">
          <ProductVisual p={p} className="pd-pack" idSuffix="-pd" priority />
        </div>

        <div>
          <p className="pd-format">{p.formatLabel} · {p.size}</p>
          <h1>{p.name}</h1>
          <p className="pd-label">{p.label}</p>
          <p className="pd-intro">{p.intro}</p>
          <ul className="pd-details">
            {p.details.map((d) => <li key={d}>{d}</li>)}
          </ul>

          <ul className="pd-benefits" aria-label="Benefícios">
            {p.benefits.map((b) => (
              <li key={b}><BenefitIcon name={b} /><span>{benefitLabels[b] ?? b}</span></li>
            ))}
          </ul>

          <dl className="specs">
            <div><dt>Formato</dt><dd>{p.formatLabel}</dd></div>
            <div><dt>Conteúdo</dt><dd className={p.size === "A definir" ? "tbc" : undefined}>{p.size}</dd></div>
            <div><dt>Ingrediente de referência</dt><dd>{p.reference}</dd></div>
            <div><dt>Modo de uso</dt><dd className="tbc">Conforme a recomendação do rótulo</dd></div>
            <div><dt>Preço</dt><dd className={p.priceCents == null ? "tbc" : "pd-price"}>{brl(p.priceCents)}</dd></div>
          </dl>

          <div className="pd-ctas">
            <BuyButton productId={p.id!} href={buy} />
            <Link className="btn outline-dark" href={`/contato?produto=${encodeURIComponent(p.name)}`}>Tirar dúvidas</Link>
          </div>

          {p.routine.length > 0 && (
            <section className="routine" aria-labelledby="rotina">
              <h2 id="rotina">Na sua rotina</h2>
              <ol>{p.routine.map((r) => <li key={r}>{r}</li>)}</ol>
            </section>
          )}

          <p className="pd-note">
            {p.toConfirm ? `${p.toConfirm} ` : ""}
            Este produto não é um medicamento. Não exceder a recomendação diária indicada na embalagem. Em caso de gravidez, amamentação ou uso de medicamentos, consulte um profissional de saúde.
          </p>
        </div>
      </div>

      <section className="related">
        <div className="wrap">
          <h2>Combine com</h2>
          <div className="grid">
            {pickRelated(all, p).map((r) => <ProductCard key={r.slug} p={r} idSuffix="-rel" />)}
          </div>
        </div>
      </section>
    </>
  );
}
