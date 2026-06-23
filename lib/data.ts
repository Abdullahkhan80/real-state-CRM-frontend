import "server-only";

import type {
  ActivityFilters,
  ApiConfig,
  CommunicationLog,
  DashboardMetrics,
  Lead,
  LeadFilters,
  LeadStats,
} from "./types";

const BACKEND_URL = process.env.BACKEND_URL;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}/api/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.data ?? json;
}

function hasBackend() {
  return Boolean(BACKEND_URL);
}

export async function getLeads(filters: LeadFilters = {}): Promise<Lead[]> {
  if (hasBackend()) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== "ALL")
      params.set("status", filters.status);
    if (filters.source && filters.source !== "ALL")
      params.set("source", filters.source);
    if (filters.search) params.set("search", filters.search);
    return apiFetch<Lead[]>(`/leads?${params}`);
  }
  return mockLeads(filters);
}

export async function getLead(id: string): Promise<Lead | null> {
  if (hasBackend()) {
    try {
      return await apiFetch<Lead>(`/leads/${id}`);
    } catch {
      return null;
    }
  }
  const lead = mockLeadData.find((l) => l.id === id);
  if (!lead) return null;
  return {
    ...lead,
    communications: mockCommunications.filter((c) => c.leadId === id),
  };
}

export async function getLeadStats(): Promise<LeadStats> {
  if (hasBackend()) return apiFetch<LeadStats>("/leads/stats");
  return mockStats;
}

export async function getCommunications(
  filters: ActivityFilters = {},
): Promise<CommunicationLog[]> {
  if (hasBackend()) {
    const all = await apiFetch<CommunicationLog[]>("/communications");
    return filterCommunications(all, filters);
  }
  return filterCommunications(mockCommunications, filters);
}

export async function getLeadCommunications(
  leadId: string,
): Promise<CommunicationLog[]> {
  if (hasBackend())
    return apiFetch<CommunicationLog[]>(`/communications/lead/${leadId}`);
  return mockCommunications
    .filter((c) => c.leadId === leadId)
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  if (hasBackend()) return apiFetch<DashboardMetrics>("/metrics/dashboard");
  return mockMetrics;
}

export async function getApiConfigs(): Promise<ApiConfig[]> {
  if (hasBackend()) return apiFetch<ApiConfig[]>("/api-configs");
  return mockApiConfigs;
}

export async function getApiConfig(
  key: string,
): Promise<ApiConfig | null> {
  if (hasBackend()) {
    try {
      return await apiFetch<ApiConfig>(`/api-configs/${key}`);
    } catch {
      return null;
    }
  }
  return mockApiConfigs.find((c) => c.key === key) ?? null;
}

function filterCommunications(
  logs: CommunicationLog[],
  filters: ActivityFilters,
): CommunicationLog[] {
  return logs
    .filter(
      (c) => !filters.type || filters.type === "ALL" || c.type === filters.type,
    )
    .filter(
      (c) =>
        !filters.direction ||
        filters.direction === "ALL" ||
        c.direction === filters.direction,
    )
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
}

function mockLeads(filters: LeadFilters): Lead[] {
  return mockLeadData
    .filter(
      (l) => !filters.status || filters.status === "ALL" || l.status === filters.status,
    )
    .filter(
      (l) => !filters.source || filters.source === "ALL" || l.source === filters.source,
    )
    .filter(
      (l) =>
        !filters.search ||
        l.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        l.phone.includes(filters.search) ||
        (l.email?.toLowerCase().includes(filters.search.toLowerCase()) ?? false),
    )
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();
const daysAgo = (d: number) => new Date(now - d * 86_400_000).toISOString();

const mockLeadData: Lead[] = [
  { id: "lead-001", name: "Sarah Chen", phone: "+1 415-555-0142", email: "sarah.chen@email.com", source: "FACEBOOK", status: "NEW", createdAt: hoursAgo(2), updatedAt: hoursAgo(2) },
  { id: "lead-002", name: "Marcus Johnson", phone: "+1 312-555-0198", email: "m.johnson@email.com", source: "INSTAGRAM", status: "CONTACTED", createdAt: hoursAgo(8), updatedAt: hoursAgo(3) },
  { id: "lead-003", name: "Elena Rodriguez", phone: "+1 305-555-0177", email: "elena.r@email.com", source: "WHATSAPP", status: "CONVERTED", createdAt: daysAgo(2), updatedAt: hoursAgo(12) },
  { id: "lead-004", name: "David Kim", phone: "+1 206-555-0154", email: null, source: "FACEBOOK", status: "NEW", createdAt: hoursAgo(5), updatedAt: hoursAgo(5) },
  { id: "lead-005", name: "Priya Patel", phone: "+1 646-555-0133", email: "priya.p@email.com", source: "INSTAGRAM", status: "CONTACTED", createdAt: daysAgo(1), updatedAt: hoursAgo(6) },
  { id: "lead-006", name: "James Wilson", phone: "+1 404-555-0188", email: "jwilson@email.com", source: "COLD_CALL", status: "LOST", createdAt: daysAgo(5), updatedAt: daysAgo(3) },
  { id: "lead-007", name: "Aisha Mohammed", phone: "+1 703-555-0166", email: "aisha.m@email.com", source: "WHATSAPP", status: "NEW", createdAt: hoursAgo(1), updatedAt: hoursAgo(1) },
  { id: "lead-008", name: "Thomas Anderson", phone: "+1 503-555-0199", email: "t.anderson@email.com", source: "FACEBOOK", status: "CONTACTED", createdAt: daysAgo(3), updatedAt: hoursAgo(20) },
  { id: "lead-009", name: "Lisa Zhang", phone: "+1 617-555-0121", email: "lisa.z@email.com", source: "INSTAGRAM", status: "CONVERTED", createdAt: daysAgo(7), updatedAt: daysAgo(2) },
  { id: "lead-010", name: "Roberto Garcia", phone: "+1 214-555-0145", email: null, source: "COLD_CALL", status: "NEW", createdAt: hoursAgo(14), updatedAt: hoursAgo(14) },
];

const mockCommunications: CommunicationLog[] = [
  { id: "com-001", leadId: "lead-001", type: "MESSAGE", direction: "INBOUND", content: "Hi, I saw the listing for the 3-bed in Mission District. Is it still available?", transcript: null, duration: null, timestamp: hoursAgo(2) },
  { id: "com-002", leadId: "lead-001", type: "MESSAGE", direction: "OUTBOUND", content: "Yes it is! Would you like to schedule a viewing this weekend?", transcript: null, duration: null, timestamp: hoursAgo(1) },
  { id: "com-003", leadId: "lead-002", type: "CALL", direction: "OUTBOUND", content: null, transcript: "AI: Hello Marcus, I'm calling about your interest in the Lakeview property... Lead: Yes, I wanted to ask about the pricing...", duration: 184, timestamp: hoursAgo(3) },
  { id: "com-004", leadId: "lead-002", type: "MESSAGE", direction: "INBOUND", content: "Thanks for the call! Can you send me the floor plan?", transcript: null, duration: null, timestamp: hoursAgo(2) },
  { id: "com-005", leadId: "lead-003", type: "CALL", direction: "INBOUND", content: null, transcript: "AI: Thank you for calling... Lead: I'd like to make an offer on the Coral Way property...", duration: 312, timestamp: hoursAgo(12) },
  { id: "com-006", leadId: "lead-003", type: "MESSAGE", direction: "OUTBOUND", content: "Congratulations on your offer! The seller has accepted. Here are the next steps.", transcript: null, duration: null, timestamp: hoursAgo(10) },
  { id: "com-007", leadId: "lead-005", type: "MESSAGE", direction: "INBOUND", content: "What are the HOA fees for the Brooklyn Heights unit?", transcript: null, duration: null, timestamp: hoursAgo(6) },
  { id: "com-008", leadId: "lead-005", type: "MESSAGE", direction: "OUTBOUND", content: "The HOA is $450/month which includes water and gym access.", transcript: null, duration: null, timestamp: hoursAgo(5) },
  { id: "com-009", leadId: "lead-008", type: "CALL", direction: "OUTBOUND", content: null, transcript: "AI: Hi Thomas, following up on the Pearl District condo... Lead: I'm still interested but need time to think.", duration: 145, timestamp: hoursAgo(20) },
  { id: "com-010", leadId: "lead-007", type: "MESSAGE", direction: "INBOUND", content: "Interested in the Arlington townhouse. What's the down payment requirement?", transcript: null, duration: null, timestamp: hoursAgo(1) },
  { id: "com-011", leadId: "lead-009", type: "MESSAGE", direction: "OUTBOUND", content: "Your closing is scheduled for Friday at 10 AM. Please bring a valid ID.", transcript: null, duration: null, timestamp: daysAgo(2) },
  { id: "com-012", leadId: "lead-004", type: "MESSAGE", direction: "INBOUND", content: "Saw the Facebook ad for Capitol Hill studio. Is parking included?", transcript: null, duration: null, timestamp: hoursAgo(5) },
];

const mockStats: LeadStats = {
  total: mockLeadData.length,
  new: mockLeadData.filter((l) => l.status === "NEW").length,
  contacted: mockLeadData.filter((l) => l.status === "CONTACTED").length,
  converted: mockLeadData.filter((l) => l.status === "CONVERTED").length,
  lost: mockLeadData.filter((l) => l.status === "LOST").length,
};

const mockMetrics: DashboardMetrics = {
  totalLeads: mockLeadData.length,
  callsAttendedByAI: mockCommunications.filter((c) => c.type === "CALL").length,
  messagesHandled: mockCommunications.filter((c) => c.type === "MESSAGE").length,
  conversionRate: Math.round(
    (mockLeadData.filter((l) => l.status === "CONVERTED").length /
      mockLeadData.length) *
      100,
  ),
};

const mockApiConfigs: ApiConfig[] = [
  { id: "cfg-001", key: "META_ACCESS_TOKEN", value: "", description: "Meta Graph API access token for Lead Ads", isActive: false, createdAt: daysAgo(10), updatedAt: daysAgo(10) },
  { id: "cfg-002", key: "META_APP_SECRET", value: "", description: "Meta app secret for webhook signature verification", isActive: false, createdAt: daysAgo(10), updatedAt: daysAgo(10) },
  { id: "cfg-003", key: "META_WEBHOOK_VERIFY_TOKEN", value: "", description: "Verify token for Meta webhook subscription", isActive: false, createdAt: daysAgo(10), updatedAt: daysAgo(10) },
  { id: "cfg-004", key: "TWILIO_AUTH_TOKEN", value: "", description: "Twilio authentication token for SMS/voice", isActive: false, createdAt: daysAgo(10), updatedAt: daysAgo(10) },
  { id: "cfg-005", key: "VAPI_API_KEY", value: "", description: "Vapi API key for AI voice agent", isActive: false, createdAt: daysAgo(10), updatedAt: daysAgo(10) },
];
