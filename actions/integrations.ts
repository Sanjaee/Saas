"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { upsertIntegration } from "@/lib/data";

export async function toggleIntegrationAction(provider: string, name: string, connected: boolean) {
  const user = await requireRole("manager");
  if (!user) return { error: "You need manager permissions for this action." };
  await upsertIntegration({
    userId: user.id,
    provider,
    name,
    connected,
  });
  revalidatePath("/integrations");
  return { success: true };
}
