export type Format = "liquido" | "capsulas" | "sache";

export const benefitKeys = [
  "energia", "equilibrio", "foco", "imunidade", "vitalidade", "protecao",
  "purifica", "bem-estar", "conforto", "leveza", "metabolismo", "saciedade",
  "concentracao", "memoria", "desempenho", "hormonal", "feminino", "digestao",
] as const;

export type Benefit =
  | "energia" | "equilibrio" | "foco" | "imunidade" | "vitalidade" | "protecao"
  | "purifica" | "bem-estar" | "conforto" | "leveza" | "metabolismo" | "saciedade"
  | "concentracao" | "memoria" | "desempenho" | "hormonal" | "feminino" | "digestao";

export type Product = {
  id?: string;
  slug: string;
  name: string;
  label: string;        // linha do rótulo
  tagline: string;      // frase curta do card
  format: Format;
  formatLabel: string;  // ex.: "Solução oral"
  size: string;         // ex.: "50 ml"
  reference: string;    // ingrediente de referência
  benefits: [Benefit, Benefit, Benefit];
  intro: string;
  details: string[];
  routine: string[];
  supplement: boolean;  // exibe "Suplemento alimentar" no rótulo
  toConfirm?: string;   // observação sobre o que falta definir
  image?: string | null; // foto do frasco em /public (PNG com fundo transparente)
  priceCents?: number | null;
  stock?: number;
  active?: boolean;
};

export const benefitLabels: Record<Benefit, string> = {
  energia: "Energia", equilibrio: "Equilíbrio", foco: "Foco", imunidade: "Imunidade",
  vitalidade: "Vitalidade", protecao: "Proteção", purifica: "Purifica", "bem-estar": "Bem-estar",
  conforto: "Conforto", leveza: "Leveza", metabolismo: "Metabolismo", saciedade: "Saciedade",
  concentracao: "Concentração", memoria: "Memória", desempenho: "Desempenho",
  hormonal: "Hormonal", feminino: "Feminino", digestao: "Digestão",
};

export const formatGroups: { key: Format | "todos"; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "liquido", label: "Líquidos" },
  { key: "capsulas", label: "Cápsulas" },
  { key: "sache", label: "Sachês" },
];

// Catálogo inicial: é gravado na base de dados pelo seed e depois editado no painel /admin.
export const seedProducts: Product[] = [
  {
    slug: "lugol",
    name: "Lugol",
    label: "Em líquido",
    tagline: "Suporte à tireoide e ao metabolismo.",
    format: "liquido",
    formatLabel: "Solução oral",
    size: "50 ml",
    reference: "Iodo, em solução inspirada na fórmula de Lugol",
    benefits: ["energia", "equilibrio", "foco"],
    intro:
      "O Lugol AXON parte de um mineral essencial que o organismo não produz sozinho: o iodo. Uma solução oral de gotas, inspirada na tradicional fórmula de Lugol, para ser a base da sua rotina.",
    details: [
      "O iodo é obtido pela alimentação e participa do funcionamento normal da tireoide.",
      "Em gotas, permite uma dosagem precisa e simples de acompanhar.",
    ],
    routine: ["Diluir as gotas em água", "Tomar no mesmo horário todos os dias", "Seguir a recomendação do rótulo"],
    supplement: true,
  },
  {
    slug: "propolis",
    name: "Própolis",
    label: "Em líquido",
    tagline: "Defesa natural e imunidade.",
    format: "liquido",
    formatLabel: "Solução oral",
    size: "50 ml",
    reference: "Extrato de própolis",
    benefits: ["imunidade", "vitalidade", "protecao"],
    intro:
      "O Própolis AXON concentra a própolis, a resina que as abelhas produzem para proteger a colmeia e que é valorizada há séculos. Em gotas, para acompanhar o seu dia, em casa ou fora dela.",
    details: [
      "A própolis é rica em compostos naturais com ação antioxidante.",
      "O formato líquido é prático para diluir em água ou chá morno.",
    ],
    routine: ["Diluir em água ou chá morno", "Incluir pela manhã", "Reforçar nas mudanças de estação"],
    supplement: true,
  },
  {
    slug: "cravinho",
    name: "Cravinho",
    label: "Em líquido",
    tagline: "Saúde digestiva e antioxidante.",
    format: "liquido",
    formatLabel: "Solução oral",
    size: "50 ml",
    reference: "Extrato de cravo-da-índia (cravinho)",
    benefits: ["purifica", "equilibrio", "bem-estar"],
    intro:
      "O Cravinho AXON nasce do cravo-da-índia, o cravinho, uma especiaria de aroma intenso usada há gerações na culinária e nos preparos tradicionais.",
    details: [
      "O cravo-da-índia é naturalmente rico em eugenol, o composto responsável pelo seu aroma.",
      "Em gotas, leva o melhor da especiaria para a sua rotina, sem complicação.",
    ],
    routine: ["Diluir as gotas em água", "Tomar após as refeições", "Seguir a recomendação do rótulo"],
    supplement: true,
  },
  {
    slug: "desintoxicacao-pes",
    name: "Desintoxicação pelos Pés",
    label: "Cuidado dos pés",
    tagline: "Elimina toxinas e equilibra o organismo.",
    format: "sache",
    formatLabel: "Sachês",
    size: "10 unidades",
    reference: "Blend de ervas para o ritual de cuidado dos pés",
    benefits: ["conforto", "leveza", "protecao"],
    intro:
      "Sachês para o ritual de cuidado pelos pés, inspirado no escalda-pés tradicional. Um momento para desacelerar ao fim do dia e cuidar de quem nos acompanha em cada passo.",
    details: [
      "Pensado para os pés cansados depois de um dia longo.",
      "Um momento de pausa que ajuda a criar uma rotina de autocuidado.",
    ],
    routine: ["Preparar a água morna", "Usar um sachê conforme a embalagem", "Relaxar por 15 a 20 minutos"],
    supplement: false,
  },
  {
    slug: "emagrecedor",
    name: "Emagrecedor",
    label: "Em cápsulas",
    tagline: "Auxilia no metabolismo e na queima de gordura.",
    format: "capsulas",
    formatLabel: "Cápsulas",
    size: "60 un.",
    reference: "Composição a confirmar",
    benefits: ["metabolismo", "saciedade", "energia"],
    intro:
      "O Emagrecedor AXON foi criado para quem está construindo uma rotina mais leve. Um apoio diário que funciona melhor ao lado de uma alimentação equilibrada e de atividade física regular.",
    details: [
      "Cápsulas práticas para incluir antes das principais refeições.",
      "Feito para acompanhar mudanças de hábito, de forma gradual e consistente.",
    ],
    routine: ["Tomar com um copo de água", "Antes das principais refeições", "Manter alimentação equilibrada"],
    supplement: true,
  },
  {
    slug: "foco-estudos",
    name: "Foco Estudos",
    label: "Em cápsulas",
    tagline: "Memória, concentração e desempenho mental.",
    format: "capsulas",
    formatLabel: "Cápsulas",
    size: "60 un.",
    reference: "Composição a confirmar",
    benefits: ["concentracao", "memoria", "desempenho"],
    intro:
      "O Foco Estudos é para os dias de estudo, de prova e de trabalho intenso. Uma fórmula pensada para quem precisa manter a mente presente por mais tempo.",
    details: [
      "Ideal para fases de estudo, concursos e projetos exigentes.",
      "Funciona melhor com boas noites de sono e pausas ao longo do dia.",
    ],
    routine: ["Tomar pela manhã", "Com um copo de água", "Manter uma rotina de sono regular"],
    supplement: true,
  },
  {
    slug: "libido-feminina",
    name: "Libido Feminina",
    label: "Em cápsulas",
    tagline: "Equilíbrio hormonal e bem-estar.",
    format: "capsulas",
    formatLabel: "Cápsulas",
    size: "60 un.",
    reference: "Composição a confirmar",
    benefits: ["hormonal", "equilibrio", "feminino"],
    intro:
      "O Libido Feminina foi criado para a mulher que quer cuidar da sua vitalidade, do bem-estar íntimo e da disposição em todas as fases da vida.",
    details: [
      "Uma fórmula pensada especialmente para o corpo feminino.",
      "Para incluir na rotina diária, com constância.",
    ],
    routine: ["Tomar uma vez ao dia", "Com um copo de água", "Usar de forma contínua"],
    supplement: true,
  },
  {
    slug: "desparasitante",
    name: "Desparasitante",
    label: "Em cápsulas",
    tagline: "Elimina vermes e parasitas intestinais.",
    format: "capsulas",
    formatLabel: "Cápsulas",
    size: "60 un.",
    reference: "Blend completo de ervas e sementes (composição a confirmar)",
    benefits: ["digestao", "equilibrio", "bem-estar"],
    intro:
      "O Desparasitante é a fórmula mais completa da linha AXON. Reúne ervas, sementes e especiarias tradicionalmente usadas para o cuidado intestinal, para uma sensação de leveza que começa por dentro.",
    details: [
      "Um blend de ingredientes botânicos escolhidos pela sua tradição de uso.",
      "Pensado para ciclos de uso, junto de uma alimentação rica em fibras e boa hidratação.",
    ],
    routine: ["Tomar com bastante água", "Seguir o ciclo indicado no rótulo", "Priorizar fibras e hidratação"],
    supplement: true,
  },
];
