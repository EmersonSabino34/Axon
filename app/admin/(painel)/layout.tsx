import type { Metadata } from "next";
import { Sidebar } from "@/components/admin/Sidebar";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import "../admin.css";

export const metadata: Metadata = { title: { default: "Painel", template: "%s | Painel AXON" }, robots: { index: false } };

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const unread = await db.message.count({ where: { read: false } });
  return (
    <div className="adm">
      <Sidebar email={admin.email} unread={unread} />
      <div className="adm-main">{children}</div>
    </div>
  );
}
