import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { AdminPaymentsTable } from "@/components/admin/payments-table";
import { auth, requireAdmin } from "@/lib/auth";
import { listPayments } from "@/lib/data";

export const metadata: Metadata = { title: "Admin · Payments" };

export default async function AdminPaymentsPage() {
  const session = await auth();
  const admin = await requireAdmin();
  if (!session?.user || !admin) redirect("/403");

  let rows: Awaited<ReturnType<typeof listPayments>>["rows"] = [];
  try {
    const result = await listPayments({ page: 1, pageSize: 1000 });
    rows = result.rows;
  } catch {
    // offline
  }

  return (
    <div>
      <PageHeader title="Payments" description="Full transaction ledger. Refund from the row actions." />
      <AdminPaymentsTable rows={rows as never} />
    </div>
  );
}
