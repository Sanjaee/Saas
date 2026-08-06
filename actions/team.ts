"use server";
import type { ActionState } from "@/lib/action-state";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { inviteSchema } from "@/lib/validations";
import { createTeamMember, updateTeamMember, removeTeamMember } from "@/lib/data";
import { ROLE_LABELS } from "@/lib/permissions";

export async function inviteMemberAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole("manager");
  if (!user) return { error: "You need manager permissions for this action." };

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
    permissions: String(formData.get("permissions") ?? "")
      .split(",")
      .filter(Boolean),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await createTeamMember({
    userId: null,
    invitedEmail: parsed.data.email.toLowerCase(),
    name: parsed.data.email.split("@")[0],
    role: parsed.data.role,
    status: "pending",
    permissions: parsed.data.permissions,
    invitedBy: user.id,
  });
  revalidatePath("/team");
  return { success: `Invitation sent to ${parsed.data.email} as ${ROLE_LABELS[parsed.data.role]}.` };
}

export async function updateMemberAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole("manager");
  if (!user) return { error: "You need manager permissions for this action." };
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "member") as "owner" | "admin" | "manager" | "member";
  const permissions = String(formData.get("permissions") ?? "")
    .split(",")
    .filter(Boolean);
  await updateTeamMember(id, { role, permissions });
  revalidatePath("/team");
  return { success: "Member updated." };
}

export async function removeMemberAction(id: string) {
  const user = await requireRole("manager");
  if (!user) return { error: "You need manager permissions for this action." };
  await removeTeamMember(id);
  revalidatePath("/team");
  return { success: "Member removed." };
}
