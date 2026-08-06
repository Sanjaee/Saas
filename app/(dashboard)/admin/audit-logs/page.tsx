import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { AuditLogsTable } from "@/components/admin/audit-logs-table";
import { auth, requireAdmin } from "@/lib/auth";
import { listAuditLogs } from "@/lib/data";

export const metadata: Metadata = { title: "Admin · Audit Logs" };

export default async function AdminAuditLogsPage() {
  const session = await auth();
  const admin = await requireAdmin();
  if (!session?.user || !admin) redirect("/403");

  let rows: Awaited<ReturnType<typeof listAuditLogs>>["rows"] = [];
  try {
    const result = await listAuditLogs({ page: 1, pageSize: 500 });
    rows = result.rows;
  } catch {
    // offline
  }

  return (
    <div>
      <PageHeader title="Audit Logs" description="A complete security & activity trail." />
      <AuditLogsTable rows={rows as never} />
    </div>
  );
}
