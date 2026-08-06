import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ApiKeysPanel } from "@/components/dashboard/api-keys/api-keys-panel";
import { auth, requireUser, requireRole } from "@/lib/auth";
import { listApiKeys } from "@/lib/data";

export const metadata: Metadata = { title: "API Keys" };

export default async function ApiKeysPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = await requireUser();
  if (!user) redirect("/login");
  const canManage = !!(await requireRole("admin"));

  let keys: Awaited<ReturnType<typeof listApiKeys>> = [];
  try {
    keys = await listApiKeys(user.id);
  } catch {
    // offline
  }

  return <ApiKeysPanel keys={keys as never} canManage={canManage} />;
}
