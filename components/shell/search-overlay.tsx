"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { SearchResult } from "@/lib/api";
import { useUI } from "./ui-provider";

type Row = { kind: string; label: string; sub: string; onSelect: () => void };

const SUGGESTIONS: readonly [string, string][] = [
  ["Chamberí", "DISTRITO"],
  ["Salamanca", "DISTRITO"],
  ["Las Letras", "BARRIO"],
  ["pisos desaparecidos en Centro", "BÚSQUEDA"],
];

export function SearchOverlay() {
  const { searchOpen, closeSearch } = useUI();
  // Se monta solo al abrir: el estado de la búsqueda se reinicia en cada apertura.
  return searchOpen ? <SearchDialog onClose={closeSearch} /> : null;
}

function SearchDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [error, setError] = useState(false);
  const requestId = useRef(0);

  async function search(value: string) {
    setQ(value);
    const id = ++requestId.current;
    if (!value.trim()) {
      setResults(null);
      setError(false);
      return;
    }
    try {
      const res = await fetch("/api/search?q=" + encodeURIComponent(value));
      if (!res.ok) throw new Error(String(res.status));
      const data: { results: SearchResult[] } = await res.json();
      if (id !== requestId.current) return; // respuesta obsoleta
      setResults(data.results);
      setError(false);
    } catch {
      if (id === requestId.current) setError(true);
    }
  }

  function open(href: string) {
    router.push(href);
    onClose();
  }

  const rows: Row[] =
    results === null
      ? SUGGESTIONS.map(([label, kind]) => ({ kind, label, sub: `Buscar “${label}”`, onSelect: () => search(label) }))
      : results.map((r) => ({ ...r, onSelect: () => open(r.href) }));

  const head = error
    ? "NO SE PUDO BUSCAR. INTÉNTALO DE NUEVO."
    : results === null
      ? "SUGERENCIAS"
      : results.length
        ? "RESULTADOS"
        : `SIN RESULTADOS PARA “${q}”`;

  return (
    <div role="dialog" aria-modal="true" aria-label="Buscar" className="fixed inset-0 z-50 flex flex-col bg-bg">
      <div className="border-b border-ink">
        <div className="page flex items-center gap-2 py-2">
          <input
            autoFocus
            type="search"
            value={q}
            onChange={(e) => search(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "Enter" && results?.[0]) open(results[0].href);
            }}
            placeholder="Busca un barrio, distrito o vivienda..."
            aria-label="Busca un barrio, distrito o vivienda"
            className="h-12 min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-mut"
          />
          <button type="button" onClick={onClose} className="h-11 px-2.5 text-sm font-medium">
            Cerrar
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="page py-1.5">
          <div aria-live="polite" className="pt-2.5 pb-1 font-mono text-[10px] leading-none font-medium tracking-[.02em] text-mut">
            {head}
          </div>
          <ul>
            {rows.map((r) => (
              <li key={r.kind + r.label}>
                <button
                  type="button"
                  onClick={r.onSelect}
                  className="grid w-full grid-cols-[78px_minmax(0,1fr)] items-center gap-2.5 border-b border-line-soft py-3.5 text-left"
                >
                  <span className="font-mono text-[9.5px] leading-none font-semibold tracking-[.02em] text-red">{r.kind}</span>
                  <span>
                    <span className="block text-base leading-[1.2] font-medium">{r.label}</span>
                    <span className="mt-[3px] block text-[12.5px] leading-[1.2] text-mut">{r.sub}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
