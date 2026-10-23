import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { formatLabels, getPhotos, statusLabels } from "@/lib/collection";
import { formatPrice } from "@/lib/currency";
import { formatDateTime } from "@/lib/dates";
import { requireAdmin } from "@/lib/server/session";
import { readCatalog } from "@/lib/server/store";

export const metadata: Metadata = { title: "Produtos" };

export default async function AdminProductsPage() {
  await requireAdmin();
  const catalog = readCatalog();

  return (
    <>
      <header className="admin-page__header">
        <div>
          <p className="eyebrow">Coleção</p>
          <h1 className="admin-page__title">Produtos</h1>
          <p className="admin-page__lead">
            Preço, stock, estado e textos de cada produto. As alterações aparecem de imediato na loja.
          </p>
        </div>
      </header>

      <section className="admin-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Produto</th>
                <th scope="col">Formato</th>
                <th scope="col" className="data-table__number">
                  Preço
                </th>
                <th scope="col" className="data-table__number">
                  Stock
                </th>
                <th scope="col">Estado</th>
                <th scope="col">Última alteração</th>
                <th scope="col">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {catalog.map((product) => (
                <tr key={product.slug}>
                  <td>
                    <span className="product-cell">
                      <span className="product-cell__thumb">
                        <Image src={getPhotos(product)[0].src} alt="" fill sizes="40px" />
                      </span>
                      <span>
                        <strong>{product.name}</strong>
                        {product.regulatoryPriority && <span className="tag tag--warning">Verificação prioritária</span>}
                      </span>
                    </span>
                  </td>
                  <td>{formatLabels[product.format]}</td>
                  <td className="data-table__number">{formatPrice(product.priceCents)}</td>
                  <td className="data-table__number">{product.stock}</td>
                  <td>
                    <span className={`status-pill status-pill--${product.status}`}>{statusLabels[product.status]}</span>
                  </td>
                  <td>{product.updatedAt ? formatDateTime(product.updatedAt) : <span className="pending-text">Valores de base</span>}</td>
                  <td className="data-table__action">
                    <Link href={`/painel/produtos/${product.slug}`} className="button button--outline button--small">
                      Editar<span className="sr-only"> {product.name}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
