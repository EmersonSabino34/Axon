// Faixa dourada em movimento contínuo, entre a área principal e a página. Decorativa: as palavras
// descrevem a embalagem e a marca, nunca efeitos dos produtos.

const words = [
  "Vidro âmbar",
  "Tampas douradas",
  "Verde-floresta",
  "Conta-gotas",
  "Cápsulas",
  "Design AXON",
  "Uma Vida Extraordinária",
];

// Quatro cópias cobrem ecrãs largos; a animação desloca exatamente uma cópia para o ciclo não se notar.
const copies = [0, 1, 2, 3];

export function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {copies.map((copy) => (
          <ul key={copy} className="marquee__group">
            {words.map((word) => (
              <li key={word} className="marquee__item">
                {word}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
