"use client";

import { Badge, Icon } from "../../_crm/components";
import { integrations } from "../../_crm/data";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6 px-4 py-6 md:px-8 animate-fade-in">
      <section className="rounded-xl premium-border bg-[var(--bg-card)] p-5 shadow-lg backdrop-blur transition-colors duration-200">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between premium-border-b pb-4">
          <div>
            <h2 className="text-sm font-bold text-[var(--text-title)] uppercase tracking-wider">Integration Status</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Meta API access token & Webhook receiver URLs</p>
          </div>
          <Badge className="bg-teal-950/40 text-teal-400 ring-teal-500/20">System Live</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {integrations.map((integration) => (
            <article key={integration.name} className="rounded-xl premium-border bg-[var(--bg-lane)] p-4 flex flex-col justify-between min-h-[160px] transition-colors duration-200">
              <div>
                <div className="mb-3.5 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--bg-badge-neutral)] text-[var(--text-muted)] premium-border">
                  <Icon name={integration.icon} className="h-4.5 w-4.5" />
                </div>
                <p className="font-bold text-[var(--text-title)] text-xs uppercase tracking-wider">{integration.name}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)] font-semibold truncate leading-relaxed">{integration.detail}</p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                {integration.state}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
