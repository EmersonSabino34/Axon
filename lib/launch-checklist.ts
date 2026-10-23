// Lista do que falta antes de abrir a loja ao público. As tarefas `auto` são verificadas a partir
// dos dados do painel; as restantes são marcadas à mão em /painel/lancamento.

import type { Product } from "./collection";
import type { CommerceSettings } from "./commerce";
import { legalPages, type SiteSettings } from "./site-config";

export type ChecklistContext = {
  catalog: Product[];
  settings: SiteSettings;
  commerce: CommerceSettings;
  /** Prestador de pagamentos real configurado (não o modo de teste). */
  livePayments: boolean;
};

export type ChecklistItem = {
  id: string;
  label: string;
  hint?: string;
  auto?: (context: ChecklistContext) => boolean;
};

export type ChecklistGroup = { title: string; items: ChecklistItem[] };

export const launchChecklist: ChecklistGroup[] = [
  {
    title: "Produtos",
    items: [
      { id: "classificacao", label: "Classificação regulamentar de cada produto" },
      {
        id: "enquadramento-prioritario",
        label: "Enquadramento específico do Lugol, Emagrecedor e Desparasitante",
        hint: "Não assumir que podem ser vendidos como suplementos alimentares.",
      },
      { id: "composicao", label: "Composição e documentação técnica" },
      {
        id: "rotulagem",
        label: "Rotulagem e alegações permitidas, incluindo as designações dos produtos",
      },
      { id: "notificacao", label: "Requisitos de notificação e de comercialização" },
      { id: "embalagens", label: "Embalagens finais aprovadas" },
      { id: "fotografias", label: "Fotografias originais em alta resolução (6 por produto)" },
      {
        id: "precos",
        label: "Preço definido em todos os produtos",
        auto: ({ catalog }) => catalog.every((product) => product.priceCents !== null),
      },
    ],
  },
  {
    title: "Loja",
    items: [
      {
        id: "pagamentos",
        label: "Pagamentos reais configurados (MB WAY, Multibanco, cartão)",
        hint: "Contrato com a ifthenpay e chaves IFTHENPAY_* no servidor.",
        auto: ({ livePayments }) => livePayments,
      },
      {
        id: "portes",
        label: "Portes de envio definidos",
        auto: ({ commerce }) => commerce.shippingCents !== null,
      },
      { id: "envios", label: "Envios: transportadora, zonas e prazos" },
      { id: "devolucoes", label: "Política de devoluções e direito de livre resolução" },
      {
        id: "faturacao",
        label: "Faturação com programa certificado pela AT",
        hint: "Cada venda tem de ter fatura emitida por software certificado (ex.: ligado ao painel ou manual).",
      },
      { id: "emails", label: "E-mails de confirmação de encomenda (serviço de e-mail)" },
      {
        id: "contactos",
        label: "Contactos oficiais publicados",
        auto: ({ settings }) => Object.values(settings.contacts).every(Boolean),
      },
      {
        id: "empresa",
        label: "Identificação da empresa publicada (denominação, NIPC, sede)",
        auto: ({ settings }) => Object.values(settings.company).every(Boolean),
      },
    ],
  },
  {
    title: "Legal e dados pessoais",
    items: [
      {
        id: "paginas-legais",
        label: "Páginas legais publicadas",
        hint: legalPages.map((page) => page.label).join(", "),
        auto: ({ settings }) => Object.values(settings.legal).every(Boolean),
      },
      { id: "rgpd", label: "Revisão RGPD das contas de cliente e da newsletter" },
      { id: "newsletter", label: "Serviço de newsletter com registo do consentimento" },
      { id: "logotipo", label: "Logótipo oficial em ficheiro" },
      {
        id: "encomendas",
        label: "Encomendas ativas na loja",
        hint: "Último passo: Painel › Definições › Loja online.",
        auto: ({ commerce }) => commerce.storeOpen,
      },
    ],
  },
];

export function evaluateChecklist(done: Set<string>, context: ChecklistContext) {
  const groups = launchChecklist.map((group) => ({
    title: group.title,
    items: group.items.map((item) => ({
      ...item,
      automatic: Boolean(item.auto),
      done: item.auto ? item.auto(context) : done.has(item.id),
    })),
  }));
  const items = groups.flatMap((group) => group.items);
  return { groups, completed: items.filter((item) => item.done).length, total: items.length };
}
