import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Home, ArrowRight, ShieldQuestion, LockKeyhole, ServerCrash } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ErrorPage({
  code,
  title,
  description,
  icon: Icon,
  ctaHref,
  ctaLabel,
}: {
  code: string;
  title: string;
  description: string;
  icon: LucideIcon;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-grid px-4 text-center">
      <div className="animate-glow-pulse absolute top-1/4 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" aria-hidden />
      <div className="relative flex flex-col items-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-violet-500/10">
          <Icon className="size-8 text-violet-500" />
        </span>
        <span className="mt-6 text-[100px] font-extrabold leading-none text-gradient">{code}</span>
        <h1 className="mt-3 text-2xl font-bold">{title}</h1>
        <p className="mt-2 max-w-md text-muted-foreground">{description}</p>
        <div className="mt-8 flex gap-3">
          <Link href="/">
            <Button className="gap-2">
              <Home className="size-4" /> Back home
            </Button>
          </Link>
          <Link href={ctaHref}>
            <Button variant="outline" className="gap-2">
              {ctaLabel} <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export const ErrorScenes = {
  unauthorized: {
    code: "401",
    title: "Authentication required",
    description: "Please sign in to access this page.",
    icon: LockKeyhole,
    ctaHref: "/login",
    ctaLabel: "Sign in",
  },
  forbidden: {
    code: "403",
    title: "You can't access this",
    description: "Your account doesn't have permission to view this page. Contact an admin if you believe this is a mistake.",
    icon: ShieldQuestion,
    ctaHref: "/dashboard",
    ctaLabel: "Go to dashboard",
  },
  serverError: {
    code: "500",
    title: "Internal server error",
    description: "Something went wrong on our end. Please try again shortly.",
    icon: ServerCrash,
    ctaHref: "/",
    ctaLabel: "Back home",
  },
};
