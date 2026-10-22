import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductVisual } from "@/components/ProductVisual";
import { toProduct } from "@/lib/catalog";
import { db } from "@/lib/db";

export const metadata = { title: "Editar produto" };

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const p = await db.product.findUnique({ where: { id: (await params).id } });
  if (!p) notFound();
  return (
    <>
      <div className="adm-head">
        <div><h1>{p.name}</h1><p>{p.label}</p></div>
        <div className="adm-actions">
          <Link className="btn ghost-adm" href="/admin/produtos">Voltar</Link>
          <a className="btn ghost-adm" href={`/produtos/${p.slug}`} target="_blank" rel="noopener noreferrer">Ver no site ↗</a>
        </div>
      </div>
      <div className="edit-grid">
        <section className="panel"><ProductForm p={p} /></section>
        <aside className="panel edit-preview">
          <div className="art"><ProductVisual p={toProduct(p)} idSuffix="-edit" /></div>
          <p>Foto definida no campo “Foto do frasco”. Sem foto, o site mostra uma embalagem desenhada.</p>
        </aside>
      </div>
    </>
  );
}
