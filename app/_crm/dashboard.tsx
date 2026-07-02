"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  activities,
  agentCards,
  apiBase,
  BackendLead,
  blankLeadForm,
  DashboardMetrics,
  demoLeads,
  fallbackMetrics,
  formatCurrency,
  formatNumber,
  integrations,
  Lead,
  LeadForm,
  LeadsResponse,
  LeadSource,
  LeadStatus,
  mapBackendLead,
  MetricsResponse,
  sourceStyles,
  statusStyles,
  Tab,
} from "./data";
import { Badge, Field, MetricCard, Shell } from "./components";
import { Icon } from "./icon";

export function CrmDashboard() {
  const [leads, setLeads] = useState<Lead[]>(demoLeads);
  const [metrics, setMetrics] = useState<DashboardMetrics>(fallbackMetrics);
  const [apiState, setApiState] = useState<"checking" | "connected" | "offline">("checking");
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | "ALL">("ALL");
  const [selectedSource, setSelectedSource] = useState<LeadSource | "ALL">("ALL");
  const [form, setForm] = useState<LeadForm>(blankLeadForm);
  const [syncMessage, setSyncMessage] = useState("Demo data active until the API responds.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<LeadStatus | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadCrmData() {
      try {
        const [leadResponse, metricsResponse] = await Promise.allSettled([
          fetch(`${apiBase}/leads?limit=50&sortBy=createdAt&sortOrder=desc`, { cache: "no-store" }),
          fetch(`${apiBase}/metrics/dashboard`, { cache: "no-store" }),
        ]);

        if (ignore) return;

        let connected = false;

        if (leadResponse.status === "fulfilled" && leadResponse.value.ok) {
          const payload = (await leadResponse.value.json()) as LeadsResponse;
          if (payload.success && payload.data && payload.data.length > 0) {
            setLeads(payload.data.map(mapBackendLead));
          }
          connected = true;
        }

        if (metricsResponse.status === "fulfilled" && metricsResponse.value.ok) {
          const payload = (await metricsResponse.value.json()) as MetricsResponse;
          if (payload.success && payload.data) {
            setMetrics(payload.data);
          }
          connected = true;
        }

        setApiState(connected ? "connected" : "offline");
        setSyncMessage(
          connected ? "Live API sync enabled." : "Demo data active. Start the backend to sync live leads."
        );
      } catch {
        if (!ignore) {
          setApiState("offline");
          setSyncMessage("Demo data active. Start the backend to sync live leads.");
        }
      }
    }

    void loadCrmData();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesQuery =
        !normalizedQuery ||
        [lead.name, lead.phone, lead.email, lead.area, lead.propertyType]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));
      const matchesStatus = selectedStatus === "ALL" || lead.status === selectedStatus;
      const matchesSource = selectedSource === "ALL" || lead.source === selectedSource;

      return matchesQuery && matchesStatus && matchesSource;
    });
  }, [leads, query, selectedSource, selectedStatus]);

  const leadTotals = useMemo(() => {
    const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);
    const convertedValue = leads
      .filter((lead) => lead.status === "CONVERTED")
      .reduce((sum, lead) => sum + lead.value, 0);
    const hotLeads = leads.filter((lead) => lead.score >= 80 && lead.status !== "LOST").length;
    const conversionRate = leads.length
      ? Math.round((leads.filter((lead) => lead.status === "CONVERTED").length / leads.length) * 100)
      : 0;

    return { totalValue, convertedValue, hotLeads, conversionRate };
  }, [leads]);

  const pipeline = useMemo(
    () =>
      (["NEW", "CONTACTED", "CONVERTED", "LOST"] as LeadStatus[]).map((status) => {
        const laneLeads = leads.filter((lead) => lead.status === status);
        const value = laneLeads.reduce((sum, lead) => sum + lead.value, 0);
        return { status, count: laneLeads.length, value, leads: laneLeads.slice(0, 2) };
      }),
    [leads]
  );

  const boardLanes = useMemo(
    () =>
      (["NEW", "CONTACTED", "CONVERTED", "LOST"] as LeadStatus[]).map((status) => {
        const laneLeads = filteredLeads.filter((lead) => lead.status === status);
        const value = laneLeads.reduce((sum, lead) => sum + lead.value, 0);
        return { status, leads: laneLeads, count: laneLeads.length, value };
      }),
    [filteredLeads]
  );

  const updateForm = <K extends keyof LeadForm>(field: K, value: LeadForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  async function moveLeadToStatus(leadId: string, status: LeadStatus) {
    const target = leads.find((lead) => lead.id === leadId);
    if (!target || target.status === status) return;

    // Optimistic move — mirror the create-lead handler: keep the local change
    // even when the backend is offline or rejects, but report it honestly.
    setLeads((current) => current.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)));

    try {
      const response = await fetch(`${apiBase}/leads/${leadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setApiState("connected");
        setSyncMessage(`${target.name} moved to ${statusStyles[status].label}.`);
      } else {
        setApiState("offline");
        setSyncMessage(`${target.name} moved locally. Backend rejected the status change.`);
      }
    } catch {
      setApiState("offline");
      setSyncMessage(`${target.name} moved locally. Backend is offline.`);
    }
  }

  function handleDrop(status: LeadStatus) {
    const id = draggedId;
    setDraggedId(null);
    setDragOverStatus(null);
    if (id) void moveLeadToStatus(id, status);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const optimisticLead: Lead = {
      id: `local-${Date.now()}`,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      source: form.source,
      status: form.status,
      value: Number.parseInt(form.value, 10) || 0,
      propertyType: form.propertyType.trim() || "Property",
      area: form.area.trim() || "Unassigned area",
      score: form.status === "NEW" ? 72 : 84,
      assignedTo: "Owner desk",
      aiAgent: form.source === "COLD_CALL" ? "Call AI" : "Message AI",
      lastActivity: "Custom lead added from CRM",
      nextAction: form.notes.trim() || "Run AI qualification sequence",
      createdAt: new Date().toISOString(),
      communicationCount: 0,
    };

    try {
      const response = await fetch(`${apiBase}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: optimisticLead.name,
          phone: optimisticLead.phone,
          email: optimisticLead.email || "",
          source: optimisticLead.source,
          status: optimisticLead.status,
        }),
      });

      if (response.ok) {
        const payload = (await response.json()) as { data?: BackendLead };
        const savedLead = payload.data ? mapBackendLead(payload.data, leads.length) : optimisticLead;
        setLeads((current) => [
          {
            ...optimisticLead,
            id: savedLead.id,
            createdAt: savedLead.createdAt,
            lastActivity: "Saved to backend CRM",
          },
          ...current,
        ]);
        setApiState("connected");
        setSyncMessage("Lead saved to backend CRM.");
      } else {
        setLeads((current) => [optimisticLead, ...current]);
        setApiState("offline");
        setSyncMessage("Lead added locally. Backend rejected the request.");
      }
    } catch {
      setLeads((current) => [optimisticLead, ...current]);
      setApiState("offline");
      setSyncMessage("Lead added locally. Backend is offline.");
    } finally {
      setForm(blankLeadForm());
      setIsSubmitting(false);
    }
  }

  const metricsSection = (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Open pipeline" value={formatCurrency(leadTotals.totalValue)} detail={`${leads.length} active records`} icon="target" tone="teal" />
          <MetricCard title="Closed value" value={formatCurrency(leadTotals.convertedValue)} detail={`${leadTotals.conversionRate}% conversion rate`} icon="check" tone="emerald" />
          <MetricCard title="Hot leads" value={formatNumber(leadTotals.hotLeads)} detail="Score above 80" icon="spark" tone="amber" />
          <MetricCard title="AI handled" value={formatNumber(metrics.week.messagesHandled + metrics.week.callsAttendedByAI)} detail="7 day conversations" icon="agent" tone="violet" />
        </section>
  );

  const pipelineSection = (
            <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm md:p-5">
              <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-950">Lead pipeline</h2>
                  <p className="text-sm text-zinc-500">{syncMessage}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["ALL", "NEW", "CONTACTED", "CONVERTED"] as (LeadStatus | "ALL")[]).map((status) => (
                    <button
                      key={status}
                      className={`h-9 rounded-lg px-3 text-sm font-medium ring-1 transition ${
                        selectedStatus === status
                          ? "bg-zinc-950 text-white ring-zinc-950"
                          : "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50"
                      }`}
                      type="button"
                      onClick={() => setSelectedStatus(status)}
                    >
                      {status === "ALL" ? "All" : statusStyles[status].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-4">
                {pipeline.map((lane) => (
                  <article key={lane.status} className={`min-h-[190px] rounded-lg border p-3 ${statusStyles[lane.status].lane}`}>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${statusStyles[lane.status].dot}`} />
                        <p className="text-sm font-semibold text-zinc-900">{statusStyles[lane.status].label}</p>
                      </div>
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200">
                        {lane.count}
                      </span>
                    </div>
                    <p className="mb-3 text-xl font-semibold tracking-tight text-zinc-950">{formatCurrency(lane.value)}</p>
                    <div className="space-y-2">
                      {lane.leads.map((lead) => (
                        <div key={lead.id} className="rounded-lg bg-white p-3 ring-1 ring-zinc-200">
                          <div className="flex items-start justify-between gap-2">
                            <p className="min-w-0 truncate text-sm font-medium text-zinc-900">{lead.name}</p>
                            <span className="text-xs font-semibold text-teal-700">{lead.score}</span>
                          </div>
                          <p className="mt-1 truncate text-xs text-zinc-500">{lead.area}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
  );

  const boardSection = (
            <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm md:p-5">
              <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-950">Lead board</h2>
                  <p className="text-sm text-zinc-500">Drag a lead between lanes to update its stage. {syncMessage}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-[1fr_160px] xl:w-[520px]">
                  <label className="relative block">
                    <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                      placeholder="Search leads"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                  </label>
                  <select
                    className="h-11 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
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
                      className={`flex min-h-[260px] flex-col rounded-lg border p-3 transition ${style.lane} ${
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
                          <p className="text-sm font-semibold text-zinc-900">{style.label}</p>
                        </div>
                        <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-zinc-600 ring-1 ring-zinc-200">
                          {lane.count}
                        </span>
                      </div>
                      <p className="mb-3 text-sm font-semibold tracking-tight text-zinc-700">{formatCurrency(lane.value)}</p>

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
                            className={`cursor-grab rounded-lg bg-white p-3 ring-1 ring-zinc-200 transition active:cursor-grabbing hover:ring-zinc-300 ${
                              draggedId === lead.id ? "opacity-50" : ""
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="min-w-0 truncate text-sm font-medium text-zinc-900">{lead.name}</p>
                              <span className="shrink-0 text-xs font-semibold text-teal-700">{lead.score}</span>
                            </div>
                            <p className="mt-1 truncate text-xs text-zinc-500">
                              {lead.propertyType} · {lead.area}
                            </p>
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <Badge className={sourceStyles[lead.source].badge}>{sourceStyles[lead.source].label}</Badge>
                              <span className="text-xs font-semibold text-zinc-700">{formatCurrency(lead.value)}</span>
                            </div>
                          </article>
                        ))}
                        {lane.count === 0 && (
                          <p className="rounded-lg border border-dashed border-zinc-300 px-3 py-6 text-center text-xs text-zinc-400">
                            Drop leads here
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
  );

  const leadDeskSection = (
            <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm md:p-5">
              <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-950">Lead desk</h2>
                  <p className="text-sm text-zinc-500">{filteredLeads.length} matching leads</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-[1fr_160px_160px] xl:w-[680px]">
                  <label className="relative block">
                    <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    <input
                      className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                      placeholder="Search leads"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                    />
                  </label>
                  <select
                    className="h-11 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
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
                  <button
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm font-medium text-zinc-700 transition hover:bg-white"
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setSelectedSource("ALL");
                      setSelectedStatus("ALL");
                    }}
                  >
                    <Icon name="filter" />
                    Reset
                  </button>
                </div>
              </div>

              <div className="hidden overflow-hidden rounded-lg border border-zinc-200 xl:block">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-zinc-50 text-xs uppercase tracking-[0.12em] text-zinc-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Lead</th>
                      <th className="px-4 py-3 font-semibold">Requirement</th>
                      <th className="px-4 py-3 font-semibold">Source</th>
                      <th className="px-4 py-3 font-semibold">Agent</th>
                      <th className="px-4 py-3 font-semibold">Value</th>
                      <th className="px-4 py-3 font-semibold">Next action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 bg-white">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="transition hover:bg-zinc-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-zinc-100 text-sm font-semibold text-zinc-700">
                              {lead.name
                                .split(" ")
                                .map((item) => item[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-zinc-950">{lead.name}</p>
                              <p className="truncate text-xs text-zinc-500">{lead.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-medium text-zinc-900">{lead.propertyType}</p>
                          <p className="text-xs text-zinc-500">{lead.area}</p>
                        </td>
                        <td className="px-4 py-4">
                          <Badge className={sourceStyles[lead.source].badge}>{sourceStyles[lead.source].label}</Badge>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-medium text-zinc-900">{lead.aiAgent}</p>
                          <p className="text-xs text-zinc-500">{lead.communicationCount || 0} touches</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-zinc-950">{formatCurrency(lead.value)}</p>
                          <div className="mt-1 h-1.5 w-24 rounded-full bg-zinc-100">
                            <div className="h-1.5 rounded-full bg-teal-500" style={{ width: `${Math.min(100, lead.score)}%` }} />
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="max-w-[280px] truncate text-zinc-700">{lead.nextAction}</p>
                          <Badge className={statusStyles[lead.status].badge}>{statusStyles[lead.status].label}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 xl:hidden">
                {filteredLeads.map((lead) => (
                  <article key={lead.id} className="rounded-lg border border-zinc-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-950">{lead.name}</p>
                        <p className="text-sm text-zinc-500">{lead.propertyType} in {lead.area}</p>
                      </div>
                      <Badge className={statusStyles[lead.status].badge}>{statusStyles[lead.status].label}</Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-zinc-500">Value</p>
                        <p className="font-semibold">{formatCurrency(lead.value)}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Agent</p>
                        <p className="font-semibold">{lead.aiAgent}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
  );

  const addLeadSection = (
            <section id="add-lead" className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm md:p-5">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-950">Add custom lead</h2>
                  <p className="text-sm text-zinc-500">Manual entries join the same pipeline.</p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-zinc-950 text-white">
                  <Icon name="add" />
                </div>
              </div>

              <form className="space-y-3" onSubmit={handleSubmit}>
                <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
                  <Field label="Full name">
                    <input
                      required
                      className="field-input"
                      value={form.name}
                      onChange={(event) => updateForm("name", event.target.value)}
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      required
                      className="field-input"
                      placeholder="555-018-7830"
                      value={form.phone}
                      onChange={(event) => updateForm("phone", event.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Email">
                  <input
                    className="field-input"
                    type="email"
                    value={form.email}
                    onChange={(event) => updateForm("email", event.target.value)}
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Source">
                    <select
                      className="field-input"
                      value={form.source}
                      onChange={(event) => updateForm("source", event.target.value as LeadSource)}
                    >
                      {Object.entries(sourceStyles).map(([source, meta]) => (
                        <option key={source} value={source}>
                          {meta.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Status">
                    <select
                      className="field-input"
                      value={form.status}
                      onChange={(event) => updateForm("status", event.target.value as LeadStatus)}
                    >
                      {Object.entries(statusStyles).map(([status, meta]) => (
                        <option key={status} value={status}>
                          {meta.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Budget value">
                    <input
                      className="field-input"
                      inputMode="numeric"
                      value={form.value}
                      onChange={(event) => updateForm("value", event.target.value)}
                    />
                  </Field>
                  <Field label="Property type">
                    <input
                      className="field-input"
                      value={form.propertyType}
                      onChange={(event) => updateForm("propertyType", event.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Area">
                  <input
                    className="field-input"
                    value={form.area}
                    onChange={(event) => updateForm("area", event.target.value)}
                  />
                </Field>
                <Field label="Next action">
                  <textarea
                    className="field-input min-h-20 resize-none py-3"
                    value={form.notes}
                    onChange={(event) => updateForm("notes", event.target.value)}
                  />
                </Field>
                <button
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
                  disabled={isSubmitting || !form.name.trim() || !form.phone.trim()}
                  type="submit"
                >
                  <Icon name="add" />
                  {isSubmitting ? "Saving" : "Create lead"}
                </button>
              </form>
            </section>
  );

  const aiAgentsSection = (
            <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-950">AI agent work</h2>
                <Icon name="agent" className="h-5 w-5 text-zinc-500" />
              </div>
              <div className="space-y-3">
                {agentCards.map((agent) => (
                  <article key={agent.name} className="rounded-lg border border-zinc-200 p-4">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white ${agent.accent}`}>
                          <Icon name={agent.icon} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-950">{agent.name}</p>
                          <p className="truncate text-sm text-zinc-500">{agent.channels}</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-700 ring-emerald-200">{agent.status}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-zinc-500">Handled</p>
                        <p className="text-lg font-semibold text-zinc-950">{agent.handled}</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Conv.</p>
                        <p className="text-lg font-semibold text-zinc-950">{agent.conversion}%</p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Queue</p>
                        <p className="text-lg font-semibold text-zinc-950">{agent.queue}</p>
                      </div>
                    </div>
                    <div className="mt-4 rounded-lg bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-600 ring-1 ring-zinc-200">
                      {agent.endpoint}
                    </div>
                  </article>
                ))}
              </div>
            </section>
  );

  const activitySection = (
            <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-950">Activity stream</h2>
                <Icon name="clock" className="h-5 w-5 text-zinc-500" />
              </div>
              <div className="space-y-4">
                {activities.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={`mt-1 h-2.5 w-2.5 rounded-full ${item.tone}`} />
                      <span className="mt-2 h-full w-px bg-zinc-200" />
                    </div>
                    <div className="min-w-0 pb-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                        <span>{item.time}</span>
                        <span>{item.agent}</span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-800">{item.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
  );

  const integrationsSection = (
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-950">Integration control</h2>
              <p className="text-sm text-zinc-500">Webhook base: {apiBase}</p>
            </div>
            <Badge className="bg-zinc-100 text-zinc-700 ring-zinc-200">n8n ready</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {integrations.map((integration) => (
              <article key={integration.name} className="rounded-lg border border-zinc-200 p-4">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
                  <Icon name={integration.icon} />
                </div>
                <p className="font-semibold text-zinc-950">{integration.name}</p>
                <p className="mt-1 text-sm text-zinc-500">{integration.detail}</p>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {integration.state}
                </div>
              </article>
            ))}
          </div>
        </section>
  );

  return (
    <Shell apiState={apiState} metrics={metrics} activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="space-y-6 px-4 py-6 md:px-8">
        {activeTab === "dashboard" && (
          <>
            {metricsSection}
            {pipelineSection}
            {activitySection}
          </>
        )}
        {activeTab === "leads" && leadDeskSection}
        {activeTab === "board" && boardSection}
        {activeTab === "create" && (
          <div className="mx-auto w-full max-w-2xl">{addLeadSection}</div>
        )}
        {activeTab === "agents" && aiAgentsSection}
        {activeTab === "activity" && activitySection}
        {activeTab === "integrations" && integrationsSection}
      </div>
    </Shell>
  );
}
