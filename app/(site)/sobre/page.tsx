import type { Metadata } from "next";
import Link from "next/link";
import { About, CtaBand, HowToBuy } from "@/components/Sections";

export const metadata: Metadata = {
  title: "Sobre",
  description: "A AXON une natureza e ciência para criar suplementos que apoiam a sua rotina de bem-estar.",
};

export default function SobrePage() {
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <nav className="crumbs" aria-label="Você está em">
            <Link href="/">Início</Link><span aria-hidden="true">/</span><span>Sobre</span>
          </nav>
          <p className="eyebrow">Nossa história</p>
          <h1>Natureza e ciência em equilíbrio</h1>
          <p className="lead">Uma marca de suplementos naturais criada para apoiar rotinas de bem-estar com elegância, clareza e cuidado.</p>
        </div>
      </section>
      <About full />
      <HowToBuy />
      <CtaBand />
    </>
  );
}
