import "server-only";

import { getDb, nowIso } from "./db";

export type Role = "cliente" | "admin";

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  lastLoginAt: string | null;
};

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: Role;
  created_at: string;
  last_login_at: string | null;
};

const USER_COLUMNS = "id, name, email, role, created_at, last_login_at";

function toUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
  };
}

export class EmailTakenError extends Error {}

export function createUser(input: { name: string; email: string; passwordHash: string }): User {
  const db = getDb();
  const now = nowIso();
  try {
    const result = db
      .prepare(
        "INSERT INTO users (name, email, password_hash, role, terms_accepted_at, created_at) VALUES (?, ?, ?, 'cliente', ?, ?)",
      )
      .run(input.name, input.email, input.passwordHash, now, now);
    return getUserById(Number(result.lastInsertRowid)) as User;
  } catch (error) {
    if (error instanceof Error && /UNIQUE constraint failed/.test(error.message)) throw new EmailTakenError();
    throw error;
  }
}

export function getUserById(id: number): User | null {
  const row = getDb().prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`).get(id) as UserRow | undefined;
  return row ? toUser(row) : null;
}

export function getCredentialsByEmail(email: string): (User & { passwordHash: string }) | null {
  const row = getDb()
    .prepare(`SELECT ${USER_COLUMNS}, password_hash FROM users WHERE email = ?`)
    .get(email) as (UserRow & { password_hash: string }) | undefined;
  return row ? { ...toUser(row), passwordHash: row.password_hash } : null;
}

export function getPasswordHash(id: number): string | null {
  const row = getDb().prepare("SELECT password_hash FROM users WHERE id = ?").get(id) as
    | { password_hash: string }
    | undefined;
  return row?.password_hash ?? null;
}

export function touchLastLogin(id: number) {
  getDb().prepare("UPDATE users SET last_login_at = ? WHERE id = ?").run(nowIso(), id);
}

export function updateUserName(id: number, name: string) {
  getDb().prepare("UPDATE users SET name = ? WHERE id = ?").run(name, id);
}

export function updatePasswordHash(id: number, passwordHash: string) {
  getDb().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(passwordHash, id);
}

export function deleteUser(id: number) {
  getDb().prepare("DELETE FROM users WHERE id = ?").run(id);
}

export function listCustomers(search = ""): User[] {
  const term = `%${search.trim().replace(/[%_]/g, "")}%`;
  const rows = getDb()
    .prepare(
      `SELECT ${USER_COLUMNS} FROM users WHERE role = 'cliente' AND (name LIKE ? OR email LIKE ?) ORDER BY created_at DESC`,
    )
    .all(term, term) as UserRow[];
  return rows.map(toUser);
}

export function countCustomers(sinceIso?: string): number {
  const db = getDb();
  const row = sinceIso
    ? db.prepare("SELECT COUNT(*) AS total FROM users WHERE role = 'cliente' AND created_at >= ?").get(sinceIso)
    : db.prepare("SELECT COUNT(*) AS total FROM users WHERE role = 'cliente'").get();
  return (row as { total: number }).total;
}

/** Clientes registados nos últimos `days` dias. */
export function countRecentCustomers(days: number): number {
  return countCustomers(new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());
}

/** Novos clientes por dia (UTC) nos últimos `days` dias, incluindo hoje, com zeros nos dias vazios. */
export function signupsByDay(days: number): { date: string; count: number }[] {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const rows = getDb()
    .prepare(
      "SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS total FROM users WHERE role = 'cliente' AND created_at >= ? GROUP BY day",
    )
    .all(start.toISOString()) as { day: string; total: number }[];
  const byDay = new Map(rows.map((row) => [row.day, row.total]));

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    const key = date.toISOString().slice(0, 10);
    return { date: key, count: byDay.get(key) ?? 0 };
  });
}
