"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { chipClass } from "@/components/ui";
import { DISTRICTS, findDistrict } from "@/lib/districts";
import { CHIP_GROUPS, DEFAULT_FILTERS, SORT_OPTIONS, type FilterKey, type Filters, type SortKey, activeFilterCount, toSearchParams } from "@/lib/filters";

const selectClass = "h-11 w-full min-w-0 border border-line-strong bg-sf px-2 font-sans text-sm font-normal tracking-normal text-ink";
const labelClass = "flex flex-col gap-1.5 font-mono text-[10px] leading-none font-medium tracking-[.02em] text-mut";

export function FilterBar({ filters, sort, resultCount }: { filters: Filters; sort: SortKey; resultCount: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const count = activeFilterCount(filters);
  const district = findDistrict(filters.distrito);

  function navigate(next: Filters, nextSort: SortKey) {
    const qs = toSearchParams(next, nextSort).toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  function setFilter(key: FilterKey, value: string) {
    // Cambiar de distrito invalida el barrio elegido.
    navigate({ ...filters, [key]: value, ...(key === "distrito" ? { barrio: "" } : {}) }, sort);
  }

  return (
    <>
      <div className="sticky top-14 z-20 -mx-4 mt-3 flex gap-2 border-b border-line bg-bg px-4 py-2.5 sm:-mx-[18px] sm:px-[18px] md:mx-0 md:px-0">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="panel-filtros"
          className="h-10 bg-ink px-3.5 text-sm font-medium text-bg"
        >
          Filtros{count ? ` · ${count}` : ""}
        </button>
        <label className="sr-only" htmlFor="orden">
          Ordenar
        </label>
        <select
          id="orden"
          value={sort}
          onChange={(e) => navigate(filters, e.target.value as SortKey)}
          className="h-10 flex-1 border border-line-strong bg-sf px-2.5 text-sm md:max-w-64"
        >
          {SORT_OPTIONS.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        {pending && (
          <span role="status" className="self-center font-mono text-[10px] text-mut">
            CARGANDO…
          </span>
        )}
      </div>

      {open && (
        <div id="panel-filtros" className="flex flex-col gap-4 border-b border-line py-3.5">
          <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2 md:max-w-xl">
            <label className={labelClass}>
              DISTRITO
              <select value={filters.distrito} onChange={(e) => setFilter("distrito", e.target.value)} className={selectClass}>
                <option value="">Todos</option>
                {DISTRICTS.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              BARRIO
              <select value={filters.barrio} onChange={(e) => setFilter("barrio", e.target.value)} disabled={!district} className={`${selectClass} disabled:opacity-60`}>
                <option value="">{district ? "Todos" : "Elige distrito"}</option>
                {district?.barrios.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {CHIP_GROUPS.map((g) => (
            <fieldset key={g.key}>
              <legend className="mb-2 font-mono text-[10px] leading-none font-medium tracking-[.02em] text-mut">{g.label}</legend>
              <div className="flex flex-wrap gap-1.5">
                {g.options.map(([value, label]) => {
                  const on = filters[g.key] === value;
                  return (
                    <button key={value} type="button" aria-pressed={on} onClick={() => setFilter(g.key, value)} className={chipClass(on)}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <div className="flex gap-2 md:max-w-xl">
            <button type="button" onClick={() => navigate(DEFAULT_FILTERS, sort)} className="h-11 flex-1 border border-line-strong">
              Limpiar
            </button>
            <button type="button" onClick={() => setOpen(false)} className="h-11 flex-[2] bg-ink text-bg">
              Ver {resultCount} resultados
            </button>
          </div>
        </div>
      )}
    </>
  );
}
