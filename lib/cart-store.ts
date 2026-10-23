// Estado do carrinho fora do React, lido com useSyncExternalStore.
// Guarda apenas o identificador e a quantidade de cada artigo (sem dados pessoais) no localStorage
// deste navegador, para o carrinho sobreviver a um recarregamento da página.

export type CartLine = { slug: string; quantity: number };

const STORAGE_KEY = "axon-carrinho";
export const MAX_QUANTITY = 20;
const EMPTY: CartLine[] = [];

let lines: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function readStorage(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter(
      (line): line is CartLine =>
        typeof line?.slug === "string" &&
        Number.isInteger(line?.quantity) &&
        line.quantity > 0,
    );
  } catch {
    return EMPTY;
  }
}

function writeStorage(next: CartLine[]) {
  try {
    if (next.length === 0) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Armazenamento indisponível (modo privado, bloqueado): o carrinho funciona só nesta visita.
  }
}

function commit(next: CartLine[]) {
  lines = next;
  writeStorage(next);
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  lines = readStorage();
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot(): CartLine[] {
  if (!loaded) {
    loaded = true;
    lines = readStorage();
  }
  return lines;
}

export function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

export function addItem(slug: string) {
  const current = getSnapshot();
  const existing = current.find((line) => line.slug === slug);
  commit(
    existing
      ? current.map((line) =>
          line.slug === slug ? { ...line, quantity: Math.min(line.quantity + 1, MAX_QUANTITY) } : line,
        )
      : [...current, { slug, quantity: 1 }],
  );
}

export function setQuantity(slug: string, quantity: number) {
  if (quantity <= 0) return removeItem(slug);
  const clamped = Math.min(quantity, MAX_QUANTITY);
  commit(getSnapshot().map((line) => (line.slug === slug ? { ...line, quantity: clamped } : line)));
}

export function removeItem(slug: string) {
  commit(getSnapshot().filter((line) => line.slug !== slug));
}

export function clearCart() {
  commit(EMPTY);
}
