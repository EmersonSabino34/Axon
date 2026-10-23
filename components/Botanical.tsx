// Ramo botânico em traço fino, usado como detalhe decorativo.

const leaves = [
  { x: 58, y: 182, r: -38 },
  { x: 59, y: 160, r: 214 },
  { x: 58, y: 136, r: -44 },
  { x: 57, y: 112, r: 220 },
  { x: 56, y: 88, r: -50 },
  { x: 57, y: 64, r: 226 },
  { x: 60, y: 42, r: -58 },
  { x: 63, y: 22, r: 232 },
];

export function Botanical({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 220" className={`botanical ${className}`} aria-hidden="true" focusable="false">
      <path d="M60 216c-2-46 2-92-3-138-2-24 2-48 8-72" />
      {leaves.map((leaf) => (
        <path
          key={`${leaf.x}-${leaf.y}`}
          d="M0 0c7-9 20-12 30-7-8 7-19 10-30 7z"
          transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.r})`}
        />
      ))}
    </svg>
  );
}
