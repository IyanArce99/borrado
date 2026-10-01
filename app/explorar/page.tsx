import type { Metadata } from "next";
import Link from "next/link";
import { SearchTrigger } from "@/components/actions";
import { CitiesForm } from "@/components/forms";
import { DemoTag, Eyebrow } from "@/components/ui";
import { getStats } from "@/lib/api";

export const metadata: Metadata = {
  title: "Explorar Madrid · Viviendas desaparecidas por distrito",
  description: "Los 20 distritos de Madrid ordenados por anuncios de vivienda desaparecidos en los últimos 30 días. Datos de demostración.",
  alternates: { canonical: "/explorar" },
};

export default async function ExplorarPage() {
  const { ranking } = await getStats(30);

  return (
    <main className="page pt-[26px]">
      <h1 className="mb-1.5 text-[42px] leading-none font-medium">Explorar Madrid</h1>
      <p className="mb-4 text-sm leading-[1.45] text-ink2">20 distritos observados a diario. Toca uno para ver qué se ha borrado.</p>
      <SearchTrigger className="h-[50px] md:max-w-xl" />

      <ul className="mt-[18px] md:grid md:grid-cols-2 md:gap-x-10">
        {ranking.map((d) => (
          <li key={d.slug}>
            <Link href={`/madrid/${d.slug}`} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 border-t border-line py-[13px] hover:text-red">
              <span className="text-[17px] leading-[1.2] font-semibold">{d.name}</span>
              <span className="font-mono text-[15px] leading-none font-medium">{d.count}</span>
              <span className="text-xs leading-[1.3] text-mut">
                /madrid/{d.slug} · {Math.round(d.avgDays)} días de media
              </span>
              <span className="text-right font-mono text-[10px] leading-[1.3] font-medium text-mut">30 DÍAS</span>
            </Link>
          </li>
        ))}
      </ul>
      <DemoTag className="mt-1.5 text-mut" />

      <section id="proximamente" className="mt-[34px] scroll-mt-20 border border-dashed border-[rgba(var(--rgb),.4)] px-4 py-5" aria-labelledby="proximamente-titulo">
        <Eyebrow>PRÓXIMAMENTE</Eyebrow>
        <h2 id="proximamente-titulo" className="mt-2.5 mb-3.5 text-[22px] leading-[1.25] font-semibold">
          Barcelona · Málaga · Valencia · Sevilla · Las Palmas · Alicante
        </h2>
        <CitiesForm />
      </section>
    </main>
  );
}
