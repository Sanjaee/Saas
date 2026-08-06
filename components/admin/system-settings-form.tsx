"use client"
import type { ActionState } from "@/lib/action-state";

import * as React from "react"
import { useActionState } from "react"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { saveSystemSettingsAction } from "@/actions/admin"

const initialState: ActionState = { error: "", success: "" };

export interface SystemSettings {
  app_name?: string;
  support_email?: string;
  maintenance_mode?: boolean;
  allow_registration?: boolean;
  require_email_verification?: boolean;
  default_currency?: string;
  tax_rate?: string;
}

export function SystemSettingsForm({ settings }: { settings: SystemSettings }) {
  const [maintenance, setMaintenance] = React.useState(!!settings.maintenance_mode);
  const [registration, setRegistration] = React.useState(settings.allow_registration !== false);
  const [verification, setVerification] = React.useState(settings.require_email_verification !== false);
  const [state, formAction, pending] = useActionState(saveSystemSettingsAction, initialState);

  React.useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>Branding and contact details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="app_name">App name</Label>
              <Input id="app_name" name="app_name" defaultValue={settings.app_name ?? "Zacode"} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support_email">Support email</Label>
              <Input id="support_email" name="support_email" type="email" defaultValue={settings.support_email ?? ""} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>Signup and verification policies.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allow_registration">Allow registration</Label>
              <p className="text-sm text-muted-foreground">Let new users create accounts.</p>
            </div>
            <Switch checked={registration} onCheckedChange={setRegistration} id="allow_registration" />
            <input type="hidden" name="allow_registration" value={registration ? "on" : "off"} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="require_email_verification">Require email verification</Label>
              <p className="text-sm text-muted-foreground">Users must verify before signing in.</p>
            </div>
            <Switch checked={verification} onCheckedChange={setVerification} id="require_email_verification" />
            <input type="hidden" name="require_email_verification" value={verification ? "on" : "off"} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>Currency and tax configuration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="default_currency">Default currency</Label>
              <Input id="default_currency" name="default_currency" defaultValue={settings.default_currency ?? "USD"} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax_rate">Tax rate (%)</Label>
              <Input id="tax_rate" name="tax_rate" type="number" min={0} max={100} defaultValue={settings.tax_rate ?? "10"} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-500/30 bg-amber-500/[0.03]">
        <CardHeader>
          <CardTitle>Maintenance</CardTitle>
          <CardDescription>Put the site into maintenance mode.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenance_mode">Maintenance mode</Label>
              <p className="text-sm text-muted-foreground">Show a maintenance page to visitors.</p>
            </div>
            <Switch checked={maintenance} onCheckedChange={setMaintenance} id="maintenance_mode" />
            <input type="hidden" name="maintenance_mode" value={maintenance ? "on" : "off"} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="gap-1.5">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save settings
        </Button>
      </div>
    </form>
  );
}
