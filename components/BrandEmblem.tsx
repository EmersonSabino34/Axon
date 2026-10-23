import { brandConfig } from "@/lib/site-config";
import { AXON_LETTERS, SPROUT, SPROUT_ORIGIN } from "./brand-paths";

// Emblema AXON: disco verde com anel dourado duplo, «AXON» com o raminho a nascer do «O» e,
// na versão completa, a linha e o slogan. Versão vetorial feita a partir do logótipo da marca;
// as cores vêm dos tokens do site (globals.css). Quando houver o ficheiro oficial, substitua-o aqui.

type BrandEmblemProps = {
  /** "compact": só o nome (cabeçalhos). "full": com linha e slogan (destaques, rodapé). */
  variant?: "compact" | "full";
  className?: string;
  /** Nome acessível. Sem ele, o emblema é decorativo (use-o dentro de um link com aria-label). */
  label?: string;
};

const LETTERS_WIDTH = AXON_LETTERS.right - AXON_LETTERS.left;

function NameWithSprout({ x, y, width }: { x: number; y: number; width: number }) {
  const scale = width / LETTERS_WIDTH;
  return (
    <g transform={`translate(${(x - AXON_LETTERS.left * scale).toFixed(3)} ${y}) scale(${scale.toFixed(5)})`}>
      <path className="emblem__letters" d={AXON_LETTERS.d} />
      <g transform={`translate(${SPROUT_ORIGIN.x} ${SPROUT_ORIGIN.y})`}>
        <path className="emblem__stem" d={SPROUT.stem} fill="none" strokeWidth={3.2} strokeLinecap="round" />
        <g transform={SPROUT.small.transform}>
          <path className="emblem__leaf-sage" d={SPROUT.small.light} />
          <path className="emblem__leaf-sage-shade" d={SPROUT.small.shade} />
        </g>
        <g transform={SPROUT.large.transform}>
          <path className="emblem__leaf-gold" d={SPROUT.large.light} />
          <path className="emblem__leaf-gold-shade" d={SPROUT.large.shade} />
        </g>
      </g>
    </g>
  );
}

export function BrandEmblem({ variant = "compact", className = "", label }: BrandEmblemProps) {
  const a11y = label ? ({ role: "img", "aria-label": label } as const) : ({ "aria-hidden": true } as const);
  const full = variant === "full";
  const { descriptor, registered } = brandConfig;

  // Medidas num quadro de 200 × 200. O nome e o raminho ficam centrados no disco.
  const width = full ? 138 : 150;
  const x = (200 - width) / 2;
  const capHeight = (width / LETTERS_WIDTH) * 100;
  const capTop = full ? (descriptor ? 80 : 88) : 101;
  const capBottom = capTop + capHeight;
  const descriptorY = capBottom + 15;
  const ruleY = descriptor ? descriptorY + 10 : capBottom + 11;
  const sloganY = ruleY + 14;

  return (
    <svg viewBox="0 0 200 200" className={`emblem emblem--${variant} ${className}`} focusable="false" {...a11y}>
      <circle className="emblem__disc" cx="100" cy="100" r="97" />
      <circle className="emblem__inner" cx="100" cy="100" r="90" />
      <circle className="emblem__ring" cx="100" cy="100" r="95.5" strokeWidth="3" />
      <circle className="emblem__ring emblem__ring--thin" cx="100" cy="100" r="90.5" strokeWidth="0.8" />

      <NameWithSprout x={x} y={capTop} width={width} />
      {registered && (
        <text className="emblem__mark" x={x + width + 3} y={capTop + 8} fontSize="8">
          ®
        </text>
      )}

      {full && (
        <>
          {descriptor && (
            <text
              className="emblem__descriptor"
              x="100"
              y={descriptorY}
              textAnchor="middle"
              fontSize="8.4"
              textLength="140"
              lengthAdjust="spacing"
            >
              {descriptor.toUpperCase()}
            </text>
          )}
          <path className="emblem__rule" d={`M78 ${ruleY}H122`} strokeWidth="0.8" />
          <text
            className="emblem__slogan"
            x="100"
            y={sloganY}
            textAnchor="middle"
            fontSize="6.6"
            textLength="128"
            lengthAdjust="spacing"
          >
            UMA VIDA EXTRAORDINÁRIA
          </text>
        </>
      )}
    </svg>
  );
}
