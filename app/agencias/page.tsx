import type { Metadata } from "next";
import { AgencyFeed } from "@/components/agency-feed";
import { PilotForm } from "@/components/forms";
import { Eyebrow } from "@/components/ui";
import { getAgencyFeed } from "@/lib/api";
import { TODAY, fmtDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Borrado para agencias",
  description: "Feed diario de bajadas de precio, desapariciones y posibles reapariciones de anuncios de particulares en Madrid.",
  alternates: { canonical: "/agencias" },
};

const PLANS = [
  { name: "1 distrito", price: "49 €/mes", feat: "Feed · filtros · alertas básicas", featured: false },
  { name: "Varios distritos", price: "99 €/mes", feat: "Feed completo · exportación · filtros avanzados · alertas", featured: true },
  { name: "API + multiusuario", price: "199 €/mes", feat: "API · multiusuario · exportación avanzada · acceso completo", featured: false },
];

export default async function AgenciasPage() {
  const feed = await getAgencyFeed();

  return (
    <main className="page pt-[26px]">
      <Eyebrow>B2B</Eyebrow>
      <h1 className="mt-2.5 mb-2 text-[40px] leading-none font-medium">Borrado para agencias</h1>
      <p className="text-[15px] leading-normal text-ink2">Detecta movimientos del mercado que otros no están viendo.</p>

      <div className="lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start lg:gap-x-10">
        <AgencyFeed items={feed} dateLabel={fmtDate(TODAY)} />

        <div>
          <h2 className="mt-[30px] mb-3 text-[26px] leading-none font-medium lg:mt-5">Planes</h2>
          <ul>
            {PLANS.map((p) => (
              <li key={p.name} className={`mb-2.5 border bg-sf p-4 ${p.featured ? "border-ink" : "border-dim"}`}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[15px] font-semibold">{p.name}</span>
                  <span className="text-[28px] leading-none font-medium whitespace-nowrap">{p.price}</span>
                </div>
                <div className="mt-2 text-[13.5px] leading-normal text-ink2">{p.feat}</div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-mut">Precios orientativos. Sin pagos en esta demo.</p>
        </div>
      </div>

      <section className="bleed mt-5 bg-panel py-5 text-panel-ink md:py-8" aria-labelledby="piloto">
        <h2 id="piloto" className="mb-3.5 text-[26px] leading-[1.05] font-medium">
          Solicitar piloto de 30 días
        </h2>
        <PilotForm />
      </section>
    </main>
  );
}
