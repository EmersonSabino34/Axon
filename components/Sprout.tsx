// Símbolo botânico linear da AXON, redesenhado a partir do manual.
export function SproutPaths() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 44V22" />
      <path d="M24 26c0-9 5-16 15-19 1 10-4 18-15 19z" />
      <path d="M24 26c4-5 8-9 12-14" />
      <path d="M24 31c0-6-4-10-13-11 0 7 4 11 13 11z" />
      <path d="M24 31c-3-3-6-6-10-8" />
    </g>
  );
}

export function Sprout({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <SproutPaths />
    </svg>
  );
}
