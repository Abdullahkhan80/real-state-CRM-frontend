"use client";

import { useCrm } from "../../_crm/context";
import { FunnelChart } from "../../_crm/components";
import { formatCurrency } from "../../_crm/data";

export default function AnalyticsPage() {
  const { leads } = useCrm();

  const wonCount = leads.filter((l) => l.status === "CONVERTED").length;
  const lostCount = leads.filter((l) => l.status === "LOST").length;
  const winRate = Math.round((wonCount / (wonCount + lostCount || 1)) * 100);
  const wonVal = leads.filter((l) => l.status === "CONVERTED").reduce((s, l) => s + l.value, 0);

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 animate-fade-in">
      {/* Metrics Row */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl premium-border bg-[var(--bg-card)] p-5 shadow-sm backdrop-blur transition-colors duration-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Total Won Leads</p>
          <p className="mt-2 text-2xl font-black text-[var(--text-title)]">{wonCount}</p>
          <p className="mt-1 text-[10px] text-emerald-500 font-bold">Successfully closed deals</p>
        </article>
        <article className="rounded-xl premium-border bg-[var(--bg-card)] p-5 shadow-sm backdrop-blur transition-colors duration-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Total Lost Leads</p>
          <p className="mt-2 text-2xl font-black text-[var(--text-title)]">{lostCount}</p>
          <p className="mt-1 text-[10px] text-rose-500 font-bold">Dropped from pipeline</p>
        </article>
        <article className="rounded-xl premium-border bg-[var(--bg-card)] p-5 shadow-sm backdrop-blur transition-colors duration-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Conversion Win Rate</p>
          <p className="mt-2 text-2xl font-black text-[var(--text-title)]">{winRate}%</p>
          <p className="mt-1 text-[10px] text-teal-500 font-bold">Closed-Won vs Closed-Lost</p>
        </article>
        <article className="rounded-xl premium-border bg-[var(--bg-card)] p-5 shadow-sm backdrop-blur transition-colors duration-200">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Closed Won Value</p>
          <p className="mt-2 text-2xl font-black text-emerald-500 font-mono">{formatCurrency(wonVal)}</p>
          <p className="mt-1 text-[10px] text-[var(--text-muted)] font-semibold">Total pipeline value secured</p>
        </article>
      </div>

      {/* Main Charts: Funnel Chart and Monthly Comparison */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly Won vs Lost Comparison SVG Bar Chart */}
        <div className="lg:col-span-2 rounded-xl premium-border bg-[var(--bg-card)] p-5 shadow-sm backdrop-blur transition-colors duration-200">
          <div className="mb-4 flex items-center justify-between premium-border-b pb-3">
            <div>
              <h3 className="text-xs font-bold text-[var(--text-title)] uppercase tracking-wider font-sans">Monthly Deal Analysis</h3>
              <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">Value of deals won vs. lost ($ thousands)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[var(--text-body)]">
                <span className="h-2.5 w-2.5 rounded bg-violet-600" /> Won
              </span>
              <span className="flex items-center gap-1.5 text-[var(--text-body)]">
                <span className="h-2.5 w-2.5 rounded bg-rose-500" /> Lost
              </span>
            </div>
          </div>

          <div className="relative h-[200px] w-full mt-4">
            <svg className="h-full w-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="var(--border-color)" strokeWidth="0.8" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="var(--border-color)" strokeWidth="0.8" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="var(--border-color)" strokeWidth="0.8" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="var(--border-color)" strokeWidth="0.8" />

              {/* Y Axis Labels */}
              <text x="20" y="24" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">$500K</text>
              <text x="20" y="64" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">$300K</text>
              <text x="20" y="104" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">$150K</text>
              <text x="20" y="144" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">$50K</text>

              {/* Bars Group 1 (Jan) - Won: 200, Lost: 50 */}
              <rect x="75" y="100" width="14" height="60" rx="2" fill="#7c3aed" />
              <rect x="91" y="140" width="14" height="20" rx="2" fill="#f43f5e" />

              {/* Bars Group 2 (Feb) - Won: 320, Lost: 120 */}
              <rect x="145" y="70" width="14" height="90" rx="2" fill="#7c3aed" />
              <rect x="161" y="120" width="14" height="40" rx="2" fill="#f43f5e" />

              {/* Bars Group 3 (Mar) - Won: 180, Lost: 90 */}
              <rect x="215" y="110" width="14" height="50" rx="2" fill="#7c3aed" />
              <rect x="231" y="130" width="14" height="30" rx="2" fill="#f43f5e" />

              {/* Bars Group 4 (Apr) - Won: 450, Lost: 80 */}
              <rect x="285" y="30" width="14" height="130" rx="2" fill="#7c3aed" />
              <rect x="301" y="135" width="14" height="25" rx="2" fill="#f43f5e" />

              {/* Bars Group 5 (May) - Won: 380, Lost: 150 */}
              <rect x="355" y="50" width="14" height="110" rx="2" fill="#7c3aed" />
              <rect x="371" y="110" width="14" height="50" rx="2" fill="#f43f5e" />

              {/* Bars Group 6 (Jun) - Won: 520, Lost: 110 */}
              <rect x="425" y="10" width="14" height="150" rx="2" fill="#7c3aed" />
              <rect x="441" y="125" width="14" height="35" rx="2" fill="#f43f5e" />

              {/* X Axis Labels */}
              <text x="90" y="175" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">Jan</text>
              <text x="160" y="175" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">Feb</text>
              <text x="230" y="175" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">Mar</text>
              <text x="300" y="175" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">Apr</text>
              <text x="370" y="175" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">May</text>
              <text x="440" y="175" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">Jun</text>
            </svg>
          </div>
        </div>

        {/* Lead Source Performance */}
        <div className="rounded-xl premium-border bg-[var(--bg-card)] p-5 shadow-sm backdrop-blur transition-colors duration-200">
          <h3 className="text-xs font-bold text-[var(--text-title)] uppercase tracking-wider mb-1">Lead Source Conversion</h3>
          <p className="text-[10px] text-[var(--text-muted)] font-medium mb-6">AI responder closure rates by platform channel</p>

          <div className="space-y-4 font-semibold text-xs text-[var(--text-body)]">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span>WhatsApp (Meta)</span>
                <span className="text-emerald-500 font-black">74%</span>
              </div>
              <div className="h-2 w-full bg-[var(--bg-lane)] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: "74%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span>Instagram DM</span>
                <span className="text-teal-500 font-black">62%</span>
              </div>
              <div className="h-2 w-full bg-[var(--bg-lane)] rounded-full overflow-hidden">
                <div className="h-full bg-teal-500" style={{ width: "62%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span>Facebook Messenger</span>
                <span className="text-violet-500 font-black">58%</span>
              </div>
              <div className="h-2 w-full bg-[var(--bg-lane)] rounded-full overflow-hidden">
                <div className="h-full bg-violet-500" style={{ width: "58%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span>Cold AI Phone Calls</span>
                <span className="text-amber-500 font-black">48%</span>
              </div>
              <div className="h-2 w-full bg-[var(--bg-lane)] rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: "48%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <FunnelChart leads={leads} />
    </div>
  );
}
