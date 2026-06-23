"use client";

import { useActionState } from "react";
import type { CommunicationLog } from "@/lib/types";
import { logCommunication } from "@/lib/actions";

export default function ActivityTimeline({
  communications,
  leadId,
}: {
  communications: CommunicationLog[];
  leadId?: string;
}) {
  return (
    <div className="space-y-4">
      {leadId && <AddCommunicationForm leadId={leadId} />}

      {communications.length === 0 ? (
        <p className="text-sm text-muted py-8 text-center">No activity yet.</p>
      ) : (
        <div className="space-y-0">
          {communications.map((log, i) => (
            <div key={log.id} className="relative flex gap-4 pb-6">
              {i < communications.length - 1 && (
                <div className="absolute left-[7px] top-4 bottom-0 w-px bg-zinc-800" />
              )}
              <div
                className={`mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                  log.type === "CALL"
                    ? "border-emerald-500"
                    : "border-sky-500"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted uppercase">
                    {log.direction === "INBOUND" ? "Inbound" : "Outbound"}
                  </span>
                  <span className="text-xs text-zinc-600">
                    {log.type}
                  </span>
                  <span className="ml-auto text-xs text-zinc-600">
                    {new Date(log.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {log.content && (
                  <p className="mt-1 text-sm text-foreground">{log.content}</p>
                )}
                {log.transcript && (
                  <details className="mt-1">
                    <summary className="text-xs text-muted cursor-pointer hover:text-foreground">
                      Transcript ({log.duration ? `${Math.floor(log.duration / 60)}m ${log.duration % 60}s` : "—"})
                    </summary>
                    <p className="mt-1 text-xs text-muted whitespace-pre-wrap">
                      {log.transcript}
                    </p>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddCommunicationForm({ leadId }: { leadId: string }) {
  const [state, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      return logCommunication(leadId, formData);
    },
    null,
  );

  return (
    <form action={action} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <h3 className="text-xs font-medium text-muted mb-3 uppercase">Log Communication</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        <select
          name="type"
          required
          className="rounded-lg border border-zinc-800 bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-zinc-600"
        >
          <option value="MESSAGE">Message</option>
          <option value="CALL">Call</option>
        </select>
        <select
          name="direction"
          required
          className="rounded-lg border border-zinc-800 bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-zinc-600"
        >
          <option value="INBOUND">Inbound</option>
          <option value="OUTBOUND">Outbound</option>
        </select>
      </div>
      <textarea
        name="content"
        placeholder="Notes, transcript, or message content..."
        rows={2}
        className="w-full rounded-lg border border-zinc-800 bg-surface px-3 py-2 text-sm text-foreground placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 mb-3"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent-hover transition-colors disabled:opacity-50"
      >
        {pending ? "Logging..." : "Log"}
      </button>
      {state && !state.success && (
        <p className="mt-2 text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}
