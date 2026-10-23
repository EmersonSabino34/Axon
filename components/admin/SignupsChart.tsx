"use client";

import { useState, type KeyboardEvent } from "react";
import { formatDayMonth } from "@/lib/dates";

type Point = { date: string; count: number };

// Marcas de eixo "redondas": 0, 1, 2… para valores pequenos; múltiplos de 1, 2 ou 5 nos restantes.
function niceTicks(max: number): number[] {
  if (max <= 4) return Array.from({ length: Math.max(2, max) + 1 }, (_, index) => index);
  const rough = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= rough) ?? rough;
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: top / step + 1 }, (_, index) => index * step);
}

const plural = (count: number) => (count === 1 ? "novo cliente" : "novos clientes");

export function SignupsChart({ data }: { data: Point[] }) {
  const [active, setActive] = useState<number | null>(null);
  const ticks = niceTicks(Math.max(0, ...data.map((point) => point.count)));
  const top = ticks[ticks.length - 1];
  const total = data.reduce((sum, point) => sum + point.count, 0);
  const last = data.length - 1;
  const current = active === null ? null : data[active];

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const from = active ?? last;
    const next = { ArrowLeft: from - 1, ArrowRight: from + 1, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setActive(Math.min(last, Math.max(0, next)));
  };

  return (
    <figure className="chart">
      <figcaption className="chart__header">
        <span className="chart__title">Novos clientes por dia</span>
        <span className="chart__subtitle">
          Últimos {data.length} dias · {total} no total
        </span>
      </figcaption>

      <div className="chart__body">
        <div className="chart__y" aria-hidden="true">
          {ticks
            .slice()
            .reverse()
            .map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
        </div>

        <div
          className="chart__plot"
          role="group"
          tabIndex={0}
          aria-label="Gráfico de novos clientes por dia. Use as setas para percorrer os dias."
          onKeyDown={onKeyDown}
          onFocus={() => setActive((value) => value ?? last)}
          onBlur={() => setActive(null)}
          onPointerLeave={() => setActive(null)}
        >
          {ticks.map((tick) => (
            <span key={tick} className="chart__grid" style={{ bottom: `${(tick / top) * 100}%` }} />
          ))}
          <div className="chart__bars">
            {data.map((point, index) => (
              <div
                key={point.date}
                className={`chart__col${active === index ? " is-active" : ""}`}
                onPointerEnter={() => setActive(index)}
              >
                <span className="chart__bar" style={{ height: `${(point.count / top) * 100}%` }} />
              </div>
            ))}
          </div>
          {current && active !== null && (
            <div
              className="chart__tooltip"
              style={{
                left: `${((active + 0.5) / data.length) * 100}%`,
                bottom: `${(current.count / top) * 100}%`,
              }}
            >
              <strong>{current.count}</strong>
              <span>{formatDayMonth(current.date)}</span>
            </div>
          )}
          {total === 0 && <p className="chart__empty">Ainda não há registos de clientes neste período.</p>}
        </div>

        <div className="chart__x" aria-hidden="true">
          {data.map((point, index) => (
            <span key={point.date}>
              {index === last || (index % 7 === 0 && last - index >= 4) ? formatDayMonth(point.date) : ""}
            </span>
          ))}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {current ? `${formatDayMonth(current.date)}: ${current.count} ${plural(current.count)}` : ""}
      </p>

      <details className="chart__table">
        <summary>Ver dados em tabela</summary>
        <table className="data-table data-table--compact">
          <thead>
            <tr>
              <th scope="col">Dia</th>
              <th scope="col" className="data-table__number">
                Novos clientes
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((point) => (
              <tr key={point.date}>
                <td>{formatDayMonth(point.date)}</td>
                <td className="data-table__number">{point.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
