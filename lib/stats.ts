/**
 * Estadísticas y vistas derivadas. Porta `stat()`, `spark()` y `facts()`
 * del prototipo.
 */
import type { Listing } from "./data";
import { eur, eurK, pct, relDay, roomsLabel } from "./format";

export type Stat = {
  n: number;
  /** tiempo medio observado (días) */
  avgDays: number;
  /** variación media entre los que bajaron precio (negativa) */
  avgDrop: number;
  /** % que redujo precio */
  pRed: number;
  /** % con posible republicación */
  pRep: number;
  /** mediana de días observados */
  med: number;
};

export function stat(a: readonly Listing[]): Stat {
  const n = a.length;
  if (!n) return { n: 0, avgDays: 0, avgDrop: 0, pRed: 0, pRep: 0, med: 0 };
  const red = a.filter((x) => x.changes > 0);
  const so = a.map((x) => x.days).sort((p, q) => p - q);
  return {
    n,
    avgDays: a.reduce((s, x) => s + x.days, 0) / n,
    avgDrop: red.length ? red.reduce((s, x) => s + x.pc, 0) / red.length : 0,
    pRed: (red.length / n) * 100,
    pRep: (a.filter((x) => x.rep).length / n) * 100,
    med: n % 2 ? so[(n - 1) / 2] : (so[n / 2 - 1] + so[n / 2]) / 2,
  };
}

export type Spark = {
  path: string;
  ghost: string;
  /** y del último precio */
  yl: number;
  /** x donde termina el histórico (punto de desaparición) */
  end: number;
};

/** Sparkline en escalones sobre un viewBox W×56; tras el 82% va el rastro. */
export function spark(x: Listing, W = 240): Spark {
  const h = x.hist;
  const t0 = x.t0;
  const span = Math.max(1, x.t1 - t0);
  const ps = h.map((p) => p.p);
  const mx = Math.max(...ps);
  const mn = Math.min(...ps);
  const end = W * 0.82;
  const X = (t: number) => 6 + ((t - t0) / span) * (end - 6);
  const Y = (p: number) => (mx === mn ? 28 : 8 + ((mx - p) / (mx - mn)) * 40);
  let d = "M6 " + Y(h[0].p).toFixed(1);
  for (let i = 1; i < h.length; i++) d += " H" + X(h[i].t).toFixed(1) + " V" + Y(h[i].p).toFixed(1);
  d += " H" + end;
  const yl = Y(x.pf);
  return { path: d, ghost: "M" + end + " " + yl.toFixed(1) + " H" + (W - 4), yl, end };
}

/** Días observados → índice de tramo (<30, 30–90, 90–180, 180–365, >365). */
export function daysBucket(d: number): number {
  return d < 30 ? 0 : d < 90 ? 1 : d < 180 ? 2 : d < 365 ? 3 : 4;
}

/** Variación → índice (sin cambio, 0–5, 5–10, 10–20, >20%). */
export function variationBucket(x: Listing): number {
  if (!x.changes) return 0;
  const v = -x.pc;
  return v < 5 ? 1 : v < 10 ? 2 : v < 20 ? 3 : 4;
}

export function specLabel(x: Listing): string {
  return x.m2 + " m² · " + roomsLabel(x.hab);
}

/**
 * "¿Qué pasó antes de desaparecer?": solo hechos observables, nunca causas.
 * `districtAvgDays` es el tiempo medio observado del distrito (30 días).
 */
export function facts(x: Listing, districtAvgDays: number): string[] {
  const f: string[] = [];
  f.push(x.changes ? "Bajó el precio " + x.changes + (x.changes === 1 ? " vez." : " veces.") : "No registró cambios de precio.");
  f.push("Estuvo " + x.days + " días observado.");
  if (x.changes) f.push("Su precio cambió un " + pct(x.pc) + ".");
  f.push("Su último precio observado fue " + eur(x.pf) + ".");
  f.push(x.rep ? "Posteriormente se detectó una posible coincidencia." : "No se ha detectado una posible coincidencia posterior.");
  f.push("En " + x.dist + ", el tiempo medio observado en los últimos 30 días fue de " + Math.round(districtAvgDays) + " días.");
  return f;
}

/** Modelo de vista serializable de la Huella. */
export type HuellaData = {
  id: string;
  spec: string;
  dist: string;
  barrio: string;
  start: string;
  end: string;
  pct: string;
  dropped: boolean;
  days: string;
  gone: string;
  path: string;
  ghost: string;
  dotLeft: string;
  dotTop: string;
  rep: boolean;
};

export function toHuella(x: Listing): HuellaData {
  const s = spark(x, 240);
  return {
    id: x.id,
    spec: x.tipo.toUpperCase() + " · " + x.m2 + " m² · " + roomsLabel(x.hab, true),
    dist: x.dist,
    barrio: x.barrio,
    start: eurK(x.p0),
    end: eurK(x.pf),
    pct: x.changes ? pct(x.pc) : "Sin cambio",
    dropped: x.changes > 0,
    days: x.days + " días",
    gone: "Desaparecido " + relDay(x.goneDay),
    path: s.path,
    ghost: s.ghost,
    dotLeft: ((s.end / 240) * 100).toFixed(2) + "%",
    dotTop: ((s.yl / 56) * 100).toFixed(2) + "%",
    rep: !!x.rep,
  };
}
