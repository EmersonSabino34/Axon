"use server";

import { db } from "@/lib/db";
import { getSettings, whatsappLink } from "@/lib/settings";

export type ContactState = { ok: boolean; error?: string; whatsapp?: string };

// Guarda a mensagem no painel e devolve o link do WhatsApp com o texto pronto.
export async function sendContact(_: ContactState, form: FormData): Promise<ContactState> {
  const name = String(form.get("nome") || "").trim().slice(0, 120);
  const phone = String(form.get("telefone") || "").trim().slice(0, 40);
  const product = String(form.get("produto") || "").trim().slice(0, 60);
  const body = String(form.get("mensagem") || "").trim().slice(0, 2000);
  if (!name || !body) return { ok: false, error: "Preencha o seu nome e a mensagem." };

  await db.message.create({ data: { name, phone: phone || null, product: product || null, body } });
  const settings = await getSettings();
  const text = `Olá, sou ${name}.${product ? ` Tenho interesse no AXON ${product}.` : ""}\n\n${body}`;
  return { ok: true, whatsapp: whatsappLink(settings.whatsapp, text) };
}
