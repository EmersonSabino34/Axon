import { BrandEmblem } from "./BrandEmblem";

const values = [
  { title: "Clareza", text: "Informação escrita para ser compreendida, sem exageros nem promessas." },
  { title: "Consistência", text: "A mesma linguagem visual da embalagem ao ecrã." },
  { title: "Cuidado", text: "Atenção ao pormenor em cada ponto de contacto com a marca." },
  { title: "Transparência", text: "Publicamos o que está confirmado e dizemos com clareza o que falta." },
];

export function BrandStory() {
  return (
    <section id="marca" className="section brand" aria-labelledby="brand-title">
      <div className="container">
        <div className="brand__intro">
          <BrandEmblem variant="full" className="brand__emblem" />
          <p className="eyebrow eyebrow--light">A Marca</p>
          <h2 id="brand-title" className="section-title section-title--light">
            Menos ruído. <em>Mais intenção.</em>
          </h2>
          <p className="brand__text">
            A AXON une uma identidade visual intemporal a uma experiência clara. Cada detalhe — da embalagem à página
            de produto — existe para o ajudar a encontrar informação compreensível e a escolher com confiança.
          </p>
        </div>

        <ol className="brand-values">
          {values.map((value) => (
            <li key={value.title} className="brand-values__item">
              <h3 className="brand-values__title">{value.title}</h3>
              <p className="brand-values__text">{value.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
