import { ReactNode, useState, useEffect, useRef } from "react";
import type { ApiState, DashboardMetrics, IconName, Tab, Lead, LeadStatus, LeadSource } from "./data";
import { navItems, sourceStyles, statusStyles, formatCurrency, formatNumber } from "./data";
import { Icon } from "./icon";

export function Shell({
  children,
  apiState,
  metrics,
  activeTab,
  onTabChange,
  theme,
  onToggleTheme,
}: {
  children: ReactNode;
  apiState: ApiState;
  metrics: DashboardMetrics;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}) {
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string } | null>(null);
  
  // Persisted state for sidebar expand / collapse
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("nexa_user");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {
        console.error(e);
      }
    }

    const savedExpanded = localStorage.getItem("nexa_sidebar_expanded");
    if (savedExpanded === "true") {
      setSidebarExpanded(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("nexa_token");
    localStorage.removeItem("nexa_user");
    window.location.reload();
  };

  const handleToggleSidebar = () => {
    const nextVal = !sidebarExpanded;
    setSidebarExpanded(nextVal);
    localStorage.setItem("nexa_sidebar_expanded", String(nextVal));
  };

  const apiStatusClass =
    apiState === "connected"
      ? "bg-emerald-950/40 text-emerald-400 ring-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400 light:bg-emerald-50 light:text-emerald-700 light:ring-emerald-200"
      : apiState === "checking"
        ? "bg-amber-950/40 text-amber-400 ring-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400 light:bg-amber-50 light:text-emerald-700 light:ring-emerald-200"
        : "bg-rose-950/40 text-rose-400 ring-rose-500/30 dark:bg-rose-950/40 dark:text-rose-400 light:bg-rose-50 light:text-rose-700 light:ring-rose-200";
  const apiDotClass =
    apiState === "connected" ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : apiState === "checking" ? "bg-amber-500" : "bg-rose-500";

  return (
    <main className="h-screen w-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)] flex font-sans transition-colors duration-200">
      
      {/* Dynamic Expandable Sidebar - Desktop */}
      <aside className={`hidden shrink-0 premium-border-r bg-[var(--bg-sidebar)] text-[var(--text-body)] xl:flex xl:flex-col h-full select-none transition-all duration-300 ease-in-out justify-between ${
        sidebarExpanded ? "w-60 px-4 py-5" : "w-20 items-center py-5"
      }`}>
        
        {/* Top Logo / Brand Info */}
        <div className="w-full shrink-0">
          {sidebarExpanded ? (
            <div className="flex items-center justify-between shrink-0 px-2">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-900/30 font-black text-lg leading-none">
                  C
                </div>
                <div>
                  <p className="text-xs font-black tracking-wide text-[var(--text-title)]">NexaEstate</p>
                  <p className="text-[9px] uppercase tracking-wider text-violet-500 font-bold">AI CRM</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center shrink-0">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-violet-600 text-white shadow-md shadow-violet-900/30 font-black text-xl leading-none">
                C
              </div>
            </div>
          )}
        </div>

        {/* Navigation List */}
        {sidebarExpanded ? (
          <nav className="flex-1 flex flex-col gap-1.5 py-8 overflow-y-auto w-full items-stretch">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex h-10 w-full items-center gap-3 rounded-xl px-3.5 text-xs font-bold transition duration-150 cursor-pointer text-left ${
                    isActive
                      ? "bg-violet-600 text-white shadow-md shadow-violet-900/20"
                      : "text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--text-title)]"
                  }`}
                  type="button"
                >
                  <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        ) : (
          <nav className="flex-1 flex flex-col gap-4 py-8 overflow-y-auto w-full items-center">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`grid h-11 w-11 place-items-center rounded-2xl transition duration-200 cursor-pointer ${
                    isActive
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-900/30"
                      : "text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--text-title)]"
                  }`}
                  title={item.label}
                  type="button"
                >
                  <Icon name={item.icon} className="h-5 w-5" />
                </button>
              );
            })}
          </nav>
        )}

        {/* Bottom Actions Row */}
        {sidebarExpanded ? (
          <div className="flex flex-col gap-2 w-full shrink-0 premium-border-t pt-5">
            {/* Collapse Trigger Button */}
            <button
              onClick={handleToggleSidebar}
              className="flex h-10 items-center gap-3 rounded-xl px-3.5 text-xs font-bold text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--text-title)] transition cursor-pointer w-full text-left"
              type="button"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 19-7-7 7-7" />
              </svg>
              <span>Collapse Sidebar</span>
            </button>

            {/* Help */}
            <button
              className="flex h-10 items-center gap-3 rounded-xl px-3.5 text-xs font-bold text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--text-title)] transition cursor-pointer w-full text-left"
              type="button"
            >
              <Icon name="shield" className="h-5 w-5 shrink-0" />
              <span>Help & Security</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex h-10 items-center gap-3 rounded-xl px-3.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 transition cursor-pointer w-full text-left"
              type="button"
            >
              <Icon name="clock" className="h-5 w-5 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full items-center shrink-0 premium-border-t pt-5">
            {/* Expand Trigger Button */}
            <button
              onClick={handleToggleSidebar}
              className="grid h-10 w-10 place-items-center rounded-full text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--text-title)] transition cursor-pointer"
              title="Expand Sidebar"
              type="button"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 5 7 7-7 7" />
              </svg>
            </button>

            {/* Help */}
            <button
              className="grid h-10 w-10 place-items-center rounded-full text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--text-title)] transition cursor-pointer"
              title="Help / Shield"
              type="button"
            >
              <Icon name="shield" className="h-4.5 w-4.5" />
            </button>
            
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="grid h-10 w-10 place-items-center rounded-full text-[var(--text-muted)] hover:bg-rose-500/10 hover:text-rose-500 transition cursor-pointer border border-transparent hover:border-rose-500/20"
              title="Log Out"
              type="button"
            >
              <Icon name="clock" className="h-4.5 w-4.5" />
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area (Scrollable viewport) */}
      <div className="min-w-0 flex-1 flex flex-col h-full overflow-hidden bg-[var(--background)] transition-colors duration-200">
        
        {/* Dribbble Style Header */}
        <header className="premium-border-b bg-[var(--bg-sidebar)]/80 px-4 py-4 backdrop-blur-md md:px-8 shrink-0 transition-colors duration-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input bar on the left */}
            <div className="relative w-full max-w-sm">
              <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                className="h-10 w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-inner-input)] pl-10 pr-16 text-xs text-[var(--text-title)] placeholder-[var(--text-muted)] outline-none transition focus:border-violet-500 focus:bg-[var(--bg-sidebar)]"
                placeholder="Search..."
                type="text"
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md bg-[var(--bg-badge-neutral)] premium-border px-1.5 py-0.5 text-[9px] font-bold text-[var(--text-muted)] font-mono">
                ⌘ K
              </span>
            </div>

            {/* Profile Avatar and Right Side Notification Controls */}
            <div className="flex items-center justify-end gap-5">
              {/* Message Bubble Notification */}
              <button className="relative grid h-9 w-9 place-items-center rounded-xl premium-border text-[var(--text-body)] hover:bg-[var(--bg-card-hover)] transition cursor-pointer">
                <Icon name="message" className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-violet-600 ring-2 ring-[var(--bg-sidebar)]" />
              </button>

              {/* Notification Bell */}
              <button className="relative grid h-9 w-9 place-items-center rounded-xl premium-border text-[var(--text-body)] hover:bg-[var(--bg-card-hover)] transition cursor-pointer">
                <Icon name="target" className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-sidebar)]" />
              </button>

              {/* Light/Dark mode toggle switch */}
              <button
                onClick={onToggleTheme}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl premium-border bg-[var(--bg-card)] text-[var(--text-body)] hover:bg-[var(--bg-card-hover)] transition cursor-pointer"
                title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                type="button"
              >
                <Icon name={theme === "dark" ? "sun" : "moon"} className="h-4 w-4" />
              </button>

              {/* Divider */}
              <span className="h-6 w-px bg-[var(--border-color)]" />

              {/* Wade Warren profile details */}
              <div className="flex items-center gap-3">
                <div className="min-w-0 text-right hidden md:block">
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Welcome back</p>
                  <p className="text-xs font-black text-[var(--text-title)] mt-0.5">{currentUser?.name || "Wade Warren"}</p>
                </div>
                {/* Profile circular avatar */}
                <div className="h-10 w-10 shrink-0 rounded-full premium-border bg-violet-500/10 overflow-hidden text-center grid place-items-center font-bold text-xs text-violet-600">
                  {currentUser?.name
                    ? currentUser.name.split(" ").map(item => item[0]).slice(0, 2).join("")
                    : "WW"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Nav for Mobile Devices - Fixed */}
        <nav className="flex gap-1.5 overflow-x-auto premium-border-b bg-[var(--bg-sidebar)] px-3 py-2 xl:hidden shrink-0 transition-colors duration-200">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition cursor-pointer ${
                activeTab === item.id
                  ? "bg-violet-600 text-white"
                  : "bg-[var(--bg-badge-neutral)] text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
              type="button"
              onClick={() => onTabChange(item.id)}
            >
              <Icon name={item.icon} className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Independent Scroll Container */}
        <div className="flex-1 overflow-y-auto bg-[var(--background)] transition-colors duration-200">
          {children}
        </div>
      </div>
    </main>
  );
}

/* Dribbble Style Metric Card with SVG Sparkline Curve Overlay */
export function MetricCard({
  title,
  value,
  detail,
  icon,
  tone,
  sparklineColor = "#7c3aed",
  sparklinePoints = "M0 25 C20 35, 30 15, 45 25 C60 35, 75 10, 100 20",
  badgeText = "+15.8%",
  isPositive = true,
}: {
  title: string;
  value: string;
  detail: string;
  icon: IconName;
  tone: "teal" | "emerald" | "amber" | "violet";
  sparklineColor?: string;
  sparklinePoints?: string;
  badgeText?: string;
  isPositive?: boolean;
}) {
  return (
    <article className="rounded-xl premium-border bg-[var(--bg-card)] p-5 shadow-sm backdrop-blur flex flex-col justify-between transition-colors duration-200 relative overflow-hidden min-h-[150px]">
      {/* Top row elements */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
          {title}
          <span className="h-3.5 w-3.5 grid place-items-center text-[var(--text-muted)] hover:text-[var(--text-title)] border border-transparent rounded-full cursor-pointer">?</span>
        </span>
        <button className="h-6 rounded-md bg-[var(--bg-badge-neutral)] premium-border px-2.5 text-[10px] font-bold text-[var(--text-body)] hover:bg-[var(--bg-card-hover)] transition cursor-pointer">
          See Details
        </button>
      </div>

      {/* Metric main numeric values */}
      <div className="mt-4 flex items-baseline gap-2 shrink-0">
        <p className="text-2xl font-black tracking-tight text-[var(--text-title)]">{value}</p>
        <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-black ${
          isPositive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
        }`}>
          {badgeText}
        </span>
      </div>

      {/* Custom SVG Sparkline Graph & Caption row */}
      <div className="mt-4 flex items-center justify-between gap-4 shrink-0">
        {/* SVG Sparkline */}
        <div className="w-28 h-8 relative">
          <svg className="h-full w-full overflow-visible" viewBox="0 0 100 40">
            <defs>
              <linearGradient id={`gradient-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={sparklineColor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={sparklineColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Sparkline curve */}
            <path
              d={sparklinePoints}
              fill="none"
              stroke={sparklineColor}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Sparkline gradient fill */}
            <path
              d={`${sparklinePoints} L100 40 L0 40 Z`}
              fill={`url(#gradient-${title.replace(/\s+/g, '')})`}
            />
          </svg>
        </div>

        {/* Small Caption */}
        <p className="text-[10px] text-[var(--text-muted)] font-semibold leading-relaxed text-right flex-1">
          {detail}
        </p>
      </div>
    </article>
  );
}

export function Badge({ children, className }: { children: ReactNode; className: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide ring-1 ${className}`}>
      {children}
    </span>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
      {children}
    </label>
  );
}

/* Dribbble Style SVG Property Revenue Line Chart Component */
export function RevenueLineChart() {
  return (
    <div className="rounded-xl premium-border bg-[var(--bg-card)] p-5 shadow-sm backdrop-blur transition-colors duration-200">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between premium-border-b pb-4">
        <div>
          <h3 className="text-xs font-bold text-[var(--text-title)] uppercase tracking-wider">Property revenue overview</h3>
          <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">Overview of July 15-July 22</p>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-xs font-semibold">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[var(--text-body)]">
              <span className="h-2 w-2 rounded-full bg-violet-600" /> Expense
            </span>
            <span className="flex items-center gap-1.5 text-[var(--text-body)]">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Income
            </span>
          </div>
          <select className="h-8 rounded-lg premium-border bg-[var(--bg-inner-input)] px-2.5 text-[10px] font-bold text-[var(--text-title)] outline-none focus:border-violet-500">
            <option>Period: This Week</option>
            <option>Period: This Month</option>
          </select>
        </div>
      </div>

      <div className="relative h-[220px] w-full mt-4">
        <svg className="h-full w-full overflow-visible" viewBox="0 0 600 220" preserveAspectRatio="none">
          {/* Y Axis Grid lines */}
          <line x1="45" y1="20" x2="590" y2="20" stroke="var(--border-color)" strokeDasharray="3 3" />
          <line x1="45" y1="60" x2="590" y2="60" stroke="var(--border-color)" strokeDasharray="3 3" />
          <line x1="45" y1="100" x2="590" y2="100" stroke="var(--border-color)" strokeDasharray="3 3" />
          <line x1="45" y1="140" x2="590" y2="140" stroke="var(--border-color)" strokeDasharray="3 3" />
          <line x1="45" y1="180" x2="590" y2="180" stroke="var(--border-color)" strokeDasharray="3 3" />

          {/* Grid line labels */}
          <text x="20" y="24" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">20K</text>
          <text x="20" y="64" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">15K</text>
          <text x="20" y="104" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">10K</text>
          <text x="20" y="144" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">5K</text>
          <text x="20" y="184" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">1K</text>

          {/* Chart Curves */}
          {/* Expense Curve (solid purple) */}
          <path
            d="M45 130 C105 140, 165 110, 225 120 C285 130, 345 70, 405 80 C465 90, 525 85, 590 90"
            fill="none"
            stroke="#7c3aed"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Income Curve (dashed green) */}
          <path
            d="M45 150 C105 170, 165 140, 225 150 C285 160, 345 100, 405 110 C465 120, 525 110, 590 120"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.8"
            strokeDasharray="5 5"
            strokeLinecap="round"
          />

          {/* Highlight marker line and tooltips (positioned on May/Jun line) */}
          <line x1="345" y1="20" x2="345" y2="180" stroke="var(--border-color)" strokeDasharray="3 3" strokeWidth="1.5" />
          <circle cx="345" cy="98" r="5" fill="#7c3aed" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="345" cy="126" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />

          {/* X Axis Months */}
          <text x="45" y="212" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">Dec</text>
          <text x="105" y="212" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">Jan</text>
          <text x="165" y="212" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">Feb</text>
          <text x="225" y="212" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">Mar</text>
          <text x="285" y="212" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">Apr</text>
          <text x="345" y="212" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">May</text>
          <text x="405" y="212" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">Jun</text>
          <text x="465" y="212" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">Jul</text>
          <text x="525" y="212" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">Aug</text>
          <text x="590" y="212" fill="var(--text-muted)" fontSize="9" fontWeight="700" textAnchor="middle">Sep</text>
        </svg>

        {/* Hover Tooltip Overlay (June 2026 / positioned absolute above May/Jun line) */}
        <div className="absolute top-[20px] left-[355px] rounded-xl bg-zinc-950 p-3 shadow-2xl border border-white/10 z-20 text-[10px] text-zinc-300 pointer-events-none select-none font-sans font-bold leading-normal min-w-[110px]">
          <p className="text-zinc-500 font-bold mb-1">June 2026</p>
          <div className="flex items-center gap-1.5 mb-1 text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            <span>Expense: $368K</span>
          </div>
          <div className="flex items-center gap-1.5 text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Income: $847K</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* SVG Lead Conversion Funnel and Lost Reason Chart */
export function FunnelChart({ leads }: { leads: Lead[] }) {
  const newLeads = leads.filter(l => l.status === "NEW").length;
  const contactedLeads = leads.filter(l => l.status === "CONTACTED").length;
  const convertedLeads = leads.filter(l => l.status === "CONVERTED").length;
  const lostLeads = leads.filter(l => l.status === "LOST").length;
  const total = leads.length || 1;

  // Progression rates
  const pctNew = Math.round((newLeads / total) * 100);
  const pctContacted = Math.round((contactedLeads / total) * 100);
  const pctConverted = Math.round((convertedLeads / total) * 100);
  const pctLost = Math.round((lostLeads / total) * 100);

  // Lost reasons stats
  const lostReasons: Record<string, number> = {};
  leads.forEach(l => {
    if (l.status === "LOST" && l.lostReason) {
      lostReasons[l.lostReason] = (lostReasons[l.lostReason] || 0) + 1;
    }
  });

  const totalLost = Object.values(lostReasons).reduce((s, v) => s + v, 0) || 1;

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      {/* Funnel Pipeline Visualization */}
      <div className="lg:col-span-2 rounded-xl premium-border bg-[var(--bg-card)] p-5 shadow-md backdrop-blur transition-colors duration-200">
        <h3 className="mb-1 text-sm font-bold text-[var(--text-title)] uppercase tracking-wider">Lead Conversion Funnel</h3>
        <p className="mb-6 text-xs text-[var(--text-muted)] font-medium">Conversion progression and deal stages</p>
        
        <div className="space-y-4">
          {/* Funnel Rows */}
          <div className="relative">
            <div className="flex justify-between text-xs font-semibold mb-1 text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-400" /> New Leads (Stage 1)</span>
              <span>{newLeads} leads ({pctNew}%)</span>
            </div>
            <div className="h-6 w-full rounded-md bg-[var(--bg-lane)] overflow-hidden premium-border">
              <div className="h-full bg-gradient-to-r from-violet-600 to-violet-500 rounded-r-md transition-all duration-500" style={{ width: `${Math.max(10, pctNew)}%` }} />
            </div>
          </div>

          <div className="relative">
            <div className="flex justify-between text-xs font-semibold mb-1 text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-teal-400" /> Contacted (Stage 2)</span>
              <span>{contactedLeads} leads ({pctContacted}%)</span>
            </div>
            <div className="h-6 w-full rounded-md bg-[var(--bg-lane)] overflow-hidden premium-border">
              <div className="h-full bg-gradient-to-r from-teal-600 to-teal-500 rounded-r-md transition-all duration-500" style={{ width: `${Math.max(10, pctContacted)}%` }} />
            </div>
          </div>

          <div className="relative">
            <div className="flex justify-between text-xs font-semibold mb-1 text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Converted / Won (Stage 3)</span>
              <span>{convertedLeads} leads ({pctConverted}%)</span>
            </div>
            <div className="h-6 w-full rounded-md bg-[var(--bg-lane)] overflow-hidden premium-border">
              <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-r-md transition-all duration-500" style={{ width: `${Math.max(10, pctConverted)}%` }} />
            </div>
          </div>

          <div className="relative">
            <div className="flex justify-between text-xs font-semibold mb-1 text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-400" /> Lost Leads (Archived)</span>
              <span>{lostLeads} leads ({pctLost}%)</span>
            </div>
            <div className="h-6 w-full rounded-md bg-[var(--bg-lane)] overflow-hidden premium-border">
              <div className="h-full bg-gradient-to-r from-rose-600 to-rose-500 rounded-r-md transition-all duration-500" style={{ width: `${Math.max(10, pctLost)}%` }} />
            </div>
          </div>
        </div>

        {/* Chevron Pipeline Visual SVG */}
        <div className="mt-8 pt-6 premium-border-t hidden md:block">
          <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-muted)]">
            <div className="flex-1 text-center bg-[var(--bg-card-hover)] py-2 rounded-l-lg border-y border-l border-[var(--border-color)] relative">
              NEW
              <div className="absolute top-1/2 -right-2 h-4 w-4 bg-[var(--bg-card-hover)] border-t border-r border-[var(--border-color)] rotate-45 -translate-y-1/2 z-10" />
            </div>
            <div className="w-4 shrink-0" />
            <div className="flex-1 text-center bg-[var(--bg-card-hover)] py-2 border-y border-[var(--border-color)] relative">
              CONTACTED
              <div className="absolute top-1/2 -right-2 h-4 w-4 bg-[var(--bg-card-hover)] border-t border-r border-[var(--border-color)] rotate-45 -translate-y-1/2 z-10" />
            </div>
            <div className="w-4 shrink-0" />
            <div className="flex-1 text-center bg-teal-600/10 text-teal-600 dark:text-teal-400 py-2 rounded-r-lg border border-teal-500/20 font-bold">
              CONVERTED (WON)
            </div>
          </div>
        </div>
      </div>

      {/* Lost Reason Analysis Donut/Bar Chart representation */}
      <div className="rounded-xl premium-border bg-[var(--bg-card)] p-5 shadow-md backdrop-blur flex flex-col justify-between transition-colors duration-200">
        <div>
          <h3 className="mb-1 text-sm font-bold text-[var(--text-title)] uppercase tracking-wider">Lost Reason Breakdown</h3>
          <p className="mb-6 text-xs text-[var(--text-muted)] font-medium">Why deals drop off the funnel</p>

          <div className="space-y-4">
            {Object.keys(lostReasons).length > 0 ? (
              Object.entries(lostReasons).map(([reason, count]) => {
                const pct = Math.round((count / totalLost) * 100);
                return (
                  <div key={reason}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-[var(--text-body)]">{reason}</span>
                      <span className="text-[var(--text-muted)] font-mono">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full rounded bg-[var(--bg-lane)] overflow-hidden">
                      <div className="h-full bg-rose-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10">
                <Icon name="shield" className="mx-auto h-8 w-8 text-[var(--text-muted)] mb-2" />
                <p className="text-xs text-[var(--text-muted)] font-semibold">No lost deals registered.</p>
              </div>
            )}
          </div>
        </div>

        {/* Secondary conversion metric */}
        <div className="mt-6 pt-4 premium-border-t">
          <div className="flex justify-between items-center text-xs font-semibold text-[var(--text-muted)]">
            <span>Overall Win Rate</span>
            <span className="text-emerald-500 dark:text-emerald-400 text-sm font-bold">
              {Math.round((convertedLeads / (convertedLeads + lostLeads || 1)) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Interactive Lead Details Drawer Panel */
export function LeadDetailsDrawer({
  lead,
  isOpen,
  onClose,
  onUpdateStatus,
  onSendMessage,
  onToggleAi,
}: {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (leadId: string, status: LeadStatus) => void;
  onSendMessage: (leadId: string, text: string) => void;
  onToggleAi: (leadId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"chat" | "call">("chat");
  const [typedMessage, setTypedMessage] = useState("");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset audio state when drawer lead changes
    setIsAudioPlaying(false);
    setAudioProgress(0);
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    if (lead && lead.source === "COLD_CALL") {
      setActiveTab("call");
    } else {
      setActiveTab("chat");
    }
  }, [lead]);

  // Audio mock player simulation
  const togglePlayAudio = () => {
    if (isAudioPlaying) {
      setIsAudioPlaying(false);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    } else {
      setIsAudioPlaying(true);
      audioIntervalRef.current = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsAudioPlaying(false);
            if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
            return 0;
          }
          return prev + 2;
        });
      }, 100);
    }
  };

  const handleSend = () => {
    if (!typedMessage.trim() || !lead) return;
    onSendMessage(lead.id, typedMessage.trim());
    setTypedMessage("");
  };

  if (!isOpen || !lead) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Body Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-xl bg-[var(--bg-sidebar)] premium-border-l shadow-2xl z-50 flex flex-col drawer-slide-in select-none transition-colors duration-200">
        
        {/* Drawer Header */}
        <div className="p-5 premium-border-b flex items-center justify-between bg-black/5 dark:bg-black/10 light:bg-black/5 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className={sourceStyles[lead.source].badge}>{sourceStyles[lead.source].label}</Badge>
              <span className="text-xs text-[var(--text-muted)] font-bold">ID: {lead.id.substring(0, 8)}</span>
            </div>
            <h2 className="text-lg font-bold text-[var(--text-title)]">{lead.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg premium-border text-[var(--text-muted)] hover:bg-black/5 hover:text-[var(--text-title)] transition cursor-pointer"
            type="button"
          >
            <Icon name="clock" className="h-4 w-4 rotate-45" />
          </button>
        </div>

        {/* Scrollable Lead profile / communications container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Quick info grid */}
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-[var(--bg-inner-input)] p-4 premium-border text-sm">
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Phone</p>
              <p className="font-semibold text-[var(--text-title)] mt-0.5">{lead.phone}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Email</p>
              <p className="font-semibold text-[var(--text-title)] mt-0.5 truncate">{lead.email || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Property Inquiry</p>
              <p className="font-semibold text-[var(--text-title)] mt-0.5">{lead.propertyType} in {lead.area}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Budget Value</p>
              <p className="font-semibold text-teal-500 dark:text-teal-400 mt-0.5 font-mono">{formatCurrency(lead.value)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Assigned Agent</p>
              <p className="font-semibold text-[var(--text-body)] mt-0.5">{lead.assignedTo}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Lead Status</p>
              <select
                className="mt-1 h-8 w-full rounded-md premium-border bg-[var(--bg-sidebar)] px-2 text-xs font-semibold text-[var(--text-title)] outline-none focus:border-teal-500 transition-colors duration-200"
                value={lead.status}
                onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
              >
                {Object.entries(statusStyles).map(([status, meta]) => (
                  <option key={status} value={status}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* AI Bot status override controller */}
          <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-4 flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`h-2.5 w-2.5 rounded-full ${lead.aiPaused ? "bg-amber-500" : "bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"}`} />
                <p className="text-xs font-bold text-[var(--text-title)] uppercase tracking-wider">
                  {lead.aiPaused ? "AI Responder Paused" : "AI Agent Auto-Responding"}
                </p>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] truncate">
                {lead.aiPaused ? "Manual messaging controls enabled" : `Meta AI Auto-Replies to ${sourceStyles[lead.source].label}`}
              </p>
            </div>
            <button
              onClick={() => onToggleAi(lead.id)}
              className={`h-8 px-3 rounded-lg text-xs font-bold border transition cursor-pointer ${
                lead.aiPaused
                  ? "bg-teal-600 text-white border-teal-500 hover:bg-teal-500"
                  : "bg-black/5 dark:bg-white/5 premium-border text-[var(--text-body)] hover:bg-black/10 dark:hover:bg-white/10"
              }`}
              type="button"
            >
              {lead.aiPaused ? "Resume AI" : "Pause AI"}
            </button>
          </div>

          {/* Communication tabs */}
          <div className="flex premium-border-b shrink-0">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 pb-3 text-center text-xs font-bold tracking-wider uppercase border-b-2 transition ${
                activeTab === "chat" ? "border-teal-500 text-teal-500 dark:text-teal-400" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-title)]"
              }`}
              type="button"
            >
              Meta Chat Log ({lead.chatHistory?.length || 0})
            </button>
            {lead.callTranscript && (
              <button
                onClick={() => setActiveTab("call")}
                className={`flex-1 pb-3 text-center text-xs font-bold tracking-wider uppercase border-b-2 transition ${
                  activeTab === "call" ? "border-teal-500 text-teal-500 dark:text-teal-400" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-title)]"
                }`}
                type="button"
              >
                AI Phone Transcript ({lead.callTranscript.length})
              </button>
            )}
          </div>

          {/* Dynamic Tab Views */}
          <div className="min-h-[280px]">
            {activeTab === "chat" && (
              <div className="space-y-4">
                {/* Chat Message Window list */}
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {lead.chatHistory && lead.chatHistory.length > 0 ? (
                    lead.chatHistory.map((msg, index) => {
                      const isOutgoing = msg.sender === "AI" || msg.sender === "Agent";
                      return (
                        <div
                          key={index}
                          className={`flex flex-col max-w-[80%] ${isOutgoing ? "ml-auto items-end" : "mr-auto items-start"}`}
                        >
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-sm ${
                              isOutgoing
                                ? msg.sender === "AI"
                                  ? "bg-teal-600 text-white rounded-br-none"
                                  : "bg-violet-600 text-white rounded-br-none"
                                : "bg-black/5 dark:bg-white/5 text-[var(--text-body)] premium-border rounded-bl-none"
                            }`}
                          >
                            <p className="leading-relaxed">{msg.text}</p>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[var(--text-muted)] font-medium px-1">
                            <span>{msg.time}</span>
                            {msg.sender === "AI" && (
                              <span className="inline-flex items-center gap-0.5 text-teal-500 dark:text-teal-400 font-bold uppercase tracking-wider">
                                <Icon name="agent" className="h-2.5 w-2.5" /> AI
                              </span>
                            )}
                            {msg.sender === "Agent" && (
                              <span className="inline-flex items-center gap-0.5 text-violet-500 dark:text-violet-400 font-bold uppercase tracking-wider">
                                Agent
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-xs text-[var(--text-muted)] py-10 font-semibold">No Meta conversation history found.</p>
                  )}
                </div>

                {/* Chat message input bar */}
                <div className="flex gap-2 pt-3 premium-border-t">
                  <input
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a manual override message... (pauses bot)"
                    className="h-10 flex-1 rounded-lg premium-border bg-[var(--bg-inner-input)] text-[var(--text-title)] placeholder-[var(--text-muted)] outline-none transition focus:border-teal-500 focus:bg-[var(--bg-sidebar)]"
                  />
                  <button
                    onClick={handleSend}
                    className="h-10 w-10 shrink-0 grid place-items-center rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition active:bg-teal-700 cursor-pointer"
                    type="button"
                  >
                    <Icon name="search" className="h-4 w-4 rotate-45" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === "call" && lead.callTranscript && (
              <div className="space-y-5">
                {/* Simulated Audio Player Wave panel */}
                <div className="rounded-xl premium-border bg-[var(--bg-inner-input)] p-4 flex items-center gap-4">
                  <button
                    onClick={togglePlayAudio}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal-600 text-white hover:bg-teal-500 transition shadow-md shadow-teal-900/20 cursor-pointer"
                    type="button"
                  >
                    {isAudioPlaying ? (
                      <span className="flex items-center gap-1 justify-center">
                        <span className="h-3 w-0.5 bg-white animate-pulse" />
                        <span className="h-3 w-0.5 bg-white animate-pulse delay-75" />
                      </span>
                    ) : (
                      <span className="border-l-8 border-l-white border-y-4 border-y-transparent ml-1" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] font-bold mb-1 uppercase">
                      <span>AI Agent Call Audio</span>
                      <span>{isAudioPlaying ? `0:${String(Math.floor(audioProgress * 0.65)).padStart(2, '0')}` : "0:00"} / 1:05</span>
                    </div>
                    {/* Simulated Wavebar */}
                    <div className="h-3 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden flex items-center relative premium-border">
                      <div className="absolute inset-0 bg-teal-500/10 w-full" />
                      <div className="h-full bg-teal-600/30 transition-all duration-300 animate-pulse" style={{ width: `${audioProgress}%` }} />
                      <div className="flex gap-[2px] items-center justify-around w-full h-full px-2 pointer-events-none absolute inset-0">
                        {Array.from({ length: 40 }).map((_, i) => {
                          const heights = [40, 60, 20, 80, 50, 90, 30, 70, 40, 80, 20, 60];
                          const h = heights[i % heights.length];
                          return (
                            <span
                              key={i}
                              className={`w-[2px] rounded-full transition ${i / 40 * 100 < audioProgress ? "bg-teal-500 dark:bg-teal-400" : "bg-zinc-400 dark:bg-zinc-600"}`}
                              style={{ height: `${h}%` }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Call transcript dialog */}
                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                  {lead.callTranscript.map((turn, index) => {
                    const isAi = turn.sender === "AI";
                    return (
                      <div key={index} className="flex gap-3">
                        <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${
                          isAi ? "bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/20" : "bg-black/5 dark:bg-white/5 text-[var(--text-muted)]"
                        }`}>
                          {isAi ? "AI" : "CU"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
                              {isAi ? "AI Voice Assistant" : lead.name}
                            </p>
                            <span className="text-[9px] text-[var(--text-muted)]">{turn.time}</span>
                          </div>
                          <p className="text-xs text-[var(--text-body)] mt-0.5 leading-relaxed bg-black/5 dark:bg-white/5 p-2.5 rounded-lg premium-border">
                            {turn.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lead action drawer footer */}
        <div className="p-4 premium-border-t bg-black/5 dark:bg-black/10 light:bg-black/5 flex gap-3 shrink-0">
          <button
            onClick={() => onUpdateStatus(lead.id, "CONVERTED")}
            className="flex-1 h-10 rounded-lg bg-emerald-600 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition cursor-pointer"
            type="button"
          >
            Mark Converted (Won)
          </button>
          <button
            onClick={() => onUpdateStatus(lead.id, "LOST")}
            className="flex-1 h-10 rounded-lg bg-rose-600 text-xs font-bold text-white shadow-md hover:bg-rose-500 transition cursor-pointer"
            type="button"
          >
            Mark Lead Lost
          </button>
        </div>
      </div>
    </>
  );
}