/** Wordmark con la línea roja que lo tacha: elemento de marca, no tocar medidas. */
export function Logo() {
  return (
    <span className="relative font-mono text-[17px] leading-none font-semibold tracking-[.14em]">
      BORRADO
      <span aria-hidden className="absolute top-[52%] -right-0.5 -left-1 h-0.5 bg-red" />
    </span>
  );
}
