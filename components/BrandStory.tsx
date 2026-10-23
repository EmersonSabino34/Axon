import { Botanical } from "./Botanical";

const values = [
  { title: "Clareza", text: "Informação escrita para ser compreendida, sem exageros nem promessas." },
  { title: "Consistência", text: "A mesma linguagem visual da embalagem ao ecrã." },
  { title: "Cuidado", text: "Atenção ao pormenor em cada ponto de contacto com a marca." },
  { title: "Transparência", text: "Publicamos o que está confirmado e dizemos com clareza o que falta." },
];

export function BrandStory() {
  return (
    <section id="marca" className="section brand" aria-labelledby="brand-title">
      <div className="container brand__inner">
        <div className="brand-plate" aria-hidden="true">
          <div className="brand-plate__frame">
            <Botanical className="brand-plate__sprig brand-plate__sprig--top" />
            <Botanical className="brand-plate__sprig brand-plate__sprig--bottom" />
            <span className="brand-plate__word">AXON</span>
            <span className="brand-plate__rule" />
            <span className="brand-plate__slogan">Uma Vida Extraordinária</span>
          </div>
        </div>

        <div className="brand__content">
          <p className="eyebrow">A Marca</p>
          <h2 id="brand-title" className="section-title">
            Menos ruído. Mais intenção.
          </h2>
          <p className="brand__text">
            A AXON procura unir uma identidade visual intemporal a uma experiência digital clara. Cada detalhe — da
            embalagem à página de produto — deve ajudar o cliente a encontrar informação compreensível e a tomar
            decisões informadas.
          </p>
          <ol className="brand-values">
            {values.map((value, index) => (
              <li key={value.title} className="brand-values__item">
                <span className="brand-values__number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="brand-values__title">{value.title}</h3>
                <p className="brand-values__text">{value.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
