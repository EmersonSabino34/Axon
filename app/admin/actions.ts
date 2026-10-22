"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSession, destroySession, getAdmin, hashPassword, requireAdmin, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseBrl } from "@/lib/format";
import { benefitKeys } from "@/lib/products";
import { settingFields } from "@/lib/settings-defaults";

export type FormState = { error?: string; ok?: string };

const str = (f: FormData, k: string, max = 2000) => String(f.get(k) ?? "").trim().slice(0, max);

function refreshSite() {
  revalidatePath("/", "layout");
}

/* Sessão */

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const email = str(form, "email", 200).toLowerCase();
  const password = str(form, "password", 200);
  const user = await db.adminUser.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) return { error: "E-mail ou senha incorretos." };
  await createSession(user.id, "admin");
  redirect("/admin");
}

export async function logout() {
  await destroySession("admin");
  redirect("/admin/login");
}

/* Produtos */

function productData(form: FormData) {
  const benefits = [str(form, "b1"), str(form, "b2"), str(form, "b3")].filter((b) => (benefitKeys as readonly string[]).includes(b));
  const format = str(form, "format");
  return {
    name: str(form, "name", 60),
    slug: str(form, "slug", 60).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    label: str(form, "label", 80),
    tagline: str(form, "tagline", 120),
    format: ["liquido", "capsulas", "sache"].includes(format) ? format : "capsulas",
    formatLabel: str(form, "formatLabel", 60),
    size: str(form, "size", 40),
    reference: str(form, "reference", 200),
    benefits: benefits.join(","),
    intro: str(form, "intro"),
    details: str(form, "details"),
    routine: str(form, "routine"),
    supplement: form.get("supplement") === "on",
    toConfirm: str(form, "toConfirm", 300) || null,
    image: str(form, "image", 300) || null,
    priceCents: parseBrl(str(form, "price", 30)),
    stock: Math.max(0, parseInt(str(form, "stock", 10) || "0", 10) || 0),
    active: form.get("active") === "on",
    sortOrder: parseInt(str(form, "sortOrder", 5) || "0", 10) || 0,
  };
}

export async function saveProduct(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(form, "id", 40);
  const data = productData(form);
  if (!data.name || !data.slug) return { error: "Preencha o nome e o endereço (slug) do produto." };
  if (data.benefits.split(",").length !== 3) return { error: "Escolha três benefícios." };
  const clash = await db.product.findFirst({ where: { slug: data.slug, NOT: id ? { id } : undefined } });
  if (clash) return { error: `Já existe um produto com o endereço "${data.slug}".` };
  if (id) await db.product.update({ where: { id }, data });
  else await db.product.create({ data });
  refreshSite();
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos?salvo=1");
}

export async function toggleProduct(form: FormData) {
  await requireAdmin();
  const id = str(form, "id", 40);
  const p = await db.product.findUnique({ where: { id } });
  if (p) await db.product.update({ where: { id }, data: { active: !p.active } });
  refreshSite();
  revalidatePath("/admin/produtos");
}

export async function adjustStock(form: FormData) {
  await requireAdmin();
  const id = str(form, "id", 40);
  const delta = parseInt(str(form, "delta", 6), 10) || 0;
  const p = await db.product.findUnique({ where: { id } });
  if (p) await db.product.update({ where: { id }, data: { stock: Math.max(0, p.stock + delta) } });
  revalidatePath("/admin/produtos");
}

/* Pedidos */

export async function createOrder(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const customerName = str(form, "customerName", 120);
  const phone = str(form, "phone", 40);
  if (!customerName || !phone) return { error: "Preencha o nome e o telefone do cliente." };

  const lines: { productId: string; quantity: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const productId = str(form, `product${i}`, 40);
    const quantity = parseInt(str(form, `qty${i}`, 4), 10) || 0;
    if (productId && quantity > 0) lines.push({ productId, quantity });
  }
  if (!lines.length) return { error: "Adicione pelo menos um produto ao pedido." };

  const products = await db.product.findMany({ where: { id: { in: lines.map((l) => l.productId) } } });
  const missingPrice = products.find((p) => p.priceCents == null);
  if (missingPrice) return { error: `Defina o preço do ${missingPrice.name} em Produtos antes de registrar o pedido.` };
  const items = lines.map((l) => {
    const p = products.find((x) => x.id === l.productId)!;
    return { productId: p.id, quantity: l.quantity, unitPriceCents: p.priceCents! };
  });
  const totalCents = items.reduce((s, it) => s + it.quantity * it.unitPriceCents, 0);
  const last = await db.order.findFirst({ orderBy: { number: "desc" }, select: { number: true } });

  const order = await db.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        number: (last?.number ?? 1000) + 1,
        customerName, phone,
        email: str(form, "email", 160) || null,
        city: str(form, "city", 120) || null,
        status: str(form, "status", 20) || "novo",
        notes: str(form, "notes") || null,
        totalCents,
        items: { create: items },
      },
    });
    for (const it of items) await tx.product.update({ where: { id: it.productId }, data: { stock: { decrement: it.quantity } } });
    return created;
  });
  revalidatePath("/admin");
  redirect(`/admin/pedidos/${order.id}`);
}

export async function updateOrderStatus(form: FormData) {
  await requireAdmin();
  const id = str(form, "id", 40);
  const status = str(form, "status", 20);
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return;
  await db.$transaction(async (tx) => {
    // Cancelar devolve o estoque; reabrir um cancelado volta a descontar.
    if (status === "cancelado" && order.status !== "cancelado") {
      for (const it of order.items) await tx.product.update({ where: { id: it.productId }, data: { stock: { increment: it.quantity } } });
    } else if (order.status === "cancelado" && status !== "cancelado") {
      for (const it of order.items) await tx.product.update({ where: { id: it.productId }, data: { stock: { decrement: it.quantity } } });
    }
    await tx.order.update({ where: { id }, data: { status, notes: form.has("notes") ? str(form, "notes") || null : undefined } });
  });
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
}

export async function deleteOrder(form: FormData) {
  await requireAdmin();
  const id = str(form, "id", 40);
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (order) {
    await db.$transaction(async (tx) => {
      if (order.status !== "cancelado") {
        for (const it of order.items) await tx.product.update({ where: { id: it.productId }, data: { stock: { increment: it.quantity } } });
      }
      await tx.order.delete({ where: { id } });
    });
  }
  redirect("/admin/pedidos");
}

/* Mensagens */

export async function toggleMessage(form: FormData) {
  await requireAdmin();
  const id = str(form, "id", 40);
  const m = await db.message.findUnique({ where: { id } });
  if (m) await db.message.update({ where: { id }, data: { read: !m.read } });
  revalidatePath("/admin/mensagens");
  revalidatePath("/admin");
}

export async function deleteMessage(form: FormData) {
  await requireAdmin();
  await db.message.delete({ where: { id: str(form, "id", 40) } }).catch(() => null);
  revalidatePath("/admin/mensagens");
}

/* Configurações */

export async function saveSettings(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  for (const f of settingFields) {
    let value = str(form, f.key, 200);
    if (f.key === "whatsapp") value = value.replace(/\D/g, "");
    await db.setting.upsert({ where: { key: f.key }, update: { value }, create: { key: f.key, value } });
  }
  refreshSite();
  return { ok: "Configurações salvas. O site já mostra os novos dados." };
}

export async function changePassword(_: FormState, form: FormData): Promise<FormState> {
  const me = await getAdmin();
  if (!me) redirect("/admin/login");
  const user = await db.adminUser.findUnique({ where: { id: me.id } });
  const current = str(form, "current", 200);
  const next = str(form, "next", 200);
  if (!user || !verifyPassword(current, user.passwordHash)) return { error: "A senha atual está incorreta." };
  if (next.length < 8) return { error: "A nova senha precisa de pelo menos 8 caracteres." };
  await db.adminUser.update({ where: { id: user.id }, data: { passwordHash: hashPassword(next) } });
  return { ok: "Senha alterada." };
}

export async function addAdmin(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const email = str(form, "email", 200).toLowerCase();
  const name = str(form, "name", 80) || "Administrador";
  const password = str(form, "password", 200);
  if (!email.includes("@")) return { error: "Informe um e-mail válido." };
  if (password.length < 8) return { error: "A senha precisa de pelo menos 8 caracteres." };
  if (await db.adminUser.findUnique({ where: { email } })) return { error: "Já existe um administrador com este e-mail." };
  await db.adminUser.create({ data: { email, name, passwordHash: hashPassword(password) } });
  revalidatePath("/admin/configuracoes");
  return { ok: `Acesso criado para ${email}.` };
}
