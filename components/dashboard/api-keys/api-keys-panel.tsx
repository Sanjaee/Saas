"use client"
import type { ActionState } from "@/lib/action-state";

import * as React from "react"
import { useActionState } from "react"
import { Plus, Copy, Check, RotateCcw, KeyRound, ShieldAlert } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PageHeader } from "@/components/dashboard/page-header"
import { createApiKeyAction, revokeApiKeyAction } from "@/actions/api-keys"
import { timeAgo } from "@/lib/format"
import { cn } from "@/lib/utils"

export interface ApiKeyRow {
  id: string;
  name: string;
  keyPreview: string;
  lastUsedAt: Date | null;
  revoked: boolean;
  createdAt: Date;
}

const initialState: ActionState = { error: "", success: "", secret: "" };

function CreateKeyDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [state, formAction, pending] = useActionState(createApiKeyAction, initialState);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (state.success && state.secret) {
      navigator.clipboard?.writeText(state.secret);
      setCopied(true);
    }
  }, [state.success, state.secret]);

  function copySecret(value: string) {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    toast.success("Copied to clipboard");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create API key</DialogTitle>
          <DialogDescription>Name your key so you can recognize it later.</DialogDescription>
        </DialogHeader>
        {state.secret ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
              <p className="font-semibold text-emerald-500">Key created!</p>
              <p className="mt-1 text-muted-foreground">Copy it now — you won&apos;t be able to see it again.</p>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg border bg-muted px-3 py-2 font-mono text-xs">{state.secret}</code>
              <Button
                variant="outline"
                size="icon"
                aria-label="Copy key"
                onClick={() => copySecret(state.secret ?? "")}
              >
                {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
              </Button>
            </div>
            <Button className="w-full" onClick={() => { onOpenChange(false); window.location.reload(); }}>
              Done
            </Button>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <div className="space-y-2">
              <Label htmlFor="key-name">Key name</Label>
              <Input id="key-name" name="name" placeholder="production-write" required autoFocus />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={pending} className="gap-1.5">
                <KeyRound className="size-4" /> Create key
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ApiKeysPanel({ keys }: { keys: ApiKeyRow[] }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      <PageHeader title="API Keys" description="Authenticate your API requests securely.">
        <Button onClick={() => setOpen(true)} className="gap-1.5">
          <Plus className="size-4" /> Create key
        </Button>
      </PageHeader>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-500" />
        <p className="text-muted-foreground">
          Treat your API keys like passwords. Never share them or commit them to source control. Revoke any key you suspect was compromised.
        </p>
      </div>

      {keys.length === 0 ? (
        <div className="rounded-xl border border-dashed p-16 text-center text-muted-foreground">
          <KeyRound className="mx-auto mb-3 size-10 opacity-40" />
          <p className="font-medium">No API keys yet</p>
          <p className="text-sm">Create a key to start using the Zacode API.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <Card key={key.id} className={cn(key.revoked && "opacity-60")}>
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                <span className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10">
                  <KeyRound className="size-5 text-violet-500" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{key.name}</p>
                    <Badge
                      variant="outline"
                      className={
                        key.revoked
                          ? "border-destructive/30 bg-destructive/10 text-destructive"
                          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                      }
                    >
                      {key.revoked ? "Revoked" : "Active"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">{key.keyPreview}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Created {timeAgo(key.createdAt)}
                    {key.lastUsedAt ? ` · Last used ${timeAgo(key.lastUsedAt)}` : " · Never used"}
                  </p>
                </div>
                {!key.revoked && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={async () => {
                      await revokeApiKeyAction(key.id);
                      toast.success("API key revoked.");
                      window.location.reload();
                    }}
                  >
                    <RotateCcw className="size-3.5" /> Revoke
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {open && <CreateKeyDialog open={open} onOpenChange={setOpen} />}
    </div>
  );
}
