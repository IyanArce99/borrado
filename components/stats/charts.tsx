"use client";

import Link from "next/link";
import { useState } from "react";
import { DemoTag } from "@/components/ui";
import { dec1, num } from "@/lib/format";

const card = "border border-line bg-sf p-4";
const readClass = "mt-1 min-h-[18px] font-mono text-xs leading-[1.4] font-medium text-red";

export type DailyBar = { daysAgo: number; count: number; label: string };

/** Desapariciones por día: hover/tap resalta en rojo y muestra la lectura. */
export function DailyChart({ bars, startLabel }: { bars: DailyBar[]; startLabel: string }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...bars.map((b) => b.count));
  const shown = bars.find((b) => b.daysAgo === (active ?? 1));

  return (
    <section className={card} aria-labelledby="chart-daily">
      <h2 id="chart-daily" className="text-[15px] leading-[1.2] font-semibold">
        Desapariciones por día
      </h2>
      <div className={readClass} aria-live="polite">
        {shown && `${active === null ? "Ayer" : shown.label} · ${shown.count} desaparecidas`}
      </div>
      <div className="mt-2.5 flex h-[140px] items-end gap-0.5" onMouseLeave={() => setActive(null)}>
        {bars.map((b) => {
          const on = b.daysAgo === (active ?? 1);
          return (
            <button
              key={b.daysAgo}
              type="button"
              onMouseEnter={() => setActive(b.daysAgo)}
              onFocus={() => setActive(b.daysAgo)}
              onClick={() => setActive(b.daysAgo)}
              aria-label={`${b.label}: ${b.count} desaparecidas`}
              className="flex h-full flex-1 items-end"
            >
              <span className={`block w-full ${on ? "bg-red" : "bg-ink"}`} style={{ height: `${((b.count / max) * 100).toFixed(1)}%` }} />
            </button>
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[10px] leading-none font-medium text-mut">
        <span>{startLabel}</span>
        <span>AYER</span>
      </div>
      <DemoTag className="mt-2.5 text-mut" />
    </section>
  );
}

export type Bar = { label: string; count: number; href?: string };

/** Barras horizontales; con `href`, la fila navega (p. ej. a la página de distrito). */
export function BarChart({ id, title, bars, hint }: { id: string; title: string; bars: Bar[]; hint: string }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...bars.map((b) => b.count));
  const total = bars.reduce((a, b) => a + b.count, 0);
  const pctOf = (n: number) => (total ? dec1((n / total) * 100) + "%" : "");
  const current = active === null ? null : bars[active];

  return (
    <section className={card} aria-labelledby={id}>
      <h2 id={id} className="text-[15px] leading-[1.2] font-semibold">
        {title}
      </h2>
      <div className={readClass} aria-live="polite">
        {current ? `${current.label} · ${num(current.count)} (${pctOf(current.count)})` : hint}
      </div>
      <ul className="mt-2" onMouseLeave={() => setActive(null)}>
        {bars.map((b, i) => {
          const on = active === i;
          const row = (
            <>
              <span className="truncate text-[13px] leading-[1.2]" title={b.label}>{b.label}</span>
              <span className="h-3 bg-track">
                <span className={`block h-full ${on ? "bg-red" : "bg-ink"}`} style={{ width: `${((b.count / max) * 100).toFixed(1)}%` }} />
              </span>
              <span className="text-right font-mono text-xs leading-none font-medium">{num(b.count)}</span>
            </>
          );
          const rowClass = "grid w-full grid-cols-[96px_minmax(0,1fr)_40px] sm:grid-cols-[150px_minmax(0,1fr)_48px] items-center gap-2.5 py-1.5 text-left";
          const handlers = { onMouseEnter: () => setActive(i), onFocus: () => setActive(i) };
          return (
            <li key={b.label}>
              {b.href ? (
                <Link href={b.href} className={rowClass} {...handlers}>
                  {row}
                </Link>
              ) : (
                <button type="button" className={rowClass} onClick={() => setActive(i)} {...handlers}>
                  {row}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <DemoTag className="mt-2.5 text-mut" />
    </section>
  );
}
