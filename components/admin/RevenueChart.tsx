"use client";

import { useState } from "react";

type Point = { label: string; value: number; orders: number };

function niceMax(v: number) {
  if (v <= 0) return 100;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

// Faturamento diário: uma série, barras finas com topo arredondado, tooltip ao passar o rato.
export function RevenueChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, H = 220, L = 56, R = 8, T = 12, B = 26;
  const max = niceMax(Math.max(...data.map((d) => d.value)));
  const step = (W - L - R) / data.length;
  const bw = Math.max(4, Math.min(16, step - 6));
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const h = hover != null ? data[hover] : null;

  return (
    <div className="chart" onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Faturamento por dia nos últimos 30 dias">
        {ticks.map((t) => (
          <g key={t}>
            <line className="grid-line" x1={L} x2={W - R} y1={y(t)} y2={y(t)} />
            <text className="axis" x={L - 8} y={y(t) + 4} textAnchor="end">{brl(t)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = L + i * step + (step - bw) / 2;
          const top = y(d.value);
          const height = H - B - top;
          const r = Math.min(4, height / 2, bw / 2);
          return (
            <g key={i}>
              {d.value > 0 && (
                <path className={`bar${hover === i ? " hl" : ""}`}
                  d={`M${x} ${H - B}V${top + r}Q${x} ${top} ${x + r} ${top}H${x + bw - r}Q${x + bw} ${top} ${x + bw} ${top + r}V${H - B}Z`} />
              )}
              {(i % 5 === 0 || i === data.length - 1) && (
                <text className="axis" x={L + i * step + step / 2} y={H - 8} textAnchor="middle">{d.label}</text>
              )}
              <rect className="hit" x={L + i * step} y={T} width={step} height={H - T - B} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={0} aria-label={`${d.label}: ${brl(d.value)}, ${d.orders} pedidos`} />
            </g>
          );
        })}
      </svg>
      {h && hover != null && (
        <div className="tip" style={{ left: `${((L + hover * step + step / 2) / W) * 100}%`, top: `${(y(h.value) / H) * 100}%` }}>
          {h.label}
          <b>{brl(h.value)}</b>
          {h.orders} {h.orders === 1 ? "pedido" : "pedidos"}
        </div>
      )}
      <details className="chart-table">
        <summary>Ver em tabela</summary>
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Dia</th><th className="num">Pedidos</th><th className="num">Faturamento</th></tr></thead>
            <tbody>{data.map((d) => <tr key={d.label}><td>{d.label}</td><td className="num">{d.orders}</td><td className="num">{brl(d.value)}</td></tr>)}</tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
