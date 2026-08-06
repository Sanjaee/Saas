"use client"

import { useEffect } from "react";
import { TriangleAlert, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
        <TriangleAlert className="size-8 text-destructive" />
      </span>
      <h1 className="mt-6 text-3xl font-bold">Something went wrong</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        An unexpected error occurred{error.digest ? ` (reference ${error.digest})` : ""}. Try again, or head back home.
      </p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="size-4" /> Try again
        </Button>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <Home className="size-4" /> Back home
          </Button>
        </Link>
      </div>
    </div>
  );
}
