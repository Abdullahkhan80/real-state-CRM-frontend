import type { LeadSource } from "@/lib/types";

const map: Record<LeadSource, { label: string; className: string }> = {
  FACEBOOK: { label: "Facebook", className: "source-facebook" },
  INSTAGRAM: { label: "Instagram", className: "source-instagram" },
  WHATSAPP: { label: "WhatsApp", className: "source-whatsapp" },
  COLD_CALL: { label: "Cold Call", className: "source-cold-call" },
};

export default function LeadSourceBadge({ source }: { source: LeadSource }) {
  const { label, className } = map[source];
  return (
    <span className={`text-xs font-medium ${className}`}>{label}</span>
  );
}
