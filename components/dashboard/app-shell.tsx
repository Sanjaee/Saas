"use client"

import { usePageMeta } from "./page-meta";
import { DashboardSidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { CommandMenu } from "@/components/command-menu";
import type { NotificationItem } from "./notifications-dropdown";
import { getDictionary } from "@/lib/i18n";

export function AppShell({
  name,
  email,
  role,
  language,
  notifications,
  unread,
  children,
}: {
  name: string;
  email: string;
  role: string;
  language: string;
  notifications: NotificationItem[];
  unread: number;
  children: React.ReactNode;
}) {
  const { title, description } = usePageMeta();
  const dict = getDictionary(language);

  return (
    <div className="flex min-h-svh w-full">
      <DashboardSidebar name={name} email={email} role={role} dict={dict} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={title}
          description={description}
          name={name}
          email={email}
          role={role}
          dict={dict}
          notifications={notifications}
          unread={unread}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
      <CommandMenu role={role} />
    </div>
  );
}
