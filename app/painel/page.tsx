import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SignupsChart } from "@/components/admin/SignupsChart";
import { ArrowIcon, InfoIcon } from "@/components/LineIcons";
import { formatLabels, getPhotos, statusLabels } from "@/lib/collection";
import { orderStatusLabels } from "@/lib/commerce";
import { formatPrice } from "@/lib/currency";
import { formatDateTime, formatShortDate, formatToday } from "@/lib/dates";
import { evaluateChecklist } from "@/lib/launch-checklist";
import { requireAdmin } from "@/lib/server/session";
import { readChecklistContext, readCheckoutReadiness } from "@/lib/server/commerce";
import { listOrders, orderStats } from "@/lib/server/orders";
import { readChecklistDone } from "@/lib/server/store";
import { countCustomers, countRecentCustomers, listCustomers, signupsByDay } from "@/lib/server/users";
import { legalPages } from "@/lib/site-config";

export const metadata: Metadata = { title: "Visão geral" };

export default async function AdminOverviewPage() {
  const admin = await requireAdmin();

  const context = readChecklistContext();
  const { catalog, settings } = context;
  const checklist = evaluateChecklist(readChecklistDone(), context);
  const readiness = readCheckoutReadiness();
  const sales = orderStats(30);
  const recentOrders = listOrders().slice(0, 5);
  const progress = Math.round((checklist.completed / checklist.total) * 100);
  const pendingTasks = checklist.groups.flatMap((group) => group.items).filter((item) => !item.done);

  const customers = countCustomers();
  const newCustomers = countRecentCustomers(30);
  const recentCustomers = listCustomers().slice(0, 5);
  const available = catalog.filter((product) => product.status === "disponivel").length;
  const priced = catalog.filter((product) => product.priceCents !== null).length;
  const stock = catalog.reduce((sum, product) => sum + product.stock, 0);

  const storeData = [
    { label: "Contactos", filled: Object.values(settings.contacts).filter(Boolean).length, total: 4 },
    { label: "Dados da empresa", filled: Object.values(settings.company).filter(Boolean).length, total: 3 },
    { label: "Páginas legais", filled: Object.values(settings.legal).filter(Boolean).length, total: legalPages.length },
  ];

  return (
    <>
      <header className="admin-page__header">
        <div>
          <p className="eyebrow">Painel AXON</p>
          <h1 className="admin-page__title">Olá, {admin.name.split(" ")[0]}</h1>
          <p className="admin-page__lead">Hoje é {formatToday()}. Este é o estado da loja.</p>
        </div>
        <Link href="/" className="button button--outline">
          Ver loja
        </Link>
      </header>

      <section className="admin-hero" aria-labelledby="preparacao-title">
        <div>
          <h2 id="preparacao-title" className="admin-hero__label">
            Preparação para o lançamento
          </h2>
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
            aria-valuetext={`${progress}%, ${checklist.completed} de ${checklist.total} tarefas`}
          >
            <span className="meter__fill" style={{ width: `${progress}%` }} />
          </div>
          <Link href="/painel/lancamento" className="text-button">
            Ver lista de lançamento
            <ArrowIcon width={16} height={16} />
          </Link>
        </div>
      </section>

      <section className="stat-grid" aria-label="Indicadores">
        <article className="stat-tile">
          <p className="stat-tile__label">Faturação (30 dias)</p>
          <p className="stat-tile__value">{formatPrice(sales.revenueCents)}</p>
          <p className="stat-tile__delta">
            {sales.paidCount} {sales.paidCount === 1 ? "encomenda paga" : "encomendas pagas"}
          </p>
        </article>
        <article className="stat-tile">
          <p className="stat-tile__label">Por enviar</p>
          <p className="stat-tile__value">{sales.toShipCount}</p>
          <p className="stat-tile__delta">{sales.pendingCount} a aguardar pagamento</p>
        </article>
        <article className="stat-tile">
          <p className="stat-tile__label">Clientes registados</p>
          <p className="stat-tile__value">{customers}</p>
          <p className="stat-tile__delta">+{newCustomers} nos últimos 30 dias</p>
        </article>
        <article className="stat-tile">
          <p className="stat-tile__label">Produtos disponíveis</p>
          <p className="stat-tile__value">
            {available}
            <span className="stat-tile__of"> de {catalog.length}</span>
          </p>
          <p className="stat-tile__delta">
            {priced} com preço · {stock} unidades em stock
          </p>
        </article>
        <article className="stat-tile stat-tile--status">
          <p className="stat-tile__label">Encomendas online</p>
          <p className={`status-pill ${readiness.open ? "status-pill--disponivel" : "status-pill--inactive"}`}>
            <InfoIcon width={16} height={16} />
            {readiness.open ? (readiness.testMode ? "Abertas (modo de teste)" : "Abertas") : "Fechadas"}
          </p>
          <p className="stat-tile__delta">
            {readiness.open ? "Os clientes podem encomendar e pagar." : `${readiness.missing.length} requisito(s) em falta.`}{" "}
            <Link href="/painel/definicoes">Definições</Link>
          </p>
        </article>
      </section>

      <section className="admin-card" aria-labelledby="encomendas-recentes-title">
        <header className="admin-card__header">
          <h2 id="encomendas-recentes-title" className="admin-card__title">
            Encomendas recentes
          </h2>
          <Link href="/painel/encomendas" className="text-button">
            Ver encomendas
            <ArrowIcon width={16} height={16} />
          </Link>
        </header>
        {recentOrders.length === 0 ? (
          <p className="admin-card__empty">Ainda não há encomendas.</p>
        ) : (
          <ul className="people-list">
            {recentOrders.map((order) => (
              <li key={order.number}>
                <span className="people-list__info">
                  <strong>
                    <Link href={`/painel/encomendas/${order.number}`}>{order.number}</Link> · {order.customerName}
                  </strong>
                  <span>{formatDateTime(order.createdAt)}</span>
                </span>
                <span className={`status-pill status-pill--order-${order.status}`}>{orderStatusLabels[order.status]}</span>
                <span className="people-list__date">{formatPrice(order.totalCents)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-card" aria-label="Novos clientes">
        <SignupsChart data={signupsByDay(30)} />
      </section>

      <section className="admin-card" aria-labelledby="colecao-title">
        <header className="admin-card__header">
          <h2 id="colecao-title" className="admin-card__title">
            Coleção
          </h2>
          <Link href="/painel/produtos" className="text-button">
            Gerir produtos
            <ArrowIcon width={16} height={16} />
          </Link>
        </header>
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
                      {product.name}
                    </span>
                  </td>
                  <td>{formatLabels[product.format]}</td>
                  <td className="data-table__number">{formatPrice(product.priceCents)}</td>
                  <td className="data-table__number">{product.stock}</td>
                  <td>
                    <span className={`status-pill status-pill--${product.status}`}>{statusLabels[product.status]}</span>
                  </td>
                  <td className="data-table__action">
                    <Link href={`/painel/produtos/${product.slug}`} className="text-button">
                      Editar<span className="sr-only"> {product.name}</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="admin-columns">
        <section className="admin-card" aria-labelledby="tarefas-title">
          <header className="admin-card__header">
            <h2 id="tarefas-title" className="admin-card__title">
              Próximas tarefas
            </h2>
            <Link href="/painel/lancamento" className="text-button">
              Ver todas
              <ArrowIcon width={16} height={16} />
            </Link>
          </header>
          {pendingTasks.length === 0 ? (
            <p className="admin-card__empty">Todas as tarefas de lançamento estão concluídas.</p>
          ) : (
            <ul className="task-list">
              {pendingTasks.slice(0, 5).map((task) => (
                <li key={task.id}>
                  <span className="task-list__dot" aria-hidden="true" />
                  {task.label}
                  {task.automatic && <span className="tag tag--auto">Automático</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-card" aria-labelledby="clientes-title">
          <header className="admin-card__header">
            <h2 id="clientes-title" className="admin-card__title">
              Clientes recentes
            </h2>
            <Link href="/painel/clientes" className="text-button">
              Ver clientes
              <ArrowIcon width={16} height={16} />
            </Link>
          </header>
          {recentCustomers.length === 0 ? (
            <p className="admin-card__empty">Ainda não há clientes registados.</p>
          ) : (
            <ul className="people-list">
              {recentCustomers.map((customer) => (
                <li key={customer.id}>
                  <span className="people-list__avatar" aria-hidden="true">
                    {customer.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="people-list__info">
                    <strong>{customer.name}</strong>
                    <span>{customer.email}</span>
                  </span>
                  <span className="people-list__date">{formatShortDate(customer.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="admin-card" aria-labelledby="dados-title">
        <header className="admin-card__header">
          <h2 id="dados-title" className="admin-card__title">
            Dados da loja
          </h2>
          <Link href="/painel/definicoes" className="text-button">
            Editar definições
            <ArrowIcon width={16} height={16} />
          </Link>
        </header>
        <ul className="completion-list">
          {storeData.map((entry) => (
            <li key={entry.label}>
              <span className="completion-list__label">{entry.label}</span>
              <span className="meter meter--small" aria-hidden="true">
                <span className="meter__fill" style={{ width: `${(entry.filled / entry.total) * 100}%` }} />
              </span>
              <span className="completion-list__value">
                {entry.filled} de {entry.total}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
