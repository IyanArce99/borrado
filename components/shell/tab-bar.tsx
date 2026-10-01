"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MORE_HREFS, TAB_ITEMS, isActive } from "@/lib/nav";
import { useUI } from "./ui-provider";

function Indicator({ on }: { on: boolean }) {
  return <span aria-hidden className={`block h-1.5 ${on ? "w-[18px] bg-red" : "w-1.5 bg-dim"}`} />;
}

const tabClass = "flex min-w-0 flex-col items-center justify-center gap-1.5 px-0.5 text-[11px] font-medium max-[359px]:text-[10px]";

export function TabBar() {
  const pathname = usePathname();
  const { menuOpen, toggleMenu, closeMenu } = useUI();
  const moreOn = menuOpen || MORE_HREFS.some((h) => isActive(pathname, h));

  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-40 grid h-[68px] grid-cols-5 border-t border-line-card bg-bg pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {TAB_ITEMS.map((t) => {
        const on = !menuOpen && isActive(pathname, t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            onClick={closeMenu}
            aria-current={on ? "page" : undefined}
            className={`${tabClass} no-underline ${on ? "text-ink" : "text-mut"}`}
          >
            <Indicator on={on} />
            {t.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={toggleMenu}
        aria-expanded={menuOpen}
        aria-controls="menu-overlay"
        className={`${tabClass} ${moreOn ? "text-ink" : "text-mut"}`}
      >
        <Indicator on={moreOn} />
        Más
      </button>
    </nav>
  );
}
