"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import type { LeadStatus, LeadSource } from "@/lib/types";

const statuses: (LeadStatus | "ALL")[] = ["ALL", "NEW", "CONTACTED", "CONVERTED", "LOST"];
const sources: (LeadSource | "ALL")[] = ["ALL", "FACEBOOK", "INSTAGRAM", "WHATSAPP", "COLD_CALL"];

export default function LeadFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = (searchParams.get("status") as LeadStatus | "ALL") || "ALL";
  const currentSource = (searchParams.get("source") as LeadSource | "ALL") || "ALL";
  const currentSearch = searchParams.get("search") || "";

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "ALL") params.set(key, value);
      else params.delete(key);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <input
        type="text"
        defaultValue={currentSearch}
        placeholder="Search name, phone, email..."
        onChange={(e) => update("search", e.target.value)}
        className="flex-1 min-w-[200px] rounded-lg border border-zinc-800 bg-surface px-3 py-2 text-sm text-foreground placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
      />
      <select
        value={currentStatus}
        onChange={(e) => update("status", e.target.value)}
        className="rounded-lg border border-zinc-800 bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-zinc-600"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s === "ALL" ? "All Status" : s.charAt(0) + s.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
      <select
        value={currentSource}
        onChange={(e) => update("source", e.target.value)}
        className="rounded-lg border border-zinc-800 bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-zinc-600"
      >
        {sources.map((s) => (
          <option key={s} value={s}>
            {s === "ALL" ? "All Sources" : s === "COLD_CALL" ? "Cold Call" : s.charAt(0) + s.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
      {(currentStatus !== "ALL" || currentSource !== "ALL" || currentSearch) && (
        <button
          onClick={() => router.push(pathname)}
          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
