"use client";

import { useState, useMemo } from "react";
import { useCrm } from "../../_crm/context";
import { Badge, Icon } from "../../_crm/components";
import { sourceStyles, statusStyles, formatCurrency, LeadSource, LeadStatus } from "../../_crm/data";

export default function BoardPage() {
  const { leads, setSelectedLead, setIsDrawerOpen, moveLeadToStatus } = useCrm();
  const [query, setQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<LeadSource | "ALL">("ALL");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<LeadStatus | null>(null);

  const filteredLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesQuery =
        !normalizedQuery ||
        [lead.name, lead.phone, lead.email, lead.area, lead.propertyType]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));
      const matchesSource = selectedSource === "ALL" || lead.source === selectedSource;

      return matchesQuery && matchesSource;
    });
  }, [leads, query, selectedSource]);

  const boardLanes = useMemo(
    () =>
      (["NEW", "CONTACTED", "CONVERTED", "LOST"] as LeadStatus[]).map((status) => {
        const laneLeads = filteredLeads.filter((lead) => lead.status === status);
        const value = laneLeads.reduce((sum, lead) => sum + lead.value, 0);
        return { status, leads: laneLeads, count: laneLeads.length, value };
      }),
    [filteredLeads]
  );

  function handleDrop(status: LeadStatus) {
    const id = draggedId;
    setDraggedId(null);
    setDragOverStatus(null);
    if (id) void moveLeadToStatus(id, status);
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 animate-fade-in">
      <section className="rounded-xl premium-border bg-[var(--bg-card)] p-5 shadow-md backdrop-blur transition-colors duration-200">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between premium-border-b pb-4">
          <div>
            <h2 className="text-sm font-bold text-[var(--text-title)] uppercase tracking-wider">Kanban Pipeline</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Drag card to update stage. Click to open details.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_160px] xl:w-[520px]">
            <label className="relative block">
              <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                className="h-10 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] pl-9 pr-3 text-xs text-[var(--text-title)] placeholder-[var(--text-muted)] outline-none transition focus:border-teal-500 focus:bg-[var(--bg-sidebar)]"
                placeholder="Search leads..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <select
              className="h-10 rounded-lg premium-border bg-[var(--bg-inner-input)] px-3 text-xs font-semibold text-[var(--text-title)] outline-none transition focus:border-teal-500 focus:bg-[var(--bg-sidebar)]"
              value={selectedSource}
              onChange={(event) => setSelectedSource(event.target.value as LeadSource | "ALL")}
            >
              <option value="ALL">All sources</option>
              {Object.entries(sourceStyles).map(([source, meta]) => (
                <option key={source} value={source}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-4">
          {boardLanes.map((lane) => {
            const style = statusStyles[lane.status];
            const isTarget = dragOverStatus === lane.status;
            return (
              <div
                key={lane.status}
                className={`flex min-h-[400px] flex-col rounded-xl border p-4 transition ${style.lane} bg-[var(--bg-lane)] premium-border ${
                  isTarget ? "ring-2 ring-teal-500/60" : ""
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  if (dragOverStatus !== lane.status) setDragOverStatus(lane.status);
                }}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                    setDragOverStatus((current) => (current === lane.status ? null : current));
                  }
                }}
                onDrop={() => handleDrop(lane.status)}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                    <p className="text-xs font-bold text-[var(--text-title)] uppercase tracking-wider">{style.label}</p>
                  </div>
                  <span className="rounded-md bg-[var(--bg-badge-neutral)] px-2 py-0.5 text-xs font-semibold text-[var(--text-muted)] premium-border">
                    {lane.count}
                  </span>
                </div>
                <p className="mb-4 text-sm font-bold text-[var(--text-muted)] font-mono">{formatCurrency(lane.value)}</p>

                <div className="flex-1 space-y-2">
                  {lane.leads.map((lead) => (
                    <article
                      key={lead.id}
                      draggable
                      onDragStart={() => setDraggedId(lead.id)}
                      onDragEnd={() => {
                        setDraggedId(null);
                        setDragOverStatus(null);
                      }}
                      onClick={() => {
                        setSelectedLead(lead);
                        setIsDrawerOpen(true);
                      }}
                      className={`cursor-grab rounded-xl bg-[var(--bg-sidebar)] p-3.5 premium-border hover:border-teal-500/30 transition hover:bg-[var(--bg-card-hover)] active:cursor-grabbing select-none ${
                        draggedId === lead.id ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 truncate text-xs font-bold text-[var(--text-title)]">{lead.name}</p>
                        <span className="shrink-0 text-[10px] font-bold text-teal-400">{lead.score}</span>
                      </div>
                      <p className="mt-1.5 truncate text-[10px] text-[var(--text-muted)] font-medium">
                        {lead.propertyType} · {lead.area}
                      </p>
                      <div className="mt-3.5 flex items-center justify-between gap-2">
                        <Badge className={sourceStyles[lead.source].badge}>{sourceStyles[lead.source].label}</Badge>
                        <span className="text-xs font-bold text-[var(--text-body)] font-mono">{formatCurrency(lead.value)}</span>
                      </div>
                    </article>
                  ))}
                  {lane.count === 0 && (
                    <p className="rounded-xl border border-dashed premium-border px-3 py-10 text-center text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                      Drop leads here
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
