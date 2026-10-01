import Link from "next/link";
import { SearchTrigger, ShareButton } from "@/components/actions";
import { HuellaGrid } from "@/components/huella";
import { DemoTag, RedSquare, outlineButton, primaryButton } from "@/components/ui";
import { getFeatured, getLatest, getStats } from "@/lib/api";
import { TODAY, dateAgo, dec1, fmtDate, num, pct } from "@/lib/format";
import { toHuella } from "@/lib/stats";

export default async function HomePage() {
  const [overview, latest, featured] = await Promise.all([getStats(30), getLatest(4), getFeatured()]);
  const { last30, ranking } = overview;
  const last14 = overview.daily.slice(-14);
  const maxBar = Math.max(...last14.map((d) => d.count));
  const top = ranking.slice(0, 6);
  const chamberi = ranking.find((d) => d.slug === "chamberi");
  const story = `En Chamberí desaparecieron ${chamberi?.count ?? 0} viviendas durante los últimos 30 días.`;

  const heroKpis = [
    { v: Math.round(last30.avgDays) + "d", l: "tiempo medio observado", red: false },
    { v: pct(last30.avgDrop), l: "bajada media previa", red: true },
    { v: dec1(last30.pRed) + "%", l: "redujeron precio", red: false },
  ];

  return (
    <main className="page">
      <section className="pt-[26px] lg:grid lg:grid-cols-2 lg:gap-x-12">
        <div>
          <div className="flex justify-between font-mono text-xs text-mut">
            <span className="whitespace-nowrap">MADRID · DIARIO</span>
            <time dateTime={new Date(TODAY).toISOString().slice(0, 10)} className="whitespace-nowrap">
              {fmtDate(TODAY)}
            </time>
          </div>
          <h1 className="mt-[22px] text-[32px] leading-[1.05] font-medium tracking-[-.035em] lg:text-[40px]">¿Qué se ha borrado?</h1>
          <p className="mt-2.5 text-[15px] leading-normal text-pretty text-ink2">
            BORRADO registra diariamente las viviendas que desaparecen del mercado observado y conserva su rastro.
          </p>
          <div className="mt-[26px] flex items-baseline gap-3">
            <span className="text-[124px] leading-[.85] font-light tracking-[-.065em]">{num(overview.yesterday)}</span>
            <span className="text-sm leading-[1.3] text-mut">
              viviendas desaparecidas
              <br />
              ayer en Madrid
            </span>
          </div>
        </div>

        <div className="lg:self-end">
          <div
            className="mt-6 flex h-[72px] items-end gap-[3px]"
            role="img"
            aria-label={`Desapariciones de los últimos 14 días. Ayer: ${overview.yesterday}.`}
          >
            {last14.map((d) => (
              <div key={d.daysAgo} className={`flex-1 ${d.daysAgo === 1 ? "bg-red" : "bg-bar"}`} style={{ height: `${((d.count / maxBar) * 100).toFixed(1)}%` }} />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-[10.5px] text-mut">
            <span className="whitespace-nowrap">{fmtDate(dateAgo(14), false)}</span>
            <span>AYER</span>
          </div>
          <div className="mt-[22px] grid grid-cols-3 gap-px border border-line bg-line">
            {heroKpis.map((k) => (
              <div key={k.l} className="bg-sf p-3">
                <div className={`font-mono text-xl leading-none font-medium ${k.red ? "text-red" : ""}`}>{k.v}</div>
                <div className="mt-1.5 text-[11.5px] leading-[1.25] text-mut">{k.l}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 font-mono text-[10.5px] text-mut">DATOS DE DEMOSTRACIÓN · DESAPARECIDO ≠ VENDIDO</div>
        </div>
      </section>

      <div className="mt-[22px]">
        <SearchTrigger />
      </div>

      <section className="pt-10 pb-2" aria-labelledby="ultimos">
        <h2 id="ultimos" className="flex items-center gap-2.5 text-[30px] leading-none font-medium">
          <RedSquare size={10} />
          Últimos borrados
        </h2>
        <p className="mt-2 mb-[18px] text-sm leading-[1.45] text-mut">Viviendas detectadas recientemente como desaparecidas.</p>
        <HuellaGrid items={latest.map(toHuella)} />
        <Link href="/borrados" className={`mt-3.5 ${primaryButton} md:ml-auto md:w-72`}>
          Ver histórico →
        </Link>
      </section>

      <section className="bleed mt-10 bg-panel py-8 text-panel-ink" aria-labelledby="antes">
        <div className="font-mono text-[10.5px] leading-none font-medium tracking-[.02em] text-panel-mut">
          CASO {featured.listing.id} · {featured.listing.dist.toUpperCase()}
        </div>
        <h2 id="antes" className="mt-3.5 mb-[18px] text-4xl leading-[1.02] font-medium">
          ¿Qué pasó antes de desaparecer?
        </h2>
        <ol>
          {featured.facts.slice(0, 5).map((t, i) => (
            <li key={t} className="grid grid-cols-[26px_minmax(0,1fr)] gap-2 border-t border-panel-line py-3 text-base leading-[1.4]">
              <span className="font-mono text-[11px] leading-[1.9] font-medium text-panel-mut">{String(i + 1).padStart(2, "0")}</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5">
          <DemoTag size="9.5px" className="text-panel-mut" />
          <Link href={`/vivienda/${featured.listing.id}`} className="flex h-11 items-center border border-panel-ink px-4 text-sm font-medium">
            Ver ficha completa →
          </Link>
        </div>
      </section>

      <section className="pt-10" aria-labelledby="donde">
        <h2 id="donde" className="mb-1.5 text-[28px] leading-[1.05] font-medium">
          Dónde más se borra
        </h2>
        <p className="mb-3.5 text-sm leading-[1.45] text-mut">Anuncios desaparecidos por distrito · últimos 30 días.</p>
        <ul>
          {top.map((d) => (
            <li key={d.slug}>
              <Link href={`/madrid/${d.slug}`} className="grid grid-cols-[minmax(0,1fr)_44px] items-center gap-x-3 gap-y-1 border-t border-line py-2.5 hover:text-red">
                <span className="text-[15px] leading-[1.2] font-medium">{d.name}</span>
                <span className="text-right font-mono text-sm leading-none font-medium">{d.count}</span>
                <span className="col-span-full h-1.5 bg-track">
                  <span className="block h-full bg-ink" style={{ width: `${((d.count / top[0].count) * 100).toFixed(1)}%` }} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-2.5 flex items-center justify-between">
          <DemoTag size="9.5px" />
          <Link href="/explorar" className="text-sm font-medium underline hover:text-red">
            Todos los distritos →
          </Link>
        </div>
      </section>

      <section className="mt-10 border border-ink bg-sf px-[18px] py-[22px]">
        <div className="font-mono text-[10.5px] leading-none font-medium tracking-[.02em] text-red">DATOS QUE CUENTAN UNA HISTORIA</div>
        <p className="mt-3.5 mb-4 text-[25px] leading-[1.15] font-semibold text-pretty">{story}</p>
        <div className="flex items-center justify-between">
          <DemoTag size="9.5px" />
          <ShareButton text={story} className={`${outlineButton} h-10 px-3.5 text-[13px]`} />
        </div>
      </section>
    </main>
  );
}
