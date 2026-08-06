"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "next-themes"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useAppUI } from "@/store/app-ui"
import { MAIN_NAV, ADMIN_NAV } from "@/components/dashboard/nav-items"
import { roleAtLeast, type Role } from "@/lib/permissions"

export function CommandMenu({ role }: { role: string }) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { commandMenuOpen, setCommandMenuOpen } = useAppUI();
  const [query, setQuery] = React.useState("");
  const isAdmin = roleAtLeast(role as Role, "admin");

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandMenuOpen(!commandMenuOpen);
      }
      if (e.key === "Escape") setCommandMenuOpen(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandMenuOpen, setCommandMenuOpen]);

  const run = (href: string) => {
    setCommandMenuOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <CommandDialog open={commandMenuOpen} onOpenChange={setCommandMenuOpen}>
      <CommandInput
        placeholder="Type a command or search…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem onSelect={() => run("/dashboard")}>Go to Dashboard</CommandItem>
          <CommandItem onSelect={() => run("/customers")}>Manage Customers</CommandItem>
          <CommandItem onSelect={() => run("/billing")}>Billing &amp; Plan</CommandItem>
          <CommandItem onSelect={() => run("/settings")}>Settings</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        {MAIN_NAV.map((group) => (
          <CommandGroup key={group.label} heading={group.label}>
            {group.items.map((item) => (
              <CommandItem key={item.href} onSelect={() => run(item.href)}>
                <item.icon className="size-4" />
                {item.title}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
        {isAdmin && (
          <>
            <CommandSeparator />
            {ADMIN_NAV.map((group) => (
              <CommandGroup key={group.label} heading={group.label}>
                {group.items.map((item) => (
                  <CommandItem key={item.href} onSelect={() => run(item.href)}>
                    <item.icon className="size-4" />
                    {item.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </>
        )}
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => setTheme("light")}>
            <Sun className="size-4" /> Light
          </CommandItem>
          <CommandItem onSelect={() => setTheme("dark")}>
            <Moon className="size-4" /> Dark
          </CommandItem>
          <CommandItem onSelect={() => setTheme("system")}>
            <Laptop className="size-4" /> System
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
