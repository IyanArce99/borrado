/**
 * Dataset de demostración determinista (PRNG seed 20260930).
 *
 * Porta literalmente `build()` del prototipo: cambiar el orden de las
 * llamadas a `rand()` altera todo el dataset, así que no reordenar.
 */
import { DISTRICT_SEEDS, OUTER_DISTRICTS } from "./districts";
import { DAY_MS, TODAY, slugify } from "./format";

export const TIPOS = ["Piso", "Apartamento", "Ático", "Casa", "Chalet"] as const;
export type Tipo = (typeof TIPOS)[number];

export type PricePoint = { t: number; p: number };

export type Republication = {
  /** Fecha de detección de la posible coincidencia */
  t: number;
  /** Coincidencia estimada, 0–100 */
  score: number;
  /** Precio del anuncio coincidente */
  p: number;
};

export type Listing = {
  id: string;
  dist: string;
  /** slug del distrito */
  ds: string;
  barrio: string;
  tipo: Tipo;
  m2: number;
  hab: number;
  banos: number;
  /** precio inicial */
  p0: number;
  /** último precio observado */
  pf: number;
  /** variación % entre p0 y pf */
  pc: number;
  hist: PricePoint[];
  /** número de bajadas de precio */
  changes: number;
  /** primera detección */
  t0: number;
  /** desaparición (o hoy, si sigue activo) */
  t1: number;
  /** días observado */
  days: number;
  /** hace cuántos días desapareció (0 = activo) */
  goneDay: number;
  rep: Republication | null;
};

export type Dataset = {
  /** Anuncios desaparecidos en los últimos 90 días (goneDay 1–90) */
  recs: Listing[];
  /** Desapariciones por día: counts[1] = ayer */
  counts: Record<number, number>;
  feat: Listing;
  /** Anuncios aún activos (feed de agencias) */
  active: Listing[];
  byId: Map<string, Listing>;
};

export const FEATURED_ID = "BR-00127";
export const YESTERDAY_COUNT = 87;
export const LAST30_COUNT = 1284;
export const HISTORY_DAYS = 90;

function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SIZE_RANGES: Record<Tipo, [number, number]> = {
  Piso: [45, 140],
  Apartamento: [28, 65],
  Ático: [50, 160],
  Casa: [85, 220],
  Chalet: [150, 420],
};

function build(): Dataset {
  const rand = mulberry32(20260930);
  const pick = <T,>(a: readonly T[]): T => a[Math.floor(rand() * a.length)];
  const wsum = DISTRICT_SEEDS.reduce((a, d) => a + d[1], 0);
  const pickDistrict = () => {
    let x = rand() * wsum;
    for (const d of DISTRICT_SEEDS) {
      x -= d[1];
      if (x <= 0) return d;
    }
    return DISTRICT_SEEDS[0];
  };
  const roundPrice = (p: number) => (p > 500000 ? Math.round(p / 5000) * 5000 : Math.round(p / 1000) * 1000);
  let idn = 10000;

  const make = (goneDay: number, active: boolean): Listing => {
    const D = pickDistrict();
    const x = rand();
    let tipo: Tipo;
    if (OUTER_DISTRICTS.has(D[0])) tipo = x < 0.55 ? "Piso" : x < 0.65 ? "Apartamento" : x < 0.75 ? "Ático" : x < 0.85 ? "Casa" : "Chalet";
    else tipo = x < 0.68 ? "Piso" : x < 0.86 ? "Apartamento" : x < 0.97 ? "Ático" : "Casa";
    const R = SIZE_RANGES[tipo];
    const m2 = Math.round(R[0] + Math.pow(rand(), 1.4) * (R[1] - R[0]));
    const hab = Math.max(tipo === "Apartamento" ? 0 : 1, Math.min(6, Math.round(m2 / 32 + (rand() - 0.5))));
    const banos = Math.max(1, Math.min(4, Math.round(m2 / 60 + (rand() - 0.3))));
    const k = (tipo === "Ático" ? 1.12 : tipo === "Chalet" ? 0.9 : tipo === "Casa" ? 0.92 : 1) * (0.82 + rand() * 0.4);
    const p0 = roundPrice(m2 * D[2] * k);
    const b = rand();
    let days =
      b < 0.16 ? 5 + rand() * 25 : b < 0.47 ? 30 + rand() * 60 : b < 0.77 ? 90 + rand() * 90 : b < 0.95 ? 180 + rand() * 185 : 365 + rand() * 260;
    days = Math.round(days);
    const t1 = TODAY - goneDay * DAY_MS;
    const t0 = t1 - days * DAY_MS;
    const hist: PricePoint[] = [{ t: t0, p: p0 }];
    if (rand() < Math.min(0.75, 0.05 + (days / 365) * 0.36)) {
      const n = Math.max(1, Math.min(4, 1 + Math.floor(rand() * (1 + days / 70))));
      const tot = (1.2 + rand() * 5.5 + (days / 365) * 4) / 100;
      const cuts = Array.from({ length: n }, () => rand() + 0.2);
      const cs = cuts.reduce((a, c) => a + c, 0);
      const times = Array.from({ length: n }, () => t0 + Math.round((0.12 + rand() * 0.85) * days) * DAY_MS).sort((a, c) => a - c);
      let p = p0;
      let acc = 0;
      times.forEach((t, i) => {
        acc += cuts[i];
        const np = roundPrice(p0 * (1 - (tot * acc) / cs));
        if (np < p) {
          hist.push({ t, p: np });
          p = np;
        }
      });
    }
    const pf = hist[hist.length - 1].p;
    let rep: Republication | null = null;
    if (!active && rand() < 0.125) {
      const lag = 1 + Math.floor(rand() * 18);
      if (goneDay - lag >= 0) {
        rep = { t: t1 + lag * DAY_MS, score: Math.round(72 + rand() * 26), p: Math.round((pf * (0.955 + rand() * 0.045)) / 1000) * 1000 };
      }
    }
    idn += 1 + Math.floor(rand() * 5);
    const id = "BR-" + idn;
    return {
      id,
      dist: D[0],
      ds: slugify(D[0]),
      barrio: pick(D[3]),
      tipo,
      m2,
      hab,
      banos,
      p0,
      pf,
      pc: ((pf - p0) / p0) * 100,
      hist,
      changes: hist.length - 1,
      t0,
      t1,
      days,
      goneDay,
      rep,
    };
  };

  const counts: Record<number, number> = {};
  let s30 = 0;
  for (let d = 1; d <= HISTORY_DAYS; d++) {
    counts[d] = d === 1 ? YESTERDAY_COUNT : Math.round(41 + 7 * Math.sin(d / 2.2) + (rand() - 0.5) * 12);
    if (d <= 30) s30 += counts[d];
  }
  // Ajuste para que los últimos 30 días sumen exactamente LAST30_COUNT.
  counts[30] += LAST30_COUNT - s30;

  const recs: Listing[] = [];
  for (let d = 1; d <= HISTORY_DAYS; d++) for (let i = 0; i < counts[d]; i++) recs.push(make(d, false));

  const ft1 = TODAY - DAY_MS;
  const ft0 = ft1 - 127 * DAY_MS;
  const feat: Listing = {
    id: FEATURED_ID,
    dist: "Chamberí",
    ds: "chamberi",
    barrio: "Trafalgar",
    tipo: "Piso",
    m2: 82,
    hab: 2,
    banos: 1,
    p0: 320000,
    pf: 295000,
    pc: -7.8125,
    hist: [
      { t: ft0, p: 320000 },
      { t: Date.UTC(2026, 6, 2), p: 310000 },
      { t: Date.UTC(2026, 7, 18), p: 299000 },
      { t: Date.UTC(2026, 8, 27), p: 295000 },
    ],
    changes: 3,
    t0: ft0,
    t1: ft1,
    days: 127,
    goneDay: 1,
    rep: { t: TODAY, score: 94, p: 289000 },
  };
  // El caso destacado sustituye a un desaparecido de ayer: los totales no cambian.
  recs[0] = feat;

  const active: Listing[] = [];
  for (let i = 0; i < 70; i++) active.push(make(0, true));

  const byId = new Map(recs.map((r) => [r.id, r]));
  return { recs, counts, feat, active, byId };
}

let cached: Dataset | null = null;

/** Dataset único para toda la app: todas las métricas se derivan de aquí. */
export function getDataset(): Dataset {
  cached ??= build();
  return cached;
}
