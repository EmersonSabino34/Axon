"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { BagIcon, BoxIcon, ChecklistIcon, CloseIcon, GridIcon, MenuIcon, SettingsIcon, UsersIcon } from "../LineIcons";
import { BrandEmblem } from "../BrandEmblem";

const links = [
  { href: "/painel", label: "Visão geral", icon: GridIcon },
  { href: "/painel/encomendas", label: "Encomendas", icon: BagIcon },
  { href: "/painel/produtos", label: "Produtos", icon: BoxIcon },
  { href: "/painel/clientes", label: "Clientes", icon: UsersIcon },
  { href: "/painel/lancamento", label: "Lançamento", icon: ChecklistIcon },
  { href: "/painel/definicoes", label: "Definições", icon: SettingsIcon },
];

export function AdminSidebar({ footer }: { footer: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/painel" ? pathname === href : pathname.startsWith(href));

  return (
    <aside className={`admin-sidebar${open ? " is-open" : ""}`}>
      <div className="admin-sidebar__top">
        <Link href="/painel" className="admin-sidebar__brand" aria-label="Painel AXON, visão geral">
          <BrandEmblem />
          <span className="admin-sidebar__label">Painel</span>
        </Link>
        <button
          type="button"
          className="icon-button icon-button--light admin-sidebar__toggle"
          aria-expanded={open}
          aria-controls="admin-menu"
          onClick={() => setOpen((current) => !current)}
        >
          <span className="sr-only">{open ? "Fechar menu do painel" : "Abrir menu do painel"}</span>
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      <div id="admin-menu" className="admin-sidebar__menu">
        <nav aria-label="Painel">
          <ul className="admin-nav">
            {links.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="admin-nav__link"
                  aria-current={isActive(href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  <Icon />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="admin-sidebar__footer">{footer}</div>
      </div>
    </aside>
  );
}
