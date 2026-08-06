"use client"

import * as React from "react"
import { CheckCheck, Info, CheckCircle2, AlertTriangle, XCircle, Sparkles, Bell } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/dashboard/page-header"
import { markOneRead, markAllNotificationsRead } from "@/actions/notifications"
import { timeAgo } from "@/lib/format"
import { cn } from "@/lib/utils"

export interface NotificationRow {
  id: string;
  title: string;
  message: string | null;
  type: string;
  read: boolean;
  createdAt: Date;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
  ai: Sparkles,
};

const TYPE_COLORS: Record<string, string> = {
  success: "text-emerald-500 bg-emerald-500/10",
  warning: "text-amber-500 bg-amber-500/10",
  error: "text-destructive bg-destructive/10",
  info: "text-sky-500 bg-sky-500/10",
  ai: "text-violet-500 bg-violet-500/10",
};

export function NotificationsPage({ initial }: { initial: NotificationRow[] }) {
  const [items, setItems] = React.useState(initial);
  const unread = items.filter((n) => !n.read).length;

  async function toggle(id: string) {
    setItems(items.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
    await markOneRead(id);
  }

  async function markAll() {
    setItems(items.map((n) => ({ ...n, read: true })));
    await markAllNotificationsRead();
    toast.success("All notifications marked as read");
  }

  return (
    <div>
      <PageHeader title="Notifications" description="Everything that needs your attention.">
        {unread > 0 && (
          <Button variant="outline" onClick={markAll} className="gap-1.5">
            <CheckCheck className="size-4" /> Mark all read
          </Button>
        )}
      </PageHeader>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed p-16 text-center text-muted-foreground">
          <Bell className="mx-auto mb-3 size-10 opacity-40" />
          <p className="font-medium">You&apos;re all caught up</p>
          <p className="text-sm">New notifications will appear here in real time.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const Icon = TYPE_ICONS[item.type] ?? Info;
            return (
              <Card
                key={item.id}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-muted/40",
                  !item.read && "border-violet-500/40 bg-violet-500/[0.03]",
                )}
                onClick={() => toggle(item.id)}
              >
                <div className="flex items-start gap-3 p-4">
                  <span className={cn("mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg", TYPE_COLORS[item.type] ?? TYPE_COLORS.info)}>
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("text-sm font-medium", !item.read && "font-semibold")}>{item.title}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(item.createdAt)}</span>
                    </div>
                    {item.message && <p className="mt-0.5 text-sm text-muted-foreground">{item.message}</p>}
                  </div>
                  {!item.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-violet-500" />}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
