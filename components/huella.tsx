import Link from "next/link";
import type { HuellaData } from "@/lib/stats";

/**
 * Huella BORRADO: representa cada vivienda sin fotografía. Histórico en
 * escalones hasta el 82% y, después, el rastro rojo discontinuo.
 */
export function Huella({ h }: { h: HuellaData }) {
  return (
    <Link
      href={`/vivienda/${h.id}`}
      className="flex h-full flex-col gap-1.5 border border-line-card bg-sf p-3.5 text-ink transition-[border-color] duration-150 hover:border-ink"
    >
      <div className="flex justify-between gap-2 font-mono text-[11px] leading-[1.2] text-mut">
        <span className="min-w-0 truncate">{h.spec}</span>
        <span className="flex-none whitespace-nowrap">{h.id}</span>
      </div>
      <div className="truncate text-[17px] leading-[1.2] font-medium">
        {h.dist} · {h.barrio}
      </div>

      <div className="relative mt-1.5 h-[46px]" aria-hidden>
        <svg viewBox="0 0 240 56" preserveAspectRatio="none" className="absolute inset-0 h-[46px] w-full overflow-visible">
          <path d={h.path} fill="none" className="stroke-ink" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          <path d={h.ghost} fill="none" className="stroke-red" strokeWidth={1.5} strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="absolute -mt-[3.5px] -ml-[3.5px] size-[7px] bg-red" style={{ left: h.dotLeft, top: h.dotTop }} />
      </div>

      <div className="mt-1.5 flex justify-between gap-1.5 font-mono text-[13px] leading-none font-medium">
        <span className="text-mut" title="Precio inicial">
          {h.start}
        </span>
        <span className={h.dropped ? "text-red" : "text-ink"}>
          {h.pct} · {h.days}
        </span>
        <span title="Último precio observado">{h.end}</span>
      </div>

      {h.rep && <div className="mt-1 font-mono text-[11px] leading-none">↻ POSIBLE REPUBLICACIÓN</div>}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-1.5 pt-2.5 font-mono text-[10.5px] leading-none">
        <span className="flex items-center gap-1.5 text-red uppercase">
          <span aria-hidden className="size-1.5 bg-red" />
          {h.gone}
        </span>
        <span className="text-mut">DATOS DE DEMOSTRACIÓN</span>
      </div>
    </Link>
  );
}

export function HuellaGrid({ items }: { items: HuellaData[] }) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-3">
      {items.map((h) => (
        <li key={h.id}>
          <Huella h={h} />
        </li>
      ))}
    </ul>
  );
}
