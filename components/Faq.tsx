"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ChevronIcon } from "./LineIcons";

// Respostas que mudam quando a loja passa a aceitar encomendas.
const openAnswers: Record<string, string> = {
  "Os produtos já estão disponíveis para compra?":
    "Sim, os produtos assinalados como disponíveis. Os restantes continuam em preparação e aparecem com «Detalhes em preparação» até a ficha estar confirmada.",
  "Esta página já recebe encomendas?":
    "Sim. Pode pagar com MB WAY, referência Multibanco ou cartão. A encomenda é preparada assim que o pagamento for confirmado e recebe o link para a acompanhar.",
};

const faqs = [
  {
    question: "Os produtos já estão disponíveis para compra?",
    answer:
      "Ainda não. A coleção AXON está em preparação: a composição, a rotulagem, o enquadramento regulamentar e o stock de cada produto ainda estão a ser confirmados. Os preços indicados são os previstos para o lançamento. Esta página é uma demonstração e não vende produtos.",
  },
  {
    question: "Onde posso consultar os ingredientes e instruções?",
    answer:
      "A composição, o modo de utilização e as advertências serão publicados na ficha de cada produto, tal como constarem no rótulo aprovado. Até lá, cada ficha indica «Detalhes em preparação» e enumera os dados que faltam confirmar.",
  },
  {
    question: "Como funcionam os envios e as devoluções?",
    answer:
      "As zonas de entrega, os prazos, os custos de envio e a política de devoluções ainda não foram definidos. Serão publicados na página «Envios e Devoluções» antes do início das vendas, de acordo com os direitos dos consumidores previstos na lei.",
  },
  {
    question: "Como posso contactar a AXON?",
    answer:
      "Os contactos oficiais ainda não foram publicados. Assim que forem confirmados, ficam disponíveis na secção Contactos e no rodapé desta página.",
  },
  {
    question: "Esta página já recebe encomendas?",
    answer:
      "Não. O carrinho funciona apenas como demonstração: permite adicionar e remover artigos, mas não processa encomendas nem pagamentos e não recolhe dados pessoais. As encomendas só serão ativadas quando a plataforma de comércio eletrónico, o stock, os envios e os pagamentos estiverem configurados.",
  },
];

export function Faq({ storeOpen = false }: { storeOpen?: boolean }) {
  const [openItems, setOpenItems] = useState<number[]>([0]);
  const listRef = useRef<HTMLDivElement>(null);

  const toggle = (index: number) =>
    setOpenItems((current) => (current.includes(index) ? current.filter((item) => item !== index) : [...current, index]));

  // Setas, Home e End movem o foco entre as perguntas.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const triggers = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>(".accordion__trigger") ?? []);
    const current = triggers.indexOf(document.activeElement as HTMLButtonElement);
    if (current === -1) return;
    const target = {
      ArrowDown: (current + 1) % triggers.length,
      ArrowUp: (current - 1 + triggers.length) % triggers.length,
      Home: 0,
      End: triggers.length - 1,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    triggers[target].focus();
  };

  return (
    <section id="perguntas" className="section faq" aria-labelledby="faq-title">
      <div className="container faq__inner">
        <header className="section-header faq__header">
          <p className="eyebrow">Ajuda</p>
          <h2 id="faq-title" className="section-title">
            Perguntas frequentes
          </h2>
          <p className="section-intro">Respostas diretas sobre o estado atual da loja AXON.</p>
        </header>

        <div ref={listRef} className="accordion" onKeyDown={onKeyDown}>
          {faqs.map((faq, index) => {
            const open = openItems.includes(index);
            return (
              <div key={faq.question} className={`accordion__item${open ? " is-open" : ""}`}>
                <h3 className="accordion__heading">
                  <button
                    type="button"
                    id={`faq-pergunta-${index}`}
                    className="accordion__trigger"
                    aria-expanded={open}
                    aria-controls={`faq-resposta-${index}`}
                    onClick={() => toggle(index)}
                  >
                    <span>{faq.question}</span>
                    <ChevronIcon className="accordion__icon" />
                  </button>
                </h3>
                <div
                  id={`faq-resposta-${index}`}
                  role="region"
                  aria-labelledby={`faq-pergunta-${index}`}
                  className="accordion__panel"
                  inert={!open}
                >
                  <div className="accordion__content">
                    <p>{(storeOpen && openAnswers[faq.question]) || faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
