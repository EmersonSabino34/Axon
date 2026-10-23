import "server-only";

// Limite simples de tentativas de login falhadas por e-mail, em memória do servidor.
// Num ambiente com vários servidores, substitua por um armazenamento partilhado.

const MAX_FAILURES = 5;
const LOCK_MINUTES = 15;
const failures = new Map<string, { count: number; lockedUntil: number }>();

/** Minutos que faltam para poder tentar de novo, ou 0. */
export function loginLockMinutes(email: string): number {
  const entry = failures.get(email);
  if (!entry || entry.lockedUntil <= Date.now()) return 0;
  return Math.ceil((entry.lockedUntil - Date.now()) / 60_000);
}

export function recordLoginFailure(email: string) {
  const entry = failures.get(email) ?? { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= MAX_FAILURES) {
    entry.count = 0;
    entry.lockedUntil = Date.now() + LOCK_MINUTES * 60_000;
  }
  failures.set(email, entry);
}

export function clearLoginFailures(email: string) {
  failures.delete(email);
}
