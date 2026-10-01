import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShareButton } from "@/components/actions";
import { OwnerReportForm } from "@/components/forms";
import { HuellaGrid } from "@/components/huella";
import { DemoTag, outlineButton } from "@/components/ui";
import { getDistrito } from "@/lib/api";
import { DISTRICTS, findDistrict } from "@/lib/districts";
import { dec1, pct } from "@/lib/format";
import { toHuella } from "@/lib/stats";

export const dynamicParams = false;

export function generateStaticParams() {
  return DISTRICTS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/madrid/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const d = findDistrict(slug);
  if (!d) return {};
  return {
    title: `Viviendas desaparecidas en ${d.name}`,
    description: `Anuncios de vivienda desaparecidos del mercado observado en ${d.name} (Madrid): cuántos, cuánto tiempo estuvieron y cuánto bajaron de precio. Datos de demostración.`,
    alternates: { canonical: `/madrid/${d.slug}` },
  };
}

const monoCell = "py-[11px] text-right font-mono text-[13px] leading-none font-medium";

export default async function DistritoPage({ params }: PageProps<"/madrid/[slug]">) {
  const { slug } = await params;
  const dx = await getDistrito(slug);
  if (!dx) notFound();
  const { stat: s } = dx;
  const days = Math.round(s.avgDays) + " días";
  const shareText = `En ${dx.name} desaparecieron ${s.n} viviendas en los últimos 30 días`;

  const kpis = [
    { v: s.n, l: "viviendas desaparecidas" },
    { v: days, l: "tiempo medio observado" },
    { v: pct(s.avgDrop), l: "bajada media previa" },
    { v: dec1(s.pRep) + "%", l: "posibles republicaciones" },
  ];
  const tarda = [
    { v: days, l: "Tiempo medio observado" },
    { v: Math.round(s.med) + " días", l: "Mediana" },
    { v: pct(s.avgDrop), l: "Bajada media antes de desaparecer" },
    { v: s.n, l: "Viviendas desaparecidas" },
  ];

  return (
    <main className="page pt-[18px]">
      <div className="flex justify-between font-mono text-[10px] leading-none font-medium tracking-[.02em] text-mut">
        <span>/madrid/{dx.slug}</span>
        <span>INDEXABLE</span>
      </div>
      <h1 className="mt-4 mb-1 text-[38px] leading-[1.02] font-medium md:text-[44px]">Viviendas desaparecidas en {dx.name}</h1>
      <div className="mt-2.5 font-mono text-[10.5px] leading-none font-medium tracking-[.1em] text-mut">ÚLTIMOS 30 DÍAS</div>
      <div className="mt-2.5 grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.l} className="bg-bg px-3 py-3.5">
            <div className="text-[30px] leading-none font-medium">{k.v}</div>
            <div className="mt-1.5 text-[12.5px] leading-[1.3] text-ink2">{k.l}</div>
          </div>
        ))}
      </div>
      <DemoTag className="mt-1.5 text-mut" />

      <div className="md:grid md:grid-cols-2 md:gap-x-12">
        <section className="mt-[26px]" aria-labelledby="barrios">
          <h2 id="barrios" className="mb-2.5 text-2xl leading-none font-semibold">
            Barrios
          </h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="font-mono text-[9.5px] leading-[1.2] tracking-[.04em] text-mut">
                <th scope="col" className="py-2 text-left font-medium">
                  BARRIO
                </th>
                <th scope="col" className="w-[46px] py-2 text-right font-medium">
                  N.º
                </th>
                <th scope="col" className="w-[66px] py-2 text-right font-medium">
                  DÍAS
                </th>
                <th scope="col" className="w-[66px] py-2 text-right font-medium">
                  BAJADA
                </th>
              </tr>
            </thead>
            <tbody>
              {dx.barrios.map((b) => (
                <tr key={b.name} className="border-t border-line">
                  <th scope="row" className="py-[11px] text-left text-sm leading-[1.2] font-medium">
                    {b.name}
                  </th>
                  <td className={monoCell}>{b.n}</td>
                  <td className={monoCell}>{b.n ? Math.round(b.avgDays) + "d" : "—"}</td>
                  <td className={`${monoCell} text-red`}>{b.avgDrop ? pct(b.avgDrop) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <DemoTag className="mt-1.5 text-mut" />
        </section>

        <section className="mt-[26px]" aria-labelledby="ultimos">
          <h2 id="ultimos" className="mb-3 text-2xl leading-none font-semibold">
            Últimos borrados en {dx.name}
          </h2>
          <HuellaGrid items={dx.latest.map(toHuella)} />
        </section>
      </div>

      <section className="bleed mt-[30px] border-y border-line bg-sf py-[26px] md:border-x" aria-labelledby="propietarios">
        <div className="md:grid md:grid-cols-2 md:gap-x-12">
          <div>
            <div className="font-mono text-[10.5px] leading-none font-medium tracking-[.02em] text-mut">PARA PROPIETARIOS</div>
            <h2 id="propietarios" className="mt-2.5 mb-3 text-[30px] leading-[1.05] font-medium">
              ¿Cuánto tarda en venderse un piso en {dx.name}?
            </h2>
            <p className="border border-ink px-3.5 py-3 text-sm leading-[1.45]">
              Lo que medimos es el <strong>tiempo observado hasta la desaparición del anuncio</strong>, no el tiempo real hasta la firma de una venta.
            </p>
            <div className="mt-3.5 grid grid-cols-2 gap-x-2.5 gap-y-3">
              {tarda.map((k) => (
                <div key={k.l}>
                  <div className="font-mono text-[22px] leading-none font-medium">{k.v}</div>
                  <div className="mt-[5px] text-[12.5px] leading-[1.3] text-ink2">{k.l}</div>
                </div>
              ))}
            </div>
            <DemoTag className="mt-2 text-mut" />
          </div>
          <div className="mt-[22px] border-t border-line pt-[18px] md:mt-0 md:border-t-0 md:pt-0">
            <h3 className="mb-3 text-[22px] leading-[1.1] font-semibold">Recibe el informe de tu zona</h3>
            <OwnerReportForm district={dx.name} />
          </div>
        </div>
      </section>

      <section className="mt-7 md:max-w-md" aria-labelledby="tarjeta">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="tarjeta" className="text-[22px] leading-none font-semibold">
            Tarjeta compartible
          </h2>
          <ShareButton text={shareText} path={`/madrid/${dx.slug}`} className={`${outlineButton} h-[38px] px-3.5 text-[13px]`} />
        </div>
        {/* Siempre oscura, independiente del tema. */}
        <figure className="flex aspect-[4/5] flex-col bg-[#0c0c0d] px-[22px] py-6 text-[#ededea]" aria-label={shareText}>
          <div className="flex justify-between font-mono text-[11px] leading-none font-semibold tracking-[.02em]">
            <span>BORRADO DATA</span>
            <span aria-hidden className="size-2 rounded-[50%] bg-card-red" />
          </div>
          <div className="mt-[22px] font-mono text-[13px] leading-none font-semibold tracking-[.02em] text-panel-mut">{dx.name.toUpperCase()}</div>
          <div className="mt-2.5 text-[104px] leading-[.85] font-light tracking-[-.04em]">{s.n}</div>
          <div className="mt-2 text-xl leading-[1.1] font-semibold">viviendas desaparecidas</div>
          <div className="mt-1 font-mono text-[11px] leading-none font-medium text-panel-mut">ÚLTIMOS 30 DÍAS</div>
          <div className="mt-auto grid grid-cols-2 gap-2.5 border-t border-[rgba(246,246,245,.2)] pt-3.5">
            <div>
              <div className="font-mono text-xl leading-none font-medium">{days}</div>
              <div className="mt-1 text-[11.5px] text-panel-mut">tiempo medio observado</div>
            </div>
            <div>
              <div className="font-mono text-xl leading-none font-medium text-card-red">{pct(s.avgDrop)}</div>
              <div className="mt-1 text-[11.5px] text-panel-mut">bajada media</div>
            </div>
          </div>
          <div className="mt-3.5 flex justify-between font-mono text-[9.5px] leading-none font-medium tracking-[.02em] text-panel-mut">
            <span>DATOS DE DEMOSTRACIÓN</span>
            <span>borrado.es</span>
          </div>
        </figure>
      </section>
    </main>
  );
}
