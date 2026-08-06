"use client"

import * as React from "react"
import Link from "next/link"
import { Bell, CheckCheck, Info, CheckCircle2, AlertTriangle, XCircle, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { timeAgo } from "@/lib/format"
import { markAllNotificationsRead } from "@/actions/notifications"

export interface NotificationItem {
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

export function NotificationsDropdown({
  items,
  unread,
}: {
  items: NotificationItem[];
  unread: number;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unread > 0 && (
            <button
              className="flex items-center gap-1 text-xs font-medium text-violet-500 hover:text-violet-600"
              onClick={async () => {
                await markAllNotificationsRead();
                toast.success("All notifications marked as read");
              }}
            >
              <CheckCheck className="size-3.5" /> Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              <Bell className="mx-auto mb-2 size-6 opacity-40" />
              You&apos;re all caught up.
            </div>
          ) : (
            items.map((item) => {
              const Icon = TYPE_ICONS[item.type] ?? Info;
              return (
                <DropdownMenuItem key={item.id} className="cursor-pointer items-start gap-3 py-2.5">
                  <span className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", TYPE_COLORS[item.type] ?? TYPE_COLORS.info)}>
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{item.title}</span>
                    {item.message && (
                      <span className="block truncate text-xs text-muted-foreground">{item.message}</span>
                    )}
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">
                      {timeAgo(item.createdAt)}
                    </span>
                  </span>
                  {!item.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-violet-500" />}
                </DropdownMenuItem>
              );
            })
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="justify-center">
          <Link href="/notifications" className="text-sm font-medium text-violet-500">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
