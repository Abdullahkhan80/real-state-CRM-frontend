export type LeadStatus = "NEW" | "CONTACTED" | "CONVERTED" | "LOST";
export type LeadSource = "FACEBOOK" | "INSTAGRAM" | "WHATSAPP" | "COLD_CALL";
export type ApiState = "checking" | "connected" | "offline";

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: LeadSource;
  status: LeadStatus;
  value: number;
  propertyType: string;
  area: string;
  score: number;
  assignedTo: string;
  aiAgent: "Message AI" | "Call AI" | "Manual";
  lastActivity: string;
  nextAction: string;
  createdAt: string;
  notes?: string;
  communicationCount?: number;
  lostReason?: string;
  aiPaused?: boolean;
  callRecordingUrl?: string;
  callTranscript?: { sender: "AI" | "Customer"; text: string; time: string }[];
  chatHistory?: { sender: "AI" | "Lead" | "Agent"; text: string; time: string }[];
};

export type LeadForm = {
  name: string;
  phone: string;
  email: string;
  source: LeadSource;
  status: LeadStatus;
  value: string;
  propertyType: string;
  area: string;
  notes: string;
};

export type BackendLead = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  source: LeadSource;
  status: LeadStatus;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    communications?: number;
  };
};

export type LeadsResponse = {
  success: boolean;
  data?: BackendLead[];
};

export type LeadImportResponse = {
  success: boolean;
  message?: string;
  data?: {
    created: number;
    updated: number;
    skipped: number;
    errors: { row: number; message: string }[];
    leads: BackendLead[];
  };
};

export type DashboardMetrics = {
  today: {
    totalLeads: number;
    callsAttendedByAI: number;
    messagesHandled: number;
  };
  week: {
    totalLeads: number;
    callsAttendedByAI: number;
    messagesHandled: number;
  };
};

export type MetricsResponse = {
  success: boolean;
  data?: DashboardMetrics;
};

export type IconName =
  | "activity"
  | "add"
  | "agent"
  | "board"
  | "call"
  | "check"
  | "clock"
  | "database"
  | "filter"
  | "home"
  | "lead"
  | "message"
  | "refresh"
  | "search"
  | "shield"
  | "spark"
  | "target"
  | "upload"
  | "sun"
  | "moon";

export type Tab = "dashboard" | "leads" | "board" | "analytics" | "create" | "agents" | "activity" | "integrations";

export const navItems: { id: Tab; label: string; icon: IconName }[] = [
  { id: "dashboard", label: "Dashboard", icon: "home" },
  { id: "leads", label: "Leads", icon: "lead" },
  { id: "board", label: "Board", icon: "board" },
  { id: "analytics", label: "Analytics", icon: "target" },
  { id: "create", label: "Add lead", icon: "add" },
  { id: "agents", label: "AI agents", icon: "agent" },
  { id: "activity", label: "Activity", icon: "activity" },
  { id: "integrations", label: "Integrations", icon: "database" },
];

export const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

export const sourceStyles: Record<LeadSource, { label: string; badge: string; dot: string }> = {
  FACEBOOK: { label: "Facebook", badge: "bg-sky-50 text-sky-700 ring-sky-200", dot: "bg-sky-500" },
  INSTAGRAM: { label: "Instagram", badge: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200", dot: "bg-fuchsia-500" },
  WHATSAPP: { label: "WhatsApp", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  COLD_CALL: { label: "Cold call", badge: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500" },
};

export const statusStyles: Record<LeadStatus, { label: string; badge: string; dot: string; lane: string }> = {
  NEW: {
    label: "New",
    badge: "bg-violet-50 text-violet-700 ring-violet-200",
    dot: "bg-violet-500",
    lane: "border-violet-200 bg-violet-50/70",
  },
  CONTACTED: {
    label: "Contacted",
    badge: "bg-teal-50 text-teal-700 ring-teal-200",
    dot: "bg-teal-500",
    lane: "border-teal-200 bg-teal-50/70",
  },
  CONVERTED: {
    label: "Converted",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
    lane: "border-emerald-200 bg-emerald-50/70",
  },
  LOST: {
    label: "Lost",
    badge: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-500",
    lane: "border-rose-200 bg-rose-50/70",
  },
};

export const demoLeads: Lead[] = [
  {
    id: "lead-001",
    name: "Ayesha Malik",
    phone: "555-018-7830",
    email: "ayesha.malik@example.com",
    source: "INSTAGRAM",
    status: "CONTACTED",
    value: 185000,
    propertyType: "3 bed apartment",
    area: "DHA Phase 6",
    score: 91,
    assignedTo: "Sara Khan",
    aiAgent: "Message AI",
    lastActivity: "Instagram DM qualified budget and location",
    nextAction: "Send Bahria and DHA shortlist",
    createdAt: "2026-06-28T06:15:00.000Z",
    communicationCount: 7,
    aiPaused: false,
    chatHistory: [
      { sender: "Lead", text: "Hi, I saw your ad about the DHA Phase 6 apartments. Are there any 3-beds left?", time: "06:15" },
      { sender: "AI", text: "Hello Ayesha! Yes, we have a few premium 3-bedroom options available. To help me find the best fit, could you share your approximate budget range?", time: "06:16" },
      { sender: "Lead", text: "My budget is around 170k to 190k USD.", time: "06:18" },
      { sender: "AI", text: "Perfect, that budget works well for DHA Phase 6! Are you looking for immediate possession or a flexible payment plan?", time: "06:19" },
      { sender: "Lead", text: "Preferably ready to move in, but a short payment plan works too.", time: "06:22" },
      { sender: "AI", text: "Great. I have logged these preferences. Agent Sara Khan will reach out shortly with a curated shortlist. Have a wonderful day!", time: "06:23" }
    ]
  },
  {
    id: "lead-002",
    name: "Hamza Rafiq",
    phone: "555-012-4588",
    email: "hamza.rafiq@example.com",
    source: "FACEBOOK",
    status: "NEW",
    value: 122000,
    propertyType: "Plot file",
    area: "Bahria Town",
    score: 78,
    assignedTo: "Ali Raza",
    aiAgent: "Message AI",
    lastActivity: "Meta ad lead captured from instant form",
    nextAction: "AI follow-up message pending",
    createdAt: "2026-06-28T05:30:00.000Z",
    communicationCount: 2,
    aiPaused: false,
    chatHistory: [
      { sender: "AI", text: "Hello Hamza! Thanks for your interest in our Bahria Town plot files. How can we help you today?", time: "05:30" }
    ]
  },
  {
    id: "lead-003",
    name: "Bilal Qureshi",
    phone: "555-017-9941",
    email: "bilal.qureshi@example.com",
    source: "COLD_CALL",
    status: "CONVERTED",
    value: 365000,
    propertyType: "Commercial shop",
    area: "Gulberg Greens",
    score: 96,
    assignedTo: "Mina Shah",
    aiAgent: "Call AI",
    lastActivity: "AI call transcript confirmed viewing window",
    nextAction: "Prepare booking token invoice",
    createdAt: "2026-06-27T15:05:00.000Z",
    communicationCount: 11,
    aiPaused: true,
    callRecordingUrl: "/mock-recordings/call-003.mp3",
    callTranscript: [
      { sender: "AI", text: "Hello, am I speaking with Bilal Qureshi?", time: "0:02" },
      { sender: "Customer", text: "Yes, this is Bilal. Who is this?", time: "0:05" },
      { sender: "AI", text: "Hi Bilal! This is NexaEstate's AI assistant. I'm calling about your inquiry regarding the commercial shop in Gulberg Greens. Is this a good time to talk?", time: "0:12" },
      { sender: "Customer", text: "Yes, I was actually looking at that shop. What's the size and total price?", time: "0:19" },
      { sender: "AI", text: "It's a premium corner shop, 450 square feet, priced at 365,000 USD, with a 20% down payment. Are you looking to buy this for investment or your own retail outlet?", time: "0:30" },
      { sender: "Customer", text: "It's for my own brand's retail outlet. Can I visit the site tomorrow?", time: "0:36" },
      { sender: "AI", text: "Absolutely, I can schedule that. Would tomorrow afternoon at 3:00 PM work for you, or is morning better?", time: "0:45" },
      { sender: "Customer", text: "3:00 PM is perfect.", time: "0:48" },
      { sender: "AI", text: "Great. I have booked your site visit for tomorrow at 3:00 PM. Our Gulberg Greens expert Mina Shah will meet you there. I will SMS you the exact shop location now.", time: "1:02" },
      { sender: "Customer", text: "Thanks, appreciate it.", time: "1:05" }
    ],
    chatHistory: [
      { sender: "AI", text: "Hi Bilal, this is the Gulberg Greens location map link for our appointment tomorrow at 3:00 PM: [Location Map]. Mina Shah will meet you at the site.", time: "15:06" },
      { sender: "Lead", text: "Received, thank you. I'm on my way now.", time: "14:45" },
      { sender: "Agent", text: "Hi Bilal, I'm at the site. Looking forward to meeting you.", time: "14:55" }
    ]
  },
  {
    id: "lead-004",
    name: "Zoya Siddiqui",
    phone: "555-013-7095",
    email: "zoya.siddiqui@example.com",
    source: "WHATSAPP",
    status: "CONTACTED",
    value: 248000,
    propertyType: "Luxury villa",
    area: "Lake City",
    score: 88,
    assignedTo: "Sara Khan",
    aiAgent: "Message AI",
    lastActivity: "WhatsApp responder shared brochure and price range",
    nextAction: "Schedule video walkthrough",
    createdAt: "2026-06-27T12:20:00.000Z",
    communicationCount: 8,
    aiPaused: false,
    chatHistory: [
      { sender: "Lead", text: "Interested in the 4-bed luxury villa in Lake City. Can you send details?", time: "12:20" },
      { sender: "AI", text: "Hello Zoya! I'd love to share the brochure with you. Here is the PDF download link: [Lake City Villa Brochure]. The starting price for this villa series is 248,000 USD.", time: "12:21" },
      { sender: "Lead", text: "Perfect. Does this include the club membership?", time: "12:25" },
      { sender: "AI", text: "Yes! All bookings this month include a complimentary lifetime family club membership at Lake City Country Club.", time: "12:26" },
      { sender: "Lead", text: "That is great. I will review the PDF tonight.", time: "12:35" }
    ]
  },
  {
    id: "lead-005",
    name: "Omar Farooqi",
    phone: "555-019-2481",
    source: "FACEBOOK",
    status: "LOST",
    value: 94000,
    propertyType: "Studio apartment",
    area: "City Centre",
    score: 42,
    assignedTo: "Ali Raza",
    aiAgent: "Manual",
    lastActivity: "Budget mismatch after agent review",
    nextAction: "Retarget when lower-price inventory opens",
    createdAt: "2026-06-26T09:42:00.000Z",
    communicationCount: 4,
    aiPaused: true,
    lostReason: "Budget Mismatch",
    chatHistory: [
      { sender: "Lead", text: "Hi, I am looking for a studio in City Centre under 60k.", time: "09:42" },
      { sender: "AI", text: "Hello Omar! Thanks for reaching out. The standard studio apartments in City Centre start at 94k. Do you have any flexibility in budget, or would you be open to other areas nearby?", time: "09:43" },
      { sender: "Lead", text: "No, 60k is my hard limit and I need City Centre.", time: "09:45" },
      { sender: "Agent", text: "Hi Omar, Ali here. Unfortunately we don't have any inventory in City Centre matching that price right now. I will save your details and alert you immediately if any resale units matching your budget open up.", time: "10:10" }
    ]
  },
  {
    id: "lead-006",
    name: "Noor Ahmed",
    phone: "555-011-6208",
    email: "noor.ahmed@example.com",
    source: "INSTAGRAM",
    status: "NEW",
    value: 510000,
    propertyType: "Farm house",
    area: "Bedian Road",
    score: 84,
    assignedTo: "Mina Shah",
    aiAgent: "Call AI",
    lastActivity: "Missed call routed to AI responder",
    nextAction: "Call AI to confirm requirements",
    createdAt: "2026-06-28T08:10:00.000Z",
    communicationCount: 1,
    aiPaused: false,
    chatHistory: [
      { sender: "AI", text: "Hi Noor, sorry we missed your call. This is NexaEstate's AI assistant. Are you looking for a residential property or an investment in Bedian Road?", time: "08:11" }
    ]
  },
];

export const fallbackMetrics: DashboardMetrics = {
  today: {
    totalLeads: 18,
    callsAttendedByAI: 31,
    messagesHandled: 146,
  },
  week: {
    totalLeads: 117,
    callsAttendedByAI: 204,
    messagesHandled: 932,
  },
};

export const activities = [
  { id: "a1", time: "09:42", agent: "Message AI", event: "Qualified Instagram lead for DHA Phase 6", tone: "bg-fuchsia-500" },
  { id: "a2", time: "09:28", agent: "Call AI", event: "Logged 4m 18s transcript and marked viewing intent", tone: "bg-emerald-500" },
  { id: "a3", time: "09:04", agent: "n8n", event: "Webhook accepted Meta lead payload", tone: "bg-sky-500" },
  { id: "a4", time: "08:51", agent: "Sales", event: "Sara Khan moved Zoya to contacted", tone: "bg-amber-500" },
];

export const agentCards = [
  {
    name: "Meta DM Responder",
    status: "Live",
    handled: 146,
    conversion: 28,
    queue: 9,
    endpoint: "/api/v1/webhooks/n8n/lead",
    channels: "Facebook, Instagram, WhatsApp",
    accent: "bg-teal-500",
    icon: "message" as IconName,
  },
  {
    name: "AI Call Responder",
    status: "Live",
    handled: 31,
    conversion: 34,
    queue: 4,
    endpoint: "/api/v1/webhooks/ai-agent",
    channels: "Twilio or Vapi calls",
    accent: "bg-emerald-500",
    icon: "call" as IconName,
  },
];

export const integrations = [
  { name: "Meta Lead Ads", state: "Connected", detail: "Facebook and Instagram forms", icon: "target" as IconName },
  { name: "n8n Workflows", state: "Ready", detail: "Message and call agents", icon: "activity" as IconName },
  { name: "CRM Backend", state: "Webhook enabled", detail: apiBase, icon: "database" as IconName },
  { name: "Credential Vault", state: "Encrypted", detail: "Meta, Twilio, Vapi keys", icon: "shield" as IconName },
];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function mapBackendLead(lead: BackendLead, index: number): Lead {
  const enrich = demoLeads[index % demoLeads.length];

  return {
    id: lead.id,
    name: lead.name,
    phone: lead.phone,
    email: lead.email || undefined,
    source: lead.source,
    status: lead.status,
    value: enrich.value,
    propertyType: enrich.propertyType,
    area: enrich.area,
    score: enrich.score,
    assignedTo: enrich.assignedTo,
    aiAgent: enrich.aiAgent,
    lastActivity: lead._count?.communications
      ? `${lead._count.communications} CRM conversations logged`
      : "Lead synced from backend",
    nextAction: enrich.nextAction,
    createdAt: lead.createdAt,
    communicationCount: lead._count?.communications || 0,
  };
}

export function blankLeadForm(): LeadForm {
  return {
    name: "",
    phone: "",
    email: "",
    source: "FACEBOOK",
    status: "NEW",
    value: "180000",
    propertyType: "Apartment",
    area: "DHA Phase 6",
    notes: "",
  };
}
