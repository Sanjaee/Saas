"use client"

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Loader2, ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OAuthButtons, type OAuthProvider } from "@/components/auth/oauth-buttons";
import { loginSchema } from "@/lib/validations";

function getOAuthProviders(): OAuthProvider[] {
  const providers: OAuthProvider[] = [];
  if (process.env.AUTH_GITHUB_ID) providers.push({ id: "github", label: "GitHub" });
  if (process.env.AUTH_GOOGLE_ID) providers.push({ id: "google", label: "Google" });
  if (process.env.AUTH_MICROSOFT_ID) providers.push({ id: "microsoft", label: "Microsoft" });
  return providers;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [rememberEmail, setRememberEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const code = step === "2fa" ? String(form.get("code") ?? "") : undefined;

    const parsed = loginSchema.safeParse({ email, password, code });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input.");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        code,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password.");
      } else if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      const code2fa = (err as { code?: string })?.code;
      if (code2fa === "2FA_REQUIRED") {
        setStep("2fa");
        setRememberEmail(email);
        setError(null);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {step === "credentials" ? "Welcome back" : "Two-factor authentication"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {step === "credentials"
            ? "Sign in to your Zacode workspace."
            : "Enter the 6-digit code from your authenticator app."}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-5">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {step === "2fa" ? (
          <>
            <input type="hidden" name="email" value={rememberEmail} />
            <div className="space-y-2">
              <Label htmlFor="code">Authenticator code</Label>
              <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 text-sm text-muted-foreground">
                <ShieldCheck className="size-4 text-violet-500" />
                {rememberEmail}
              </div>
              <Input
                id="code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123 456"
                className="mt-2 text-center font-mono text-lg tracking-[0.3em]"
                autoFocus
                maxLength={6}
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@company.com" autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="/forgot-password" className="text-sm font-medium text-violet-500 hover:text-violet-600">
                  Forgot password?
                </a>
              </div>
              <Input id="password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" required />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <label htmlFor="remember" className="text-sm text-muted-foreground">
                Remember me for 30 days
              </label>
            </div>
          </>
        )}

        <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
          {step === "credentials" ? "Sign in" : "Verify & sign in"}
        </Button>
      </form>

      {step === "2fa" && (
        <button
          onClick={() => setStep("credentials")}
          className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to sign in
        </button>
      )}

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
        Don&apos;t have an account?{" "}
        <a href="/register" className="font-medium text-violet-500 hover:text-violet-600">
          Start free trial
        </a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
