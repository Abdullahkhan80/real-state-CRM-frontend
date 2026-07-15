"use client";

import { useCrm } from "../../_crm/context";
import { MetricCard, RevenueLineChart, Icon } from "../../_crm/components";
import { sourceStyles, statusStyles, formatCurrency } from "../../_crm/data";
import Link from "next/link";

export default function DashboardPage() {
  const { leads, setSelectedLead, setIsDrawerOpen } = useCrm();

  const metricsSection = (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      <MetricCard
        title="Total property"
        value="268"
        detail="Leads coming increased by 15% in last 7 days"
        icon="home"
        tone="violet"
        sparklineColor="#8b5cf6"
        sparklinePoints="M0 25 C15 35, 30 15, 45 25 C60 35, 75 10, 100 20"
        badgeText="↑ 15.8%"
        isPositive={true}
      />
      <MetricCard
        title="Total income"
        value="$163,848"
        detail="Income increased by 10% in last 7 days"
        icon="database"
        tone="emerald"
        sparklineColor="#10b981"
        sparklinePoints="M0 30 C15 20, 30 35, 45 25 C60 15, 75 25, 100 30"
        badgeText="↓ 12.8%"
        isPositive={false}
      />
      <MetricCard
        title="Total sales"
        value="$848,848"
        detail="Sales volume grew in last 7 days"
        icon="target"
        tone="amber"
        sparklineColor="#f97316"
        sparklinePoints="M0 35 C15 35, 30 20, 45 25 C60 30, 75 15, 100 20"
        badgeText="↑ 18.8%"
        isPositive={true}
      />
    </section>
  );

  const recentMessagesCard = (
    <article className="rounded-xl premium-border bg-[var(--bg-card)] p-5 shadow-sm backdrop-blur transition-colors duration-200 flex flex-col justify-between h-full min-h-[320px]">
      <div>
        <div className="mb-4 flex items-center justify-between premium-border-b pb-4">
          <div>
            <h3 className="text-xs font-bold text-[var(--text-title)] uppercase tracking-wider">Message</h3>
            <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">All conversations</p>
          </div>
          <select className="h-8 rounded-lg premium-border bg-[var(--bg-inner-input)] px-2 text-[10px] font-bold text-[var(--text-title)] outline-none focus:border-violet-500">
            <option>Today</option>
            <option>Yesterday</option>
          </select>
        </div>

        <div className="space-y-4">
          {/* Jane Cooper */}
          <div
            onClick={() => {
              const lead = leads.find((l) => l.name === "Ayesha Malik");
              if (lead) {
                setSelectedLead(lead);
                setIsDrawerOpen(true);
              }
            }}
            className="flex items-center justify-between gap-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-indigo-500/10 text-indigo-600 grid place-items-center font-bold text-xs">JC</div>
              <div>
                <p className="text-xs font-bold text-[var(--text-title)]">Jane Cooper</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-medium">I need a property</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[9px] text-[var(--text-muted)] font-semibold">12 min ago</p>
              <span className="mt-1 inline-grid h-4.5 w-4.5 place-items-center rounded-full bg-rose-500 text-[9px] font-bold text-white leading-none">
                5
              </span>
            </div>
          </div>

          {/* Brooklyn Simmons */}
          <div
            onClick={() => {
              const lead = leads.find((l) => l.name === "Zoya Siddiqui");
              if (lead) {
                setSelectedLead(lead);
                setIsDrawerOpen(true);
              }
            }}
            className="flex items-center justify-between gap-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-violet-500/10 text-violet-600 grid place-items-center font-bold text-xs">BS</div>
              <div>
                <p className="text-xs font-bold text-[var(--text-title)]">Brooklyn Simmons</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-medium">My budget is $500,000</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[9px] text-[var(--text-muted)] font-semibold">1 day ago</p>
            </div>
          </div>

          {/* Esther Howard */}
          <div
            onClick={() => {
              const lead = leads.find((l) => l.name === "Hamza Rafiq");
              if (lead) {
                setSelectedLead(lead);
                setIsDrawerOpen(true);
              }
            }}
            className="flex items-center justify-between gap-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-amber-500/10 text-amber-600 grid place-items-center font-bold text-xs">EH</div>
              <div>
                <p className="text-xs font-bold text-[var(--text-title)]">Esther Howard</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-medium">Thank you so much. 😊</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[9px] text-[var(--text-muted)] font-semibold">8 hrs ago</p>
              <span className="mt-1 inline-grid h-4.5 w-4.5 place-items-center rounded-full bg-rose-500 text-[9px] font-bold text-white leading-none">
                1
              </span>
            </div>
          </div>

          {/* Guy Hawkins */}
          <div
            onClick={() => {
              const lead = leads.find((l) => l.name === "Bilal Qureshi");
              if (lead) {
                setSelectedLead(lead);
                setIsDrawerOpen(true);
              }
            }}
            className="flex items-center justify-between gap-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-teal-500/10 text-teal-600 grid place-items-center font-bold text-xs">GH</div>
              <div>
                <p className="text-xs font-bold text-[var(--text-title)]">Guy Hawkins</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-medium">How standard is it...</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[9px] text-[var(--text-muted)] font-semibold">3 days ago</p>
            </div>
          </div>
        </div>
      </div>

      <Link
        href="/crm/activity"
        className="mt-4 flex h-9 items-center justify-center gap-1.5 w-full rounded-xl bg-violet-600/10 hover:bg-violet-600/20 text-xs font-bold text-violet-600 transition cursor-pointer"
      >
        View all messages ↗
      </Link>
    </article>
  );

  const activePropertySection = (
    <section className="rounded-xl premium-border bg-[var(--bg-card)] p-5 shadow-sm backdrop-blur transition-colors duration-200">
      <div className="mb-5 flex items-center justify-between premium-border-b pb-4">
        <div>
          <h3 className="text-xs font-bold text-[var(--text-title)] uppercase tracking-wider">Active Property</h3>
          <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">Overview of July 15-July 31</p>
        </div>
        <Link
          href="/crm/board"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl premium-border bg-[var(--bg-inner-input)] px-4 text-xs font-bold text-[var(--text-body)] hover:bg-[var(--bg-card-hover)] transition cursor-pointer"
        >
          <Icon name="filter" className="h-3.5 w-3.5" />
          Filter
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-black/5 dark:bg-black/15 light:bg-black/5 text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] premium-border-b">
            <tr>
              <th className="px-5 py-4 font-bold">Property</th>
              <th className="px-5 py-4 font-bold">Location</th>
              <th className="px-5 py-4 font-bold">Contact</th>
              <th className="px-5 py-4 font-bold">Date</th>
              <th className="px-5 py-4 font-bold">Engagement</th>
              <th className="px-5 py-4 font-bold">Price</th>
              <th className="px-5 py-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)] bg-transparent">
            {/* Opulence Oasis */}
            <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition duration-150">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-16 shrink-0 rounded-lg overflow-hidden bg-white/5 premium-border relative">
                    <img src="/opulence_oasis.png" alt="Opulence Oasis" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[var(--text-title)] text-xs">Opulence Oasis</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-medium">3 beds · 2 bath · 1200sqft</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3">
                <p className="font-semibold text-[var(--text-body)]">Paris, France</p>
              </td>
              <td className="px-5 py-3">
                <p className="font-semibold text-[var(--text-body)] font-mono">(406) 555-0120</p>
              </td>
              <td className="px-5 py-3 text-[var(--text-muted)] font-semibold">5 Jul 2026</td>
              <td className="px-5 py-3">
                <p className="font-semibold text-[var(--text-body)] flex items-center gap-1.5">
                  <Icon name="agent" className="h-3.5 w-3.5 text-zinc-500" />
                  1,347 Views
                </p>
              </td>
              <td className="px-5 py-3">
                <p className="font-black text-violet-600 dark:text-violet-400 font-mono">$88,888.59</p>
              </td>
              <td className="px-5 py-3 text-right">
                <button
                  onClick={() => {
                    const lead = leads.find((l) => l.name === "Bilal Qureshi");
                    if (lead) {
                      setSelectedLead(lead);
                      setIsDrawerOpen(true);
                    }
                  }}
                  className="h-8 rounded-lg premium-border bg-[var(--bg-inner-input)] hover:bg-[var(--bg-card-hover)] text-[10px] font-bold text-[var(--text-body)] px-3.5 transition cursor-pointer"
                >
                  Edit
                </button>
              </td>
            </tr>

            {/* Regal Retreat */}
            <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition duration-150">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-16 shrink-0 rounded-lg overflow-hidden bg-white/5 premium-border relative">
                    <img src="/regal_retreat.png" alt="Regal Retreat" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[var(--text-title)] text-xs">Regal Retreat</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-medium">5 beds · 2 bath · 1400sqft</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3">
                <p className="font-semibold text-[var(--text-body)]">Paris, France</p>
              </td>
              <td className="px-5 py-3">
                <p className="font-semibold text-[var(--text-body)] font-mono">(430) 555-0103</p>
              </td>
              <td className="px-5 py-3 text-[var(--text-muted)] font-semibold">7 Jul 2026</td>
              <td className="px-5 py-3">
                <p className="font-semibold text-[var(--text-body)] flex items-center gap-1.5">
                  <Icon name="agent" className="h-3.5 w-3.5 text-zinc-500" />
                  1,656 Views
                </p>
              </td>
              <td className="px-5 py-3">
                <p className="font-black text-violet-600 dark:text-violet-400 font-mono">$91,345.43</p>
              </td>
              <td className="px-5 py-3 text-right">
                <button
                  onClick={() => {
                    const lead = leads.find((l) => l.name === "Noor Ahmed");
                    if (lead) {
                      setSelectedLead(lead);
                      setIsDrawerOpen(true);
                    }
                  }}
                  className="h-8 rounded-lg premium-border bg-[var(--bg-inner-input)] hover:bg-[var(--bg-card-hover)] text-[10px] font-bold text-[var(--text-body)] px-3.5 transition cursor-pointer"
                >
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 animate-fade-in">
      {metricsSection}
      
      {/* Middle Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueLineChart />
        </div>
        <div>
          {recentMessagesCard}
        </div>
      </div>

      {/* Bottom Row */}
      {activePropertySection}
    </div>
  );
}
