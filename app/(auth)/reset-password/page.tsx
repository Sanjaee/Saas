"use client"
import type { ActionState } from "@/lib/action-state";

import { useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { resetPasswordAction } from "@/actions/auth";

const initialState = { error: "" };

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <div>
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Set a new password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a strong password you haven&apos;t used before.
        </p>
      </div>

      {state.error && (
        <Alert variant="destructive" className="mt-5">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {!token ? (
        <Alert className="mt-5">
          <AlertDescription>This reset link is missing a token. Request a new one.</AlertDescription>
        </Alert>
      ) : (
        <form action={formAction} className="mt-6 space-y-4">
          <input type="hidden" name="token" value={token} />
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" autoComplete="new-password" required />
            <p className="text-xs text-muted-foreground">At least 8 characters with letters and numbers.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" autoComplete="new-password" required />
          </div>
          <Button type="submit" className="w-full gap-2" size="lg" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
            Reset password
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-violet-500 hover:text-violet-600">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
