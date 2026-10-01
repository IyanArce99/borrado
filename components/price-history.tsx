import type { Listing } from "@/lib/data";
import { eur, eurK, fmtDate } from "@/lib/format";

/** Gráfico de histórico: escalones hasta la desaparición (84%) y rastro rojo. */
export function PriceHistory({ x }: { x: Listing }) {
  const h = x.hist;
  const span = Math.max(1, x.t1 - x.t0);
  const ps = h.map((p) => p.p);
  const max = Math.max(...ps);
  const min = Math.min(...ps);
  const X = (t: number) => 20 + ((t - x.t0) / span) * 820;
  const Y = (p: number) => (max === min ? 150 : 50 + ((max - p) / (max - min)) * 190);

  let d = "M20 " + Y(h[0].p);
  h.slice(1).forEach((p) => (d += " H" + X(p.t) + " V" + Y(p.p)));
  d += " H840";

  const points = h.map((p, i) => ({ key: p.t, left: X(p.t) / 10, top: Y(p.p) / 3, label: i === 0 || i === h.length - 1 ? eurK(p.p) : "",
    // El último precio va debajo: encima corre la línea hacia el punto de desaparición.
    below: i > 0 && i === h.length - 1,
    // La primera etiqueta se alinea a la izquierda para no salirse del eje.
    first: i === 0,
  }));
  const summary = `Precio de ${eur(x.p0)} el ${fmtDate(x.t0)} a ${eur(x.pf)} el ${fmtDate(x.t1)}, con ${x.changes} bajadas.`;

  return (
    <figure>
      <div className="relative mt-4 h-[200px] border-b border-l border-dim" role="img" aria-label={summary}>
        <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden>
          <path d={d} fill="none" className="stroke-ink" strokeWidth={2} vectorEffect="non-scaling-stroke" />
          <path d={`M840 ${Y(x.pf)} H1000`} fill="none" className="stroke-red" strokeWidth={1.5} strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
        </svg>
        {points.map((p) => (
          <span key={p.key} aria-hidden>
            <span
              className="absolute size-[9px] -translate-1/2 rounded-[50%] bg-ink shadow-[0_0_0_3px_var(--bg)]"
              style={{ left: `${p.left}%`, top: `${p.top}%` }}
            />
            {p.label && (
              <span
                className={`absolute font-mono text-[10px] leading-none font-medium whitespace-nowrap ${p.first ? "-translate-x-1" : "-translate-x-1/2"} ${p.below ? "translate-y-[90%]" : "-translate-y-[190%]"}`}
                style={{ left: `${p.left}%`, top: `${p.top}%` }}
              >
                {p.label}
              </span>
            )}
          </span>
        ))}
        <span
          aria-hidden
          className="absolute size-[13px] -translate-1/2 rounded-[50%] bg-red shadow-[0_0_0_3px_var(--bg)]"
          style={{ left: "84%", top: `${Y(x.pf) / 3}%` }}
        />
        <span
          aria-hidden
          className="absolute right-0 -mt-4 font-mono text-[9.5px] leading-none font-semibold tracking-[.02em] text-red"
          style={{ top: `${Y(x.pf) / 3}%` }}
        >
          BORRADO
        </span>
      </div>
      <figcaption className="mt-1.5 flex justify-between font-mono text-[10px] leading-none font-medium text-mut">
        <span>{fmtDate(x.t0)}</span>
        <span>{fmtDate(x.t1)}</span>
      </figcaption>
    </figure>
  );
}
