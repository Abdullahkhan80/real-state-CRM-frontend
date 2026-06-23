import { Suspense } from "react";
import { getApiConfigs } from "@/lib/data";
import CredentialsForm from "@/components/settings/credentials-form";
import Skeleton from "@/components/ui/skeleton";

export default async function SettingsPage() {
  const configs = await getApiConfigs();

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted mt-1">
          Configure webhook secrets and API credentials for Meta Lead Ads and other integrations.
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-64" />}>
        <CredentialsForm configs={configs} />
      </Suspense>

      <div className="mt-8 rounded-xl border border-zinc-800 bg-surface p-6">
        <h2 className="text-sm font-medium text-muted mb-2">
          Meta Lead Ads Webhook Setup
        </h2>
        <p className="text-xs text-zinc-500 leading-relaxed">
          Configure your Meta app webhook to point to:{" "}
          <code className="bg-zinc-800 px-1 py-0.5 rounded text-accent">
            {process.env.BACKEND_URL || "https://your-domain.com"}
            /api/v1/webhook/meta
          </code>
        </p>
        <ul className="mt-3 text-xs text-zinc-500 space-y-1 list-disc list-inside">
          <li>Set the verify token to match your <strong>META_WEBHOOK_VERIFY_TOKEN</strong></li>
          <li>The app secret is used to validate incoming payload signatures</li>
          <li>Enable the <strong>leads</strong> field under Webhook subscriptions</li>
        </ul>
      </div>
    </div>
  );
}
