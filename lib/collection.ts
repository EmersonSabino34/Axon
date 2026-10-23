// Catálogo da coleção AXON. Nenhum ingrediente, dose, tamanho, preço, certificação ou benefício
// foi definido: esses dados só devem ser acrescentados depois de confirmados e validados.
//
// Os textos de apresentação falam da experiência, da embalagem e da tradição de cada ingrediente,
// sem dizer o que o produto faz no organismo. Efeitos só podem ser comunicados com alegações
// autorizadas e validadas — quando existirem, entram em `validatedClaims`.

export type ProductFormat = "liquido" | "capsulas" | "por-confirmar";
export type ProductStatus = "em-preparacao" | "disponivel";

export const statusLabels: Record<ProductStatus, string> = {
  "em-preparacao": "Em preparação",
  disponivel: "Disponível",
};

export type Product = {
  slug: string;
  name: string;
  format: ProductFormat;
  /** Texto do formato na ficha, quando é preciso mais do que a categoria. */
  formatNote?: string;
  /** Frase curta de apresentação (cartões e slides). */
  tagline: string;
  /** Texto de apresentação do slide e da ficha. */
  description: string;
  /** Três pontos fortes da apresentação (sem efeitos no organismo). */
  highlights: string[];
  /** Alegações autorizadas e validadas por quem responde pela regulamentação. Vazio até lá. */
  validatedClaims: string[];
  /** Descrição da embalagem mostrada nas imagens (proposta, não final). */
  packaging: string;
  /** Texto alternativo da fotografia principal. */
  sceneAlt: string;
  /** Preço em cêntimos de euro. `null` enquanto não houver preço definido. */
  priceCents: number | null;
  /** Unidades em stock (só visível no painel). */
  stock: number;
  status: ProductStatus;
  /** Última alteração feita no painel, ou `null` se usa os valores de base. */
  updatedAt: string | null;
  /** Dados em falta próprios deste produto, além dos comuns a toda a coleção. */
  pendingExtra?: string[];
  /** Aviso de enquadramento regulamentar a confirmar antes de qualquer venda. */
  regulatoryNote?: string;
  /** Produtos que exigem verificação específica antes de serem tratados como suplementos alimentares. */
  regulatoryPriority?: boolean;
};

export type ProductPhoto = { src: string; alt: string; caption: string };

export const formatLabels: Record<ProductFormat, string> = {
  liquido: "Líquido",
  capsulas: "Cápsulas",
  "por-confirmar": "Formato por confirmar",
};

export const filters: { key: "todos" | Exclude<ProductFormat, "por-confirmar">; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "liquido", label: "Líquidos" },
  { key: "capsulas", label: "Cápsulas" },
];

export type FilterKey = (typeof filters)[number]["key"];

/** Dados que faltam confirmar em todos os produtos da coleção. */
export const pendingCommon = [
  "Composição e ingredientes",
  "Modo de utilização, quantidades e advertências",
  "Tamanho e conteúdo da embalagem",
  "Classificação regulamentar do produto",
  "Rotulagem e alegações permitidas",
  "Stock disponível",
];

const nameClaimNote =
  "A própria designação comercial pode ser interpretada como uma alegação e tem de ser validada antes de ser usada na embalagem ou na comunicação.";

const liquidPackaging = "Frasco em vidro âmbar com conta-gotas e rótulo verde e dourado";
const capsulePackaging = "Frasco verde-escuro com tampa dourada";

/** Dados de base. Preço, stock, estado e textos podem ser alterados no painel (/painel/produtos). */
export const baseProducts: Product[] = [
  {
    slug: "lugol",
    name: "Lugol",
    format: "liquido",
    tagline: "Precisão em cada gota.",
    description:
      "O Lugol AXON foi pensado ao pormenor: vidro âmbar, conta-gotas e um rótulo verde e dourado que se reconhece à primeira vista. Uma utilização simples, rigorosa e sempre igual — para quem leva a sério cada escolha da sua rotina.",
    highlights: ["Conta-gotas para uma utilização rigorosa", "Frasco em vidro âmbar", "Design AXON em verde e dourado"],
    validatedClaims: [],
    packaging: liquidPackaging,
    sceneAlt: "frasco âmbar com conta-gotas sobre pedra, entre folhas verdes",
    priceCents: 2499,
    stock: 0,
    status: "em-preparacao",
    updatedAt: null,
    regulatoryPriority: true,
    regulatoryNote:
      "Soluções à base de iodo podem enquadrar-se como medicamento ou noutra categoria, consoante a composição e a concentração. Não deve ser tratado como suplemento alimentar sem confirmar o enquadramento junto das entidades competentes.",
  },
  {
    slug: "propolis",
    name: "Própolis",
    format: "liquido",
    tagline: "Um tesouro guardado pelas abelhas.",
    description:
      "A própolis é a resina que as abelhas recolhem e transformam para proteger a colmeia — um ingrediente apreciado há gerações. O Própolis AXON traz essa tradição para o seu dia a dia, num frasco âmbar com conta-gotas que acompanha a sua rotina em casa ou em viagem.",
    highlights: ["Inspirado na colmeia", "Conta-gotas prático, em casa ou em viagem", "Frasco em vidro âmbar"],
    validatedClaims: [],
    packaging: liquidPackaging,
    sceneAlt: "frasco âmbar com conta-gotas junto a um favo de mel e folhas",
    priceCents: 1699,
    stock: 0,
    status: "em-preparacao",
    updatedAt: null,
  },
  {
    slug: "cravinho",
    name: "Cravinho",
    format: "liquido",
    tagline: "O aroma de uma especiaria intemporal.",
    description:
      "O cravinho — o botão floral seco do craveiro-da-índia — é uma das especiarias mais aromáticas do mundo e atravessa cozinhas e tradições de vários continentes. O Cravinho AXON celebra essa herança num formato líquido, elegante e fácil de levar para os seus momentos do dia.",
    highlights: ["Uma especiaria com história", "Formato líquido com conta-gotas", "Design AXON em verde e dourado"],
    validatedClaims: [],
    packaging: liquidPackaging,
    sceneAlt: "frasco âmbar com conta-gotas entre cravinhos e pedra",
    priceCents: 2500,
    stock: 0,
    status: "em-preparacao",
    updatedAt: null,
  },
  {
    slug: "desintoxicacao-sistema-linfatico",
    name: "Desintoxicação do sistema linfático",
    format: "liquido",
    tagline: "Um ritual só seu, todos os dias.",
    description:
      "Há momentos que pedem pausa. Este produto AXON foi criado para quem gosta de dedicar alguns minutos a si próprio, num ritual diário simples e cuidado. Frasco âmbar, conta-gotas e o design inconfundível da coleção — para começar o dia com intenção.",
    highlights: ["Um ritual diário simples", "Formato líquido com conta-gotas", "Design da coleção AXON"],
    validatedClaims: [],
    packaging: liquidPackaging,
    sceneAlt: "frasco âmbar com conta-gotas sobre pedra, entre folhas verdes",
    priceCents: 3200,
    stock: 0,
    status: "em-preparacao",
    updatedAt: null,
    pendingExtra: ["Validação da designação do produto"],
    regulatoryNote:
      "Designações que sugiram efeitos de desintoxicação podem ser consideradas alegações não autorizadas. " +
      nameClaimNote,
  },
  {
    slug: "emagrecedor",
    name: "Emagrecedor",
    format: "capsulas",
    tagline: "Um passo de cada vez, ao seu ritmo.",
    description:
      "Mudanças conscientes constroem-se dia após dia. O Emagrecedor AXON acompanha essa decisão com cápsulas práticas e uma apresentação que dá gosto ter por perto. Pensado para uma rotina com alimentação variada e equilibrada e um estilo de vida ativo.",
    highlights: ["Cápsulas práticas para o dia a dia", "Para uma rotina consciente", "Frasco verde-escuro com tampa dourada"],
    validatedClaims: [],
    packaging: capsulePackaging,
    sceneAlt: "frasco verde-escuro com tampa dourada sobre pedra, com cápsulas ao lado",
    priceCents: 4500,
    stock: 0,
    status: "em-preparacao",
    updatedAt: null,
    regulatoryPriority: true,
    pendingExtra: ["Validação da designação do produto"],
    regulatoryNote:
      "Produtos apresentados com finalidade de perda de peso estão sujeitos a regras estritas de comunicação. Não deve ser tratado como suplemento alimentar sem verificar o enquadramento específico. " +
      nameClaimNote,
  },
  {
    slug: "foco-estudos",
    name: "Foco Estudos",
    format: "capsulas",
    tagline: "Para os dias que pedem mais de si.",
    description:
      "Épocas de exames, projetos exigentes, longas horas de leitura. O Foco Estudos AXON foi criado para acompanhar essas fases com uma rotina simples: cápsulas práticas, num frasco que se destaca em qualquer secretária. A sua dedicação faz o resto.",
    highlights: ["Pensado para fases exigentes", "Cápsulas fáceis de levar", "Frasco verde-escuro com tampa dourada"],
    validatedClaims: [],
    packaging: capsulePackaging,
    sceneAlt: "frasco verde-escuro com tampa dourada junto a livros, com cápsulas ao lado",
    priceCents: 5000,
    stock: 0,
    status: "em-preparacao",
    updatedAt: null,
    pendingExtra: ["Validação da designação do produto"],
    regulatoryNote: nameClaimNote,
  },
  {
    slug: "libido-feminino",
    name: "Libido Feminino",
    format: "capsulas",
    tagline: "Celebre a mulher que é, em todas as fases.",
    description:
      "Criado a pensar na mulher que se coloca em primeiro lugar. O Libido Feminino AXON junta a elegância da coleção a cápsulas práticas — um pequeno gesto diário de atenção a si própria, com a discrição e o cuidado que merece.",
    highlights: ["Um gesto diário só para si", "Cápsulas práticas e discretas", "Design AXON em verde e dourado"],
    validatedClaims: [],
    packaging: capsulePackaging,
    sceneAlt: "frasco verde-escuro com tampa dourada entre flores claras",
    priceCents: 2500,
    stock: 0,
    status: "em-preparacao",
    updatedAt: null,
    pendingExtra: ["Validação da designação do produto"],
    regulatoryNote: nameClaimNote,
  },
  {
    slug: "desparasitante",
    name: "Desparasitante",
    format: "capsulas",
    tagline: "Cuidado com método e transparência.",
    description:
      "Para quem valoriza rotinas regulares e informação clara. O Desparasitante AXON apresenta-se em cápsulas, num frasco verde-escuro com tampa dourada, com a mesma qualidade de apresentação de toda a coleção. A ficha completa será publicada assim que estiver validada.",
    highlights: ["Cápsulas práticas", "Informação publicada só depois de validada", "Frasco verde-escuro com tampa dourada"],
    validatedClaims: [],
    packaging: capsulePackaging,
    sceneAlt: "frasco verde-escuro com tampa dourada sobre pedra, com cápsulas ao lado",
    priceCents: 4500,
    stock: 0,
    status: "em-preparacao",
    updatedAt: null,
    regulatoryPriority: true,
    pendingExtra: ["Validação da designação do produto"],
    regulatoryNote:
      "A ação contra parasitas é, em regra, uma finalidade associada a medicamentos. Não deve ser tratado como suplemento alimentar sem confirmar o enquadramento junto das entidades competentes. " +
      nameClaimNote,
  },
];

// As seis vistas de cada produto, pela ordem dos ficheiros em /public/produtos/<slug>/1.webp … 6.webp.
const photoViews: Record<"liquido" | "capsulas", { caption: string; alt: string }[]> = {
  liquido: [
    { caption: "Em cenário", alt: "" },
    { caption: "Conta-gotas", alt: "pormenor do conta-gotas com uma gota" },
    { caption: "Frente", alt: "vista frontal do frasco" },
    { caption: "Verso", alt: "verso da embalagem" },
    { caption: "Gota", alt: "conta-gotas com líquido" },
    { caption: "Rótulo", alt: "pormenor do rótulo" },
  ],
  capsulas: [
    { caption: "Em cenário", alt: "" },
    { caption: "Frasco aberto", alt: "frasco aberto com cápsulas" },
    { caption: "Verso", alt: "verso da embalagem" },
    { caption: "Lateral", alt: "vista lateral do frasco" },
    { caption: "Cápsulas", alt: "pormenor das cápsulas" },
    { caption: "Rótulo", alt: "pormenor do rótulo" },
  ],
};

export function getPhotos(product: Product): ProductPhoto[] {
  const views = photoViews[product.format === "capsulas" ? "capsulas" : "liquido"];
  return views.map((view, index) => ({
    src: `/produtos/${product.slug}/${index + 1}.webp`,
    alt: `${product.name}: ${index === 0 ? product.sceneAlt : view.alt}`,
    caption: view.caption,
  }));
}

export function matchesFilter(product: Product, filter: FilterKey): boolean {
  return filter === "todos" || product.format === filter;
}
