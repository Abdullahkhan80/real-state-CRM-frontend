"use client";

import { useActionState } from "react";
import type { ApiConfig } from "@/lib/types";
import { updateApiConfig, saveApiConfig } from "@/lib/actions";

export default function CredentialsForm({
  configs,
}: {
  configs: ApiConfig[];
}) {
  return (
    <div className="space-y-6">
      <ExistingConfigs configs={configs} />
      <NewConfigForm />
    </div>
  );
}

function ExistingConfigs({ configs }: { configs: ApiConfig[] }) {
  const activeConfigs = configs.filter((c) => c.isActive);

  if (activeConfigs.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-surface p-6">
        <h2 className="text-sm font-medium text-muted mb-4">
          Configured Credentials
        </h2>
        <p className="text-sm text-zinc-500">No credentials configured yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-surface p-6">
      <h2 className="text-sm font-medium text-muted mb-4">
        Configured Credentials
      </h2>
      <div className="space-y-4">
        {activeConfigs.map((cfg) => (
          <ConfigRow key={cfg.id} config={cfg} />
        ))}
      </div>
    </div>
  );
}

function ConfigRow({ config }: { config: ApiConfig }) {
  const [state, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      return updateApiConfig(config.key, formData);
    },
    null,
  );

  return (
    <form action={action} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <label className="text-sm font-medium text-foreground">
            {formatKey(config.key)}
          </label>
          {config.description && (
            <p className="text-xs text-muted mt-0.5">{config.description}</p>
          )}
        </div>
        <span className="rounded-full bg-accent-subtle px-2 py-0.5 text-xs text-accent">
          Configured
        </span>
      </div>
      <input type="hidden" name="key" value={config.key} />
      <div className="flex gap-2">
        <input
          type="password"
          name="value"
          placeholder="Enter new value..."
          className="flex-1 rounded-lg border border-zinc-800 bg-surface px-3 py-2 text-sm text-foreground placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {pending ? "..." : "Update"}
        </button>
      </div>
      {state && !state.success && (
        <p className="mt-2 text-sm text-destructive">{state.error}</p>
      )}
    </form>
  );
}

function NewConfigForm() {
  const [state, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      return saveApiConfig(formData);
    },
    null,
  );

  return (
    <div className="rounded-xl border border-zinc-800 bg-surface p-6">
      <h2 className="text-sm font-medium text-muted mb-4">
        Add New Credential
      </h2>
      <form action={action} className="space-y-4">
        <div>
          <label className="block text-sm text-foreground mb-1">Key</label>
          <select
            name="key"
            required
            className="w-full rounded-lg border border-zinc-800 bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:border-zinc-600"
          >
            <option value="">Select a key...</option>
            <option value="META_ACCESS_TOKEN">META_ACCESS_TOKEN</option>
            <option value="META_APP_SECRET">META_APP_SECRET</option>
            <option value="META_WEBHOOK_VERIFY_TOKEN">META_WEBHOOK_VERIFY_TOKEN</option>
            <option value="TWILIO_AUTH_TOKEN">TWILIO_AUTH_TOKEN</option>
            <option value="VAPI_API_KEY">VAPI_API_KEY</option>
            <option value="CUSTOM">Custom...</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-foreground mb-1">
            Description
          </label>
          <input
            type="text"
            name="description"
            placeholder="e.g., Meta Graph API access token"
            className="w-full rounded-lg border border-zinc-800 bg-surface px-3 py-2 text-sm text-foreground placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>
        <div>
          <label className="block text-sm text-foreground mb-1">Value</label>
          <input
            type="password"
            name="value"
            required
            placeholder="Enter secret value..."
            className="w-full rounded-lg border border-zinc-800 bg-surface px-3 py-2 text-sm text-foreground placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save Credential"}
        </button>
        {state && !state.success && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
      </form>
    </div>
  );
}

function formatKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
