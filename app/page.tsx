import { Suspense } from "react";
import { getDashboardMetrics, getLeadStats, getCommunications } from "@/lib/data";
import StatCard from "@/components/stat-card";
import Skeleton from "@/components/ui/skeleton";
import Card from "@/components/ui/card";
import ActivityTimeline from "@/components/activity/activity-timeline";

export default async function Home() {
  const [metrics, stats, recentComms] = await Promise.all([
    getDashboardMetrics(),
    getLeadStats(),
    getCommunications().then((c) => c.slice(0, 5)),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted mt-1">
          Overview of your real estate lead pipeline.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Leads" value={metrics.totalLeads} />
        <StatCard label="New Leads" value={stats.new} />
        <StatCard label="AI Calls" value={metrics.callsAttendedByAI} />
        <StatCard
          label="Conversion Rate"
          value={`${metrics.conversionRate}%`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<Skeleton className="h-64" />}>
          <Card>
            <h2 className="text-sm font-medium text-muted mb-4">
              Lead Status Breakdown
            </h2>
            <div className="space-y-3">
              <StatusBar
                label="New"
                count={stats.new}
                total={stats.total}
                color="bg-blue-600"
              />
              <StatusBar
                label="Contacted"
                count={stats.contacted}
                total={stats.total}
                color="bg-amber-600"
              />
              <StatusBar
                label="Converted"
                count={stats.converted}
                total={stats.total}
                color="bg-emerald-600"
              />
              <StatusBar
                label="Lost"
                count={stats.lost}
                total={stats.total}
                color="bg-rose-600"
              />
            </div>
          </Card>
        </Suspense>

        <Suspense fallback={<Skeleton className="h-64" />}>
          <Card>
            <h2 className="text-sm font-medium text-muted mb-4">
              Recent Activity
            </h2>
            <ActivityTimeline communications={recentComms} />
          </Card>
        </Suspense>
      </div>
    </div>
  );
}

function StatusBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-muted">{label}</span>
        <span className="font-medium">
          {count} ({pct}%)
        </span>
      </div>
      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
