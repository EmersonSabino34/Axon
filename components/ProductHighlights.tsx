import type { Product } from "@/lib/collection";
import { CheckIcon } from "./LineIcons";

// Pontos fortes da apresentação e, quando existirem, as alegações já validadas.
export function ProductHighlights({ product }: { product: Product }) {
  return (
    <>
      <ul className="highlight-list">
        {product.highlights.map((highlight) => (
          <li key={highlight}>
            <CheckIcon width={18} height={18} />
            {highlight}
          </li>
        ))}
      </ul>
      {product.validatedClaims.length > 0 && (
        <div className="claims">
          <p className="claims__title">O que faz</p>
          <ul className="highlight-list">
            {product.validatedClaims.map((claim) => (
              <li key={claim}>
                <CheckIcon width={18} height={18} />
                {claim}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
