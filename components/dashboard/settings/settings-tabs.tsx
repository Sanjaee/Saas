"use client"
import type { ActionState } from "@/lib/action-state";

import * as React from "react"
import { useActionState } from "react"
import { toast } from "sonner"
import {
  User,
  Shield,
  SlidersHorizontal,
  KeyRound,
  QrCode,
  Smartphone,
  Copy,
  Check,
  Loader2,
  LogOut,
  Monitor,
  Globe,
  Palette,
} from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { logoutAction } from "@/actions/auth"
import { updateProfileAction, updatePasswordAction, updatePreferencesAction } from "@/actions/settings"
import { setup2FAAction, enable2FAAction, disable2FAAction } from "@/actions/auth"
import { useTheme } from "next-themes"

const initialAction: ActionState = { error: "", success: "" };

function ProfileForm({ user }: { user: { name: string; email: string; company: string | null; phone: string | null; image: string | null } }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialAction);
  React.useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>This information appears on your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="s-name">Full name</Label>
              <Input id="s-name" name="name" defaultValue={user.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-email">Email</Label>
              <Input id="s-email" name="email" type="email" defaultValue={user.email} required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="s-company">Company</Label>
              <Input id="s-company" name="company" defaultValue={user.company ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-phone">Phone</Label>
              <Input id="s-phone" name="phone" defaultValue={user.phone ?? ""} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={pending} className="gap-1.5">
              {pending && <Loader2 className="size-4 animate-spin" />}
              Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordForm() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, initialAction);
  React.useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Update your password to keep your account secure.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current">Current password</Label>
            <Input id="current" name="currentPassword" type="password" autoComplete="current-password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new">New password</Label>
            <Input id="new" name="newPassword" type="password" autoComplete="new-password" required />
            <p className="text-xs text-muted-foreground">At least 8 characters with letters and numbers.</p>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={pending} className="gap-1.5">
              {pending && <Loader2 className="size-4 animate-spin" />}
              Update password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function TwoFactorCard({ enabled, otpauthUrl }: { enabled: boolean; otpauthUrl?: string }) {
  const [step, setStep] = React.useState<"idle" | "qr" | "codes">("idle");
  const [secret, setSecret] = React.useState("");
  const [qr, setQr] = React.useState("");
  const [code, setCode] = React.useState("");
  const [codes, setCodes] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  async function startSetup() {
    setLoading(true);
    const result = await setup2FAAction();
    setLoading(false);
    if ("error" in result) {
      toast.error(result.error as string);
      return;
    }
    setSecret(result.secret);
    setQr(result.qrDataUrl);
    setStep("qr");
  }

  async function confirm() {
    if (code.length !== 6) return toast.error("Enter a 6-digit code.");
    setLoading(true);
    const form = new FormData();
    form.set("code", code);
    const result = await enable2FAAction(form);
    setLoading(false);
    if ("error" in result) {
      toast.error(result.error as string);
      return;
    }
    setCodes(result.backupCodes ?? []);
    setStep("codes");
    toast.success("Two-factor authentication enabled.");
  }

  async function disable() {
    setLoading(true);
    const form = new FormData();
    form.set("code", code);
    const result = await disable2FAAction(form);
    setLoading(false);
    if ("error" in result) toast.error(result.error as string);
    else {
      toast.success("2FA disabled.");
      setStep("idle");
      setCode("");
    }
  }

  async function copyCodes() {
    await navigator.clipboard?.writeText(codes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-factor authentication</CardTitle>
        <CardDescription>Add an extra layer of security to your account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10">
              <Smartphone className="size-5 text-violet-500" />
            </span>
            <div>
              <p className="font-medium">Authenticator app</p>
              <p className="text-sm text-muted-foreground">
                {enabled ? "2FA is currently enabled" : "Not enabled"}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={enabled ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" : "text-muted-foreground"}>
            {enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>

        {step === "idle" && !enabled && (
          <Button onClick={startSetup} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <QrCode className="size-4" />}
            Enable 2FA
          </Button>
        )}

        {step === "qr" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 rounded-lg border p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="QR code to scan" className="size-44 rounded-lg" />
              <p className="text-sm text-muted-foreground">
                Scan this QR code with Google Authenticator or Authy.
              </p>
              <div className="flex items-center gap-2">
                <code className="rounded bg-muted px-2 py-1 font-mono text-xs">{secret}</code>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={async () => {
                    await navigator.clipboard?.writeText(secret);
                    toast.success("Secret copied");
                  }}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="2fa-code">Enter the 6-digit code</Label>
              <Input
                id="2fa-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                maxLength={6}
                placeholder="123 456"
                className="font-mono text-lg tracking-[0.3em]"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={confirm} disabled={loading} className="flex-1">
                {loading && <Loader2 className="size-4 animate-spin" />} Confirm &amp; enable
              </Button>
              <Button variant="outline" onClick={() => setStep("idle")}>Cancel</Button>
            </div>
          </div>
        )}

        {step === "codes" && (
          <div className="space-y-3">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-500">
              Two-factor authentication is enabled. Save these backup codes in a safe place.
            </div>
            <div className="grid grid-cols-2 gap-2">
              {codes.map((c) => (
                <code key={c} className="rounded-lg border bg-muted px-3 py-2 text-center font-mono text-sm">
                  {c}
                </code>
              ))}
            </div>
            <Button variant="outline" onClick={copyCodes} className="gap-1.5">
              {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
              {copied ? "Copied!" : "Copy codes"}
            </Button>
            <Button className="w-full" onClick={() => window.location.reload()}>Done</Button>
          </div>
        )}

        {enabled && (
          <div className="flex items-end justify-between gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="disable-2fa">Enter code to disable</Label>
              <Input
                id="disable-2fa"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                maxLength={6}
                placeholder="123 456"
              />
            </div>
            <Button variant="outline" className="text-destructive hover:text-destructive" onClick={disable} disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />} Disable
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActiveSessions({ current }: { current: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active sessions</CardTitle>
        <CardDescription>Devices currently signed in to your account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <span className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10">
            <Monitor className="size-5 text-violet-500" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium">{current}</p>
            <p className="text-xs text-muted-foreground">This device · Current session</p>
          </div>
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
            Active
          </Badge>
        </div>
        <Button variant="outline" className="w-full gap-2 text-destructive hover:text-destructive" onClick={async () => { await logoutAction(); }}>
          <LogOut className="size-4" /> Sign out everywhere
        </Button>
      </CardContent>
    </Card>
  );
}

function PreferencesForm({ user }: { user: { language: string; timezone: string } }) {
  const [language, setLanguage] = React.useState(user.language);
  const [timezone, setTimezone] = React.useState(user.timezone);
  const { theme, setTheme } = useTheme();
  const [state, formAction, pending] = useActionState(updatePreferencesAction, initialAction);

  React.useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Language, theme and timezone.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-muted-foreground" />
            <Label>Language</Label>
          </div>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full sm:max-w-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="id">Bahasa Indonesia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Palette className="size-4 text-muted-foreground" />
            <Label>Theme</Label>
          </div>
          <div className="flex gap-1 rounded-full border bg-muted/50 p-1 sm:max-w-xs">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 rounded-full px-4 py-1.5 text-sm capitalize transition-all ${theme === t ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Monitor className="size-4 text-muted-foreground" />
            <Label htmlFor="timezone">Timezone</Label>
          </div>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="w-full sm:max-w-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["UTC", "Asia/Jakarta", "Asia/Singapore", "America/New_York", "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Australia/Sydney"].map((tz) => (
                <SelectItem key={tz} value={tz}>{tz}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <form action={formAction} className="flex items-end justify-end gap-2">
          <input type="hidden" name="language" value={language} />
          <input type="hidden" name="theme" value={theme} />
          <input type="hidden" name="timezone" value={timezone} />
          <Button type="submit" disabled={pending} className="gap-1.5">
            {pending && <Loader2 className="size-4 animate-spin" />}
            Save preferences
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function SettingsTabs({
  user,
  twoFactorEnabled,
}: {
  user: { name: string; email: string; company: string | null; phone: string | null; image: string | null; language: string; timezone: string };
  twoFactorEnabled: boolean;
}) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-3 sm:max-w-md">
        <TabsTrigger value="profile" className="gap-1.5"><User className="size-4" /> Profile</TabsTrigger>
        <TabsTrigger value="security" className="gap-1.5"><Shield className="size-4" /> Security</TabsTrigger>
        <TabsTrigger value="preferences" className="gap-1.5"><SlidersHorizontal className="size-4" /> Preferences</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="mt-4 space-y-4">
        <ProfileForm user={user} />
      </TabsContent>
      <TabsContent value="security" className="mt-4 space-y-4">
        <PasswordForm />
        <TwoFactorCard enabled={twoFactorEnabled} />
        <ActiveSessions current="Web browser" />
      </TabsContent>
      <TabsContent value="preferences" className="mt-4 space-y-4">
        <PreferencesForm user={user} />
      </TabsContent>
    </Tabs>
  );
}
