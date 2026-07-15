"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  activities as initialActivities,
  agentCards as initialAgentCards,
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
  LeadImportResponse,
  LeadsResponse,
  LeadSource,
  LeadStatus,
  mapBackendLead,
  MetricsResponse,
  sourceStyles,
  statusStyles,
  Tab,
} from "./data";
import { Badge, Field, MetricCard, Shell, FunnelChart, LeadDetailsDrawer, RevenueLineChart } from "./components";
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
  const [syncMessage, setSyncMessage] = useState("Sandbox mode active. Start the backend to sync live data.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importInputKey, setImportInputKey] = useState(0);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<LeadStatus | null>(null);

  // Theme management state
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("nexa_theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.className = savedTheme;
    } else {
      document.documentElement.className = "dark";
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("nexa_theme", nextTheme);
    document.documentElement.className = nextTheme;
  };

  // Lead details side drawer states
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // AI Agent configs state
  const [botConfigs, setBotConfigs] = useState({
    metaPrompt: "You are NexaEstate's AI assistant. Introduce yourself, qualify their budget, location, and property type preference politely, then hand over to an agent.",
    callPrompt: "You are Bella, a friendly AI real estate agent. Call the customer, confirm their shop/villa inquiry details, and schedule a viewing slot for this weekend.",
    voice: "Bella (Female)",
    channels: {
      whatsapp: true,
      instagram: true,
      facebook: true,
    }
  });

  const [activities, setActivities] = useState(initialActivities);

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
          connected ? "Live API sync enabled." : "Sandbox active. Start the backend database to sync live leads."
        );
      } catch {
        if (!ignore) {
          setApiState("offline");
          setSyncMessage("Sandbox active. Start the backend database to sync live leads.");
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
        return { status, count: laneLeads.length, value, leads: laneLeads.slice(0, 3) };
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

    setLeads((current) => current.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)));

    // Track status change in activity stream
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setActivities(prev => [
      {
        id: `act-${Date.now()}`,
        time: timestamp,
        agent: "System",
        event: `${target.name} moved stage to ${statusStyles[status].label}`,
        tone: status === "CONVERTED" ? "bg-emerald-500" : status === "LOST" ? "bg-rose-500" : "bg-violet-500"
      },
      ...prev
    ]);

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
        setSyncMessage(`${target.name} moved locally (Sandbox).`);
      }
    } catch {
      setApiState("offline");
      setSyncMessage(`${target.name} moved locally (Sandbox).`);
    }
  }

  // Handle drawer communications
  const handleUpdateStatus = (leadId: string, status: LeadStatus) => {
    void moveLeadToStatus(leadId, status);
    setSelectedLead((prev) => (prev && prev.id === leadId ? { ...prev, status } : prev));
  };

  const handleSendMessage = (leadId: string, text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLeads((current) =>
      current.map((lead) => {
        if (lead.id === leadId) {
          const nextHistory = [
            ...(lead.chatHistory || []),
            { sender: "Agent" as const, text, time }
          ];
          return {
            ...lead,
            chatHistory: nextHistory,
            aiPaused: true,
            communicationCount: (lead.communicationCount || 0) + 1,
            lastActivity: `Agent sent reply: "${text}"`,
          };
        }
        return lead;
      })
    );

    setSelectedLead((prev) => {
      if (prev && prev.id === leadId) {
        const nextHistory = [
          ...(prev.chatHistory || []),
          { sender: "Agent" as const, text, time }
        ];
        return {
          ...prev,
          chatHistory: nextHistory,
          aiPaused: true,
          communicationCount: (prev.communicationCount || 0) + 1,
          lastActivity: `Agent sent reply: "${text}"`,
        };
      }
      return prev;
    });

    // Append to live activity ticker
    setActivities(prev => [
      {
        id: `act-${Date.now()}`,
        time,
        agent: "Sales Agent",
        event: `Manually texted: "${text.substring(0, 30)}..." (AI paused)`,
        tone: "bg-violet-500"
      },
      ...prev
    ]);
  };

  const handleToggleAi = (leadId: string) => {
    setLeads((current) =>
      current.map((lead) =>
        lead.id === leadId ? { ...lead, aiPaused: !lead.aiPaused } : lead
      )
    );
    setSelectedLead((prev) =>
      prev && prev.id === leadId ? { ...prev, aiPaused: !prev.aiPaused } : prev
    );

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const target = leads.find((l) => l.id === leadId);
    if (target) {
      setActivities(prev => [
        {
          id: `act-${Date.now()}`,
          time,
          agent: "System",
          event: `AI Auto-Responder for ${target.name} turned ${!target.aiPaused ? "OFF" : "ON"}`,
          tone: !target.aiPaused ? "bg-amber-500" : "bg-emerald-500"
        },
        ...prev
      ]);
    }
  };

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
      aiPaused: false,
      chatHistory: [
        { sender: "AI", text: "Hello! Thank you for inquiring. We have logged your request and our AI will qualify your requirements.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]
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
        setSyncMessage("Lead added locally (Sandbox).");
      }
    } catch {
      setLeads((current) => [optimisticLead, ...current]);
      setApiState("offline");
      setSyncMessage("Lead added locally (Sandbox).");
    } finally {
      setForm(blankLeadForm());
      setIsSubmitting(false);
      setActiveTab("leads");
    }
  }

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

  // Dribbble Style 3-card top metrics row
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

  // Dribbble Recent Message Board
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

      <button
        onClick={() => setActiveTab("activity")}
        className="mt-4 flex h-9 items-center justify-center gap-1.5 w-full rounded-xl bg-violet-600/10 hover:bg-violet-600/20 text-xs font-bold text-violet-600 transition cursor-pointer"
      >
        View all messages ↗
      </button>
    </article>
  );

  // Bottom Row: Active Property Table list
  const activePropertySection = (
    <section className="rounded-xl premium-border bg-[var(--bg-card)] p-5 shadow-sm backdrop-blur transition-colors duration-200">
      <div className="mb-5 flex items-center justify-between premium-border-b pb-4">
        <div>
          <h3 className="text-xs font-bold text-[var(--text-title)] uppercase tracking-wider">Active Property</h3>
          <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">Overview of July 15-July 31</p>
        </div>
        <button
          onClick={() => setActiveTab("board")}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl premium-border bg-[var(--bg-inner-input)] px-4 text-xs font-bold text-[var(--text-body)] hover:bg-[var(--bg-card-hover)] transition cursor-pointer"
        >
          <Icon name="filter" className="h-3.5 w-3.5" />
          Filter
        </button>
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
                    {/* Render the generated image opulence_oasis.png */}
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
                    {/* Render the generated image regal_retreat.png */}
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

  const boardSection = (
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
  );

  const leadDeskSection = (
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
  );

  const addLeadSection = (
    <section id="add-lead" className="rounded-xl premium-border bg-[var(--bg-card)] p-5 shadow-md backdrop-blur transition-colors duration-200">
      <div className="mb-5 flex items-center justify-between gap-3 premium-border-b pb-4">
        <div>
          <h2 className="text-sm font-bold text-[var(--text-title)] uppercase tracking-wider">Add custom lead</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Manual entries are qualified by AI sequence.</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-600 text-white shadow-md">
          <Icon name="add" />
        </div>
      </div>

      <form className="space-y-4 text-xs font-semibold" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <input
              required
              className="h-10 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] px-3.5 text-sm text-[var(--text-title)] outline-none focus:border-teal-500 transition-colors duration-200"
              value={form.name}
              onChange={(event) => updateForm("name", event.target.value)}
            />
          </Field>
          <Field label="Phone number">
            <input
              required
              className="h-10 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] px-3.5 text-sm text-[var(--text-title)] outline-none focus:border-teal-500 transition-colors duration-200"
              placeholder="555-018-7830"
              value={form.phone}
              onChange={(event) => updateForm("phone", event.target.value)}
            />
          </Field>
        </div>
        <Field label="Email">
          <input
            className="h-10 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] px-3.5 text-sm text-[var(--text-title)] outline-none focus:border-teal-500 transition-colors duration-200"
            type="email"
            placeholder="example@nexaestate.local"
            value={form.email}
            onChange={(event) => updateForm("email", event.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Lead Source">
            <select
              className="h-10 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] px-3 text-xs font-semibold text-[var(--text-title)] outline-none focus:border-teal-500 transition-colors duration-200"
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
          <Field label="Pipeline Stage">
            <select
              className="h-10 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] px-3 text-xs font-semibold text-[var(--text-title)] outline-none focus:border-teal-500 transition-colors duration-200"
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
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Budget value (USD)">
            <input
              className="h-10 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] px-3.5 text-sm text-[var(--text-title)] outline-none focus:border-teal-500 transition-colors duration-200"
              inputMode="numeric"
              value={form.value}
              onChange={(event) => updateForm("value", event.target.value)}
            />
          </Field>
          <Field label="Property Inquiry type">
            <input
              className="h-10 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] px-3.5 text-sm text-[var(--text-title)] outline-none focus:border-teal-500 transition-colors duration-200"
              value={form.propertyType}
              onChange={(event) => updateForm("propertyType", event.target.value)}
            />
          </Field>
        </div>
        <Field label="Property location area">
          <input
            className="h-10 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] px-3.5 text-sm text-[var(--text-title)] outline-none focus:border-teal-500 transition-colors duration-200"
            value={form.area}
            onChange={(event) => updateForm("area", event.target.value)}
          />
        </Field>
        <Field label="Lead requirements & notes">
          <textarea
            className="h-20 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] px-3.5 py-2.5 text-sm text-[var(--text-title)] outline-none focus:border-teal-500 resize-none transition-colors duration-200"
            value={form.notes}
            onChange={(event) => updateForm("notes", event.target.value)}
          />
        </Field>
        <button
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-teal-600 text-sm font-semibold text-white shadow-md transition hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          disabled={isSubmitting || !form.name.trim() || !form.phone.trim()}
          type="submit"
        >
          <Icon name="add" />
          {isSubmitting ? "Creating..." : "Add Lead to CRM"}
        </button>
      </form>
    </section>
  );

  const aiAgentsSection = (
    <section className="space-y-6 animate-fade-in">
      {/* Bot Customizer Controls Panel */}
      <div className="rounded-xl premium-border bg-[var(--bg-card)] p-5 shadow-lg backdrop-blur transition-colors duration-200">
        <div className="mb-4 flex items-center justify-between premium-border-b pb-3">
          <div>
            <h2 className="text-sm font-bold text-[var(--text-title)] uppercase tracking-wider">AI Responder Configuration</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Define prompts and voice profiles for autonomous bots</p>
          </div>
          <Icon name="agent" className="h-5 w-5 text-teal-400" />
        </div>

        <div className="space-y-4 text-xs font-semibold">
          <div>
            <Field label="Meta Chat Bot System Prompt (WhatsApp, Instagram, Facebook)">
              <textarea
                value={botConfigs.metaPrompt}
                onChange={(e) => setBotConfigs(prev => ({ ...prev, metaPrompt: e.target.value }))}
                className="mt-1 h-20 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] px-3.5 py-2 text-xs text-[var(--text-title)] outline-none focus:border-teal-500 resize-none font-medium leading-relaxed transition-colors duration-200"
              />
            </Field>
          </div>

          <div>
            <Field label="AI Phone Agent Callback Prompt Instruction">
              <textarea
                value={botConfigs.callPrompt}
                onChange={(e) => setBotConfigs(prev => ({ ...prev, callPrompt: e.target.value }))}
                className="mt-1 h-20 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] px-3.5 py-2 text-xs text-[var(--text-title)] outline-none focus:border-teal-500 resize-none font-medium leading-relaxed transition-colors duration-200"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone Agent Voice Model">
              <select
                value={botConfigs.voice}
                onChange={(e) => setBotConfigs(prev => ({ ...prev, voice: e.target.value }))}
                className="mt-1 h-10 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] px-3 text-xs font-semibold text-[var(--text-title)] outline-none focus:border-teal-500 transition-colors duration-200"
              >
                <option value="Bella (Female)">Bella (Female) - Warm & Professional</option>
                <option value="Marcus (Male)">Marcus (Male) - Confident & Clear</option>
                <option value="Sophia (Female)">Sophia (Female) - Friendly & Polite</option>
                <option value="David (Male)">David (Male) - Executive & Authoritative</option>
              </select>
            </Field>

            <div>
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Meta Channels Active</span>
              <div className="flex gap-4 mt-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[var(--text-body)] hover:text-[var(--text-title)]">
                  <input
                    type="checkbox"
                    checked={botConfigs.channels.whatsapp}
                    onChange={(e) => setBotConfigs(prev => ({ ...prev, channels: { ...prev.channels, whatsapp: e.target.checked } }))}
                    className="accent-teal-500 rounded border-[var(--border-color)]"
                  />
                  WhatsApp
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[var(--text-body)] hover:text-[var(--text-title)]">
                  <input
                    type="checkbox"
                    checked={botConfigs.channels.instagram}
                    onChange={(e) => setBotConfigs(prev => ({ ...prev, channels: { ...prev.channels, instagram: e.target.checked } }))}
                    className="accent-teal-500 rounded border-[var(--border-color)]"
                  />
                  Instagram
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[var(--text-body)] hover:text-[var(--text-title)]">
                  <input
                    type="checkbox"
                    checked={botConfigs.channels.facebook}
                    onChange={(e) => setBotConfigs(prev => ({ ...prev, channels: { ...prev.channels, facebook: e.target.checked } }))}
                    className="accent-teal-500 rounded border-[var(--border-color)]"
                  />
                  Facebook Messenger
                </label>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => alert("AI Agent Configurations Saved Locally.")}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-xs font-bold text-white shadow-md hover:bg-teal-500 transition cursor-pointer"
              type="button"
            >
              Save Configurations
            </button>
          </div>
        </div>
      </div>

      {/* AI Bot Cards stats representation */}
      <div className="rounded-xl premium-border bg-[var(--bg-card)] p-5 shadow-lg backdrop-blur transition-colors duration-200">
        <div className="mb-4 flex items-center justify-between premium-border-b pb-3">
          <h2 className="text-sm font-bold text-[var(--text-title)] uppercase tracking-wider">AI Bot Deployments</h2>
          <Icon name="agent" className="h-5 w-5 text-teal-400" />
        </div>
        <div className="space-y-4">
          {initialAgentCards.map((agent) => (
            <article key={agent.name} className="rounded-xl premium-border bg-[var(--bg-lane)] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white ${agent.accent} shadow-md`}>
                  <Icon name={agent.icon} className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--text-title)] text-sm">{agent.name}</h4>
                  <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">{agent.channels}</p>
                </div>
              </div>

              <div className="flex items-center gap-8 text-xs select-none">
                <div>
                  <p className="text-[var(--text-muted)] uppercase tracking-wider font-semibold text-[9px]">Leads Handled</p>
                  <p className="text-base font-bold text-[var(--text-title)] mt-0.5">{agent.name === "AI Call Responder" ? botConfigs.voice ? "31" : "0" : "146"}</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)] uppercase tracking-wider font-semibold text-[9px]">Confidence Conv.</p>
                  <p className="text-base font-bold text-[var(--text-title)] mt-0.5">{agent.conversion}%</p>
                </div>
                <div>
                  <p className="text-[var(--text-muted)] uppercase tracking-wider font-semibold text-[9px]">Active Queue</p>
                  <p className="text-base font-bold text-[var(--text-title)] mt-0.5">{agent.queue} tasks</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <Badge className="bg-emerald-950/45 text-emerald-500 dark:text-emerald-400 ring-emerald-500/20">LIVE STATUS</Badge>
                <p className="text-[10px] text-[var(--text-muted)] font-mono">{agent.endpoint}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );

  const activitySection = (
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
  );

  const integrationsSection = (
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
  );

  const wonCount = leads.filter((l) => l.status === "CONVERTED").length;
  const lostCount = leads.filter((l) => l.status === "LOST").length;
  const winRate = Math.round((wonCount / (wonCount + lostCount || 1)) * 100);
  const wonVal = leads.filter((l) => l.status === "CONVERTED").reduce((s, l) => s + l.value, 0);
  const lostVal = leads.filter((l) => l.status === "LOST").reduce((s, l) => s + l.value, 0);

  const analyticsSection = (
    <section className="space-y-6 animate-fade-in">
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
    </section>
  );

  return (
    <Shell
      apiState={apiState}
      metrics={metrics}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      theme={theme}
      onToggleTheme={handleToggleTheme}
    >
      <div className="space-y-6 px-4 py-6 md:px-8">
        {activeTab === "dashboard" && (
          <>
            {metricsSection}
            
            {/* Middle Row (divided into two columns) */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column: Property revenue overview */}
              <div className="lg:col-span-2">
                <RevenueLineChart />
              </div>
              
              {/* Right Column: Messages list */}
              <div>
                {recentMessagesCard}
              </div>
            </div>

            {/* Bottom Row: Active Property list */}
            {activePropertySection}
          </>
        )}
        {activeTab === "leads" && leadDeskSection}
        {activeTab === "board" && boardSection}
        {activeTab === "analytics" && analyticsSection}
        {activeTab === "create" && (
          <div className="mx-auto w-full max-w-2xl">{addLeadSection}</div>
        )}
        {activeTab === "agents" && aiAgentsSection}
        {activeTab === "activity" && activitySection}
        {activeTab === "integrations" && integrationsSection}
      </div>

      {/* Interactive detail drawer side panel popup */}
      <LeadDetailsDrawer
        lead={selectedLead}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedLead(null);
        }}
        onUpdateStatus={handleUpdateStatus}
        onSendMessage={handleSendMessage}
        onToggleAi={handleToggleAi}
      />
    </Shell>
  );
}
