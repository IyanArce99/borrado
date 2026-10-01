"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { NAV, isActive } from "@/lib/nav";
import { useUI } from "./ui-provider";

export function MenuOverlay() {
  const pathname = usePathname();
  const { menuOpen, closeMenu, showToast } = useUI();

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeMenu();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  if (!menuOpen) return null;

  return (
    <div
      id="menu-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Menú"
      className="fixed inset-x-0 top-14 bottom-[68px] z-30 overflow-y-auto bg-bg py-2 lg:bottom-0"
    >
      <nav className="page">
        {NAV.map((n) => {
          const on = isActive(pathname, n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              onClick={closeMenu}
              aria-current={on ? "page" : undefined}
              className={`flex h-[58px] items-center justify-between border-b border-line text-2xl font-medium ${on ? "text-ink" : "text-ink2"}`}
            >
              {n.label}
              <span aria-hidden className={`size-2 rounded-[50%] ${on ? "bg-red" : "bg-transparent"}`} />
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => showToast("El acceso de usuarios llegará con la beta.")}
          className="mt-[18px] h-[50px] w-full border border-ink text-[15px] font-medium"
        >
          Iniciar sesión
        </button>
      </nav>
    </div>
  );
}
