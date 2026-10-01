import Link from "next/link";

const LINKS = [
  { label: "Metodología", href: "/metodologia" },
  { label: "Para agencias", href: "/agencias" },
  { label: "Pro", href: "/pro" },
  { label: "Próximamente", href: "/explorar#proximamente" },
];

export function Footer() {
  return (
    <footer className="mt-12 border-t border-line">
      <div className="page pt-6 pb-5">
        <div className="font-mono text-[13px] leading-none font-semibold tracking-[.02em]">BORRADO</div>
        <p className="mt-2.5 mb-3.5 max-w-xl text-[13px] leading-normal text-mut">
          No es un portal inmobiliario. Registramos las viviendas que desaparecen del mercado observado en Madrid. Desaparecido ≠ vendido.
        </p>
        <nav aria-label="Pie" className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px]">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="underline hover:text-red">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 font-mono text-[9.5px] leading-normal font-medium tracking-[.02em] text-mut">
          TODOS LOS DATOS SON DE DEMOSTRACIÓN · © 2026 BORRADO
        </div>
      </div>
    </footer>
  );
}
