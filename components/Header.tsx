"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";

const links = [
  { href: "/produtos", label: "Produtos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/#como-comprar", label: "Como comprar" },
  { href: "/contato", label: "Contato" },
];

export function Header({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  const items = [...links, signedIn ? { href: "/conta", label: "Minha conta" } : { href: "/entrar", label: "Entrar" }];
  // O menu guarda a página em que foi aberto, e fecha sozinho ao mudar de página.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null);

  return (
    <header className="top">
      <div className="wrap top-inner">
        <Link className="brand" href="/" aria-label="AXON, página inicial">
          <Logo size={52} />
        </Link>
        <button className="menu-toggle" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(!open)}>
          {open ? "Fechar" : "Menu"}
        </button>
        <nav id="menu" className={`menu${open ? " open" : ""}`} aria-label="Principal">
          {items.map((l) => (
            <Link key={l.href} href={l.href} aria-current={pathname.startsWith(l.href) && l.href !== "/" ? "page" : undefined} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link className="btn small" href="/contato" onClick={() => setOpen(false)}>
            Fale conosco
          </Link>
        </nav>
      </div>
    </header>
  );
}
