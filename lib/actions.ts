"use server";

import { revalidatePath, refresh } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionResult, LeadStatus } from "./types";

const BACKEND_URL = process.env.BACKEND_URL;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}/api/v1${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  const json = await res.json();
  return json.data ?? json;
}

function hasBackend() {
  return Boolean(BACKEND_URL);
}

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
): Promise<ActionResult> {
  if (hasBackend()) {
    try {
      await apiFetch(`/leads/${leadId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }
  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/");
  refresh();
  return { success: true };
}

export async function updateLead(
  leadId: string,
  formData: FormData,
): Promise<ActionResult> {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = (formData.get("email") as string) || null;
  const status = formData.get("status") as LeadStatus;

  if (!name?.trim() || !phone?.trim()) {
    return { success: false, error: "Name and phone are required." };
  }

  if (hasBackend()) {
    try {
      await apiFetch(`/leads/${leadId}`, {
        method: "PUT",
        body: JSON.stringify({ name, phone, email, status }),
      });
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/");
  refresh();
  return { success: true };
}

export async function saveApiConfig(
  formData: FormData,
): Promise<ActionResult> {
  const key = formData.get("key") as string;
  const value = formData.get("value") as string;
  const description = (formData.get("description") as string) || null;

  if (!key?.trim() || !value?.trim()) {
    return { success: false, error: "Key and value are required." };
  }

  if (hasBackend()) {
    try {
      await apiFetch("/api-configs", {
        method: "POST",
        body: JSON.stringify({ key, value, description, isActive: true }),
      });
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  revalidatePath("/settings");
  refresh();
  return { success: true };
}

export async function updateApiConfig(
  key: string,
  formData: FormData,
): Promise<ActionResult> {
  const value = formData.get("value") as string;
  const description = (formData.get("description") as string) || null;

  if (!value?.trim()) {
    return { success: false, error: "Value is required." };
  }

  if (hasBackend()) {
    try {
      await apiFetch(`/api-configs/${key}`, {
        method: "PUT",
        body: JSON.stringify({ value, description, isActive: true }),
      });
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  revalidatePath("/settings");
  refresh();
  return { success: true };
}

export async function logCommunication(
  leadId: string,
  formData: FormData,
): Promise<ActionResult> {
  const type = formData.get("type") as "MESSAGE" | "CALL";
  const direction = formData.get("direction") as "INBOUND" | "OUTBOUND";
  const content = (formData.get("content") as string) || null;

  if (hasBackend()) {
    try {
      await apiFetch("/communications", {
        method: "POST",
        body: JSON.stringify({ leadId, type, direction, content }),
      });
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/activity");
  refresh();
  return { success: true };
}

export async function deleteLead(leadId: string): Promise<ActionResult> {
  if (hasBackend()) {
    try {
      await apiFetch(`/leads/${leadId}`, { method: "DELETE" });
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  }

  revalidatePath("/leads");
  revalidatePath("/");
  redirect("/leads");
}
