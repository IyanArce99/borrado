"use client";

import { useState } from "react";
import type { FeedItem, FeedType } from "@/lib/api";
import { DemoTag, chipClass } from "./ui";

const TABS: readonly [FeedType | "todo", string][] = [
  ["todo", "Todo"],
  ["bajada", "Bajadas"],
  ["gone", "Desaparecidos"],
  ["rep", "Reaparecidos"],
  ["180", "+180 días"],
];

const VISIBLE = 10;

export function AgencyFeed({ items, dateLabel }: { items: FeedItem[]; dateLabel: string }) {
  const [tab, setTab] = useState<FeedType | "todo">("todo");
  const count = (k: FeedType | "todo") => (k === "todo" ? items.length : items.filter((r) => r.type === k).length);
  const visible = items.filter((r) => tab === "todo" || r.type === tab).slice(0, VISIBLE);

  return (
    <div className="mt-5 min-w-0 border border-ink bg-sf">
      <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 bg-ink px-3.5 py-3 font-mono text-[10.5px] leading-none font-medium tracking-[.02em] text-bg">
        <span>FEED · PARTICULARES · MADRID</span>
        <span>{dateLabel}</span>
      </div>
      <div role="tablist" aria-label="Tipo de movimiento" className="no-scrollbar flex gap-1.5 overflow-x-auto border-b border-line px-3 py-2.5">
        {TABS.map(([k, l]) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tab === k}
            aria-controls="feed-list"
            onClick={() => setTab(k)}
            className={`${chipClass(tab === k)} h-[34px] flex-none text-[12.5px] whitespace-nowrap`}
          >
            {l} · {count(k)}
          </button>
        ))}
      </div>
      <ul id="feed-list" role="tabpanel">
        {visible.map((r) => (
          <li key={r.key} className="border-b border-line-soft px-3.5 py-3">
            <div className="flex justify-between font-mono text-[10px] leading-none font-semibold tracking-[.02em]">
              <span className={r.red ? "text-red" : ""}>{r.tag}</span>
              <span className="text-mut">{r.when}</span>
            </div>
            <div className="mt-[7px] text-[15px] leading-[1.2] font-medium">
              {r.dist} <span className="font-normal text-mut">· {r.spec}</span>
            </div>
            <div className="mt-1 flex justify-between font-mono text-[13px] leading-[1.2] font-medium">
              <span>{r.main}</span>
              <span className={r.red ? "text-red" : ""}>{r.extra}</span>
            </div>
          </li>
        ))}
      </ul>
      <DemoTag className="px-3.5 py-2.5 text-mut" />
    </div>
  );
}
