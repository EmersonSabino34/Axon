import type { Metadata } from "next";
import Link from "next/link";
import { CheckIcon } from "@/components/LineIcons";
import { evaluateChecklist } from "@/lib/launch-checklist";
import { requireAdmin } from "@/lib/server/session";
import { readChecklistContext } from "@/lib/server/commerce";
import { readChecklistDone } from "@/lib/server/store";
import { toggleChecklistItem } from "../actions";

export const metadata: Metadata = { title: "Lançamento" };

// Onde resolver cada tarefa automática.
const autoLinks: Record<string, { href: string; label: string }> = {
  precos: { href: "/painel/produtos", label: "Definir preços" },
  portes: { href: "/painel/definicoes", label: "Definir portes" },
  encomendas: { href: "/painel/definicoes", label: "Abrir encomendas" },
  contactos: { href: "/painel/definicoes", label: "Preencher contactos" },
  empresa: { href: "/painel/definicoes", label: "Preencher dados da empresa" },
  "paginas-legais": { href: "/painel/definicoes", label: "Indicar páginas legais" },
};

export default async function AdminLaunchPage() {
  await requireAdmin();
  const checklist = evaluateChecklist(readChecklistDone(), readChecklistContext());
  const progress = Math.round((checklist.completed / checklist.total) * 100);

  return (
    <>
      <header className="admin-page__header">
        <div>
          <p className="eyebrow">Antes de abrir ao público</p>
          <h1 className="admin-page__title">Lançamento</h1>
          <p className="admin-page__lead">
            O que falta confirmar antes de vender. As tarefas automáticas ficam concluídas quando os dados estiverem
            preenchidos no painel.
          </p>
        </div>
      </header>

      <section className="admin-hero admin-hero--compact" aria-label="Progresso">
        <div>
          <p className="admin-hero__value">{progress}%</p>
          <p className="admin-hero__detail">
            {checklist.completed} de {checklist.total} tarefas concluídas
          </p>
        </div>
        <div className="admin-hero__meter">
          <div
            className="meter"
            role="meter"
            aria-label="Preparação para o lançamento"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <span className="meter__fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>

      {checklist.groups.map((group, groupIndex) => (
        <section key={group.title} className="admin-card" aria-labelledby={`grupo-${groupIndex}`}>
          <h2 id={`grupo-${groupIndex}`} className="admin-card__title">
            {group.title}
          </h2>
          <ul className="checklist">
            {group.items.map((item) => (
              <li key={item.id} className={`checklist__item${item.done ? " is-done" : ""}`}>
                <span className="checklist__mark" aria-hidden="true">
                  {item.done && <CheckIcon width={16} height={16} />}
                </span>
                <span className="checklist__text">
                  <span className="checklist__label">
                    {item.label}
                    <span className="sr-only">{item.done ? " (concluída)" : " (por fazer)"}</span>
                  </span>
                  {item.hint && <span className="checklist__hint">{item.hint}</span>}
                </span>
                {item.automatic ? (
                  <span className="checklist__action">
                    <span className="tag tag--auto">Automático</span>
                    {!item.done && autoLinks[item.id] && (
                      <Link href={autoLinks[item.id].href} className="text-button">
                        {autoLinks[item.id].label}
                      </Link>
                    )}
                  </span>
                ) : (
                  <form action={toggleChecklistItem} className="checklist__action">
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="done" value={String(!item.done)} />
                    <button
                      type="submit"
                      className={`button button--small ${item.done ? "button--outline" : "button--primary"}`}
                      aria-label={`${item.done ? "Reabrir" : "Marcar como concluída"}: ${item.label}`}
                    >
                      {item.done ? "Reabrir" : "Marcar como concluída"}
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
