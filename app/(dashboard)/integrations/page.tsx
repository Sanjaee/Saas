import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { IntegrationsPanel } from "@/components/dashboard/integrations/integrations-panel";
import { auth, requireUser } from "@/lib/auth";
import { listIntegrations } from "@/lib/data";

export const metadata: Metadata = { title: "Integrations" };

export default async function IntegrationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = await requireUser();
  if (!user) redirect("/login");

  let integrations: Awaited<ReturnType<typeof listIntegrations>> = [];
  try {
    integrations = await listIntegrations(user.id);
  } catch {
    // offline
  }

  return <IntegrationsPanel integrations={integrations as never} />;
}
