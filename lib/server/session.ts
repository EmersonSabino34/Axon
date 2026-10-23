import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { io } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getDb, nowIso } from "./db";
import { getUserById, type User } from "./users";

// Sessões guardadas na base de dados: o navegador recebe um token aleatório num cookie httpOnly
// e o servidor guarda apenas o hash desse token. Não há chaves secretas no código do navegador.

const COOKIE_NAME = "axon_sessao";
const SESSION_DAYS = 30;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(nowIso());
  db.prepare("INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)").run(
    hashToken(token),
    userId,
    nowIso(),
    expires.toISOString(),
  );

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
  cookieStore.delete(COOKIE_NAME);
}

/** Utilizador da sessão atual, ou `null`. Lê o cookie: use-o dentro de um <Suspense>. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  // A validade da sessão depende da hora atual e de uma leitura síncrona da base de dados:
  // io() deixa esta parte fora das pré-renderizações (resolve-se de imediato num pedido normal).
  await io();
  const session = getDb()
    .prepare("SELECT user_id FROM sessions WHERE token_hash = ? AND expires_at > ?")
    .get(hashToken(token), nowIso()) as { user_id: number } | undefined;
  return session ? getUserById(session.user_id) : null;
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/conta");
  return user;
}
