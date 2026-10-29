import { SproutPaths } from "./Sprout";

// Emblema circular da AXON: anel duplo, símbolo botânico e nome. "full" acrescenta a linha "Suplementos naturais".
export function Logo({ size = 56, full = false, tone = "dark", className }: { size?: number; full?: boolean; tone?: "dark" | "light"; className?: string }) {
  const ring = tone === "dark" ? "#10291F" : "#D6AE65";
  const word = tone === "dark" ? "#10291F" : "#D6AE65";
  const sub = tone === "dark" ? "#55625B" : "#E8DCC6";
  return (

    <svg className={className} width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="AXON Suplementos Naturais">
      <circle cx="60" cy="60" r="57" fill="none" stroke={ring} strokeWidth="1.4" />
      <circle cx="60" cy="60" r="52" fill="none" stroke="#D6AE65" strokeOpacity=".7" strokeWidth=".6" />
      <g transform={`translate(${full ? 51 : 49} ${full ? 18 : 17}) scale(${full ? 0.4 : 0.46})`} color="#B8913F">
        <SproutPaths />
      </g>
      <text x="60" y={full ? 68 : 74} textAnchor="middle" style={{ fontFamily: "var(--font-serif), Georgia, serif" }} fontSize={full ? 25 : 29} letterSpacing="1.5" fill={word}>AXON</text>
      {full && (
        <>
          <text x="60" y="80" textAnchor="middle" style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }} fontSize="5.2" letterSpacing="1.6" fill={sub}>SUPLEMENTOS NATURAIS</text>
          <line x1="46" x2="74" y1="87" y2="87" stroke="#D6AE65" strokeWidth=".6" />
          <text x="60" y="95" textAnchor="middle" style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }} fontSize="4.2" letterSpacing="1.3" fill={sub}>UMA VIDA EXTRAORDINÁRIA</text>
        </>
      )}
    </svg>
  );
}
