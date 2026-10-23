import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm, ResetProductButton } from "@/components/admin/ProductForm";
import { ArrowLeftIcon, InfoIcon } from "@/components/LineIcons";
import { formatLabels, getPhotos, pendingCommon } from "@/lib/collection";
import { requireAdmin } from "@/lib/server/session";
import { readProduct } from "@/lib/server/store";

export const metadata: Metadata = { title: "Editar produto" };

export default async function EditProductPage({ params }: PageProps<"/painel/produtos/[slug]">) {
  await requireAdmin();
  const { slug } = await params;
  const product = readProduct(slug);
  if (!product) notFound();
  const [cover] = getPhotos(product);

  return (
    <>
      <Link href="/painel/produtos" className="back-link">
        <ArrowLeftIcon width={16} height={16} />
        Produtos
      </Link>

      <header className="admin-page__header admin-page__header--product">
        <span className="admin-page__thumb">
          <Image src={cover.src} alt={cover.alt} fill sizes="96px" />
        </span>
        <div>
          <p className="eyebrow">{formatLabels[product.format]}</p>
          <h1 className="admin-page__title">{product.name}</h1>
          <p className="admin-page__lead">{product.packaging}</p>
        </div>
      </header>

      <div className="admin-columns admin-columns--form">
        <section className="admin-card">
          <ProductForm product={product} />
        </section>

        <aside className="admin-side">
          {product.regulatoryNote && (
            <div className={`notice${product.regulatoryPriority ? " notice--priority" : ""}`}>
              <InfoIcon width={18} height={18} />
              <div>
                <p className="notice__title">
                  {product.regulatoryPriority ? "Verificação regulamentar prioritária" : "Designação a validar"}
                </p>
                <p>{product.regulatoryNote}</p>
              </div>
            </div>
          )}
          <section className="admin-card admin-card--muted">
            <h2 className="admin-card__title">Dados por confirmar</h2>
            <ul className="task-list">
              {[...(product.pendingExtra ?? []), ...pendingCommon].map((item) => (
                <li key={item}>
                  <span className="task-list__dot" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section className="admin-card admin-card--muted">
            <h2 className="admin-card__title">Valores de base</h2>
            <p className="admin-card__text">
              Volte ao preço, stock, estado e textos definidos no código (lib/collection.ts).
            </p>
            <ResetProductButton slug={product.slug} disabled={!product.updatedAt} />
          </section>
        </aside>
      </div>
    </>
  );
}
