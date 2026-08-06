import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { AdminEmailTemplatesTable } from "@/components/admin/content-tables";
import { auth, requireAdmin } from "@/lib/auth";
import { listEmailTemplates } from "@/lib/data";

export const metadata: Metadata = { title: "Admin · Email Templates" };

export default async function AdminEmailTemplatesPage() {
  const session = await auth();
  const admin = await requireAdmin();
  if (!session?.user || !admin) redirect("/403");

  let rows: Awaited<ReturnType<typeof listEmailTemplates>> = [];
  try {
    rows = await listEmailTemplates();
  } catch {
    // offline
  }

  return (
    <div>
      <PageHeader title="Email Templates" description="Transactional emails sent to users." />
      <AdminEmailTemplatesTable rows={rows as never} />
    </div>
  );
}
