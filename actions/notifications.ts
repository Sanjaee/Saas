"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  markNotificationRead,
  markAllNotificationsRead as markAll,
  createNotification,
} from "@/lib/data";

export async function markOneRead(id: string) {
  const user = await requireUser();
  if (!user) return;
  await markNotificationRead(id);
  revalidatePath("/notifications");
}

export async function markAllNotificationsRead() {
  const user = await requireUser();
  if (!user) return;
  await markAll(user.id);
  revalidatePath("/notifications");
  revalidatePath("/");
}

export async function pushNotification(title: string, message: string, type = "info") {
  const user = await requireUser();
  if (!user) return;
  await createNotification({ userId: user.id, title, message, type });
  revalidatePath("/notifications");
}
