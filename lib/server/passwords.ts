import "server-only";

import { randomBytes, scrypt, scryptSync, timingSafeEqual, type ScryptOptions } from "node:crypto";

// Palavras-passe guardadas com scrypt e sal aleatório: "scrypt$N$r$p$sal$hash" (base64url).
const PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 } satisfies ScryptOptions;
const KEY_LENGTH = 64;

function scryptAsync(password: string, salt: Buffer, keyLength: number, options: ScryptOptions) {
  return new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, keyLength, options, (error, key) => (error ? reject(error) : resolve(key))),
  );
}

function format(salt: Buffer, key: Buffer) {
  return ["scrypt", PARAMS.N, PARAMS.r, PARAMS.p, salt.toString("base64url"), key.toString("base64url")].join("$");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  return format(salt, await scryptAsync(password, salt, KEY_LENGTH, PARAMS));
}

export function hashPasswordSync(password: string): string {
  const salt = randomBytes(16);
  return format(salt, scryptSync(password, salt, KEY_LENGTH, PARAMS));
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, N, r, p, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = await scryptAsync(password, Buffer.from(salt, "base64url"), expected.length, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
    maxmem: PARAMS.maxmem,
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

let dummyHash: string | undefined;

// Hash usado quando o e-mail não existe, para a resposta demorar o mesmo e não revelar contas.
export function getDummyHash() {
  dummyHash ??= hashPasswordSync(randomBytes(12).toString("hex"));
  return dummyHash;
}
