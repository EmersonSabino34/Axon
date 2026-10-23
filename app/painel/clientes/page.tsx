import type { Metadata } from "next";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { DownloadIcon } from "@/components/LineIcons";
import { formatDateTime, formatShortDate } from "@/lib/dates";
import { requireAdmin } from "@/lib/server/session";
import { listCustomers } from "@/lib/server/users";
import { deleteCustomer } from "../actions";

export const metadata: Metadata = { title: "Clientes" };

export default async function AdminCustomersPage({ searchParams }: PageProps<"/painel/clientes">) {
  await requireAdmin();
  const { q } = await searchParams;
  const search = typeof q === "string" ? q.slice(0, 80) : "";
  const customers = listCustomers(search);

  return (
    <>
      <header className="admin-page__header">
        <div>
          <p className="eyebrow">Contas</p>
          <h1 className="admin-page__title">Clientes</h1>
          <p className="admin-page__lead">Contas criadas no site. Trate estes dados de acordo com o RGPD.</p>
        </div>
        <a href="/painel/clientes/exportar" className="button button--outline" download>
          <DownloadIcon width={18} height={18} />
          Exportar CSV
        </a>
      </header>

      <section className="admin-card">
        <form className="search-form" role="search" action="/painel/clientes">
          <label htmlFor="pesquisa-clientes" className="sr-only">
            Pesquisar por nome ou e-mail
          </label>
          <input
            id="pesquisa-clientes"
            name="q"
            type="search"
            defaultValue={search}
            placeholder="Pesquisar por nome ou e-mail"
            className="field__input"
          />
          <button type="submit" className="button button--primary button--small">
            Pesquisar
          </button>
        </form>

        <p className="admin-card__meta" role="status">
          {customers.length} {customers.length === 1 ? "cliente" : "clientes"}
          {search && ` para «${search}»`}
        </p>

        {customers.length === 0 ? (
          <p className="admin-card__empty">
            {search ? "Nenhum cliente corresponde à pesquisa." : "Ainda não há clientes registados."}
          </p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Nome</th>
                  <th scope="col">E-mail</th>
                  <th scope="col">Registo</th>
                  <th scope="col">Último acesso</th>
                  <th scope="col">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <strong>{customer.name}</strong>
                    </td>
                    <td>
                      <a href={`mailto:${customer.email}`}>{customer.email}</a>
                    </td>
                    <td>{formatShortDate(customer.createdAt)}</td>
                    <td>{customer.lastLoginAt ? formatDateTime(customer.lastLoginAt) : "—"}</td>
                    <td className="data-table__action">
                      <form action={deleteCustomer}>
                        <input type="hidden" name="id" value={customer.id} />
                        <ConfirmSubmit
                          message={`Eliminar a conta de ${customer.name}? Esta ação não pode ser anulada.`}
                          className="text-button text-button--danger"
                        >
                          Eliminar<span className="sr-only"> {customer.name}</span>
                        </ConfirmSubmit>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
