import Link from "next/link";
import type { Lead } from "@/lib/types";
import LeadStatusBadge from "./lead-status-badge";
import LeadSourceBadge from "./lead-source-badge";

export default function LeadTable({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <div className="py-16 text-center text-muted">
        <p className="text-lg">No leads found</p>
        <p className="text-sm mt-1">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/50">
            <th className="text-left px-4 py-3 font-medium text-muted">Name</th>
            <th className="text-left px-4 py-3 font-medium text-muted hidden sm:table-cell">Phone</th>
            <th className="text-left px-4 py-3 font-medium text-muted hidden md:table-cell">Source</th>
            <th className="text-left px-4 py-3 font-medium text-muted">Status</th>
            <th className="text-left px-4 py-3 font-medium text-muted hidden lg:table-cell">Created</th>
            <th className="text-right px-4 py-3 font-medium text-muted" />
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="border-b border-zinc-800/50 transition-colors hover:bg-white/[0.02]"
            >
              <td className="px-4 py-3 font-medium">{lead.name}</td>
              <td className="px-4 py-3 text-muted hidden sm:table-cell">{lead.phone}</td>
              <td className="px-4 py-3 hidden md:table-cell">
                <LeadSourceBadge source={lead.source} />
              </td>
              <td className="px-4 py-3">
                <LeadStatusBadge status={lead.status} />
              </td>
              <td className="px-4 py-3 text-muted hidden lg:table-cell">
                {new Date(lead.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/leads/${lead.id}`}
                  className="text-sm text-muted hover:text-accent transition-colors"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
