import type { Metadata } from "next";
import { BarChart, DailyChart } from "@/components/stats/charts";
import { DemoTag, Eyebrow } from "@/components/ui";
import { getBreakdowns, getStats } from "@/lib/api";
import { dateAgo, dec1, fmtDate, num, pct } from "@/lib/format";

export const metadata: Metadata = {
  title: "El mercado que desaparece · Estadísticas de Madrid",
  description:
    "Cuántas viviendas desaparecen del mercado observado en Madrid, cuánto tiempo estuvieron anunciadas y cuánto bajaron de precio. Datos de demostración.",
  alternates: { canonical: "/estadisticas" },
};

export default async function EstadisticasPage() {
  const [overview, breakdowns] = await Promise.all([getStats(30), getBreakdowns(30)]);
  const { last30 } = overview;

  const kpis = [
    { v: num(overview.yesterday), l: "Desaparecidas ayer" },
    { v: num(last30.n), l: "Últimos 30 días" },
    { v: Math.round(last30.avgDays) + " días", l: "Tiempo medio observado" },
    { v: pct(last30.avgDrop), l: "Bajada media antes de desaparecer" },
    { v: dec1(last30.pRed) + "%", l: "Con reducción de precio" },
    { v: dec1(last30.pRep) + "%", l: "Posibles republicaciones" },
  ];

  return (
    <main className="page pt-[26px]">
      <Eyebrow>MADRID · ÚLTIMOS 30 DÍAS</Eyebrow>
      <h1 className="mt-2.5 mb-[18px] text-[42px] leading-none font-medium">El mercado que desaparece</h1>

      <div className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.l} className="bg-bg px-3 py-3.5">
            <div className="text-[30px] leading-none font-medium">{k.v}</div>
            <div className="mt-1.5 text-[12.5px] leading-[1.3] text-ink2">{k.l}</div>
            <DemoTag size="8.5px" className="mt-2 text-mut" />
          </div>
        ))}
      </div>

      <div className="mt-7 grid gap-3.5 md:grid-cols-2">
        <div className="md:col-span-2">
          <DailyChart
            startLabel={fmtDate(dateAgo(30), false)}
            bars={overview.daily.map((d) => ({ ...d, label: fmtDate(dateAgo(d.daysAgo)) }))}
          />
        </div>
        <BarChart id="chart-tiempo" title="Tiempo observado antes de desaparecer" hint="Toca una barra" bars={breakdowns.tiempo} />
        <BarChart id="chart-variacion" title="Variación de precio antes de desaparecer" hint="Toca una barra" bars={breakdowns.variacion} />
        <BarChart
          id="chart-distritos"
          title="Desapariciones por distrito"
          hint="Toca un distrito para abrir su página"
          bars={overview.ranking.map((d) => ({ label: d.name, count: d.count, href: `/madrid/${d.slug}` }))}
        />
        <BarChart id="chart-tipologia" title="Desapariciones por tipología" hint="Toca una barra" bars={breakdowns.tipologia} />
      </div>
    </main>
  );
}
