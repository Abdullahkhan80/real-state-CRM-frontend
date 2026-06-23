export type LeadSource = "FACEBOOK" | "INSTAGRAM" | "WHATSAPP" | "COLD_CALL";

export type LeadStatus = "NEW" | "CONTACTED" | "CONVERTED" | "LOST";

export type CommunicationType = "MESSAGE" | "CALL";

export type CommunicationDirection = "INBOUND" | "OUTBOUND";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  source: LeadSource;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  communications?: CommunicationLog[];
}

export interface CommunicationLog {
  id: string;
  leadId: string;
  lead?: Lead;
  type: CommunicationType;
  direction: CommunicationDirection;
  content: string | null;
  transcript: string | null;
  duration: number | null;
  timestamp: string;
}

export interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  converted: number;
  lost: number;
}

export interface DashboardMetrics {
  totalLeads: number;
  callsAttendedByAI: number;
  messagesHandled: number;
  conversionRate: number;
}

export interface ApiConfig {
  id: string;
  key: string;
  value: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ActionResult = {
  success: boolean;
  error?: string;
};

export interface LeadFilters {
  status?: LeadStatus | "ALL";
  source?: LeadSource | "ALL";
  search?: string;
}

export interface ActivityFilters {
  type?: CommunicationType | "ALL";
  direction?: CommunicationDirection | "ALL";
}
