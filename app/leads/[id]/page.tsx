import { Suspense } from "react";
import Link from "next/link";
import { getLead, getLeadCommunications } from "@/lib/data";
import LeadEditForm from "@/components/lead/lead-edit-form";
import ActivityTimeline from "@/components/activity/activity-timeline";
import Skeleton from "@/components/ui/skeleton";
import Card from "@/components/ui/card";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lead, communications] = await Promise.all([
    getLead(id),
    getLeadCommunications(id),
  ]);

  if (!lead) {
    return (
      <div className="py-16 text-center">
        <p className="text-xl text-muted">Lead not found</p>
        <Link
          href="/leads"
          className="text-sm text-accent hover:underline mt-2 inline-block"
        >
          ← Back to leads
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/leads"
        className="text-sm text-muted hover:text-foreground transition-colors"
      >
        ← Back to leads
      </Link>

      <div className="flex items-center justify-between mt-2 mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{lead.name}</h1>
          <p className="text-sm text-muted mt-1">{lead.phone}{lead.email ? ` · ${lead.email}` : ""}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<Skeleton className="h-96" />}>
          <LeadEditForm lead={lead} />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-96" />}>
          <Card>
            <h2 className="text-sm font-medium text-muted mb-4">
              Activity Log
            </h2>
            <ActivityTimeline
              communications={communications}
              leadId={lead.id}
            />
          </Card>
        </Suspense>
      </div>
    </div>
  );
}
