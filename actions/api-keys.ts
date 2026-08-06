"use server";
import type { ActionState } from "@/lib/action-state";

import { revalidatePath } from "next/cache";
import { randomBytes, createHash } from "crypto";
import { requireUser } from "@/lib/auth";
import { apiKeySchema } from "@/lib/validations";
import { createApiKey, revokeApiKey } from "@/lib/data";

export async function createApiKeyAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (!user) return { error: "Not authenticated" };
  const parsed = apiKeySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid name." };

  const raw = `nb_live_${randomBytes(24).toString("hex")}`;
  const preview = `nb_live_…${raw.slice(-6)}`;
  const hash = createHash("sha256").update(raw).digest("hex");

  await createApiKey({
    userId: user.id,
    name: parsed.data.name,
    keyPreview: preview,
    keyHash: hash,
    revoked: false,
  });
  revalidatePath("/api-keys");
  return { success: "API key created.", secret: raw };
}

export async function revokeApiKeyAction(id: string) {
  const user = await requireUser();
  if (!user) return { error: "Not authenticated" };
  await revokeApiKey(id);
  revalidatePath("/api-keys");
  return { success: "API key revoked." };
}
