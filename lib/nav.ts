export type NavItem = { label: string; href: string };

export const NAV: readonly NavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Borrados", href: "/borrados" },
  { label: "Estadísticas", href: "/estadisticas" },
  { label: "Explorar", href: "/explorar" },
  { label: "Metodología", href: "/metodologia" },
  { label: "Para agencias", href: "/agencias" },
  { label: "Pro", href: "/pro" },
];

/** Las 4 primeras van en la tab bar; el resto cuelga de "Más". */
export const TAB_ITEMS = NAV.slice(0, 4);
export const MORE_HREFS = NAV.slice(4).map((n) => n.href);

/** Rutas hijas que marcan como activa una sección. */
const SECTION_ALIASES: Record<string, string[]> = {
  "/borrados": ["/vivienda"],
  "/explorar": ["/madrid"],
};

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  const prefixes = [href, ...(SECTION_ALIASES[href] ?? [])];
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}
