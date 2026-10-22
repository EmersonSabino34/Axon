// Cria os 8 produtos, as configurações e o primeiro administrador. Seguro para correr várias vezes:
// não sobrescreve o que já foi editado no painel.
import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";
import { seedProducts } from "../lib/products";
import { defaultSettings } from "../lib/settings-defaults";

const db = new PrismaClient();

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

async function main() {
  for (const [i, p] of seedProducts.entries()) {
    await db.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug, name: p.name, label: p.label, tagline: p.tagline, format: p.format,
        formatLabel: p.formatLabel, size: p.size, reference: p.reference, benefits: p.benefits.join(","),
        intro: p.intro, details: p.details.join("\n"), routine: p.routine.join("\n"),
        supplement: p.supplement, toConfirm: p.toConfirm ?? null, image: `/produtos/${p.slug}.webp`, stock: 0, sortOrder: i,
      },
    });
  }
  for (const [key, value] of Object.entries(defaultSettings)) {
    await db.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password && !(await db.adminUser.findUnique({ where: { email } }))) {
    await db.adminUser.create({ data: { email, name: "Administrador", passwordHash: hashPassword(password) } });
    console.log(`Administrador criado: ${email}`);
  }
  console.log("Seed concluído.");
}

main().finally(() => db.$disconnect());
