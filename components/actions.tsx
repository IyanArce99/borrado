"use client";

import { SearchIcon } from "./shell/icons";
import { useShare, useUI } from "./shell/ui-provider";

/** Falso input que abre el buscador global. */
export function SearchTrigger({ className = "h-[52px]" }: { className?: string }) {
  const { openSearch } = useUI();
  return (
    <button
      type="button"
      onClick={openSearch}
      className={`flex w-full cursor-text items-center gap-3 border border-ink bg-sf px-4 text-left text-[15px] text-mut ${className}`}
    >
      <SearchIcon size={12} />
      Busca un barrio, distrito o vivienda…
    </button>
  );
}

export function ShareButton({ text, path, className, children = "Compartir" }: { text: string; path?: string; className: string; children?: React.ReactNode }) {
  const share = useShare();
  return (
    <button type="button" onClick={() => share(text, path ? window.location.origin + path : undefined)} className={className}>
      {children}
    </button>
  );
}

export function ToastButton({ message, className, children }: { message: string; className: string; children: React.ReactNode }) {
  const { showToast } = useUI();
  return (
    <button type="button" onClick={() => showToast(message)} className={className}>
      {children}
    </button>
  );
}
