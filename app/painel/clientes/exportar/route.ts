import { getCurrentUser } from "@/lib/server/session";
import { listCustomers } from "@/lib/server/users";

// Exporta os clientes em CSV (separador ";" e BOM, para abrir corretamente no Excel em português).
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return new Response("Acesso reservado a administradores.", { status: 403 });
  }

  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = [
    ["Nome", "E-mail", "Registo", "Último acesso"],
    ...listCustomers().map((customer) => [customer.name, customer.email, customer.createdAt, customer.lastLoginAt ?? ""]),
  ];
  const csv = "﻿" + rows.map((row) => row.map(escape).join(";")).join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="clientes-axon-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
