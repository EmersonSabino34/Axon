"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/admin/actions";
import { Logo } from "../Logo";

const I = {
  dash: <path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z" />,
  prod: <><path d="M9 3h6v3H9z" /><path d="M7 6h10l1 3v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9z" /><path d="M9 13h6" /></>,
  orders: <><path d="M6 2h12l2 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" /><path d="M4 6h16M9 11h6M9 15h6" /></>,
  msgs: <path d="M4 5h16v11H8l-4 4z" />,
  people: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5" /></>,
  cfg: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" /></>,
};

function Icon({ d }: { d: React.ReactNode }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>;
}

export function Sidebar({ email, unread }: { email: string; unread: number }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/admin", label: "Dashboard", icon: I.dash, exact: true },
    { href: "/admin/pedidos", label: "Pedidos", icon: I.orders },
    { href: "/admin/produtos", label: "Produtos", icon: I.prod },
    { href: "/admin/clientes", label: "Clientes", icon: I.people },
    { href: "/admin/mensagens", label: "Mensagens", icon: I.msgs, count: unread },
    { href: "/admin/configuracoes", label: "Configurações", icon: I.cfg },
  ];
  return (
    <aside className={`adm-side${open ? " open" : ""}`}>
      <Link className="adm-brand" href="/admin">
        <Logo size={44} tone="light" />
        <span><small>Painel</small><b>AXON</b></span>
      </Link>
      <button className="adm-burger" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{open ? "Fechar" : "Menu"}</button>
      <nav className="adm-nav" aria-label="Painel">
        {links.map((l) => {
          const active = l.exact ? path === l.href : path.startsWith(l.href);
          return (
            <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}>
              <Icon d={l.icon} />
              {l.label}
              {l.count ? <span className="count">{l.count}</span> : null}
            </Link>
          );
        })}
      </nav>
      <div className="adm-foot">
        <span className="adm-user">{email}</span>
        <a href="/" target="_blank" rel="noopener noreferrer">Ver o site ↗</a>
        <form action={logout}><button type="submit">Sair</button></form>
      </div>
    </aside>
  );
}
