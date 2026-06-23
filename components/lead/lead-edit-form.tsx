"use client";

import { useActionState } from "react";
import type { Lead } from "@/lib/types";
import { updateLeadStatus } from "@/lib/actions";
import LeadStatusBadge from "./lead-status-badge";

export default function LeadEditForm({ lead }: { lead: Lead }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-surface p-6">
        <h2 className="text-sm font-medium text-muted mb-4">Lead Details</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted">Name</dt>
            <dd className="font-medium">{lead.name}</dd>
          </div>
          <div>
            <dt className="text-muted">Phone</dt>
            <dd className="font-medium">{lead.phone}</dd>
          </div>
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="font-medium">{lead.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Source</dt>
            <dd className="font-medium">{lead.source}</dd>
          </div>
          <div>
            <dt className="text-muted">Status</dt>
            <dd><LeadStatusBadge status={lead.status} /></dd>
          </div>
          <div>
            <dt className="text-muted">Created</dt>
            <dd className="font-medium">
              {new Date(lead.createdAt).toLocaleDateString("en-US", {
                dateStyle: "long",
              })}
            </dd>
          </div>
        </dl>
      </div>

      <StatusActions leadId={lead.id} currentStatus={lead.status} />
    </div>
  );
}

function StatusActions({
  leadId,
  currentStatus,
}: {
  leadId: string;
  currentStatus: string;
}) {
  const [state, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const status = formData.get("status") as Lead["status"];
      return updateLeadStatus(leadId, status);
    },
    null,
  );

  const statuses: Lead["status"][] = ["NEW", "CONTACTED", "CONVERTED", "LOST"];

  return (
    <div className="rounded-xl border border-zinc-800 bg-surface p-6">
      <h2 className="text-sm font-medium text-muted mb-4">Update Status</h2>
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => {
          const active = currentStatus === status;
          return (
            <form key={status} action={action}>
              <input type="hidden" name="status" value={status} />
              <button
                type="submit"
                disabled={pending || active}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-zinc-700 text-zinc-300 cursor-not-allowed"
                    : "border border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-foreground disabled:opacity-50"
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            </form>
          );
        })}
      </div>
      {state && !state.success && (
        <p className="mt-2 text-sm text-destructive">{state.error}</p>
      )}
    </div>
  );
}
