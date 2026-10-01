import type { Metadata } from "next";
import Link from "next/link";
import { FilterBar } from "@/components/borrados/filter-bar";
import { HuellaGrid } from "@/components/huella";
import { DemoTag, Eyebrow } from "@/components/ui";
import { getBorrados } from "@/lib/api";
import { DISTRICTS, findDistrict } from "@/lib/districts";
import { PAGE_SIZE, parseFilters, parseLimit, parseSort, toSearchParams } from "@/lib/filters";
import { num, pct } from "@/lib/format";
import { toHuella } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Borrados · Histórico de anuncios desaparecidos en Madrid",
  description: "Histórico filtrable de anuncios de vivienda desaparecidos del mercado observado en Madrid. Datos de demostración.",
  alternates: { canonical: "/borrados" },
};

export default async function BorradosPage({ searchParams }: PageProps<"/borrados">) {
  const sp = await searchParams;
  const filters = parseFilters(
    sp,
    DISTRICTS.map((d) => d.slug),
    (slug) => findDistrict(slug)?.barrios ?? [],
  );
  const sort = parseSort(sp);
  const limit = parseLimit(sp);
  const { items, total, stat } = await getBorrados(filters, sort, limit);
  const moreHref = "/borrados?" + toSearchParams(filters, sort, limit + PAGE_SIZE).toString();

  const kpis = [
    { v: num(total), l: "Desaparecidos" },
    { v: Math.round(stat.avgDays) + " d", l: "Tiempo medio" },
    { v: pct(stat.avgDrop), l: "Bajada media" },
  ];

  return (
    <main className="page pt-[26px]">
      <Eyebrow>MADRID · HISTÓRICO</Eyebrow>
      <h1 className="mt-2.5 mb-1.5 text-[44px] leading-none font-medium">Borrados</h1>
      <p className="text-sm leading-[1.45] text-ink2">Anuncios desaparecidos del mercado observado.</p>

      <div className="mt-[18px] grid grid-cols-3 border-t-2 border-b border-t-ink border-b-line md:max-w-2xl">
        {kpis.map((k) => (
          <div key={k.l} className="py-3 pr-1.5">
            <div className="font-mono text-xl leading-none font-medium">{k.v}</div>
            <div className="mt-[5px] text-xs leading-[1.25] text-mut">{k.l}</div>
          </div>
        ))}
      </div>
      <DemoTag className="mt-1.5 text-mut" />

      <FilterBar filters={filters} sort={sort} resultCount={num(total)} />

      <Eyebrow className="pt-3.5 pb-2 text-mut">{num(total)} ANUNCIOS DESAPARECIDOS</Eyebrow>
      {total ? (
        <HuellaGrid items={items.map(toHuella)} />
      ) : (
        <p className="py-10 text-center text-xl leading-[1.3] font-semibold text-mut">Ningún anuncio desaparecido con estos filtros.</p>
      )}
      {total > items.length && (
        <Link href={moreHref} scroll={false} replace className="mt-3.5 flex h-12 w-full items-center justify-center border border-ink text-sm font-medium">
          Cargar más
        </Link>
      )}
    </main>
  );
}
