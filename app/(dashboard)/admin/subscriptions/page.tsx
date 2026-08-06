import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { AdminSubscriptionsTable } from "@/components/admin/subscriptions-table";
import { auth, requireAdmin } from "@/lib/auth";
import { listSubscriptions } from "@/lib/data";

export const metadata: Metadata = { title: "Admin · Subscriptions" };

export default async function AdminSubscriptionsPage() {
  const session = await auth();
  const admin = await requireAdmin();
  if (!session?.user || !admin) redirect("/403");

  let rows: Awaited<ReturnType<typeof listSubscriptions>>["rows"] = [];
  try {
    const result = await listSubscriptions({ page: 1, pageSize: 1000 });
    rows = result.rows;
  } catch {
    // offline
  }

  return (
    <div>
      <PageHeader title="Subscriptions" description="Manage every subscription across the platform." />
      <AdminSubscriptionsTable rows={rows as never} />
    </div>
  );
}
