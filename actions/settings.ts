"use server";
import type { ActionState } from "@/lib/action-state";

import bcrypt from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { profileSchema, securitySchema, preferencesSchema } from "@/lib/validations";
import { updateUser } from "@/lib/data";

export async function updateProfileAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await updateUser(user.id, { ...parsed.data, company: parsed.data.company || null, phone: parsed.data.phone || null });
  revalidatePath("/settings");
  return { success: "Profile updated." };
}

export async function updatePasswordAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = securitySchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const valid = user.passwordHash && bcrypt.compareSync(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { error: "Current password is incorrect." };

  await updateUser(user.id, { passwordHash: bcrypt.hashSync(parsed.data.newPassword, 10) });
  revalidatePath("/settings");
  return { success: "Password updated." };
}

export async function updatePreferencesAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  if (!user) return { error: "Not authenticated" };

  const parsed = preferencesSchema.safeParse({
    language: formData.get("language"),
    theme: formData.get("theme"),
    timezone: formData.get("timezone"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await updateUser(user.id, { language: parsed.data.language, timezone: parsed.data.timezone });
  revalidatePath("/settings");
  return { success: "Preferences updated." };
}

export async function uploadAvatarAction(formData: FormData) {
  const user = await requireUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("file") as File | null;
  if (!file) return { error: "No file provided." };
  if (file.size > 2 * 1024 * 1024) return { error: "Image must be under 2MB." };
  if (!file.type.startsWith("image/")) return { error: "Only images are allowed." };

  try {
    const ext = path.extname(file.name) || ".png";
    const filename = `avatar-${user.id}${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(dir, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), bytes);
    const url = `/uploads/avatars/${filename}`;
    await updateUser(user.id, { image: url });
    revalidatePath("/settings");
    return { success: "Avatar updated.", url };
  } catch (error) {
    console.error("Upload failed:", error);
    return { error: "Upload failed." };
  }
}
