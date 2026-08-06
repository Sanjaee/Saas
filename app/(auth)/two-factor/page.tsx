"use client"
import type { ActionState } from "@/lib/action-state";

import { useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { verifyTwoFactorAction } from "@/actions/auth";

const initialState: ActionState = { error: "", success: "" };

function TwoFactorForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [state, formAction, pending] = useActionState(verifyTwoFactorAction, initialState);

  return (
    <div>
      <div className="space-y-1.5 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-violet-500/10">
          <ShieldCheck className="size-7 text-violet-500" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Two-factor authentication</h1>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code from your authenticator app to continue.
        </p>
      </div>

      {state.error && (
        <Alert variant="destructive" className="mt-5">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <form action={formAction} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={email} placeholder="you@company.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder="••••••••" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Authenticator code</Label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            placeholder="123 456"
            className="text-center font-mono text-lg tracking-[0.3em]"
            maxLength={6}
            required
            autoFocus
          />
        </div>
        <Button type="submit" className="w-full gap-2" size="lg" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
          Verify &amp; sign in
        </Button>
      </form>
    </div>
  );
}

export default function TwoFactorPage() {
  return (
    <Suspense>
      <TwoFactorForm />
    </Suspense>
  );
}
