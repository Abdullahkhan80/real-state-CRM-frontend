import Badge from "@/components/ui/badge";
import type { LeadStatus } from "@/lib/types";

const map: Record<LeadStatus, { label: string; variant: "new" | "contacted" | "converted" | "lost" }> = {
  NEW: { label: "New", variant: "new" },
  CONTACTED: { label: "Contacted", variant: "contacted" },
  CONVERTED: { label: "Converted", variant: "converted" },
  LOST: { label: "Lost", variant: "lost" },
};

export default function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}
