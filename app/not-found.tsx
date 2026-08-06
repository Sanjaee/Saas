import Link from "next/link";
import { Compass, Home } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-grid px-4 text-center">
      <div className="animate-glow-pulse absolute top-1/4 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" aria-hidden />
      <span className="text-[120px] font-extrabold leading-none text-gradient">404</span>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/">
          <Button className="gap-2">
            <Home className="size-4" /> Back home
          </Button>
        </Link>
        <Link href="/blog">
          <Button variant="outline" className="gap-2">
            <Compass className="size-4" /> Explore blog
          </Button>
        </Link>
      </div>
    </div>
  );
}
