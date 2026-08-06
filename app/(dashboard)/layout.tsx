import { redirect } from "next/navigation";

import { auth, requireUser } from "@/lib/auth";
import { listNotifications, unreadNotificationsCount } from "@/lib/data";
import { AppShell } from "@/components/dashboard/app-shell";
import { NotificationItem } from "@/components/dashboard/notifications-dropdown";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await requireUser();
  if (!user) redirect("/login");

  let notifications: NotificationItem[] = [];
  let unread = 0;
  try {
    notifications = await listNotifications(user.id, 6);
    unread = await unreadNotificationsCount(user.id);
  } catch {
    // offline/mock fallback handled by the store
  }

  return (
    <AppShell
      name={user.name}
      email={user.email}
      role={user.role}
      language={user.language}
      notifications={notifications}
      unread={unread}
    >
      {children}
    </AppShell>
  );
}
