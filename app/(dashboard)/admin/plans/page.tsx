import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { AdminPlansTable } from "@/components/admin/plans-table";
import { auth, requireAdmin } from "@/lib/auth";
import { listPlans } from "@/lib/data";

export const metadata: Metadata = { title: "Admin · Pricing Plans" };

export default async function AdminPlansPage() {
  const session = await auth();
  const admin = await requireAdmin();
  if (!session?.user || !admin) redirect("/403");

  let rows: Awaited<ReturnType<typeof listPlans>> = [];
  try {
    rows = await listPlans();
  } catch {
    // offline
  }

  return (
    <div>
      <PageHeader title="Pricing Plans" description="Manage tiers, pricing and features." />
      <AdminPlansTable rows={rows as never} />
    </div>
  );
}
