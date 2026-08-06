"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { useAppUI } from "@/store/app-ui"
import { Logo } from "@/components/landing/logo"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logoutAction } from "@/actions/auth"
import { MAIN_NAV, ADMIN_NAV, type NavGroup } from "./nav-items"
import { roleAtLeast, type Role } from "@/lib/permissions"
import type { Dictionary } from "@/lib/i18n"

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

function NavList({
  groups,
  pathname,
  collapsed,
  onNavigate,
  dict,
}: {
  groups: NavGroup[];
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
  dict: Dictionary;
}) {
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.label}>
          {!collapsed && (
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {group.tKey ? dict.nav[group.tKey] : group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const link = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    collapsed && "justify-center px-0",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className={cn("size-4 shrink-0", active && "text-primary")} />
                  {!collapsed && <span className="flex-1 truncate">{item.tKey ? dict.nav[item.tKey] : item.title}</span>}
                  {!collapsed && item.badge ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right">{item.tKey ? dict.nav[item.tKey] : item.title}</TooltipContent>
                  </Tooltip>
                );
              }
              return link;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function UserMenu({ name, email, role }: { name: string; email: string; role: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex w-full items-center gap-2 rounded-lg border bg-background p-2 text-left transition-colors hover:bg-muted"
          aria-label="Open user menu"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-violet-600 to-indigo-500 text-xs font-bold text-white">
            {name.slice(0, 2).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{name}</span>
            <span className="block truncate text-xs text-muted-foreground">{email}</span>
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>
          <span className="block text-sm">{name}</span>
          <span className="block truncate text-xs font-normal text-muted-foreground">{email}</span>
          <span className="mt-1 inline-block rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-500">
            {role}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">Profile &amp; settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/billing">Billing</Link>
        </DropdownMenuItem>
        {roleAtLeast(role as Role, "admin") && (
          <DropdownMenuItem asChild>
            <Link href="/admin">Admin panel</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={async () => {
            await logoutAction();
          }}
        >
          <LogOut className="size-4" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DashboardSidebar({
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
  const { sidebarCollapsed } = useAppUI();
  const isAdmin = roleAtLeast(role as Role, "admin");

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-svh shrink-0 flex-col border-r bg-sidebar transition-[width] duration-300 md:flex",
        sidebarCollapsed ? "w-[68px]" : "w-64",
      )}
    >
      <div className={cn("flex h-16 items-center border-b px-4", sidebarCollapsed && "justify-center px-0")}>
        <Link href="/dashboard" aria-label="Dashboard home">
          <Logo className={cn(sidebarCollapsed && "scale-90")} />
        </Link>
      </div>

      <ScrollArea className="flex-1 px-2 py-4">
        <NavList groups={MAIN_NAV} pathname={pathname} collapsed={sidebarCollapsed} dict={dict} />
        {isAdmin && (
          <div className="mt-6">
            <NavList groups={ADMIN_NAV} pathname={pathname} collapsed={sidebarCollapsed} dict={dict} />
          </div>
        )}
      </ScrollArea>

      <div className={cn("border-t p-3", sidebarCollapsed && "flex justify-center p-2")}>
        {sidebarCollapsed ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex size-10 items-center justify-center rounded-lg border bg-background hover:bg-muted" aria-label="Open user menu">
                <span className="flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-violet-600 to-indigo-500 text-[10px] font-bold text-white">
                  {name.slice(0, 2).toUpperCase()}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right" className="w-56">
              <DropdownMenuLabel>{name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/billing">Billing</Link></DropdownMenuItem>
              {isAdmin && <DropdownMenuItem asChild><Link href="/admin">Admin panel</Link></DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={async () => logoutAction()}>
                <LogOut className="size-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <UserMenu name={name} email={email} role={role} />
        )}
      </div>
    </aside>
  );
}
