import { db } from "./db";
import { defaultSettings, type Settings } from "./settings-defaults";

export type { Settings };

export async function getSettings(): Promise<Settings> {
  const rows = await db.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...defaultSettings, ...map } as Settings;
}

export function whatsappLink(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
