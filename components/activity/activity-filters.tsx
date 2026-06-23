"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const types = ["ALL", "MESSAGE", "CALL"];

export default function ActivityFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("type") || "ALL";
  const currentDirection = searchParams.get("direction") || "ALL";

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
      <select
        value={currentType}
        onChange={(e) => update("type", e.target.value)}
        className="rounded-lg border border-zinc-800 bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-zinc-600"
      >
        {types.map((t) => (
          <option key={t} value={t}>
            {t === "ALL" ? "All Types" : t === "MESSAGE" ? "Messages" : "Calls"}
          </option>
        ))}
      </select>
      <select
        value={currentDirection}
        onChange={(e) => update("direction", e.target.value)}
        className="rounded-lg border border-zinc-800 bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-zinc-600"
      >
        <option value="ALL">All Directions</option>
        <option value="INBOUND">Inbound</option>
        <option value="OUTBOUND">Outbound</option>
      </select>
      {(currentType !== "ALL" || currentDirection !== "ALL") && (
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
