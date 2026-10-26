"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/currency";

// Atalho fixo para a coleção no telemóvel, onde o menu está fechado. Só aparece depois da área
// principal e esconde-se quando a coleção, a newsletter ou o rodapé estão no ecrã.
const HIDE_NEAR = ["#inicio", "#colecao", "#newsletter", ".site-footer"];

export function StickyCta({ fromPriceCents }: { fromPriceCents: number | null }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const targets = HIDE_NEAR.map((selector) => document.querySelector(selector)).filter(
      (element): element is Element => element !== null,
    );
    const onScreen = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? onScreen.add(entry.target) : onScreen.delete(entry.target)));
      setVisible(onScreen.size === 0);
    });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <aside className={`sticky-cta${visible ? " is-visible" : ""}`} aria-label="Atalho para a coleção" inert={!visible}>
      <p className="sticky-cta__text">
        <span className="sticky-cta__name">Coleção AXON</span>
        {fromPriceCents !== null && <span className="sticky-cta__price">desde {formatPrice(fromPriceCents)}</span>}
      </p>
      <a href="#colecao" className="button button--gold sticky-cta__button">
        Ver coleção
      </a>
    </aside>
  );
}
