"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type UIContextValue = {
  searchOpen: boolean;
  menuOpen: boolean;
  toast: string;
  openSearch: () => void;
  closeSearch: () => void;
  toggleMenu: () => void;
  closeMenu: () => void;
  showToast: (message: string) => void;
};

const UIContext = createContext<UIContextValue | null>(null);

const TOAST_MS = 2600;

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const openSearch = useCallback(() => {
    setMenuOpen(false);
    setSearchOpen(true);
  }, []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((o) => !o), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const showToast = useCallback((message: string) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(""), TOAST_MS);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // Bloquea el scroll del documento bajo los overlays.
  const locked = searchOpen || menuOpen;
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);

  const value = useMemo(
    () => ({ searchOpen, menuOpen, toast, openSearch, closeSearch, toggleMenu, closeMenu, showToast }),
    [searchOpen, menuOpen, toast, openSearch, closeSearch, toggleMenu, closeMenu, showToast],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI debe usarse dentro de <UIProvider>");
  return ctx;
}

/** navigator.share si existe; si no, copia al portapapeles y avisa. */
export function useShare() {
  const { showToast } = useUI();
  return useCallback(
    async (text: string, url?: string) => {
      const full = text + " · Datos de demostración · borrado.es";
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({ text: full, url });
          return;
        } catch (err) {
          if ((err as DOMException)?.name === "AbortError") return;
        }
      }
      try {
        await navigator.clipboard.writeText(url ? full + " " + url : full);
      } catch {
        // Sin permiso de portapapeles: el aviso se muestra igualmente.
      }
      showToast("Texto copiado para compartir.");
    },
    [showToast],
  );
}
