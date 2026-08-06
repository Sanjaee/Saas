"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { upsertIntegration } from "@/lib/data";

export async function toggleIntegrationAction(provider: string, name: string, connected: boolean) {
  const user = await requireUser();
  if (!user) return { error: "Not authenticated" };
  await upsertIntegration({
    userId: user.id,
    provider,
    name,
    connected,
  });
  revalidatePath("/integrations");
  return { success: true };
}
