import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { AdminCouponsTable } from "@/components/admin/coupons-table";
import { auth, requireAdmin } from "@/lib/auth";
import { listCoupons } from "@/lib/data";

export const metadata: Metadata = { title: "Admin · Coupons" };

export default async function AdminCouponsPage() {
  const session = await auth();
  const admin = await requireAdmin();
  if (!session?.user || !admin) redirect("/403");

  let rows: Awaited<ReturnType<typeof listCoupons>> = [];
  try {
    rows = await listCoupons();
  } catch {
    // offline
  }

  return (
    <div>
      <PageHeader title="Coupons" description="Create and manage discount codes." />
      <AdminCouponsTable rows={rows as never} />
    </div>
  );
}
