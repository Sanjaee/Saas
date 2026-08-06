import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { AdminUsersTable } from "@/components/admin/users-table";
import { auth, requireAdmin } from "@/lib/auth";
import { listUsers } from "@/lib/data";

export const metadata: Metadata = { title: "Admin · Users" };

export default async function AdminUsersPage() {
  const session = await auth();
  const admin = await requireAdmin();
  if (!session?.user || !admin) redirect("/403");

  let rows: Awaited<ReturnType<typeof listUsers>>["rows"] = [];
  try {
    const result = await listUsers({ page: 1, pageSize: 1000 });
    rows = result.rows;
  } catch {
    // offline
  }

  return (
    <div>
      <PageHeader title="Users" description="Manage all platform users and roles." />
      <AdminUsersTable rows={rows as never} />
    </div>
  );
}
