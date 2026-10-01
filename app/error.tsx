"use client";

import { useEffect } from "react";
import { primaryButton } from "@/components/ui";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page pt-[26px]">
      <div className="max-w-xl">
        <h1 className="text-[32px] leading-[1.05] font-medium">Algo ha fallado al cargar esta página.</h1>
        <p className="mt-3 text-[15px] leading-normal text-ink2">Vuelve a intentarlo en unos segundos.</p>
        <button type="button" onClick={retry} className={`${primaryButton} mt-6 md:w-72`}>
          Reintentar
        </button>
      </div>
    </main>
  );
}
