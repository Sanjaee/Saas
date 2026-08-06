"use client"

import * as React from "react"
import Link from "next/link"
import { PanelLeft, Search, Menu, X, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAppUI } from "@/store/app-ui"
import { ThemeToggle } from "@/components/theme-toggle"
import { Logo } from "@/components/landing/logo"
import { NotificationsDropdown, type NotificationItem } from "./notifications-dropdown"
import { MAIN_NAV, ADMIN_NAV } from "./nav-items"
import { logoutAction } from "@/actions/auth"
import { roleAtLeast, type Role } from "@/lib/permissions"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Dictionary } from "@/lib/i18n"

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

function MobileNav({
  name,
  email,
  role,
  dict,
}: {
  name: string;
  email: string;
  role: string;
  dict: Dictionary;
}) {
  const pathname = usePathname();
  const isAdmin = roleAtLeast(role as Role, "admin");
  const groups = isAdmin ? [...MAIN_NAV, ...ADMIN_NAV] : MAIN_NAV;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-72 flex-col p-0">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/dashboard"><Logo /></Link>
          <SheetClose asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Close menu">
              <X className="size-4" />
            </Button>
          </SheetClose>
        </div>
        <ScrollArea className="flex-1 px-2 py-4">
          {groups.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group.tKey ? dict.nav[group.tKey] : group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <item.icon className="size-4" />
                        {item.tKey ? dict.nav[item.tKey] : item.title}
                      </Link>
                    </SheetClose>
                  );
                })}
              </div>
            </div>
          ))}
        </ScrollArea>
        <div className="border-t p-3">
          <div className="mb-2 flex items-center gap-2 rounded-lg border bg-background p-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-gradient-to-br from-violet-600 to-indigo-500 text-xs font-bold text-white">
              {name.slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{name}</span>
              <span className="block truncate text-xs text-muted-foreground">{email}</span>
            </span>
          </div>
          <Button
            variant="outline"
            className="w-full gap-2 text-destructive"
            onClick={async () => {
              await logoutAction();
            }}
          >
            <LogOut className="size-4" /> Log out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function Topbar({
  title,
  description,
  name,
  email,
  role,
  dict,
  notifications,
  unread,
  children,
}: {
  title: string;
  description?: string;
  name: string;
  email: string;
  role: string;
  dict: Dictionary;
  notifications: NotificationItem[];
  unread: number;
  children?: React.ReactNode;
}) {
  const { toggleSidebar, setCommandMenuOpen } = useAppUI();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <MobileNav name={name} email={email} role={role} dict={dict} />
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:inline-flex"
        aria-label="Toggle sidebar"
        onClick={toggleSidebar}
      >
        <PanelLeft className="size-4" />
      </Button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold sm:text-base">{title}</h1>
        {description && (
          <p className="hidden truncate text-xs text-muted-foreground sm:block">{description}</p>
        )}
      </div>

      {children}

      <Button
        variant="outline"
        className="hidden w-52 justify-start gap-2 text-muted-foreground sm:flex"
        onClick={() => setCommandMenuOpen(true)}
      >
        <Search className="size-3.5" />
        <span className="flex-1 text-left text-sm">{dict.common.search}</span>
        <kbd className="pointer-events-none inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="sm:hidden"
        aria-label="Search"
        onClick={() => setCommandMenuOpen(true)}
      >
        <Search className="size-4" />
      </Button>

      <NotificationsDropdown items={notifications} unread={unread} />
      <ThemeToggle />
    </header>
  );
}
