import type { Metadata } from "next";
import { getStats } from "@/lib/api";

export const metadata: Metadata = {
  title: "Metodología",
  description: "Qué observa BORRADO, qué no puede saber y cómo estima posibles republicaciones. Una desaparición no confirma una venta.",
  alternates: { canonical: "/metodologia" },
};

const OBSERVA = ["Aparición", "Precio", "Características", "Barrio y distrito", "Cambios de precio", "Permanencia", "Desaparición", "Posibles coincidencias posteriores"];

const REP_FACTORS = ["Superficie", "Habitaciones", "Baños", "Tipología", "Barrio", "Precio", "Características observables", "Similitud entre anuncios"];

const h2 = "text-2xl leading-none font-semibold";

export default async function MetodologiaPage() {
  const { ranking } = await getStats(30);
  const top = ranking.slice(0, 10);
  const max = top[0].count;
  // Ejemplo conceptual: las "registradas" son una proporción ilustrativa, no datos reales.
  const compare = top.map((d, i) => ({ name: d.name, a: d.count, b: Math.round(d.count * (0.42 + ((i * 37) % 30) / 100)) }));

  return (
    <main className="page pt-[26px]">
      <div className="max-w-3xl">
      <h1 className="mb-2.5 text-[42px] leading-none font-medium">Metodología</h1>
      <p className="text-[15px] leading-normal text-ink2">
        BORRADO observa diariamente información pública de anuncios inmobiliarios y registra cambios observables.
      </p>

      <h2 className={`mt-7 mb-2.5 ${h2}`}>¿Qué observamos?</h2>
      <ol>
        {OBSERVA.map((t, i) => (
          <li key={t} className="grid grid-cols-[30px_minmax(0,1fr)] border-t border-line py-2.5 text-[15px] leading-[1.3]">
            <span className="font-mono text-[11px] leading-[1.6] font-medium text-mut">{String(i + 1).padStart(2, "0")}</span>
            <span>{t}</span>
          </li>
        ))}
      </ol>

      <section className="bleed mt-7 bg-panel py-7 text-panel-ink" aria-labelledby="no-sabemos">
        <div className="font-mono text-[10.5px] leading-none font-medium tracking-[.02em] text-panel-mut">¿QUÉ NO PODEMOS SABER?</div>
        <h2 id="no-sabemos" className="my-3 text-[32px] leading-[1.02] font-medium">
          Una desaparición no confirma una venta.
        </h2>
        <p className="text-[15px] leading-normal text-[#e4e4e4]">
          BORRADO no puede conocer cuándo se firma realmente un contrato de compraventa o alquiler simplemente observando un anuncio.
        </p>
        <div className="mt-5 font-mono text-[38px] leading-none font-medium tracking-[-.04em]">
          Desaparecido <span className="text-card-red">≠</span> vendido
        </div>
      </section>

      <h2 className={`mt-7 mb-2 ${h2}`}>Posibles republicaciones</h2>
      <p className="mb-2.5 text-sm leading-[1.45] text-ink2">Comparamos cada anuncio desaparecido con los que aparecen después. La similitud combina:</p>
      <ul className="flex flex-wrap gap-1.5">
        {REP_FACTORS.map((t) => (
          <li key={t} className="border border-[rgba(var(--rgb),.25)] px-[11px] py-2 text-[13px]">
            {t}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[13px] leading-[1.45] text-mut">
        El resultado es siempre una <strong className="text-ink">coincidencia estimada</strong>. Nunca “confirmado”.
      </p>

      <h2 className="mt-[30px] mb-2 text-2xl leading-[1.05] font-semibold">Anuncios desaparecidos vs operaciones registradas</h2>
      <p className="mb-3 text-sm leading-[1.45] text-ink2">
        Son fenómenos diferentes: un anuncio puede desaparecer sin venta, y una venta puede no haber pasado por un anuncio observado.
      </p>
      <div className="mb-2 flex gap-3.5 font-mono text-[10.5px] leading-none font-medium text-mut" aria-hidden>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 bg-ink" />
          DESAPARECIDOS
        </span>
        <span className="flex items-center gap-1.5">
          <span className="hatched size-2.5" />
          REGISTRADAS
        </span>
      </div>
      <ul>
        {compare.map((c) => (
          <li key={c.name} className="grid grid-cols-[92px_minmax(0,1fr)] items-center gap-2.5 border-t border-line-soft py-1.5">
            <span className="text-[12.5px] leading-[1.2]">{c.name}</span>
            <div className="flex flex-col gap-[3px]" role="img" aria-label={`${c.name}: ${c.a} desaparecidos frente a ${c.b} registradas (ejemplo conceptual)`}>
              <div className="h-2 bg-ink" style={{ width: `${(c.a / max) * 100}%` }} />
              <div className="hatched h-2" style={{ width: `${(c.b / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-2.5 font-mono text-xs leading-[1.45] text-mut">Ejemplo conceptual de comparación con datos registrales. Datos de demostración.</p>

      <h2 className={`mt-[30px] mb-2 ${h2}`}>Ubicación y privacidad</h2>
      <p className="text-sm leading-normal text-ink2">
        La ubicación máxima es el barrio. Nunca mostramos calle, número, portal, coordenadas ni dirección exacta. Tampoco portales, agencias, personas,
        teléfonos o emails. Las fichas individuales son <span className="font-mono">noindex</span>.
      </p>
      </div>
    </main>
  );
}
