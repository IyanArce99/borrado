/** Iconos dibujados con CSS, como en el prototipo. */

export function SearchIcon({ size = 15 }: { size?: number }) {
  return (
    <span aria-hidden className="relative block rounded-[50%] border-[1.6px] border-ink" style={{ width: size, height: size }}>
      <span className="absolute -right-1.5 -bottom-[5px] h-[1.6px] w-[7px] rotate-45 bg-ink" />
    </span>
  );
}

export function ThemeIcon() {
  return (
    <span
      aria-hidden
      className="block size-[15px] rounded-[50%] border-[1.6px] border-ink"
      style={{ background: "linear-gradient(90deg, var(--ink) 50%, transparent 50%)" }}
    />
  );
}

export function MenuIcon() {
  return (
    <span aria-hidden className="flex flex-col gap-[5px]">
      <span className="block h-[1.6px] w-[18px] bg-ink" />
      <span className="block h-[1.6px] w-[18px] bg-ink" />
    </span>
  );
}
