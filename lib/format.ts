/**
 * Formateadores deterministas (sin Intl) para que servidor y cliente
 * produzcan exactamente el mismo texto.
 */

export const DAY_MS = 86_400_000;
/** "Hoy" del dataset de demostración: 30 SEP 2026 (UTC). */
export const TODAY = Date.UTC(2026, 8, 30);

const MONTHS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

/** 1284 → "1.284" */
export function num(x: number): string {
  return String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** 295000 → "€295.000" */
export function eur(x: number): string {
  return "€" + num(x);
}

/** 295000 → "€295k" · 1250000 → "€1,25M" */
export function eurK(x: number): string {
  return x >= 1e6 ? "€" + (x / 1e6).toFixed(2).replace(".", ",") + "M" : "€" + Math.round(x / 1000) + "k";
}

/** 5.83 → "5,8" */
export function dec1(x: number): string {
  return x.toFixed(1).replace(".", ",");
}

/** −5.83 → "−5,8%" (signo menos tipográfico) */
export function pct(x: number): string {
  return Math.abs(x) < 0.05 ? "0,0%" : (x < 0 ? "−" : "+") + dec1(Math.abs(x)) + "%";
}

/** timestamp → "30 SEP 2026" · withYear=false → "30 SEP" */
export function fmtDate(t: number, withYear = true): string {
  const d = new Date(t);
  return d.getUTCDate() + " " + MONTHS[d.getUTCMonth()] + (withYear ? " " + d.getUTCFullYear() : "");
}

export function dateAgo(days: number): number {
  return TODAY - days * DAY_MS;
}

/** Frecuencia diaria: nunca minutos ni horas. */
export function relDay(daysAgo: number): string {
  if (daysAgo === 0) return "hoy";
  if (daysAgo === 1) return "ayer";
  if (daysAgo <= 7) return "hace " + daysAgo + " días";
  return "el " + fmtDate(dateAgo(daysAgo), false);
}

export function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function slugify(s: string): string {
  return normalize(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function roomsLabel(hab: number, upper = false): string {
  if (!hab) return upper ? "ESTUDIO" : "estudio";
  return hab + (upper ? " HAB." : " hab.");
}

export function bathsLabel(banos: number): string {
  return banos + (banos > 1 ? " baños" : " baño");
}
