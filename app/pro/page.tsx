import type { Metadata } from "next";
import { ToastButton } from "@/components/actions";
import { primaryButton } from "@/components/ui";

export const metadata: Metadata = {
  title: "Borrado Pro",
  description: "Histórico completo, filtros avanzados, seguimiento de zonas y alertas para particulares.",
  alternates: { canonical: "/pro" },
};

const FEATURES = ["Histórico completo", "Filtros avanzados", "Seguimiento de zonas", "Estadísticas históricas", "Posibles republicaciones", "Exportación", "Alertas"];

export default function ProPage() {
  return (
    <main className="page pt-[26px]">
      <div className="max-w-2xl">
      <div className="font-mono text-xs leading-none font-semibold tracking-[.02em] text-red">BORRADO PRO</div>
      <h1 className="mt-3 mb-2 text-[40px] leading-none font-medium">Todo el rastro, no solo lo de ayer.</h1>
      <p className="text-[15px] leading-normal text-ink2">Para particulares que quieren seguir sus zonas con el histórico completo.</p>

      <ul className="mt-[22px] border-t-2 border-ink">
        {FEATURES.map((t) => (
          <li key={t} className="flex gap-3 border-b border-line py-3 text-[15px]">
            <span aria-hidden className="font-mono text-red">
              ✓
            </span>
            {t}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-[56px] leading-none font-medium">9,99 €</span>
        <span className="text-[15px] text-mut">/mes</span>
      </div>
      <ToastButton message="Pagos no activos en esta demo. Te avisaremos al abrir la prueba." className={`${primaryButton} mt-4 h-[52px] text-base`}>
        Probar Borrado Pro
      </ToastButton>
      <p className="mt-2.5 text-center text-xs text-mut">Precio conceptual. Sin pagos reales en esta demo.</p>
      </div>
    </main>
  );
}
