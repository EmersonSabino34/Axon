import type { Product as DbProduct } from "@prisma/client";
import { saveProduct } from "@/app/admin/actions";
import { benefitKeys, benefitLabels } from "@/lib/products";
import { ActionForm } from "./ActionForm";

export function ProductForm({ p }: { p?: DbProduct }) {
  const b = (p?.benefits ?? "").split(",");
  const price = p?.priceCents != null ? (p.priceCents / 100).toFixed(2).replace(".", ",") : "";
  return (
    <ActionForm action={saveProduct} submit={p ? "Salvar alterações" : "Criar produto"}>
      {p && <input type="hidden" name="id" value={p.id} />}
      <label>Nome<input id="p-name" name="name" defaultValue={p?.name} required /></label>
      <label>Endereço na web (slug)<small>Aparece em /produtos/…</small><input id="p-slug" name="slug" defaultValue={p?.slug} required /></label>
      <label>Linha do rótulo<small>Ex.: Equilíbrio intestinal</small><input id="p-label" name="label" defaultValue={p?.label} /></label>
      <label>Frase do card<input id="p-tagline" name="tagline" defaultValue={p?.tagline} /></label>
      <label>Tipo de embalagem
        <select id="p-format" name="format" defaultValue={p?.format ?? "capsulas"}>
          <option value="liquido">Frasco conta-gotas (líquido)</option>
          <option value="capsulas">Pote de cápsulas</option>
          <option value="sache">Sachê</option>
        </select>
      </label>
      <label>Formato como aparece<small>Ex.: Solução oral, Cápsulas</small><input id="p-formatLabel" name="formatLabel" defaultValue={p?.formatLabel} /></label>
      <label>Conteúdo<small>Ex.: 50 ml, 60 un.</small><input id="p-size" name="size" defaultValue={p?.size} /></label>
      <label>Ingrediente de referência<input id="p-reference" name="reference" defaultValue={p?.reference} /></label>
      <label>Preço (R$)<small>Em branco = “Sob consulta”</small><input id="p-price" name="price" inputMode="decimal" defaultValue={price} placeholder="0,00" /></label>
      <label>Estoque (unidades)<input id="p-stock" name="stock" type="number" min={0} defaultValue={p?.stock ?? 0} /></label>
      <div className="full field">
        Benefícios (3 ícones)
        <div className="form" style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[0, 1, 2].map((i) => (
            <select key={i} id={`p-b${i + 1}`} name={`b${i + 1}`} defaultValue={b[i] ?? ""} aria-label={`Benefício ${i + 1}`}>
              <option value="">Escolher…</option>
              {benefitKeys.map((k) => <option key={k} value={k}>{benefitLabels[k]}</option>)}
            </select>
          ))}
        </div>
      </div>
      <label className="full">Texto de apresentação<textarea id="p-intro" name="intro" defaultValue={p?.intro} rows={4} /></label>
      <label className="full">Destaques<small>Um por linha</small><textarea id="p-details" name="details" defaultValue={p?.details} rows={3} /></label>
      <label className="full">Na sua rotina<small>Até 3 passos, um por linha</small><textarea id="p-routine" name="routine" defaultValue={p?.routine} rows={3} /></label>
      <label className="full">Observação<small>Ex.: formato ainda em definição. Aparece no fim da página.</small><input id="p-toConfirm" name="toConfirm" defaultValue={p?.toConfirm ?? ""} /></label>
      <label className="full">Foto do frasco<small>Caminho do ficheiro em /public, ex.: /produtos/lugol.webp (imagem com fundo transparente). Em branco usa a embalagem desenhada.</small><input id="p-image" name="image" defaultValue={p?.image ?? ""} /></label>
      <label>Ordem no catálogo<input id="p-sort" name="sortOrder" type="number" defaultValue={p?.sortOrder ?? 0} /></label>
      <div className="field" style={{ justifyContent: "flex-end", gap: 10 }}>
        <label className="check"><input id="p-active" type="checkbox" name="active" defaultChecked={p?.active ?? true} /> Publicado no site</label>
        <label className="check"><input id="p-supplement" type="checkbox" name="supplement" defaultChecked={p?.supplement ?? true} /> Mostrar “Suplemento alimentar” no rótulo</label>
      </div>
    </ActionForm>
  );
}
