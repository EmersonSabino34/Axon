// Configuração fixa do site. Contactos, dados da empresa e links legais são editados no painel
// (/painel/definicoes) e guardados na base de dados; aqui ficam só os valores de partida (vazios).
// Os campos a `null` aparecem no site como "a confirmar" ou "pendente" — não use dados fictícios.

export type ContactKey = "email" | "phone" | "address" | "hours";

export const legalPages = [
  { id: "privacidade", label: "Política de Privacidade" },
  { id: "cookies", label: "Política de Cookies" },
  { id: "termos", label: "Termos e Condições" },
  { id: "envios", label: "Envios e Devoluções" },
  { id: "reclamacoes", label: "Livro de Reclamações" },
  { id: "ral", label: "Resolução Alternativa de Litígios" },
] as const;

export type LegalId = (typeof legalPages)[number]["id"];

export type CompanyDetails = {
  legalName: string | null;
  /** NIPC */
  taxId: string | null;
  registeredOffice: string | null;
};

export type SiteSettings = {
  contacts: Record<ContactKey, string | null>;
  company: CompanyDetails;
  /** Caminho ou endereço de cada página legal. `null` enquanto a página não existir. */
  legal: Record<LegalId, string | null>;
};

export const defaultSettings: SiteSettings = {
  contacts: { email: null, phone: null, address: null, hours: null },
  company: { legalName: null, taxId: null, registeredOffice: null },
  legal: { privacidade: null, cookies: null, termos: null, envios: null, reclamacoes: null, ral: null },
};

/** Opções do emblema AXON (components/BrandEmblem.tsx). */
export const brandConfig = {
  /**
   * Linha por baixo de «AXON», como no rótulo (ex.: "Suplementos naturais"). Fica desligada até estar
   * confirmada a classificação de todos os produtos: Lugol, Emagrecedor e Desparasitante podem não ser
   * suplementos alimentares.
   */
  descriptor: null as string | null,
  /** Mostra «®» junto ao nome. Ative só com a marca registada: usar ® sem registo não é permitido. */
  registered: false,
};

export const siteConfig = {
  name: "AXON",
  slogan: "Uma Vida Extraordinária",
  description:
    "AXON — uma marca criada para acompanhar o seu dia a dia, com uma apresentação cuidada, informação clara e uma experiência de compra simples. Coleção em preparação.",

  /** Mantenha `false` até a loja estar pronta para o público: a página fica fora dos motores de pesquisa. */
  indexable: false,

  commerce: {
    currency: "EUR",
    locale: "pt-PT",
  },

  newsletter: {
    /**
     * Endereço de um Route Handler próprio (ex.: "/api/newsletter") que fale com o serviço de newsletter
     * no servidor, onde ficam as chaves. Enquanto for `null`, o formulário só valida e não envia nada.
     */
    endpoint: null as string | null,
  },
};

export const contactLabels: Record<ContactKey, string> = {
  email: "E-mail",
  phone: "Telefone",
  address: "Morada",
  hours: "Horário de atendimento",
};

export const navItems = [
  { href: "#colecao", label: "Coleção" },
  { href: "#origens", label: "Ingredientes" },
  { href: "#marca", label: "A Marca" },
  { href: "#perguntas", label: "Ajuda" },
  { href: "#contactos", label: "Contactos" },
];

export const commerceSetupSteps = [
  "Plataforma de comércio eletrónico",
  "Stock de cada produto",
  "Envios: zonas, prazos e custos",
  "Pagamentos com integração segura",
];
