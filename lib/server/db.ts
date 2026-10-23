import "server-only";

import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { hashPasswordSync } from "./passwords";

// Base de dados SQLite do próprio Node (sem serviços externos). O ficheiro fica em data/axon.db,
// ou no caminho definido em DATABASE_PATH. Precisa de um servidor com disco persistente.

const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "axon.db");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cliente' CHECK (role IN ('cliente', 'admin')),
  terms_accepted_at TEXT,
  created_at TEXT NOT NULL,
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS product_overrides (
  slug TEXT PRIMARY KEY,
  price_cents INTEGER,
  stock INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'em-preparacao' CHECK (status IN ('em-preparacao', 'disponivel')),
  tagline TEXT,
  description TEXT,
  highlights TEXT,
  validated_claims TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS checklist (
  id TEXT PRIMARY KEY,
  done_at TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  token_hash TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('pendente', 'pago', 'enviado', 'cancelado', 'falhado')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mbway', 'multibanco', 'cartao')),
  provider TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_nif TEXT,
  ship_address TEXT NOT NULL,
  ship_postal_code TEXT NOT NULL,
  ship_city TEXT NOT NULL,
  subtotal_cents INTEGER NOT NULL,
  shipping_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  payment_request_id TEXT,
  mb_entity TEXT,
  mb_reference TEXT,
  mb_expires_at TEXT,
  mbway_phone TEXT,
  payment_error TEXT,
  admin_note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  paid_at TEXT,
  shipped_at TEXT
);
CREATE INDEX IF NOT EXISTS orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  unit_price_cents INTEGER NOT NULL,
  quantity INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS order_items_order ON order_items(order_id);

CREATE TABLE IF NOT EXISTS payment_events (
  id INTEGER PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  detail TEXT,
  created_at TEXT NOT NULL
);
`;

const globalForDb = globalThis as unknown as { axonDb?: DatabaseSync; axonSchema?: string };

export function getDb(): DatabaseSync {
  if (!globalForDb.axonDb) {
    mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const db = new DatabaseSync(DB_PATH);
    db.exec("PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
    db.exec(SCHEMA);
    ensureAdmin(db);
    globalForDb.axonDb = db;
    globalForDb.axonSchema = SCHEMA;
  } else if (globalForDb.axonSchema !== SCHEMA) {
    // Em desenvolvimento a ligação sobrevive às recargas do código: aplica as tabelas novas.
    globalForDb.axonDb.exec(SCHEMA);
    globalForDb.axonSchema = SCHEMA;
  }
  return globalForDb.axonDb;
}

export function nowIso() {
  return new Date().toISOString();
}

// Cria o primeiro administrador a partir de ADMIN_EMAIL e ADMIN_PASSWORD, se ainda não houver nenhum.
function ensureAdmin(db: DatabaseSync) {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const existing = db.prepare("SELECT COUNT(*) AS total FROM users WHERE role = 'admin'").get() as { total: number };
  if (existing.total > 0) return;
  db.prepare(
    "INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, 'admin', ?) " +
      "ON CONFLICT(email) DO UPDATE SET role = 'admin'",
  ).run(process.env.ADMIN_NAME?.trim() || "Administrador", email, hashPasswordSync(password), nowIso());
}
