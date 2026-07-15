"use client";

import { useState, FormEvent } from "react";
import { useCrm } from "../../_crm/context";
import { Field, Icon } from "../../_crm/components";
import { useRouter } from "next/navigation";
import {
  blankLeadForm,
  LeadForm,
  Lead,
  apiBase,
  BackendLead,
  mapBackendLead,
  sourceStyles,
  statusStyles,
  LeadSource,
  LeadStatus,
} from "../../_crm/data";

export default function CreateLeadPage() {
  const { leads, setLeads, setApiState, setSyncMessage, setActivities } = useCrm();
  const [form, setForm] = useState<LeadForm>(blankLeadForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const updateForm = <K extends keyof LeadForm>(field: K, value: LeadForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const optimisticLead: Lead = {
      id: `local-${Date.now()}`,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      source: form.source,
      status: form.status,
      value: Number.parseInt(form.value, 10) || 0,
      propertyType: form.propertyType.trim() || "Property",
      area: form.area.trim() || "Unassigned area",
      score: form.status === "NEW" ? 72 : 84,
      assignedTo: "Owner desk",
      aiAgent: form.source === "COLD_CALL" ? "Call AI" : "Message AI",
      lastActivity: "Custom lead added from CRM",
      nextAction: form.notes.trim() || "Run AI qualification sequence",
      createdAt: new Date().toISOString(),
      communicationCount: 0,
      aiPaused: false,
      chatHistory: [
        {
          sender: "AI",
          text: "Hello! Thank you for inquiring. We have logged your request and our AI will qualify your requirements.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    };

    try {
      const response = await fetch(`${apiBase}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: optimisticLead.name,
          phone: optimisticLead.phone,
          email: optimisticLead.email || "",
          source: optimisticLead.source,
          status: optimisticLead.status,
        }),
      });

      if (response.ok) {
        const payload = (await response.json()) as { data?: BackendLead };
        const savedLead = payload.data ? mapBackendLead(payload.data, leads.length) : optimisticLead;
        setLeads((current) => [
          {
            ...optimisticLead,
            id: savedLead.id,
            createdAt: savedLead.createdAt,
            lastActivity: "Saved to backend CRM",
          },
          ...current,
        ]);
        setApiState("connected");
        setSyncMessage("Lead saved to backend CRM.");
      } else {
        setLeads((current) => [optimisticLead, ...current]);
        setApiState("offline");
        setSyncMessage("Lead added locally (Sandbox).");
      }
    } catch {
      setLeads((current) => [optimisticLead, ...current]);
      setApiState("offline");
      setSyncMessage("Lead added locally (Sandbox).");
    } finally {
      setForm(blankLeadForm());
      setIsSubmitting(false);
      router.push("/crm/leads");
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 animate-fade-in max-w-2xl mx-auto">
      <section id="add-lead" className="rounded-xl premium-border bg-[var(--bg-card)] p-5 shadow-md backdrop-blur transition-colors duration-200">
        <div className="mb-5 flex items-center justify-between gap-3 premium-border-b pb-4">
          <div>
            <h2 className="text-sm font-bold text-[var(--text-title)] uppercase tracking-wider">Add custom lead</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Manual entries are qualified by AI sequence.</p>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-600 text-white shadow-md">
            <Icon name="add" />
          </div>
        </div>

        <form className="space-y-4 text-xs font-semibold" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <input
                required
                className="h-10 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] px-3.5 text-sm text-[var(--text-title)] outline-none focus:border-teal-500 transition-colors duration-200"
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
              />
            </Field>
            <Field label="Phone number">
              <input
                required
                className="h-10 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] px-3.5 text-sm text-[var(--text-title)] outline-none focus:border-teal-500 transition-colors duration-200"
                placeholder="555-018-7830"
                value={form.phone}
                onChange={(event) => updateForm("phone", event.target.value)}
              />
            </Field>
          </div>
          <Field label="Email">
            <input
              className="h-10 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] px-3.5 text-sm text-[var(--text-title)] outline-none focus:border-teal-500 transition-colors duration-200"
              type="email"
              placeholder="example@nexaestate.local"
              value={form.email}
              onChange={(event) => updateForm("email", event.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Lead Source">
              <select
                className="h-10 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] px-3 text-xs font-semibold text-[var(--text-title)] outline-none focus:border-teal-500 transition-colors duration-200"
                value={form.source}
                onChange={(event) => updateForm("source", event.target.value as LeadSource)}
              >
                {Object.entries(sourceStyles).map(([source, meta]) => (
                  <option key={source} value={source}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Pipeline Stage">
              <select
                className="h-10 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] px-3 text-xs font-semibold text-[var(--text-title)] outline-none focus:border-teal-500 transition-colors duration-200"
                value={form.status}
                onChange={(event) => updateForm("status", event.target.value as LeadStatus)}
              >
                {Object.entries(statusStyles).map(([status, meta]) => (
                  <option key={status} value={status}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Budget value (USD)">
              <input
                className="h-10 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] px-3.5 text-sm text-[var(--text-title)] outline-none focus:border-teal-500 transition-colors duration-200"
                inputMode="numeric"
                value={form.value}
                onChange={(event) => updateForm("value", event.target.value)}
              />
            </Field>
            <Field label="Property Inquiry type">
              <input
                className="h-10 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] px-3.5 text-sm text-[var(--text-title)] outline-none focus:border-teal-500 transition-colors duration-200"
                value={form.propertyType}
                onChange={(event) => updateForm("propertyType", event.target.value)}
              />
            </Field>
          </div>
          <Field label="Property location area">
            <input
              className="h-10 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] px-3.5 text-sm text-[var(--text-title)] outline-none focus:border-teal-500 transition-colors duration-200"
              value={form.area}
              onChange={(event) => updateForm("area", event.target.value)}
            />
          </Field>
          <Field label="Lead requirements & notes">
            <textarea
              className="h-20 w-full rounded-lg premium-border bg-[var(--bg-inner-input)] px-3.5 py-2.5 text-sm text-[var(--text-title)] outline-none focus:border-teal-500 resize-none transition-colors duration-200"
              value={form.notes}
              onChange={(event) => updateForm("notes", event.target.value)}
            />
          </Field>
          <button
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-teal-600 text-sm font-semibold text-white shadow-md transition hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            disabled={isSubmitting || !form.name.trim() || !form.phone.trim()}
            type="submit"
          >
            <Icon name="add" />
            {isSubmitting ? "Creating..." : "Add Lead to CRM"}
          </button>
        </form>
      </section>
    </div>
  );
}
