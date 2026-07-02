import { ReactNode } from "react";
import type { ApiState, DashboardMetrics, IconName, Tab } from "./data";
import { navItems } from "./data";
import { Icon } from "./icon";

export function Shell({
  children,
  apiState,
  metrics,
  activeTab,
  onTabChange,
}: {
  children: ReactNode;
  apiState: ApiState;
  metrics: DashboardMetrics;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  const apiStatusClass =
    apiState === "connected"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : apiState === "checking"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : "bg-rose-50 text-rose-700 ring-rose-200";
  const apiDotClass =
    apiState === "connected" ? "bg-emerald-500" : apiState === "checking" ? "bg-amber-500" : "bg-rose-500";

  return (
    <main className="min-h-screen bg-[#f6f7f4] text-zinc-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-zinc-900/10 bg-zinc-950 text-white xl:flex xl:flex-col">
          <div className="border-b border-white/10 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-teal-400 text-zinc-950">
                <Icon name="home" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-semibold tracking-wide">NexaEstate CRM</p>
                <p className="text-xs text-zinc-400">AI sales command</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1 px-4 py-5 text-sm text-zinc-300">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left transition ${
                  activeTab === item.id ? "bg-white text-zinc-950" : "hover:bg-white/10"
                }`}
                type="button"
                aria-current={activeTab === item.id ? "page" : undefined}
                onClick={() => onTabChange(item.id)}
              >
                <Icon name={item.icon} className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto border-t border-white/10 p-5">
            <div className="rounded-lg bg-white/8 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-white">Today AI work</p>
                <Icon name="spark" className="h-4 w-4 text-teal-300" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-2xl font-semibold">{metrics.today.messagesHandled}</p>
                  <p className="text-xs text-zinc-400">Messages</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{metrics.today.callsAttendedByAI}</p>
                  <p className="text-xs text-zinc-400">Calls</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="border-b border-zinc-900/10 bg-white/85 px-4 py-4 backdrop-blur md:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
                  <span>Owner workspace</span>
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 normal-case tracking-normal ring-1 ${apiStatusClass}`}>
                    <span className={`h-2 w-2 rounded-full ${apiDotClass}`} />
                    {apiState === "connected" ? "API connected" : apiState === "checking" ? "Checking API" : "Demo mode"}
                  </span>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">Real estate AI CRM</h1>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50"
                  type="button"
                  onClick={() => window.location.reload()}
                >
                  <Icon name="refresh" />
                  Sync
                </button>
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800"
                  type="button"
                  onClick={() => onTabChange("create")}
                >
                  <Icon name="add" />
                  Add lead
                </button>
              </div>
            </div>
          </header>

          <nav className="flex gap-2 overflow-x-auto border-b border-zinc-900/10 bg-white px-4 py-3 xl:hidden">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium ring-1 transition ${
                  activeTab === item.id
                    ? "bg-zinc-950 text-white ring-zinc-950"
                    : "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50"
                }`}
                type="button"
                aria-current={activeTab === item.id ? "page" : undefined}
                onClick={() => onTabChange(item.id)}
              >
                <Icon name={item.icon} className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {children}
        </div>
      </div>
    </main>
  );
}

export function MetricCard({
  title,
  value,
  detail,
  icon,
  tone,
}: {
  title: string;
  value: string;
  detail: string;
  icon: IconName;
  tone: "teal" | "emerald" | "amber" | "violet";
}) {
  const tones = {
    teal: "bg-teal-50 text-teal-700 ring-teal-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
  };

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-zinc-500">{title}</p>
        <span className={`grid h-9 w-9 place-items-center rounded-lg ring-1 ${tones[tone]}`}>
          <Icon name={icon} />
        </span>
      </div>
      <p className="truncate text-2xl font-semibold tracking-tight text-zinc-950">{value}</p>
      <p className="mt-1 text-sm text-zinc-500">{detail}</p>
    </article>
  );
}

export function Badge({ children, className }: { children: ReactNode; className: string }) {
  return (
    <span className={`mt-2 inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${className}`}>
      {children}
    </span>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">{label}</span>
      {children}
    </label>
  );
}