"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { navItems } from "@/lib/site-config";
import { useCart } from "./CartProvider";
import { BagIcon, CloseIcon, MenuIcon, UserIcon } from "./LineIcons";
import { BrandEmblem } from "./BrandEmblem";

const DESKTOP_QUERY = "(min-width: 900px)";

export function SiteHeader() {
  const { count, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [activeHref, setActiveHref] = useState(navItems[0].href);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // O cabeçalho fica mais baixo quando a barra superior sai do ecrã.
  useEffect(() => {
    const topBar = document.getElementById("topo");
    if (!topBar) return;
    const observer = new IntersectionObserver(([entry]) => setCompact(!entry.isIntersecting));
    observer.observe(topBar);
    return () => observer.disconnect();
  }, []);

  // Assinala no menu a secção que está a meio do ecrã.
  useEffect(() => {
    const sections = navItems
      .map((item) => document.querySelector<HTMLElement>(item.href))
      .filter((section): section is HTMLElement => section !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveHref(`#${visible.target.id}`);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", menuOpen);
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const onBreakpoint = () => {
      if (desktop.matches) setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      desktop.removeEventListener("change", onBreakpoint);
      document.documentElement.classList.remove("menu-open");
    };
  }, [menuOpen]);

  const cartLabel = `Abrir carrinho, ${count} ${count === 1 ? "artigo" : "artigos"}`;

  return (
    <header ref={headerRef} className={`site-header${compact ? " is-compact" : ""}`}>
      <div className="container site-header__inner">
        <a href="#inicio" className="site-header__brand" aria-label="AXON, voltar ao início">
          <BrandEmblem />
        </a>

        <nav
          id="menu-principal"
          className={`site-nav${menuOpen ? " is-open" : ""}`}
          aria-label="Navegação principal"
        >
          <ul className="site-nav__list">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="site-nav__link"
                  aria-current={activeHref === item.href ? "location" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          <Link href="/conta" className="icon-button" aria-label="A minha conta">
            <UserIcon />
          </Link>
          <button id="cart-toggle" type="button" className="icon-button cart-toggle" onClick={openCart} aria-label={cartLabel}>
            <BagIcon />
            <span key={count} className={`cart-toggle__count${count > 0 ? " has-items" : ""}`} aria-hidden="true">
              {count}
            </span>
          </button>
          <button
            ref={toggleRef}
            type="button"
            className="icon-button menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="menu-principal"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="sr-only">{menuOpen ? "Fechar menu" : "Abrir menu"}</span>
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
