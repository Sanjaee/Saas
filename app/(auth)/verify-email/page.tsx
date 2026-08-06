"use client"
import type { ActionState } from "@/lib/action-state";

import { useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, MailCheck, CheckCircle2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { verifyEmailAction, resendVerificationAction } from "@/actions/auth";

const initialState: ActionState = { error: "", success: "" };
const resendInitial: ActionState = { error: "", success: "", devCode: "" };

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const devCode = searchParams.get("dev") ?? "";
  const [state, formAction, pending] = useActionState(verifyEmailAction, initialState);
  const [resendState, resendAction, resendPending] = useActionState(resendVerificationAction, resendInitial);

  return (
    <div>
      <div className="space-y-1.5 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-violet-500/10">
          <MailCheck className="size-7 text-violet-500" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Verify your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to <span className="font-medium text-foreground">{email || "your inbox"}</span>.
        </p>
      </div>

      {state.success && (
        <Alert className="mt-5 border-emerald-500/30 bg-emerald-500/10">
          <AlertDescription className="text-emerald-500">{state.success}</AlertDescription>
        </Alert>
      )}
      {state.error && (
        <Alert variant="destructive" className="mt-5">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {resendState.success && (
        <Alert className="mt-5 border-emerald-500/30 bg-emerald-500/10">
          <AlertDescription className="text-emerald-500">
            {resendState.success}
            {resendState.devCode ? ` (demo code: ${resendState.devCode})` : ""}
          </AlertDescription>
        </Alert>
      )}

      {devCode && (
        <Alert className="mt-5 border-dashed">
          <AlertDescription>
            <span className="font-semibold">Demo mode:</span> your verification code is{" "}
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono font-bold">{devCode}</span>
          </AlertDescription>
        </Alert>
      )}

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="email" value={email} />
        <div className="space-y-2">
          <Label htmlFor="code">Verification code</Label>
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
          {pending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
          Verify email
        </Button>
      </form>

      <form action={resendAction} className="mt-3">
        <input type="hidden" name="email" value={email} />
        <Button variant="ghost" className="w-full gap-2" size="sm" disabled={resendPending}>
          {resendPending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          Resend code
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already verified?{" "}
        <Link href="/login" className="font-medium text-violet-500 hover:text-violet-600">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
