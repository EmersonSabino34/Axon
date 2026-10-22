import Link from "next/link";
import type { Product } from "@/lib/products";
import { ProductVisual } from "./ProductVisual";
import { Logo } from "./Logo";

export function Hero({ products }: { products: Product[] }) {
  const pick = (slug: string, i: number) => products.find((p) => p.slug === slug) ?? products[i];
  const [a, b, c] = [pick("propolis", 0), pick("foco-estudos", 4), pick("lugol", 1)];
  return (
    <section className="hero">
      <div className="wrap hero-inner">
        <div>
          <p className="eyebrow">Suplementos naturais</p>
          <h1>
            Natureza que <em>potencializa</em> o seu melhor.
          </h1>
          <p className="hero-lead">
            Oito suplementos naturais, em gotas, cápsulas e sachês, para acompanhar a sua rotina de bem-estar todos os dias.
          </p>
          <div className="hero-ctas">
            <Link className="btn" href="/produtos">Conheça os produtos</Link>
            <Link className="link" href="/sobre">Nossa história</Link>
          </div>
        </div>
        <div className="hero-stage" aria-hidden="true">
          <div className="hero-ring" />
          <div className="hero-packs">
            {a && <ProductVisual p={a} className="p1" idSuffix="-hero" priority />}
            {b && <ProductVisual p={b} className="p2" idSuffix="-hero" priority />}
            {c && <ProductVisual p={c} className="p3" idSuffix="-hero" priority />}
            <div className="hero-plinth" />
          </div>
        </div>
      </div>
    </section>
  );
}

const values = [
  { label: "Qualidade natural", d: <path d="M20 4C10 4 5 10 5 19M20 4c0 8-5 13-13 13M5 19l-2 2" /> },
  { label: "Mais saúde e vitalidade", d: <><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" /><path d="M9 12l2 2 4-4" /></> },
  { label: "Bem-estar em equilíbrio", d: <><path d="M12 20c-4-2-7-5-7-9 3 0 5 1 7 4 2-3 4-4 7-4 0 4-3 7-7 9z" /><path d="M12 15c-1-3-1-6 0-10 1 4 1 7 0 10z" /></> },
  { label: "O seu melhor todos os dias", d: <><circle cx="12" cy="9" r="5" /><path d="M12 14v7M9 21h6M10 9l2-2 2 2" /></> },
];

export function Values() {
  return (
    <div className="values">
      <div className="wrap values-inner">
        {values.map((v) => (
          <div key={v.label}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{v.d}</svg>
            {v.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export function About({ full = false }: { full?: boolean }) {
  return (
    <section className="band about">
      <div className="wrap about-inner">
        <div>
          <p className="eyebrow">Sobre a AXON</p>
          <h2>Cuidar do bem-estar com calma, conhecimento e confiança.</h2>
        </div>
        <div className="about-text">
          <p className="quote">“Acreditamos que a natureza e a ciência funcionam melhor juntas.”</p>
          <p>
            A AXON reúne ingredientes de inspiração natural e cuidado rigoroso na formulação para criar produtos que fazem parte da rotina de quem os usa.
            Falamos de forma clara, sem promessas exageradas, porque confiança se constrói com informação.
          </p>
          {full && (
            <p>
              Cada fórmula nasce de um ingrediente de referência, como a própolis, o cravo-da-índia ou o iodo, e de um propósito claro no dia a dia:
              defesa, foco, equilíbrio, leveza. A embalagem verde e dourada traduz essa ideia: a profundidade da natureza e o cuidado de cada detalhe.
            </p>
          )}
          <div className="pillars">
            <div><h3>Natureza</h3><p>Ingredientes de referência, escolhidos pela tradição e pela qualidade.</p></div>
            <div><h3>Ciência</h3><p>Composições pensadas com critério e informação verificada.</p></div>
            <div><h3>Equilíbrio</h3><p>Produtos para acompanhar o dia a dia, sem excessos.</p></div>
            <div><h3>Cuidado</h3><p>Atenção aos detalhes, da escolha dos ingredientes à embalagem.</p></div>
          </div>
          {!full && (
            <div>
              <Link className="link light" href="/sobre">Conheça a AXON</Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function HowToBuy() {
  return (
    <section className="band" id="como-comprar">
      <div className="wrap">
        <div className="sec-head">
          <div>
            <p className="eyebrow">Como comprar</p>
            <h2>Simples, direto e com atendimento próximo.</h2>
          </div>
          <p>Fale com a gente pelo WhatsApp e cuidamos do seu pedido de forma personalizada, do primeiro contato à entrega.</p>
        </div>
        <ol className="steps">
          <li><h3>Escolha o produto</h3><p>Abra a página do produto e toque em “Comprar pelo WhatsApp”.</p></li>
          <li><h3>Envie a mensagem</h3><p>A conversa já abre com o nome do produto. Informe a quantidade e o endereço de entrega.</p></li>
          <li><h3>Confirme e receba</h3><p>Confirmamos o valor, a forma de pagamento e o prazo, e enviamos o seu pedido.</p></li>
        </ol>
      </div>
    </section>
  );
}

const faqs = [
  { q: "Os produtos AXON são medicamentos?", a: "Não. Os produtos AXON são suplementos alimentares e produtos de bem-estar. Eles complementam uma alimentação equilibrada e não substituem orientação médica nem tratamentos." },
  { q: "Como faço meu pedido?", a: "Pelo WhatsApp. Em cada página de produto há um botão que abre a conversa com o nome do produto. Confirmamos o valor, a forma de pagamento e o prazo de entrega com você." },
  { q: "Vocês entregam em todo o Brasil?", a: "Sim. O prazo e o valor do frete dependem da sua região e são informados no atendimento, antes da confirmação do pedido." },
  { q: "Posso tomar mais de um produto AXON ao mesmo tempo?", a: "Muitas pessoas combinam produtos da linha. Se você usa medicamentos, está grávida ou amamentando, converse antes com um profissional de saúde." },
  { q: "Como devo conservar os produtos?", a: "Mantenha em local fresco e seco, ao abrigo da luz e fora do alcance de crianças. Após aberto, feche bem a embalagem e respeite a validade indicada no rótulo." },
];

export function Faq() {
  return (
    <section className="band faq" id="perguntas">
      <div className="wrap">
        <div className="sec-head center">
          <div>
            <p className="eyebrow">Perguntas frequentes</p>
            <h2>Tire as suas dúvidas.</h2>
          </div>
        </div>
        <div className="faq-list">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="band cta-band">
      <div className="wrap">
        <Logo size={84} className="cta-logo" />
        <h2>Encontre a fórmula certa para a sua rotina.</h2>
        <p>Nossa equipe ajuda você a escolher entre os produtos da linha AXON. É só mandar uma mensagem.</p>
        <div className="hero-ctas">
          <Link className="btn" href="/contato">Fale conosco</Link>
          <Link className="link" href="/produtos">Ver produtos</Link>
        </div>
      </div>
    </section>
  );
}
