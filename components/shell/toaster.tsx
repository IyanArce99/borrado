"use client";

import { useUI } from "./ui-provider";

export function Toaster() {
  const { toast } = useUI();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-4 bottom-[84px] z-[60] flex justify-center lg:bottom-6">
      {toast && <div className="w-full max-w-[440px] bg-ink px-4 py-3.5 text-sm leading-[1.4] text-bg">{toast}</div>}
    </div>
  );
}
