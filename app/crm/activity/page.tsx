"use client";

import { useCrm } from "../../_crm/context";
import { Icon } from "../../_crm/components";

export default function ActivityPage() {
  const { activities } = useCrm();

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 animate-fade-in">
      <section className="rounded-xl premium-border bg-[var(--bg-card)] p-5 shadow-lg backdrop-blur transition-colors duration-200">
        <div className="mb-5 flex items-center justify-between premium-border-b pb-4">
          <div>
            <h2 className="text-sm font-bold text-[var(--text-title)] uppercase tracking-wider">AI Bot Activity Stream</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Real-time trace logs of AI call and text responders</p>
          </div>
          <Icon name="clock" className="h-5 w-5 text-teal-400" />
        </div>
        <div className="space-y-4">
          {activities.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className={`mt-1.5 h-2 w-2 rounded-full ${item.tone || "bg-teal-500"}`} />
                <span className="mt-2 h-full w-px premium-border-l" />
              </div>
              <div className="min-w-0 pb-3 premium-border-b w-full">
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                  <span>{item.time}</span>
                  <span className="text-teal-500 dark:text-teal-400">{item.agent}</span>
                </div>
                <p className="mt-1 text-sm text-[var(--text-body)] leading-relaxed font-medium">{item.event}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
