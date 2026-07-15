"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import {
  activities as initialActivities,
  apiBase,
  BackendLead,
  DashboardMetrics,
  demoLeads,
  fallbackMetrics,
  Lead,
  LeadsResponse,
  LeadStatus,
  mapBackendLead,
  MetricsResponse,
  sourceStyles,
  statusStyles,
} from "./data";

interface CrmContextType {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  metrics: DashboardMetrics;
  setMetrics: React.Dispatch<React.SetStateAction<DashboardMetrics>>;
  apiState: "checking" | "connected" | "offline";
  setApiState: React.Dispatch<React.SetStateAction<"checking" | "connected" | "offline">>;
  syncMessage: string;
  setSyncMessage: React.Dispatch<React.SetStateAction<string>>;
  selectedLead: Lead | null;
  setSelectedLead: React.Dispatch<React.SetStateAction<Lead | null>>;
  isDrawerOpen: boolean;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activities: typeof initialActivities;
  setActivities: React.Dispatch<React.SetStateAction<typeof initialActivities>>;
  botConfigs: {
    metaPrompt: string;
    callPrompt: string;
    voice: string;
    channels: {
      whatsapp: boolean;
      instagram: boolean;
      facebook: boolean;
    };
  };
  setBotConfigs: React.Dispatch<
    React.SetStateAction<{
      metaPrompt: string;
      callPrompt: string;
      voice: string;
      channels: {
        whatsapp: boolean;
        instagram: boolean;
        facebook: boolean;
      };
    }>
  >;
  moveLeadToStatus: (leadId: string, status: LeadStatus) => Promise<void>;
  handleUpdateStatus: (leadId: string, status: LeadStatus) => void;
  handleSendMessage: (leadId: string, text: string) => void;
  handleToggleAi: (leadId: string) => void;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export function CrmProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(demoLeads);
  const [metrics, setMetrics] = useState<DashboardMetrics>(fallbackMetrics);
  const [apiState, setApiState] = useState<"checking" | "connected" | "offline">("checking");
  const [syncMessage, setSyncMessage] = useState("Sandbox mode active. Start the backend to sync live data.");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activities, setActivities] = useState(initialActivities);

  const [botConfigs, setBotConfigs] = useState({
    metaPrompt: "You are NexaEstate's AI assistant. Introduce yourself, qualify their budget, location, and property type preference politely, then hand over to an agent.",
    callPrompt: "You are Bella, a friendly AI real estate agent. Call the customer, confirm their shop/villa inquiry details, and schedule a viewing slot for this weekend.",
    voice: "Bella (Female)",
    channels: {
      whatsapp: true,
      instagram: true,
      facebook: true,
    },
  });

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

  async function moveLeadToStatus(leadId: string, status: LeadStatus) {
    const target = leads.find((lead) => lead.id === leadId);
    if (!target || target.status === status) return;

    setLeads((current) => current.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)));

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        time: timestamp,
        agent: "System",
        event: `${target.name} moved stage to ${statusStyles[status].label}`,
        tone: status === "CONVERTED" ? "bg-emerald-500" : status === "LOST" ? "bg-rose-500" : "bg-violet-500",
      },
      ...prev,
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

  const handleUpdateStatus = (leadId: string, status: LeadStatus) => {
    void moveLeadToStatus(leadId, status);
    setSelectedLead((prev) => (prev && prev.id === leadId ? { ...prev, status } : prev));
  };

  const handleSendMessage = (leadId: string, text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setLeads((current) =>
      current.map((lead) => {
        if (lead.id === leadId) {
          const nextHistory = [...(lead.chatHistory || []), { sender: "Agent" as const, text, time }];
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
        const nextHistory = [...(prev.chatHistory || []), { sender: "Agent" as const, text, time }];
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

    setActivities((prev) => [
      {
        id: `act-${Date.now()}`,
        time,
        agent: "Sales Agent",
        event: `Manually texted: "${text.substring(0, 30)}..." (AI paused)`,
        tone: "bg-violet-500",
      },
      ...prev,
    ]);
  };

  const handleToggleAi = (leadId: string) => {
    setLeads((current) => current.map((lead) => (lead.id === leadId ? { ...lead, aiPaused: !lead.aiPaused } : lead)));
    setSelectedLead((prev) => (prev && prev.id === leadId ? { ...prev, aiPaused: !prev.aiPaused } : prev));

    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const target = leads.find((l) => l.id === leadId);
    if (target) {
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          time,
          agent: "System",
          event: `AI Auto-Responder for ${target.name} turned ${!target.aiPaused ? "OFF" : "ON"}`,
          tone: !target.aiPaused ? "bg-amber-500" : "bg-emerald-500",
        },
        ...prev,
      ]);
    }
  };

  return (
    <CrmContext.Provider
      value={{
        leads,
        setLeads,
        metrics,
        setMetrics,
        apiState,
        setApiState,
        syncMessage,
        setSyncMessage,
        selectedLead,
        setSelectedLead,
        isDrawerOpen,
        setIsDrawerOpen,
        activities,
        setActivities,
        botConfigs,
        setBotConfigs,
        moveLeadToStatus,
        handleUpdateStatus,
        handleSendMessage,
        handleToggleAi,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
}

export function useCrm() {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error("useCrm must be used within a CrmProvider");
  }
  return context;
}
