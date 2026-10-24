import type { Product } from "@/lib/products";
import { SproutPaths } from "./Sprout";


const GOLD = "#D6AE65";
const CREAM = "#E8DCC6";


// Rótulo comum às três embalagens: selo circular com o símbolo, nome do produto e linha do rótulo.
function Label({ p, top, width, id }: { p: Product; top: number; width: number; id: string }) {
  const cx = 80;
  const nameSize = Math.min(17, (width - 14) / (p.name.length * 0.78));
  return (
    <g>
      <circle cx={cx} cy={top + 22} r={17} fill="none" stroke={`url(#${id}-gold)`} strokeWidth={1.2} />
      <circle cx={cx} cy={top + 22} r={14} fill="none" stroke={GOLD} strokeOpacity={0.4} strokeWidth={0.5} />
      <g transform={`translate(${cx - 6} ${top + 9}) scale(0.25)`} color={GOLD}>
        <SproutPaths />
      </g>
      <text x={cx} y={top + 31} textAnchor="middle" style={{ fontFamily: "var(--font-serif), Georgia, serif" }} fontSize={7.5} letterSpacing={0.8} fill={GOLD}>AXON</text>
      <text x={cx} y={top + 60} textAnchor="middle" style={{ fontFamily: "var(--font-serif), Georgia, serif" }} fontSize={nameSize} letterSpacing={nameSize * 0.14} fill={`url(#${id}-gold)`}>{p.name}</text>
      <text x={cx} y={top + 71} textAnchor="middle" style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }} fontSize={4.6} letterSpacing={1.1} fill={CREAM}>{p.label.toUpperCase()}</text>
      <line x1={cx - 16} x2={cx + 16} y1={top + 78} y2={top + 78} stroke={GOLD} strokeWidth={0.5} />
      {p.supplement && (
        <text x={cx} y={top + 87} textAnchor="middle" style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }} fontSize={3.8} letterSpacing={0.9} fill={CREAM} fillOpacity={0.8}>SUPLEMENTO ALIMENTAR</text>
      )}
      <text x={cx} y={top + 96} textAnchor="middle" style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }} fontSize={4.6} letterSpacing={0.6} fill={CREAM}>
        {p.format === "capsulas" ? "60 cápsulas" : p.format === "sache" ? "Ritual para os pés" : p.size}
      </text>
    </g>
  );
}

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-gold`} x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stopColor="#F0D79A" />
        <stop offset=".45" stopColor="#D6AE65" />
        <stop offset="1" stopColor="#9C7638" />
      </linearGradient>
      <linearGradient id={`${id}-goldh`} x1="0" x2="1">
        <stop offset="0" stopColor="#9C7638" />
        <stop offset=".3" stopColor="#F0D79A" />
        <stop offset=".6" stopColor="#D6AE65" />
        <stop offset="1" stopColor="#8A6A2C" />
      </linearGradient>
      <linearGradient id={`${id}-amber`} x1="0" x2="1">
        <stop offset="0" stopColor="#2A1306" />
        <stop offset=".35" stopColor="#7A3E12" />
        <stop offset=".6" stopColor="#5A2B0B" />
        <stop offset="1" stopColor="#1F0E04" />
      </linearGradient>
      <linearGradient id={`${id}-green`} x1="0" x2="1">
        <stop offset="0" stopColor="#07150F" />
        <stop offset=".35" stopColor="#1C4434" />
        <stop offset=".65" stopColor="#10291F" />
        <stop offset="1" stopColor="#050E0A" />
      </linearGradient>
      <linearGradient id={`${id}-label`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#143326" />
        <stop offset="1" stopColor="#0C2018" />
      </linearGradient>
    </defs>
  );
}

function Dropper({ p, id }: { p: Product; id: string }) {
  return (
    <>
      <rect x="64" y="6" width="32" height="44" rx="16" fill="#151515" />
      <rect x="70" y="10" width="5" height="34" rx="2.5" fill="#fff" fillOpacity=".12" />
      <rect x="56" y="46" width="48" height="34" rx="3" fill={`url(#${id}-goldh)`} />
      {Array.from({ length: 11 }).map((_, i) => (
        <line key={i} x1={60 + i * 4} x2={60 + i * 4} y1="50" y2="76" stroke="#000" strokeOpacity=".12" strokeWidth=".8" />
      ))}
      <rect x="62" y="80" width="36" height="9" fill="#2A1306" />
      <path d="M32 112Q32 90 58 89H102Q128 90 128 112V236Q128 248 116 248H44Q32 248 32 236Z" fill={`url(#${id}-amber)`} />
      <rect x="38" y="122" width="84" height="112" fill={`url(#${id}-label)`} />
      <rect x="41" y="125" width="78" height="106" fill="none" stroke={GOLD} strokeOpacity=".55" strokeWidth=".6" />
      <Label p={p} top={128} width={78} id={id} />
      <rect x="40" y="98" width="5" height="140" rx="2.5" fill="#fff" fillOpacity=".09" />
    </>
  );
}

function Jar({ p, id }: { p: Product; id: string }) {
  return (
    <>
      <rect x="34" y="30" width="92" height="38" rx="4" fill={`url(#${id}-goldh)`} />
      {Array.from({ length: 22 }).map((_, i) => (
        <line key={i} x1={38 + i * 4} x2={38 + i * 4} y1="33" y2="65" stroke="#000" strokeOpacity=".1" strokeWidth=".8" />
      ))}
      <rect x="40" y="68" width="80" height="10" fill="#06110C" />
      <path d="M24 102Q24 78 50 78H110Q136 78 136 102V234Q136 248 122 248H38Q24 248 24 234Z" fill={`url(#${id}-green)`} />
      <line x1="30" x2="130" y1="114" y2="114" stroke={GOLD} strokeOpacity=".6" strokeWidth=".6" />
      <line x1="30" x2="130" y1="232" y2="232" stroke={GOLD} strokeOpacity=".6" strokeWidth=".6" />
      <Label p={p} top={124} width={92} id={id} />
      <rect x="32" y="90" width="6" height="146" rx="3" fill="#fff" fillOpacity=".07" />
    </>
  );
}

function Sachet({ p, id }: { p: Product; id: string }) {
  const zig = (y: number) =>
    `M28 ${y}` + Array.from({ length: 13 }).map((_, i) => `L${32 + i * 8} ${y + (i % 2 ? 0 : 4)}`).join("") + `L132 ${y}`;
  return (
    <>
      <path d={`${zig(28)}V246H28Z`} fill={`url(#${id}-green)`} />
      <rect x="28" y="32" width="104" height="16" fill="#06110C" fillOpacity=".5" />
      <rect x="28" y="228" width="104" height="18" fill="#06110C" fillOpacity=".5" />
      {Array.from({ length: 26 }).map((_, i) => (
        <g key={i} stroke={GOLD} strokeOpacity=".18" strokeWidth=".6">
          <line x1={30 + i * 4} x2={30 + i * 4} y1="34" y2="46" />
          <line x1={30 + i * 4} x2={30 + i * 4} y1="230" y2="244" />
        </g>
      ))}
      <rect x="36" y="64" width="88" height="150" fill="none" stroke={GOLD} strokeOpacity=".55" strokeWidth=".6" />
      <Label p={p} top={92} width={88} id={id} />
      <rect x="34" y="50" width="5" height="176" rx="2.5" fill="#fff" fillOpacity=".06" />
    </>
  );
}

export function Pack({ p, className, idSuffix = "" }: { p: Product; className?: string; idSuffix?: string }) {
  const id = `pk-${p.slug}${idSuffix}`;
  return (
    <svg className={className} viewBox="0 0 160 260" role="img" aria-label={`Embalagem AXON ${p.name}, ${p.formatLabel.toLowerCase()}`}>
      <Defs id={id} />
      <ellipse cx="80" cy="252" rx="58" ry="5" fill="#10291F" opacity=".16" />
      {p.format === "liquido" && <Dropper p={p} id={id} />}
      {p.format === "capsulas" && <Jar p={p} id={id} />}
      {p.format === "sache" && <Sachet p={p} id={id} />}
    </svg>
  );
}
