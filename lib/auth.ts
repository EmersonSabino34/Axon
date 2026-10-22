import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

const COOKIE = "axon_admin";
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

export async function createSession(userId: string) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp })).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getAdmin() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (expected.length !== sig.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  try {
    const { uid, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof exp !== "number" || exp < Date.now() / 1000) return null;
    return await db.adminUser.findUnique({ where: { id: uid }, select: { id: true, email: true, name: true } });
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
