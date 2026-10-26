import Image from "next/image";
import { AtmIcon, CardIcon, PhoneIcon, TruckIcon } from "./LineIcons";

const trust = [
  { icon: PhoneIcon, label: "MB WAY" },
  { icon: AtmIcon, label: "Multibanco" },
  { icon: CardIcon, label: "Cartão" },
  { icon: TruckIcon, label: "Entregas em Portugal" },
];

// Convite final, depois das perguntas frequentes: leva à coleção ou, antes da abertura, à newsletter.
export function Invitation({ storeOpen = false }: { storeOpen?: boolean }) {
  return (
    <section className="invitation" aria-labelledby="invitation-title">
      <div className="invitation__media" aria-hidden="true">
        <Image src="/marca/colecao-axon.webp" alt="" fill sizes="100vw" className="invitation__image" />
      </div>
      <div className="container invitation__inner">
        <p className="eyebrow eyebrow--light">O próximo passo é seu</p>
        <h2 id="invitation-title" className="invitation__title">
          A sua vida extraordinária <em>começa num pequeno gesto.</em>
        </h2>
        <p className="invitation__text">
          {storeOpen
            ? "Escolha o seu AXON e receba-o em casa, com pagamento seguro."
            : "A coleção está quase pronta. Deixe o seu e-mail e saiba antes de todos quando abrirmos."}
        </p>
        <div className="invitation__actions">
          <a href="#colecao" className="button button--gold button--glow">
            Escolher o meu AXON
          </a>
          {!storeOpen && (
            <a href="#newsletter" className="button button--outline-light">
              Avisem-me no lançamento
            </a>
          )}
        </div>
        {storeOpen && (
          <ul className="invitation__trust">
            {trust.map(({ icon: Icon, label }) => (
              <li key={label}>
                <Icon width={18} height={18} />
                {label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
