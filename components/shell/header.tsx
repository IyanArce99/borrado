"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, isActive } from "@/lib/nav";
import { MenuIcon, SearchIcon, ThemeIcon } from "./icons";
import { Logo } from "./logo";
import { toggleTheme } from "./theme";
import { useUI } from "./ui-provider";

const iconButton = "grid size-11 place-items-center";

export function Header() {
  const pathname = usePathname();
  const { openSearch, toggleMenu, closeMenu, menuOpen } = useUI();

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-line bg-bgA backdrop-blur-[8px]">
      <div className="page flex h-full items-center justify-between gap-4">
        <Link href="/" onClick={closeMenu} aria-label="BORRADO · Inicio" className="flex h-11 items-center">
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden min-w-0 flex-1 justify-center gap-5 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className="text-sm font-medium whitespace-nowrap text-ink2 no-underline hover:text-ink aria-[current=page]:text-ink aria-[current=page]:underline aria-[current=page]:decoration-red aria-[current=page]:decoration-2"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex gap-1">
          <button type="button" onClick={openSearch} aria-label="Buscar" className={iconButton}>
            <SearchIcon />
          </button>
          <button type="button" onClick={toggleTheme} aria-label="Cambiar modo claro/oscuro" className={iconButton}>
            <ThemeIcon />
          </button>
          <button
            type="button"
            onClick={toggleMenu}
            aria-label="Menú"
            aria-expanded={menuOpen}
            aria-controls="menu-overlay"
            className={iconButton}
          >
            <MenuIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
