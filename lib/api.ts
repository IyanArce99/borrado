/**
 * Capa de acceso a datos. Hoy lee del dataset de demostración; las firmas
 * son asíncronas para poder sustituirlas por un backend real sin tocar
 * las páginas.
 */
import { getDataset, type Listing, TIPOS, type Tipo } from "./data";
import { DISTRICTS, findDistrict } from "./districts";
import { DAY_MS, TODAY, eurK, normalize, pct, relDay } from "./format";
import { PRICE_RANGES, SIZE_RANGES, TIME_RANGES, VARIATION_BUCKETS, type Filters, type SortKey } from "./filters";
import { daysBucket, facts, specLabel, stat, variationBucket, type Stat } from "./stats";

const inRange = (x: number, [a, b]: readonly [number, number]) => x >= a && x < b;

function lastDays(days: number): Listing[] {
  return getDataset().recs.filter((x) => x.goneDay <= days);
}

function yesterday(): Listing[] {
  return getDataset().recs.filter((x) => x.goneDay === 1);
}

/* ---------- Resumen / estadísticas ---------- */

export type DistrictRank = { name: string; slug: string; count: number; avgDays: number };

export type Overview = {
  yesterday: number;
  last30: Stat;
  /** desapariciones por día, de más antiguo a ayer */
  daily: { daysAgo: number; count: number }[];
  ranking: DistrictRank[];
};

export async function getStats(range = 30): Promise<Overview> {
  const { counts } = getDataset();
  const L = lastDays(range);
  const bySlug = new Map<string, Listing[]>();
  L.forEach((x) => bySlug.set(x.ds, [...(bySlug.get(x.ds) ?? []), x]));
  const ranking = DISTRICTS.map((d) => {
    const items = bySlug.get(d.slug) ?? [];
    return { name: d.name, slug: d.slug, count: items.length, avgDays: stat(items).avgDays };
  }).sort((a, b) => b.count - a.count);
  return {
    yesterday: yesterday().length,
    last30: stat(L),
    daily: Array.from({ length: range }, (_, i) => ({ daysAgo: range - i, count: counts[range - i] })),
    ranking,
  };
}

export type Breakdown = { label: string; count: number }[];

export async function getBreakdowns(range = 30): Promise<{ tiempo: Breakdown; variacion: Breakdown; tipologia: Breakdown }> {
  const tb = [0, 0, 0, 0, 0];
  const vb = [0, 0, 0, 0, 0];
  const tp = new Map<Tipo, number>();
  lastDays(range).forEach((x) => {
    tb[daysBucket(x.days)]++;
    vb[variationBucket(x)]++;
    tp.set(x.tipo, (tp.get(x.tipo) ?? 0) + 1);
  });
  return {
    tiempo: ["<30 días", "30–90", "90–180", "180–365", ">365 días"].map((label, i) => ({ label, count: tb[i] })),
    variacion: ["Sin bajada", "0–5%", "5–10%", "10–20%", ">20%"].map((label, i) => ({ label, count: vb[i] })),
    tipologia: TIPOS.map((label) => ({ label, count: tp.get(label) ?? 0 })),
  };
}

/** Desaparecidos ayer, con el caso destacado primero y luego los más movidos. */
export async function getLatest(limit: number): Promise<Listing[]> {
  const { feat } = getDataset();
  const Y = yesterday().filter((x) => x !== feat).sort((a, b) => b.changes - a.changes || a.pc - b.pc);
  return [feat, ...Y].slice(0, limit);
}

function districtAvgDays(slug: string): number {
  return stat(lastDays(30).filter((r) => r.ds === slug)).avgDays;
}

export async function getFeatured(): Promise<{ listing: Listing; facts: string[] }> {
  const { feat } = getDataset();
  return { listing: feat, facts: facts(feat, districtAvgDays(feat.ds)) };
}

/* ---------- Borrados ---------- */

export type BorradosResult = { items: Listing[]; total: number; stat: Stat };

function matches(x: Listing, f: Filters): boolean {
  if (x.goneDay > +f.fecha) return false;
  if (f.distrito && x.ds !== f.distrito) return false;
  if (f.barrio && x.barrio !== f.barrio) return false;
  if (f.tipo && x.tipo !== f.tipo) return false;
  if (f.precio && !inRange(x.pf, PRICE_RANGES[f.precio as keyof typeof PRICE_RANGES])) return false;
  if (f.sup && !inRange(x.m2, SIZE_RANGES[f.sup as keyof typeof SIZE_RANGES])) return false;
  if (f.tiempo && !inRange(x.days, TIME_RANGES[f.tiempo as keyof typeof TIME_RANGES])) return false;
  if (f.hab) {
    const ok = f.hab === "4+" ? x.hab >= 4 : f.hab === "1" ? x.hab <= 1 : x.hab === +f.hab;
    if (!ok) return false;
  }
  if (f.var) {
    const ok = f.var === "sin" ? !x.changes : x.changes > 0 && VARIATION_BUCKETS[variationBucket(x)] === f.var;
    if (!ok) return false;
  }
  return true;
}

const SORTERS: Record<SortKey, (a: Listing, b: Listing) => number> = {
  reciente: (a, b) => a.goneDay - b.goneDay,
  bajada: (a, b) => a.pc - b.pc,
  dias: (a, b) => b.days - a.days,
};

export async function getBorrados(filters: Filters, sort: SortKey = "reciente", limit = 12): Promise<BorradosResult> {
  const res = getDataset().recs.filter((x) => matches(x, filters)).sort(SORTERS[sort]);
  return { items: res.slice(0, limit), total: res.length, stat: stat(res) };
}

/* ---------- Ficha ---------- */

export type Vivienda = { listing: Listing; facts: string[]; similar: Listing[] };

export async function getVivienda(id: string): Promise<Vivienda | null> {
  const x = getDataset().byId.get(id);
  if (!x) return null;
  const similar = getDataset()
    .recs.filter((r) => r.ds === x.ds && r.id !== x.id && r.goneDay <= 7)
    .slice(0, 3);
  return { listing: x, facts: facts(x, districtAvgDays(x.ds)), similar };
}

/* ---------- Distrito ---------- */

export type BarrioRow = { name: string; n: number; avgDays: number; avgDrop: number };

export type Distrito = {
  name: string;
  slug: string;
  stat: Stat;
  barrios: BarrioRow[];
  latest: Listing[];
};

export async function getDistrito(slug: string): Promise<Distrito | null> {
  const d = findDistrict(slug);
  if (!d) return null;
  const A = lastDays(30).filter((x) => x.ds === slug);
  const barrios = d.barrios
    .map((b) => {
      const bs = stat(A.filter((x) => x.barrio === b));
      return { name: b, n: bs.n, avgDays: bs.avgDays, avgDrop: bs.avgDrop };
    })
    .sort((a, b) => b.n - a.n);
  const latest = getDataset()
    .recs.filter((x) => x.ds === slug)
    .slice(0, 3);
  return { name: d.name, slug: d.slug, stat: stat(A), barrios, latest };
}

/* ---------- Agencias ---------- */

export type FeedType = "bajada" | "gone" | "rep" | "180";

export type FeedItem = {
  key: string;
  type: FeedType;
  t: number;
  when: string;
  tag: string;
  red: boolean;
  dist: string;
  spec: string;
  main: string;
  extra: string;
};

export async function getAgencyFeed(): Promise<FeedItem[]> {
  const D = getDataset();
  const feed: Omit<FeedItem, "when">[] = [];
  const spec = (x: Listing) => x.tipo + " · " + specLabel(x);
  D.active.forEach((x) => {
    const last = x.hist[x.hist.length - 1];
    if (x.changes && TODAY - last.t <= 14 * DAY_MS) {
      const prev = x.hist[x.hist.length - 2].p;
      feed.push({ key: "b" + x.id, type: "bajada", t: last.t, tag: "▼ BAJADA DE PRECIO", red: true, dist: x.dist, spec: spec(x), main: eurK(prev) + " → " + eurK(x.pf), extra: pct(((x.pf - prev) / prev) * 100) });
    } else if (x.days > 180) {
      feed.push({ key: "a" + x.id, type: "180", t: TODAY - (x.days % 9) * DAY_MS, tag: "◷ +180 DÍAS", red: false, dist: x.dist, spec: spec(x), main: eurK(x.pf), extra: x.days + " días observado" });
    }
  });
  yesterday()
    .slice(0, 10)
    .forEach((x) => feed.push({ key: "g" + x.id, type: "gone", t: x.t1, tag: "● DESAPARECIDO", red: true, dist: x.dist, spec: spec(x), main: eurK(x.pf), extra: x.days + " días observado" }));
  D.recs
    .filter((x) => x.rep && TODAY - x.rep.t <= 10 * DAY_MS)
    .slice(0, 8)
    .forEach((x) => feed.push({ key: "r" + x.id, type: "rep", t: x.rep!.t, tag: "↻ POSIBLE REAPARECIDO", red: false, dist: x.dist, spec: spec(x), main: "Coincidencia estimada", extra: x.rep!.score + "%" }));
  return feed
    .sort((a, b) => b.t - a.t)
    .map((r) => ({ ...r, when: relDay(Math.round((TODAY - r.t) / DAY_MS)).toUpperCase() }));
}

/* ---------- Búsqueda ---------- */

export type SearchResult = { kind: "DISTRITO" | "BARRIO" | "ESTADÍSTICA" | "FICHA"; label: string; sub: string; href: string };

/** Prioridad: distritos → barrios → estadísticas → fichas (por ID). */
export async function searchSite(raw: string): Promise<SearchResult[]> {
  const q = normalize(raw.trim());
  if (!q) return [];
  const L30 = lastDays(30);
  const out: SearchResult[] = [];
  const countBy = (pred: (x: Listing) => boolean) => L30.filter(pred).length;
  DISTRICTS.forEach((d) => {
    const nn = normalize(d.name);
    if (nn.includes(q) || q.includes(nn)) {
      out.push({ kind: "DISTRITO", label: d.name, sub: countBy((x) => x.ds === d.slug) + " desaparecidas · 30 días", href: "/madrid/" + d.slug });
    }
  });
  DISTRICTS.forEach((d) =>
    d.barrios.forEach((b) => {
      const nb = normalize(b);
      if (nb.includes(q) || (q.length > 5 && q.includes(nb))) {
        out.push({ kind: "BARRIO", label: b, sub: d.name + " · " + countBy((x) => x.barrio === b) + " desaparecidas · 30 días", href: "/madrid/" + d.slug });
      }
    }),
  );
  if (/estad|desapar|borrad|madrid|tarda|vend/.test(q)) {
    out.push({ kind: "ESTADÍSTICA", label: "El mercado que desaparece", sub: "Estadísticas de Madrid · 30 días", href: "/estadisticas" });
  }
  const idq = q.replace(/[^0-9]/g, "");
  if (idq.length >= 3) {
    getDataset()
      .recs.filter((x) => x.id.includes(idq))
      .slice(0, 5)
      .forEach((x) =>
        out.push({ kind: "FICHA", label: x.tipo + " · " + x.dist + " · " + x.id, sub: specLabel(x) + " · desaparecido " + relDay(x.goneDay), href: "/vivienda/" + x.id }),
      );
  }
  return out.slice(0, 12);
}
