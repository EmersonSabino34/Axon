import "server-only";
import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

// Administradores e clientes têm sessões separadas: cada um com o seu cookie,
// e o tipo vai dentro do conteúdo assinado, para um não servir no lugar do outro.
const COOKIES = { admin: "axon_admin", customer: "axon_cliente" } as const;
type SessionKind = keyof typeof COOKIES;
const MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("Defina AUTH_SECRET no ficheiro .env (mínimo 16 caracteres).");
  return s;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = scryptSync(password, salt, 64);
  const known = Buffer.from(hash, "hex");
  return known.length === test.length && timingSafeEqual(known, test);
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export async function createSession(userId: string, kind: SessionKind) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = Buffer.from(JSON.stringify({ uid: userId, kind, exp })).toString("base64url");
  (await cookies()).set(COOKIES[kind], `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(kind: SessionKind) {
  (await cookies()).delete(COOKIES[kind]);
}

async function sessionUserId(kind: SessionKind) {
  const raw = (await cookies()).get(COOKIES[kind])?.value;
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (expected.length !== sig.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (data.kind !== kind || typeof data.uid !== "string") return null;
    if (typeof data.exp !== "number" || data.exp < Date.now() / 1000) return null;
    return data.uid as string;
  } catch {
    return null;
  }
}

export async function getAdmin() {
  const uid = await sessionUserId("admin");
  if (!uid) return null;
  return db.adminUser.findUnique({ where: { id: uid }, select: { id: true, email: true, name: true } });
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function getCustomer() {
  const uid = await sessionUserId("customer");
  if (!uid) return null;
  return db.customer.findUnique({ where: { id: uid }, select: { id: true, name: true, email: true, phone: true, createdAt: true } });
}

export async function requireCustomer() {
  const customer = await getCustomer();
  if (!customer) redirect("/entrar");
  return customer;
}

/* Link de nova senha: o código só existe no link; na base fica o hash dele. */

export const RESET_HOURS = 24;
const resetHash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createPasswordReset(customerId: string) {
  const token = randomBytes(32).toString("base64url");
  const resetExpires = new Date(Date.now() + RESET_HOURS * 60 * 60 * 1000);
  await db.customer.update({ where: { id: customerId }, data: { resetTokenHash: resetHash(token), resetExpires } });
  return token;
}

export async function findPasswordReset(token: string) {
  if (!token) return null;
  const customer = await db.customer.findUnique({ where: { resetTokenHash: resetHash(token) }, select: { id: true, name: true, resetExpires: true } });
  if (!customer?.resetExpires || customer.resetExpires.getTime() < Date.now()) return null;
  return customer;
}
