"use server";
import type { ActionState } from "@/lib/action-state";

import { revalidatePath } from "next/cache";
import { requireUser, requireAdmin } from "@/lib/auth";
import { customerSchema, leadSchema } from "@/lib/validations";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  createLead,
  updateLead,
  deleteLead,
  createAuditLog,
} from "@/lib/data";

function audit(
  user: { id: string; email: string },
  action: string,
  entity: string,
  entityId?: string,
) {
  createAuditLog({ actorId: user.id, actorEmail: user.email, action, entity, entityId }).catch(
    () => {},
  );
}

export async function createCustomerAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company"),
    plan: formData.get("plan"),
    status: formData.get("status"),
    country: formData.get("country"),
    revenue: formData.get("revenue"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await createCustomer({ ...parsed.data, revenue: parsed.data.revenue ?? 0 });
  audit(user, "customer.create", "customer");
  revalidatePath("/customers");
  return { success: "Customer added." };
}

export async function updateCustomerAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (!user) return { error: "Not authenticated" };
  const id = String(formData.get("id") ?? "");

  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company"),
    plan: formData.get("plan"),
    status: formData.get("status"),
    country: formData.get("country"),
    revenue: formData.get("revenue"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await updateCustomer(id, parsed.data);
  audit(user, "customer.update", "customer", id);
  revalidatePath("/customers");
  return { success: "Customer updated." };
}

export async function deleteCustomerAction(id: string) {
  const user = await requireUser();
  if (!user) return { error: "Not authenticated" };
  await deleteCustomer(id);
  audit(user, "customer.delete", "customer", id);
  revalidatePath("/customers");
  return { success: "Customer deleted." };
}

export async function createLeadAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = leadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company"),
    status: formData.get("status"),
    source: formData.get("source"),
    score: formData.get("score"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await createLead(parsed.data);
  audit(user, "lead.create", "lead");
  revalidatePath("/leads");
  return { success: "Lead added." };
}

export async function updateLeadAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (!user) return { error: "Not authenticated" };
  const id = String(formData.get("id") ?? "");

  const parsed = leadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company"),
    status: formData.get("status"),
    source: formData.get("source"),
    score: formData.get("score"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await updateLead(id, parsed.data);
  audit(user, "lead.update", "lead", id);
  revalidatePath("/leads");
  return { success: "Lead updated." };
}

export async function deleteLeadAction(id: string) {
  const user = await requireUser();
  if (!user) return { error: "Not authenticated" };
  await deleteLead(id);
  audit(user, "lead.delete", "lead", id);
  revalidatePath("/leads");
  return { success: "Lead deleted." };
}

export async function adminDeleteCustomerAction(id: string) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Admin access required" };
  await deleteCustomer(id);
  revalidatePath("/admin/users");
  revalidatePath("/customers");
  return { success: "User deleted." };
}
