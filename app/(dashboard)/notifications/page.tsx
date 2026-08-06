import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { NotificationsPage } from "@/components/dashboard/notifications/notifications-page";
import { auth, requireUser } from "@/lib/auth";
import { listNotifications } from "@/lib/data";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsRoute() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = await requireUser();
  if (!user) redirect("/login");

  let notifications: Awaited<ReturnType<typeof listNotifications>> = [];
  try {
    notifications = await listNotifications(user.id, 100);
  } catch {
    // offline
  }

  return <NotificationsPage initial={notifications as never} />;
}
