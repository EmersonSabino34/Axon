import { DesignIcon, DocumentIcon, PathIcon } from "./LineIcons";

const values = [
  {
    icon: DesignIcon,
    title: "Design cuidado",
    text: "Embalagens e páginas pensadas ao pormenor, com uma linguagem visual única.",
  },
  {
    icon: DocumentIcon,
    title: "Informação transparente",
    text: "Cada dado é publicado apenas depois de confirmado, e o que falta fica assinalado.",
  },
  {
    icon: PathIcon,
    title: "Experiência simples",
    text: "Uma navegação direta, sem ruído, do primeiro olhar à escolha.",
  },
];

export function ValuesBand() {
  return (
    <section className="values-band" aria-labelledby="values-title">
      <h2 id="values-title" className="sr-only">
        Os valores AXON
      </h2>
      <ul className="container values-band__list">
        {values.map(({ icon: Icon, title, text }) => (
          <li key={title} className="values-band__item">
            <span className="values-band__icon">
              <Icon width={22} height={22} />
            </span>
            <div>
              <h3 className="values-band__title">{title}</h3>
              <p className="values-band__text">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
