import { Suspense } from "react";
import { getCommunications } from "@/lib/data";
import type { ActivityFilters as ActivityFilterTypes } from "@/lib/types";
import ActivityFilterBar from "@/components/activity/activity-filters";
import ActivityTimeline from "@/components/activity/activity-timeline";
import Skeleton from "@/components/ui/skeleton";

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; direction?: string }>;
}) {
  const params = await searchParams;
  const filters: ActivityFilterTypes = {
    type: (params.type as ActivityFilterTypes["type"]) ?? "ALL",
    direction: (params.direction as ActivityFilterTypes["direction"]) ?? "ALL",
  };

  const communications = await getCommunications(filters);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Activity & Communication Feed
        </h1>
        <p className="text-sm text-muted mt-1">
          Track all inbound and outbound interactions across leads.
        </p>
      </div>

      <ActivityFilterBar />
      <div className="rounded-xl border border-zinc-800 bg-surface p-6">
        <Suspense fallback={<Skeleton className="h-64" />}>
          <ActivityTimeline communications={communications} />
        </Suspense>
      </div>
    </div>
  );
}
