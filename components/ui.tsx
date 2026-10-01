/** Primitivas visuales compartidas (server-safe). */

export function DemoTag({ className = "", size = "9px", children = "Datos de demostración" }: { className?: string; size?: string; children?: React.ReactNode }) {
  return (
    <div className={`font-mono leading-none font-medium tracking-[.02em] uppercase ${className || "text-mut"}`} style={{ fontSize: size }}>
      {children}
    </div>
  );
}

export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`font-mono text-[10.5px] leading-none font-medium tracking-[.02em] ${className || "text-mut"}`}>{children}</div>;
}

/** Cuadrado rojo: marca de "borrado". */
export function RedSquare({ size = 8 }: { size?: number }) {
  return <span aria-hidden className="inline-block flex-none bg-red" style={{ width: size, height: size }} />;
}

export type KpiItem = { value: React.ReactNode; label: string; red?: boolean };

/** Rejilla de KPIs con separadores de 1px. */
export function KpiGrid({
  items,
  cols = 2,
  valueClass = "text-[30px] leading-none font-medium",
  labelClass = "mt-1.5 text-[12.5px] leading-[1.3] text-ink2",
  cellClass = "bg-bg px-3 py-3.5",
  footer,
}: {
  items: KpiItem[];
  cols?: 2 | 3;
  valueClass?: string;
  labelClass?: string;
  cellClass?: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className={`grid gap-px border border-line bg-line ${cols === 3 ? "grid-cols-3" : "grid-cols-2 md:grid-cols-4"}`}>
      {items.map((k) => (
        <div key={k.label} className={cellClass}>
          <div className={`${valueClass} ${k.red ? "text-red" : ""}`}>{k.value}</div>
          <div className={labelClass}>{k.label}</div>
          {footer}
        </div>
      ))}
    </div>
  );
}

export const chipClass = (on: boolean) =>
  `h-9 px-3 text-[13px] font-medium border ${on ? "border-ink bg-ink text-bg" : "border-line-strong bg-transparent text-ink"}`;

export const inputClass = "h-[46px] w-full border border-line-strong bg-sf px-3 text-[15px] placeholder:text-mut";

export const primaryButton = "flex h-[50px] w-full items-center justify-center bg-ink text-[15px] font-medium text-bg";

export const outlineButton = "flex items-center justify-center border border-ink text-sm font-medium";
