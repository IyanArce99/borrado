import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareButton } from "@/components/actions";
import { HuellaGrid } from "@/components/huella";
import { PriceHistory } from "@/components/price-history";
import { DemoTag, RedSquare, outlineButton } from "@/components/ui";
import { getVivienda } from "@/lib/api";
import { bathsLabel, eur, fmtDate, pct, relDay, roomsLabel } from "@/lib/format";
import { specLabel, toHuella } from "@/lib/stats";

/** [vacío, relleno] por tono */
const TIMELINE_DOT = {
  ink: ["border-ink bg-transparent", "border-ink bg-ink"],
  red: ["border-red bg-transparent", "border-red bg-red"],
} as const;

export async function generateMetadata({ params }: PageProps<"/vivienda/[id]">): Promise<Metadata> {
  const { id } = await params;
  const v = await getVivienda(id);
  return {
    title: v ? `${v.listing.tipo} · ${v.listing.dist} · ${v.listing.id}` : "Ficha no encontrada",
    // Las fichas individuales nunca se indexan.
    robots: { index: false, follow: true },
  };
}

export default async function ViviendaPage({ params }: PageProps<"/vivienda/[id]">) {
  const { id } = await params;
  const v = await getVivienda(id);
  if (!v) notFound();
  const { listing: x, facts, similar } = v;

  const kpis = [
    { l: "PRECIO INICIAL", v: eur(x.p0), red: false },
    { l: "VARIACIÓN", v: x.changes ? "−" + eur(x.p0 - x.pf) : "€0", red: x.changes > 0 },
    { l: "VARIACIÓN %", v: x.changes ? pct(x.pc) : "0,0%", red: x.changes > 0 },
    { l: "TIEMPO OBSERVADO", v: x.days + " días", red: false },
  ];

  type Event = { date: string; title: string; detail: string; tone: "ink" | "red"; filled: boolean };
  const timeline: Event[] = [
    { date: fmtDate(x.t0), title: "Primera detección", detail: eur(x.p0), tone: "ink", filled: false },
    ...x.hist.slice(1).map((p, i) => ({ date: fmtDate(p.t), title: "▼ Bajada", detail: eur(x.hist[i].p) + " → " + eur(p.p), tone: "ink" as const, filled: true })),
    { date: fmtDate(x.t1), title: "Desaparecido", detail: "Último precio " + eur(x.pf), tone: "red", filled: true },
  ];
  if (x.rep) timeline.push({ date: fmtDate(x.rep.t), title: "↻ Posible coincidencia", detail: x.rep.score + "% · " + eur(x.rep.p), tone: "ink", filled: false });

  const shareText = `${x.tipo} en ${x.dist}: ${eur(x.p0)} → ${eur(x.pf)} (${pct(x.pc)}) en ${x.days} días antes de desaparecer`;
  const repRows = (price: number) => [x.m2 + " m²", roomsLabel(x.hab), bathsLabel(x.banos), eur(price)];

  return (
    <main className="page pt-[18px]">
      <div className="flex items-center justify-between gap-2 font-mono text-[10px] leading-none font-medium tracking-[.02em] text-mut">
        <nav aria-label="Ruta" className="min-w-0 flex-1 truncate">
          <Link href={`/madrid/${x.ds}`} className="hover:text-red">
            MADRID / {x.dist.toUpperCase()}
          </Link>
        </nav>
        <span className="flex-none border border-line-strong px-1.5 py-1 whitespace-nowrap">NOINDEX · {x.id}</span>
      </div>

      <div className="md:grid md:grid-cols-2 md:gap-x-12">
        <div>
          <h1 className="mt-[18px] mb-2 text-[40px] leading-none font-medium">
            {x.tipo} · {x.dist}
          </h1>
          <div className="flex items-center gap-2 font-mono text-[11px] leading-none font-semibold tracking-[.02em] text-red">
            <RedSquare />
            <span className="leading-[1.4]">ANUNCIO DESAPARECIDO · {relDay(x.goneDay).toUpperCase()}</span>
          </div>
          <div className="mt-2 text-[15px] text-ink2">
            {specLabel(x)} · {bathsLabel(x.banos)} · {x.barrio}
          </div>

          <div className="mt-[22px] border-t-2 border-ink pt-3.5">
            <div className="text-[52px] leading-none font-medium tracking-[-.04em]">{eur(x.pf)}</div>
            <div className="mt-1 text-[13px] text-mut">Último precio observado</div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-px border border-line bg-line">
            {kpis.map((k) => (
              <div key={k.l} className="bg-bg p-3">
                <div className="font-mono text-[10px] leading-none font-medium tracking-[.02em] text-mut">{k.l}</div>
                <div className={`mt-[7px] font-mono text-lg leading-none font-medium ${k.red ? "text-red" : ""}`}>{k.v}</div>
              </div>
            ))}
          </div>
        </div>

        <section className="mt-7 md:mt-[18px]" aria-labelledby="historico">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 id="historico" className="text-2xl leading-none font-semibold">
              Histórico de precio
            </h2>
            <DemoTag />
          </div>
          <PriceHistory x={x} />
        </section>
      </div>

      <section className="mt-7" aria-labelledby="timeline">
        <h2 id="timeline" className="mb-3 text-2xl leading-none font-semibold">
          Timeline
        </h2>
        <ol>
          {timeline.map((e, i) => (
            <li key={i} className="group grid grid-cols-[18px_minmax(0,1fr)] gap-3">
              <div className="flex flex-col items-center" aria-hidden>
                <span className={`mt-1 size-[11px] rounded-[50%] border-[1.5px] ${TIMELINE_DOT[e.tone][e.filled ? 1 : 0]}`} />
                <span className="w-px flex-1 bg-dim group-last:hidden" />
              </div>
              <div className="pb-4">
                <div className="font-mono text-[10.5px] leading-[1.4] font-medium tracking-[.02em] text-mut">{e.date}</div>
                <div className={`text-[15px] leading-[1.3] font-semibold ${e.tone === "red" ? "text-red" : ""}`}>{e.title}</div>
                <div className="font-mono text-[13px] leading-[1.4] font-medium text-ink2">{e.detail}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="bleed mt-3 bg-panel py-[26px] text-panel-ink" aria-labelledby="antes">
        <h2 id="antes" className="mb-3 text-[30px] leading-[1.05] font-medium">
          ¿Qué pasó antes de desaparecer?
        </h2>
        <ul>
          {facts.map((t) => (
            <li key={t} className="border-t border-panel-line py-[11px] text-[15.5px] leading-[1.4]">
              {t}
            </li>
          ))}
        </ul>
        <DemoTag size="9.5px" className="mt-2 text-panel-mut">
          Solo hechos observables · Datos de demostración
        </DemoTag>
      </section>

      {x.rep && (
        <section className="mt-7 md:max-w-2xl" aria-labelledby="republicacion">
          <h2 id="republicacion" className="mb-1.5 text-2xl leading-none font-semibold">
            ↻ Posible republicación
          </h2>
          <p className="mb-3.5 text-sm leading-[1.45] text-ink2">Hemos detectado posteriormente un anuncio con características similares.</p>
          <div className="grid grid-cols-2 border border-dim">
            <div className="border-r border-dim p-3.5">
              <div className="font-mono text-[10px] leading-none font-semibold tracking-[.02em] text-red">ANTES</div>
              {repRows(x.pf).map((l) => (
                <div key={l} className="mt-2 font-mono text-sm leading-[1.2] font-medium">
                  {l}
                </div>
              ))}
            </div>
            <div className="bg-sf p-3.5">
              <div className="font-mono text-[10px] leading-none font-semibold tracking-[.02em] text-mut">DESPUÉS · {fmtDate(x.rep.t, false)}</div>
              {repRows(x.rep.p).map((l) => (
                <div key={l} className="mt-2 font-mono text-sm leading-[1.2] font-medium">
                  {l}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3.5 flex items-baseline gap-2.5">
            <span className="text-[44px] leading-none font-medium">{x.rep.score}%</span>
            <span className="text-sm">de coincidencia estimada</span>
          </div>
          <div className="mt-2 h-1.5 bg-line-soft" role="meter" aria-valuenow={x.rep.score} aria-valuemin={0} aria-valuemax={100} aria-label="Coincidencia estimada">
            <div className="h-full bg-ink" style={{ width: `${x.rep.score}%` }} />
          </div>
          <p className="mt-3 text-[12.5px] leading-[1.45] text-mut">
            Coincidencia estimada a partir de características observables. No confirma que se trate del mismo inmueble.
          </p>
        </section>
      )}

      <ShareButton text={shareText} path={`/vivienda/${x.id}`} className={`${outlineButton} mt-[26px] h-12 w-full md:w-72`}>
        Compartir ficha
      </ShareButton>

      {similar.length > 0 && (
        <section className="mt-[30px]" aria-labelledby="similares">
          <h2 id="similares" className="mb-3 text-[22px] leading-none font-semibold">
            También borrados en {x.dist}
          </h2>
          <HuellaGrid items={similar.map(toHuella)} />
        </section>
      )}
    </main>
  );
}
