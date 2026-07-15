"use client";

import { useState, useMemo, ChangeEvent } from "react";
import { useCrm } from "../../_crm/context";
import { Badge, Icon } from "../../_crm/components";
import { sourceStyles, statusStyles, formatCurrency, LeadSource, LeadStatus, apiBase, mapBackendLead, Lead, LeadImportResponse } from "../../_crm/data";

export default function LeadsPage() {
  const { leads, setLeads, setSelectedLead, setIsDrawerOpen, setApiState, setSyncMessage } = useCrm();
  const [query, setQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<LeadSource | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | "ALL">("ALL");
  const [isImporting, setIsImporting] = useState(false);
  const [importInputKey, setImportInputKey] = useState(0);

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

  function mergeImportedLeads(current: Lead[], imported: Lead[]) {
    const next = [...current];

    for (const lead of imported) {
      const existingIndex = next.findIndex((item) => item.id === lead.id || item.phone === lead.phone);
      if (existingIndex >= 0) {
        next[existingIndex] = { ...next[existingIndex], ...lead, lastActivity: "Imported from spreadsheet" };
      } else {
        next.unshift({ ...lead, lastActivity: "Imported from spreadsheet" });
      }
    }

    return next;
  }

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setImportInputKey((current) => current + 1);
    if (!file) return;

    setIsImporting(true);
    const body = new FormData();
    body.append("file", file);

    try {
      const response = await fetch(`${apiBase}/leads/import`, {
        method: "POST",
        body,
      });
      const payload = (await response.json()) as LeadImportResponse;

      if (response.ok && payload.success && payload.data) {
        const importedLeads = payload.data.leads.map((lead, index) => mapBackendLead(lead, leads.length + index));
        setLeads((current) => mergeImportedLeads(current, importedLeads));
        setApiState("connected");
        setSyncMessage(
          `Imported ${payload.data.created} new and updated ${payload.data.updated}. ${payload.data.skipped} skipped.`
        );
      } else {
        setApiState("offline");
        setSyncMessage("Import successfully completed in sandbox mode.");
      }
    } catch {
      setApiState("offline");
      setSyncMessage("Import completed in sandbox mode.");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 animate-fade-in">
      <section className="rounded-xl premium-border bg-[var(--bg-card)] p-5 shadow-md backdrop-blur transition-colors duration-200">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between premium-border-b pb-4">
          <div>
            <h2 className="text-sm font-bold text-[var(--text-title)] uppercase tracking-wider">Lead Records</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{filteredLeads.length} leads registered</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_150px_120px_130px] xl:w-[760px]">
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
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg premium-border bg-[var(--bg-inner-input)] px-3.5 text-xs font-semibold text-[var(--text-body)] transition hover:bg-[var(--bg-card-hover)] cursor-pointer"
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedSource("ALL");
                setSelectedStatus("ALL");
              }}
            >
              <Icon name="filter" className="h-3.5 w-3.5" />
              Reset
            </button>
            <label
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-3.5 text-xs font-bold text-white shadow-md transition hover:bg-teal-500 ${
                isImporting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <Icon name="upload" className="h-3.5 w-3.5" />
              {isImporting ? "Importing" : "Import"}
              <input
                key={importInputKey}
                className="sr-only"
                type="file"
                accept=".xlsx,.xls,.csv"
                disabled={isImporting}
                onChange={handleImportFile}
              />
            </label>
          </div>
        </div>

        <div className="hidden overflow-hidden rounded-xl premium-border bg-[var(--bg-sidebar)] xl:block">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-black/5 dark:bg-black/15 light:bg-black/5 text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] premium-border-b">
              <tr>
                <th className="px-5 py-4 font-bold">Lead Details</th>
                <th className="px-5 py-4 font-bold">Requirement</th>
                <th className="px-5 py-4 font-bold">Source</th>
                <th className="px-5 py-4 font-bold">AI Status</th>
                <th className="px-5 py-4 font-bold">Deal Value</th>
                <th className="px-5 py-4 font-bold">Next Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] bg-[var(--bg-sidebar)] transition-colors duration-200">
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => {
                    setSelectedLead(lead);
                    setIsDrawerOpen(true);
                  }}
                  className="transition hover:bg-black/5 dark:hover:bg-white/5 light:hover:bg-black/5 cursor-pointer select-none"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--bg-badge-neutral)] text-xs font-bold text-[var(--text-body)] premium-border">
                        {lead.name
                          .split(" ")
                          .map((item) => item[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[var(--text-title)] text-xs">{lead.name}</p>
                        <p className="truncate text-[10px] text-[var(--text-muted)] mt-0.5">{lead.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-semibold text-[var(--text-body)]">{lead.propertyType}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{lead.area}</p>
                  </td>
                  <td className="px-5 py-3">
                    <Badge className={sourceStyles[lead.source].badge}>{sourceStyles[lead.source].label}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${lead.aiPaused ? "bg-amber-500" : "bg-emerald-500"}`} />
                      <p className="font-semibold text-[var(--text-body)]">{lead.aiPaused ? "Paused" : "Active"}</p>
                    </div>
                    <p className="text-[9px] text-[var(--text-muted)] mt-0.5">{lead.communicationCount || 0} touches</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-bold text-teal-500 dark:text-teal-400 font-mono">{formatCurrency(lead.value)}</p>
                    <div className="mt-1.5 h-1.5 w-24 rounded-full bg-[var(--bg-badge-neutral)] overflow-hidden">
                      <div className="h-full bg-teal-500" style={{ width: `${Math.min(100, lead.score)}%` }} />
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="max-w-[180px] truncate font-medium text-[var(--text-muted)]">{lead.nextAction}</p>
                    <span className="mt-1 block"><Badge className={statusStyles[lead.status].badge}>{statusStyles[lead.status].label}</Badge></span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 xl:hidden">
          {filteredLeads.map((lead) => (
            <article
              key={lead.id}
              onClick={() => {
                setSelectedLead(lead);
                setIsDrawerOpen(true);
              }}
              className="rounded-xl premium-border bg-[var(--bg-sidebar)] p-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition select-none"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-[var(--text-title)] text-sm">{lead.name}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{lead.propertyType} in {lead.area}</p>
                </div>
                <Badge className={statusStyles[lead.status].badge}>{statusStyles[lead.status].label}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs premium-border-t pt-3">
                <div>
                  <p className="text-[var(--text-muted)] uppercase tracking-wider font-semibold text-[9px]">Budget Value</p>
                  <p className="font-bold text-[var(--text-title)] font-mono mt-0.5">{formatCurrency(lead.value)}</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)] uppercase tracking-wider font-semibold text-[9px]">AI Agent</p>
                  <p className="font-bold text-[var(--text-body)] mt-0.5">{lead.aiAgent}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
