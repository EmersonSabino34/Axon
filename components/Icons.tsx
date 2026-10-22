import type { Benefit } from "@/lib/products";

// Ícones lineares de benefícios (24×24, traço fino), um único estilo para todo o site.
const benefitPaths: Record<Benefit, React.ReactNode> = {
  energia: <path d="M13 3 5 14h6l-1 7 8-11h-6z" />,
  equilibrio: <><path d="M12 4v16M6 20h12M4 9h16" /><path d="M4 9l-2 5a3 3 0 0 0 4 0zM20 9l-2 5a3 3 0 0 0 4 0z" /></>,
  foco: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r=".8" /></>,
  imunidade: <><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" /><path d="M12 8v8M8 12h8" /></>,
  vitalidade: <><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" /></>,
  protecao: <><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" /><path d="M9 12l2 2 4-4" /></>,
  purifica: <><path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z" /><path d="M9 14a3 3 0 0 0 3 3" /></>,
  "bem-estar": <><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" /><path d="M12 16v-5c0-2 1-3 3-3" /></>,
  conforto: <><path d="M4 15c0-4 4-7 8-7s8 3 8 7" /><path d="M2 15h20v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3z" /></>,
  leveza: <><path d="M20 4C10 4 5 10 5 19" /><path d="M20 4c0 8-5 13-13 13" /><path d="M5 19l-2 2" /></>,
  metabolismo: <><path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 1 1 2 2 3 3 0-2 0-4 0-6z" /></>,
  saciedade: <><path d="M3 11h18a9 9 0 0 1-18 0z" /><path d="M8 7c0-1 1-2 0-3M12 7c0-1 1-2 0-3M16 7c0-1 1-2 0-3" /></>,
  concentracao: <><circle cx="12" cy="12" r="8" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /><circle cx="12" cy="12" r="1.5" /></>,
  memoria: <><path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a3 3 0 0 0-3-1z" /><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1" /></>,
  desempenho: <><path d="M3 20h18" /><path d="M5 16l5-5 3 3 6-7" /><path d="M15 7h4v4" /></>,
  hormonal: <><circle cx="12" cy="12" r="8" /><path d="M4 12c2-3 4-3 6 0s4 3 6 0 3-2 4-1" /></>,
  feminino: <><circle cx="12" cy="9" r="5" /><path d="M12 14v7M9 18h6" /></>,
  digestao: <><path d="M12 4a8 8 0 1 0 8 8" /><path d="M12 8a4 4 0 1 0 4 4" /><path d="M12 12h0" /></>,
};

export function BenefitIcon({ name, className }: { name: Benefit; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {benefitPaths[name]}
    </svg>
  );
}
