import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Novo produto" };

export default function NewProduct() {
  return (
    <>
      <div className="adm-head">
        <div><h1>Novo produto</h1><p>O produto aparece no site assim que for salvo como publicado.</p></div>
        <div className="adm-actions"><Link className="btn ghost-adm" href="/admin/produtos">Voltar</Link></div>
      </div>
      <section className="panel"><ProductForm /></section>
    </>
  );
}
