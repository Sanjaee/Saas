"use client"
import type { ActionState } from "@/lib/action-state";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OAuthButtons, type OAuthProvider } from "@/components/auth/oauth-buttons";
import { registerAction } from "@/actions/auth";

const initialState: ActionState = { error: "", fieldErrors: {} };

function getOAuthProviders(): OAuthProvider[] {
  const providers: OAuthProvider[] = [];
  if (process.env.AUTH_GITHUB_ID) providers.push({ id: "github", label: "GitHub" });
  if (process.env.AUTH_GOOGLE_ID) providers.push({ id: "google", label: "Google" });
  if (process.env.AUTH_MICROSOFT_ID) providers.push({ id: "microsoft", label: "Microsoft" });
  return providers;
}

function fieldError(
  state: typeof initialState,
  name: string,
): string | undefined {
  return state.fieldErrors?.[name]?.[0];
}

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <div>
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Start your 14-day free trial. No credit card required.
        </p>
      </div>

      {state.error && (
        <Alert variant="destructive" className="mt-5">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <form action={formAction} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" placeholder="Alex Morgan" autoComplete="name" required />
            {fieldError(state, "name") && (
              <p className="text-xs text-destructive">{fieldError(state, "name")}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" placeholder="Acme Inc" autoComplete="organization" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" name="email" type="email" placeholder="you@company.com" autoComplete="email" required />
          {fieldError(state, "email") && (
            <p className="text-xs text-destructive">{fieldError(state, "email")}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" autoComplete="new-password" required />
            {fieldError(state, "password") && (
              <p className="text-xs text-destructive">{fieldError(state, "password")}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" autoComplete="new-password" required />
            {fieldError(state, "confirmPassword") && (
              <p className="text-xs text-destructive">{fieldError(state, "confirmPassword")}</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox id="terms" name="terms" required />
          <label htmlFor="terms" className="text-sm text-muted-foreground">
            I agree to the{" "}
            <Link href="#" className="font-medium text-violet-500 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="font-medium text-violet-500 hover:underline">
              Privacy Policy
            </Link>
            .
          </label>
        </div>
        {fieldError(state, "terms") && (
          <p className="text-xs text-destructive">{fieldError(state, "terms")}</p>
        )}

        <Button type="submit" className="w-full gap-2" size="lg" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
          Create account
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wider">
          <span className="bg-background px-2 text-muted-foreground">or continue with</span>
        </div>
      </div>

      <OAuthButtons providers={getOAuthProviders()} />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-violet-500 hover:text-violet-600">
          Sign in
        </Link>
      </p>
    </div>
  );
}
