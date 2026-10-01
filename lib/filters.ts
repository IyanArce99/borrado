/**
 * Definición de filtros de /borrados. Sin dependencias del dataset para
 * poder importarse también desde componentes cliente.
 */

export type Range = readonly [number, number];

export const PRICE_RANGES = { "<200": [0, 2e5], "200-400": [2e5, 4e5], "400-700": [4e5, 7e5], ">700": [7e5, 1e9] } as const satisfies Record<string, Range>;
export const SIZE_RANGES = { "<60": [0, 60], "60-90": [60, 90], "90-130": [90, 130], ">130": [130, 1e4] } as const satisfies Record<string, Range>;
export const TIME_RANGES = { "<30": [0, 30], "30-90": [30, 90], "90-180": [90, 180], "180-365": [180, 365], ">365": [365, 1e4] } as const satisfies Record<string, Range>;
export const VARIATION_BUCKETS = ["sin", "0-5", "5-10", "10-20", ">20"] as const;
export const DATE_OPTIONS = ["1", "7", "30", "90"] as const;
export const ROOM_OPTIONS = ["1", "2", "3", "4+"] as const;
export const TIPO_OPTIONS = ["Piso", "Apartamento", "Ático", "Casa", "Chalet"] as const;
export const SORT_OPTIONS = [
  ["reciente", "Más recientes"],
  ["bajada", "Mayor bajada"],
  ["dias", "Más días observado"],
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number][0];

export type Filters = {
  distrito: string;
  barrio: string;
  fecha: string;
  tipo: string;
  precio: string;
  sup: string;
  hab: string;
  tiempo: string;
  var: string;
};

export type FilterKey = keyof Filters;

export const DEFAULT_FILTERS: Filters = {
  distrito: "",
  barrio: "",
  fecha: "30",
  tipo: "",
  precio: "",
  sup: "",
  hab: "",
  tiempo: "",
  var: "",
};

export const PAGE_SIZE = 12;

/** Grupos de chips del panel, en orden de aparición. "" = "Todas/Todos". */
export const CHIP_GROUPS: readonly { key: FilterKey; label: string; options: readonly (readonly [string, string])[] }[] = [
  { key: "fecha", label: "FECHA", options: [["1", "Ayer"], ["7", "7 días"], ["30", "30 días"], ["90", "90 días"]] },
  { key: "tipo", label: "TIPOLOGÍA", options: [["", "Todas"], ...TIPO_OPTIONS.map((t) => [t, t] as const)] },
  { key: "precio", label: "ÚLTIMO PRECIO", options: [["", "Todos"], ["<200", "<200k"], ["200-400", "200–400k"], ["400-700", "400–700k"], [">700", ">700k"]] },
  { key: "sup", label: "SUPERFICIE", options: [["", "Todas"], ["<60", "<60 m²"], ["60-90", "60–90"], ["90-130", "90–130"], [">130", ">130"]] },
  { key: "hab", label: "HABITACIONES", options: [["", "Todas"], ...ROOM_OPTIONS.map((h) => [h, h] as const)] },
  { key: "tiempo", label: "TIEMPO OBSERVADO", options: [["", "Todos"], ["<30", "<30 d"], ["30-90", "30–90"], ["90-180", "90–180"], ["180-365", "180–365"], [">365", ">365"]] },
  { key: "var", label: "VARIACIÓN DE PRECIO", options: [["", "Todas"], ["sin", "Sin cambio"], ["0-5", "0–5%"], ["5-10", "5–10%"], ["10-20", "10–20%"], [">20", ">20%"]] },
];

type RawParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

function oneOf<T extends string>(v: string, allowed: readonly T[], fallback: T | ""): T | "" {
  return (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}

/** Valida y normaliza la query string; valores desconocidos se ignoran. */
export function parseFilters(sp: RawParams, districtSlugs: readonly string[], barriosOf: (slug: string) => readonly string[]): Filters {
  const distrito = oneOf(first(sp.distrito), districtSlugs, "");
  const barrio = distrito ? oneOf(first(sp.barrio), barriosOf(distrito), "") : "";
  return {
    distrito,
    barrio,
    fecha: oneOf(first(sp.fecha), DATE_OPTIONS, "30"),
    tipo: oneOf(first(sp.tipo), TIPO_OPTIONS, ""),
    precio: oneOf(first(sp.precio), Object.keys(PRICE_RANGES), ""),
    sup: oneOf(first(sp.sup), Object.keys(SIZE_RANGES), ""),
    hab: oneOf(first(sp.hab), ROOM_OPTIONS, ""),
    tiempo: oneOf(first(sp.tiempo), Object.keys(TIME_RANGES), ""),
    var: oneOf(first(sp.var), VARIATION_BUCKETS, ""),
  };
}

export function parseSort(sp: RawParams): SortKey {
  return oneOf(first(sp.orden), SORT_OPTIONS.map((o) => o[0]), "reciente") || "reciente";
}

export function parseLimit(sp: RawParams): number {
  const n = parseInt(first(sp.n), 10);
  if (!Number.isFinite(n) || n < PAGE_SIZE) return PAGE_SIZE;
  return Math.min(Math.ceil(n / PAGE_SIZE) * PAGE_SIZE, 1200);
}

/** Filtros activos (la fecha por defecto no cuenta). */
export function activeFilterCount(f: Filters): number {
  return (Object.keys(f) as FilterKey[]).filter((k) => f[k] && !(k === "fecha" && f[k] === DEFAULT_FILTERS.fecha)).length;
}

/** Serializa solo lo que difiere de los valores por defecto. */
export function toSearchParams(f: Filters, sort: SortKey, limit = PAGE_SIZE): URLSearchParams {
  const sp = new URLSearchParams();
  (Object.keys(f) as FilterKey[]).forEach((k) => {
    if (f[k] && f[k] !== DEFAULT_FILTERS[k]) sp.set(k, f[k]);
  });
  if (sort !== "reciente") sp.set("orden", sort);
  if (limit > PAGE_SIZE) sp.set("n", String(limit));
  return sp;
}
