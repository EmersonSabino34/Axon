"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSession, destroySession, findPasswordReset, getCustomer, hashPassword, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";

// `fields` devolve o que foi digitado, para o formulário não se apagar quando há erro.
export type AccountState = { error?: string; ok?: string; fields?: Record<string, string> };

const str = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);
const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export async function signUp(_: AccountState, form: FormData): Promise<AccountState> {
  const name = str(form, "nome", 120);
  const email = str(form, "email").toLowerCase();
  const phone = str(form, "telefone", 40);
  const password = str(form, "senha");
  const fields = { nome: name, email, telefone: phone };
  if (!name) return { error: "Informe o seu nome.", fields };
  if (!validEmail(email)) return { error: "Informe um e-mail válido.", fields };
  if (password.length < 8) return { error: "A senha precisa de pelo menos 8 caracteres.", fields };
  if (password !== str(form, "confirmar")) return { error: "As duas senhas não são iguais.", fields };
  if (await db.customer.findUnique({ where: { email } })) return { error: "Já existe uma conta com este e-mail. Entre com a sua senha.", fields };

  const customer = await db.customer.create({ data: { name, email, phone: phone || null, passwordHash: hashPassword(password) } });
  await createSession(customer.id, "customer");
  redirect("/conta?bemvindo=1");
}

export async function signIn(_: AccountState, form: FormData): Promise<AccountState> {
  const email = str(form, "email").toLowerCase();
  const customer = await db.customer.findUnique({ where: { email } });
  if (!customer || !verifyPassword(str(form, "senha"), customer.passwordHash)) return { error: "E-mail ou senha incorretos.", fields: { email } };
  await createSession(customer.id, "customer");
  redirect("/conta");
}

export async function signOut() {
  await destroySession("customer");
  redirect("/");
}

export async function saveAccount(_: AccountState, form: FormData): Promise<AccountState> {
  const me = await getCustomer();
  if (!me) redirect("/entrar");
  const name = str(form, "nome", 120);
  const email = str(form, "email").toLowerCase();
  const phone = str(form, "telefone", 40);
  const fields = { nome: name, email, telefone: phone };
  if (!name) return { error: "Informe o seu nome.", fields };
  if (!validEmail(email)) return { error: "Informe um e-mail válido.", fields };
  if (email !== me.email && (await db.customer.findUnique({ where: { email } }))) return { error: "Já existe outra conta com este e-mail.", fields };

  await db.customer.update({ where: { id: me.id }, data: { name, email, phone: phone || null } });
  revalidatePath("/conta");
  return { ok: "Dados salvos." };
}

export async function changePassword(_: AccountState, form: FormData): Promise<AccountState> {
  const me = await getCustomer();
  if (!me) redirect("/entrar");
  const user = await db.customer.findUnique({ where: { id: me.id } });
  const next = str(form, "nova");
  if (!user || !verifyPassword(str(form, "atual"), user.passwordHash)) return { error: "A senha atual está incorreta." };
  if (next.length < 8) return { error: "A nova senha precisa de pelo menos 8 caracteres." };
  if (next !== str(form, "confirmar")) return { error: "As duas senhas novas não são iguais." };
  await db.customer.update({ where: { id: user.id }, data: { passwordHash: hashPassword(next), resetTokenHash: null, resetExpires: null } });
  return { ok: "Senha alterada." };
}

// Nova senha pelo link que a AXON enviou no WhatsApp. O link só vale uma vez.
export async function resetPassword(_: AccountState, form: FormData): Promise<AccountState> {
  const customer = await findPasswordReset(str(form, "token"));
  if (!customer) return { error: "Este link não vale mais. Peça um novo à AXON pelo WhatsApp." };
  const next = str(form, "nova");
  if (next.length < 8) return { error: "A nova senha precisa de pelo menos 8 caracteres." };
  if (next !== str(form, "confirmar")) return { error: "As duas senhas novas não são iguais." };
  await db.customer.update({ where: { id: customer.id }, data: { passwordHash: hashPassword(next), resetTokenHash: null, resetExpires: null } });
  await createSession(customer.id, "customer");
  redirect("/conta?senha=nova");
}
