export function brl(cents: number | null | undefined) {
  if (cents == null) return "Sob consulta";
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function parseBrl(value: string): number | null {
  const clean = value.replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  if (!clean) return null;
  const n = Number(clean);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

export function dateBR(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function dateTimeBR(d: Date) {
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export const orderStatuses = [
  { key: "novo", label: "Novo" },
  { key: "confirmado", label: "Confirmado" },
  { key: "enviado", label: "Enviado" },
  { key: "entregue", label: "Entregue" },
  { key: "cancelado", label: "Cancelado" },
] as const;

export function statusLabel(key: string) {
  return orderStatuses.find((s) => s.key === key)?.label ?? key;
}
