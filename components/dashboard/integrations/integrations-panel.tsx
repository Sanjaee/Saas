"use client"

import * as React from "react"
import { Plug, Unplug, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/dashboard/page-header"
import { toggleIntegrationAction } from "@/actions/integrations"

export interface IntegrationRow {
  id: string;
  name: string;
  provider: string;
  connected: boolean;
  createdAt: Date;
}

const INTEGRATION_META: Record<string, { color: string; glyph: string }> = {
  slack: { color: "#E01E5A", glyph: "#" },
  discord: { color: "#5865F2", glyph: "D" },
  github: { color: "#24292f", glyph: "G" },
  google: { color: "#4285F4", glyph: "G" },
  stripe: { color: "#635BFF", glyph: "S" },
  zapier: { color: "#FF4F00", glyph: "Z" },
  notion: { color: "#000000", glyph: "N" },
  figma: { color: "#F24E1E", glyph: "F" },
  trello: { color: "#0079BF", glyph: "T" },
  airtable: { color: "#18BFFF", glyph: "A" },
};

export function IntegrationsPanel({ integrations }: { integrations: IntegrationRow[] }) {
  const [list, setList] = React.useState(integrations);
  const [pending, setPending] = React.useState<string | null>(null);

  async function toggle(integration: IntegrationRow) {
    setPending(integration.id);
    const next = !integration.connected;
    setList(list.map((i) => (i.id === integration.id ? { ...i, connected: next } : i)));
    try {
      const result = await toggleIntegrationAction(integration.provider, integration.name, next);
      if (!result?.success) throw new Error("Failed");
      toast.success(`${integration.name} ${next ? "connected" : "disconnected"}.`);
    } catch {
      setList(list.map((i) => (i.id === integration.id ? { ...i, connected: integration.connected } : i)));
      toast.error("Something went wrong.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div>
      <PageHeader title="Integrations" description="Connect the tools your team already uses." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((integration) => {
          const meta = INTEGRATION_META[integration.provider] ?? { color: "#7c3aed", glyph: integration.name[0] };
          return (
            <Card key={integration.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                  style={{ background: meta.color }}
                >
                  {meta.glyph}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{integration.name}</p>
                    <Badge
                      variant="outline"
                      className={
                        integration.connected
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                          : "text-muted-foreground"
                      }
                    >
                      {integration.connected ? "Connected" : "Not connected"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{integration.provider}</p>
                </div>
                <Button
                  variant={integration.connected ? "outline" : "default"}
                  size="sm"
                  onClick={() => toggle(integration)}
                  disabled={pending === integration.id}
                  className="gap-1.5"
                >
                  {pending === integration.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : integration.connected ? (
                    <Unplug className="size-3.5" />
                  ) : (
                    <Plug className="size-3.5" />
                  )}
                  {integration.connected ? "Disconnect" : "Connect"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
