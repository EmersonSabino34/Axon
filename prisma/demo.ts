// Dados de demonstração para ver o dashboard preenchido. Só corre se ainda não houver pedidos.
// Apague com: npx prisma db push --force-reset && npm run seed
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const names = ["Ana Souza", "Carla Mendes", "Juliana Rocha", "Marcos Lima", "Patrícia Alves", "Renata Costa", "Bruno Dias", "Fernanda Reis", "Lucas Martins", "Beatriz Nunes", "Camila Freitas", "Rafael Gomes"];
const cities = ["São Paulo, SP", "Campinas, SP", "Belo Horizonte, MG", "Curitiba, PR", "Rio de Janeiro, RJ", "Porto Alegre, RS", "Goiânia, GO"];
const prices: Record<string, number> = { lugol: 6990, propolis: 5990, cravinho: 5490, "desintoxicacao-pes": 7990, emagrecedor: 11990, "foco-estudos": 9990, "libido-feminina": 10990, desparasitante: 12990 };

function rnd(n: number) { return Math.floor(Math.random() * n); }

async function main() {
  if ((await db.order.count()) > 0) return console.log("Já existem pedidos; demo ignorada.");
  const products = await db.product.findMany();
  for (const p of products) {
    await db.product.update({ where: { id: p.id }, data: { priceCents: prices[p.slug] ?? 7990, stock: 8 + rnd(60) } });
  }
  const now = Date.now();
  let number = 1001;
  for (let d = 29; d >= 0; d--) {
    const count = rnd(4) + (d < 10 ? 2 : 0);
    for (let i = 0; i < count; i++) {
      const when = new Date(now - d * 86400000 - rnd(36000000));
      const picks = [...products].sort(() => Math.random() - 0.5).slice(0, 1 + rnd(2));
      const items = picks.map((p) => ({ productId: p.id, quantity: 1 + rnd(2), unitPriceCents: prices[p.slug] ?? 7990 }));
      const total = items.reduce((s, it) => s + it.quantity * it.unitPriceCents, 0);
      const status = d > 6 ? (Math.random() < 0.08 ? "cancelado" : "entregue") : d > 2 ? ["enviado", "entregue", "confirmado"][rnd(3)] : ["novo", "confirmado"][rnd(2)];
      await db.order.create({
        data: { number: number++, customerName: names[rnd(names.length)], phone: `(11) 9${8000 + rnd(1999)}-${1000 + rnd(8999)}`, city: cities[rnd(cities.length)], status, totalCents: total, createdAt: when, items: { create: items } },
      });
    }
    for (const p of products) {
      const views = rnd(14) + 2;
      for (let v = 0; v < views; v++) await db.event.create({ data: { type: "view", productId: p.id, createdAt: new Date(now - d * 86400000 - rnd(80000000)) } });
      const clicks = rnd(4);
      for (let c = 0; c < clicks; c++) await db.event.create({ data: { type: "whatsapp", productId: p.id, createdAt: new Date(now - d * 86400000 - rnd(80000000)) } });
    }
  }
  const msgs = [
    ["Carla Mendes", "Desparasitante", "Qual é o ciclo de uso recomendado do Desparasitante?"],
    ["Marcos Lima", "Foco Estudos", "Vocês enviam para Recife? Quero 2 frascos do Foco Estudos."],
    ["Juliana Rocha", "", "Trabalham com revenda? Tenho uma loja de produtos naturais."],
    ["Renata Costa", "Libido Feminina", "Posso tomar o Libido Feminina junto com o Própolis?"],
  ];
  for (const [i, [name, product, body]] of msgs.entries()) {
    await db.message.create({ data: { name, product: product || null, body, phone: "(11) 98888-0000", read: i > 1, createdAt: new Date(now - i * 20000000) } });
  }
  console.log("Dados de demonstração criados.");
}

main().finally(() => db.$disconnect());
