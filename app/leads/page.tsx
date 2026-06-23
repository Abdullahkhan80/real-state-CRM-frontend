import { Suspense } from "react";
import { getLeads, getLeadStats } from "@/lib/data";
import type { LeadFilters as LeadFilterTypes } from "@/lib/types";
import StatCard from "@/components/stat-card";
import LeadFilterBar from "@/components/lead/lead-filters";
import LeadTable from "@/components/lead/lead-table";
import Skeleton from "@/components/ui/skeleton";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; source?: string; search?: string }>;
}) {
  const params = await searchParams;
  const filters: LeadFilterTypes = {
    status: (params.status as LeadFilterTypes["status"]) ?? "ALL",
    source: (params.source as LeadFilterTypes["source"]) ?? "ALL",
    search: params.search,
  };

  const [stats, leads] = await Promise.all([
    getLeadStats(),
    getLeads(filters),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="text-sm text-muted mt-1">
          Manage your real estate leads from{" "}
          {stats.total} total prospects.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="New" value={stats.new} />
        <StatCard label="Converted" value={stats.converted} />
        <StatCard label="Lost" value={stats.lost} />
      </div>

      <LeadFilterBar />
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <LeadTable leads={leads} />
      </Suspense>
    </div>
  );
}
