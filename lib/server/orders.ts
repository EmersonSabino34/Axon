import "server-only";

import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { OrderStatus, PaymentMethod } from "@/lib/commerce";
import { getDb, nowIso } from "./db";
import type { User } from "./users";

export type OrderItem = { slug: string; name: string; unitPriceCents: number; quantity: number };

export type Order = {
  id: number;
  number: string;
  userId: number | null;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  provider: string;
  customer: { name: string; email: string; phone: string; nif: string | null };
  shipping: { address: string; postalCode: string; city: string };
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  paymentRequestId: string | null;
  mbEntity: string | null;
  mbReference: string | null;
  mbExpiresAt: string | null;
  mbwayPhone: string | null;
  paymentError: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  items: OrderItem[];
};

type OrderRow = {
  id: number;
  number: string;
  token_hash: string;
  user_id: number | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  provider: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_nif: string | null;
  ship_address: string;
  ship_postal_code: string;
  ship_city: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  payment_request_id: string | null;
  mb_entity: string | null;
  mb_reference: string | null;
  mb_expires_at: string | null;
  mbway_phone: string | null;
  payment_error: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  shipped_at: string | null;
};

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

function toOrder(row: OrderRow, items: OrderItem[]): Order {
  return {
    id: row.id,
    number: row.number,
    userId: row.user_id,
    status: row.status,
    paymentMethod: row.payment_method,
    provider: row.provider,
    customer: { name: row.customer_name, email: row.customer_email, phone: row.customer_phone, nif: row.customer_nif },
    shipping: { address: row.ship_address, postalCode: row.ship_postal_code, city: row.ship_city },
    subtotalCents: row.subtotal_cents,
    shippingCents: row.shipping_cents,
    totalCents: row.total_cents,
    paymentRequestId: row.payment_request_id,
    mbEntity: row.mb_entity,
    mbReference: row.mb_reference,
    mbExpiresAt: row.mb_expires_at,
    mbwayPhone: row.mbway_phone,
    paymentError: row.payment_error,
    adminNote: row.admin_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    paidAt: row.paid_at,
    shippedAt: row.shipped_at,
    items,
  };
}

function readItems(orderId: number): OrderItem[] {
  const rows = getDb()
    .prepare("SELECT slug, name, unit_price_cents, quantity FROM order_items WHERE order_id = ? ORDER BY rowid")
    .all(orderId) as { slug: string; name: string; unit_price_cents: number; quantity: number }[];
  return rows.map((row) => ({ slug: row.slug, name: row.name, unitPriceCents: row.unit_price_cents, quantity: row.quantity }));
}

// Número curto (até 15 caracteres, limite da ifthenpay), sem caracteres ambíguos.
function newOrderNumber(): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const random = Array.from(randomBytes(8), (byte) => alphabet[byte % alphabet.length]).join("");
  return `AX${random}`;
}

export type NewOrder = {
  userId: number | null;
  paymentMethod: PaymentMethod;
  provider: string;
  customer: Order["customer"];
  shipping: Order["shipping"];
  items: OrderItem[];
  subtotalCents: number;
  shippingCents: number;
};

/** Cria a encomenda (estado «pendente») e devolve o token que dá acesso à página da encomenda. */
export function createOrder(input: NewOrder): { order: Order; token: string } {
  const db = getDb();
  const token = randomBytes(24).toString("base64url");
  const now = nowIso();
  db.exec("BEGIN IMMEDIATE");
  try {
    let number = newOrderNumber();
    while (db.prepare("SELECT 1 FROM orders WHERE number = ?").get(number)) number = newOrderNumber();
    const result = db
      .prepare(
        `INSERT INTO orders (number, token_hash, user_id, status, payment_method, provider, customer_name, customer_email,
          customer_phone, customer_nif, ship_address, ship_postal_code, ship_city, subtotal_cents, shipping_cents,
          total_cents, created_at, updated_at)
         VALUES (?, ?, ?, 'pendente', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        number,
        hashToken(token),
        input.userId,
        input.paymentMethod,
        input.provider,
        input.customer.name,
        input.customer.email,
        input.customer.phone,
        input.customer.nif,
        input.shipping.address,
        input.shipping.postalCode,
        input.shipping.city,
        input.subtotalCents,
        input.shippingCents,
        input.subtotalCents + input.shippingCents,
        now,
        now,
      );
    const orderId = Number(result.lastInsertRowid);
    const insertItem = db.prepare(
      "INSERT INTO order_items (order_id, slug, name, unit_price_cents, quantity) VALUES (?, ?, ?, ?, ?)",
    );
    for (const item of input.items) insertItem.run(orderId, item.slug, item.name, item.unitPriceCents, item.quantity);
    db.exec("COMMIT");
    logPaymentEvent(orderId, "criada", `${input.paymentMethod} · ${input.provider}`);
    return { order: getOrderByNumber(number) as Order, token };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function getOrderByNumber(number: string): Order | null {
  const row = getDb().prepare("SELECT * FROM orders WHERE number = ?").get(number) as OrderRow | undefined;
  return row ? toOrder(row, readItems(row.id)) : null;
}

/** Acesso à página da encomenda: token do link, dono da encomenda ou administrador. */
export function canViewOrder(number: string, token: string | null, user: User | null): boolean {
  const row = getDb().prepare("SELECT token_hash, user_id FROM orders WHERE number = ?").get(number) as
    | { token_hash: string; user_id: number | null }
    | undefined;
  if (!row) return false;
  if (user && (user.role === "admin" || user.id === row.user_id)) return true;
  if (!token) return false;
  const expected = Buffer.from(row.token_hash);
  const actual = Buffer.from(hashToken(token));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function attachPayment(
  number: string,
  payment: {
    method: PaymentMethod;
    requestId: string | null;
    entity?: string | null;
    reference?: string | null;
    expiresAt?: string | null;
    mbwayPhone?: string | null;
  },
) {
  getDb()
    .prepare(
      `UPDATE orders SET status = 'pendente', payment_method = ?, payment_request_id = ?, mb_entity = ?, mb_reference = ?,
         mb_expires_at = ?, mbway_phone = ?, payment_error = NULL, updated_at = ? WHERE number = ?`,
    )
    .run(
      payment.method,
      payment.requestId,
      payment.entity ?? null,
      payment.reference ?? null,
      payment.expiresAt ?? null,
      payment.mbwayPhone ?? null,
      nowIso(),
      number,
    );
}

/** Marca a encomenda como paga (uma só vez) e desconta o stock. Devolve `true` se mudou de estado. */
export function markOrderPaid(number: string, source: string): boolean {
  const db = getDb();
  const order = getOrderByNumber(number);
  if (!order || !["pendente", "falhado"].includes(order.status)) return false;
  const now = nowIso();
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare("UPDATE orders SET status = 'pago', paid_at = ?, payment_error = NULL, updated_at = ? WHERE id = ?").run(
      now,
      now,
      order.id,
    );
    const takeStock = db.prepare("UPDATE product_overrides SET stock = MAX(0, stock - ?) WHERE slug = ?");
    for (const item of order.items) takeStock.run(item.quantity, item.slug);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  logPaymentEvent(order.id, "paga", source);
  return true;
}

export function markOrderFailed(number: string, reason: string) {
  const order = getOrderByNumber(number);
  if (!order || order.status !== "pendente") return;
  getDb()
    .prepare("UPDATE orders SET status = 'falhado', payment_error = ?, updated_at = ? WHERE id = ?")
    .run(reason, nowIso(), order.id);
  logPaymentEvent(order.id, "falhada", reason);
}

export function setOrderStatus(number: string, status: "enviado" | "cancelado", note: string | null) {
  const order = getOrderByNumber(number);
  if (!order) return;
  const now = nowIso();
  getDb()
    .prepare(
      "UPDATE orders SET status = ?, admin_note = COALESCE(?, admin_note), shipped_at = CASE WHEN ? = 'enviado' THEN ? ELSE shipped_at END, updated_at = ? WHERE id = ?",
    )
    .run(status, note, status, now, now, order.id);
  logPaymentEvent(order.id, status, note ?? "");
}

export function logPaymentEvent(orderId: number, kind: string, detail: string) {
  getDb()
    .prepare("INSERT INTO payment_events (order_id, kind, detail, created_at) VALUES (?, ?, ?, ?)")
    .run(orderId, kind, detail.slice(0, 500), nowIso());
}

export function listPaymentEvents(orderId: number): { kind: string; detail: string | null; createdAt: string }[] {
  const rows = getDb()
    .prepare("SELECT kind, detail, created_at FROM payment_events WHERE order_id = ? ORDER BY id")
    .all(orderId) as { kind: string; detail: string | null; created_at: string }[];
  return rows.map((row) => ({ kind: row.kind, detail: row.detail, createdAt: row.created_at }));
}

export type OrderSummary = Pick<Order, "number" | "status" | "paymentMethod" | "totalCents" | "createdAt" | "paidAt"> & {
  customerName: string;
  customerEmail: string;
  itemCount: number;
};

const SUMMARY_SQL = `SELECT o.number, o.status, o.payment_method, o.total_cents, o.created_at, o.paid_at, o.customer_name,
  o.customer_email, COALESCE((SELECT SUM(quantity) FROM order_items WHERE order_id = o.id), 0) AS item_count FROM orders o`;

type SummaryRow = {
  number: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  total_cents: number;
  created_at: string;
  paid_at: string | null;
  customer_name: string;
  customer_email: string;
  item_count: number;
};

const toSummary = (row: SummaryRow): OrderSummary => ({
  number: row.number,
  status: row.status,
  paymentMethod: row.payment_method,
  totalCents: row.total_cents,
  createdAt: row.created_at,
  paidAt: row.paid_at,
  customerName: row.customer_name,
  customerEmail: row.customer_email,
  itemCount: row.item_count,
});

export function listOrders(status?: OrderStatus): OrderSummary[] {
  const db = getDb();
  const rows = status
    ? db.prepare(`${SUMMARY_SQL} WHERE o.status = ? ORDER BY o.created_at DESC`).all(status)
    : db.prepare(`${SUMMARY_SQL} ORDER BY o.created_at DESC`).all();
  return (rows as SummaryRow[]).map(toSummary);
}

export function listOrdersForUser(userId: number): OrderSummary[] {
  const rows = getDb().prepare(`${SUMMARY_SQL} WHERE o.user_id = ? ORDER BY o.created_at DESC`).all(userId) as SummaryRow[];
  return rows.map(toSummary);
}

/** Encomendas pagas (incluindo enviadas) e faturação nos últimos `days` dias, e pendentes. */
export function orderStats(days: number) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const db = getDb();
  const paid = db
    .prepare("SELECT COUNT(*) AS n, COALESCE(SUM(total_cents), 0) AS total FROM orders WHERE status IN ('pago', 'enviado') AND paid_at >= ?")
    .get(since) as { n: number; total: number };
  const pending = db.prepare("SELECT COUNT(*) AS n FROM orders WHERE status = 'pendente'").get() as { n: number };
  const toShip = db.prepare("SELECT COUNT(*) AS n FROM orders WHERE status = 'pago'").get() as { n: number };
  return { paidCount: paid.n, revenueCents: paid.total, pendingCount: pending.n, toShipCount: toShip.n };
}
