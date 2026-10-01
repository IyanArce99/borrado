import Link from "next/link";
import { primaryButton } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="page pt-[26px]">
      <div className="max-w-xl">
        <div className="font-mono text-[10.5px] leading-none font-medium tracking-[.02em] text-red">404</div>
        <h1 className="relative mt-3 inline-block text-[42px] leading-none font-medium">
          Esta página no existe
          <span aria-hidden className="absolute top-[55%] -right-0.5 -left-1 h-0.5 bg-red" />
        </h1>
        <p className="mt-3 text-[15px] leading-normal text-ink2">Puede que la dirección esté mal escrita. Madrid se explora por distritos: /madrid/centro, /madrid/chamberi…</p>
        <Link href="/explorar" className={`${primaryButton} mt-6 md:w-72`}>
          Explorar distritos →
        </Link>
      </div>
    </main>
  );
}
