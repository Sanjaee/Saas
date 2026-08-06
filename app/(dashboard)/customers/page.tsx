import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/dashboard/page-header";
import { CustomerTable } from "@/components/dashboard/customers/customer-table";
import { ExportCsvButton } from "@/components/dashboard/export-csv-button";
import { auth, requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listCustomers } from "@/lib/data";

export const metadata: Metadata = { title: "Customers" };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const canWrite = !!(await requireRole("manager"));

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const pageSize = 10;

  let rows: Awaited<ReturnType<typeof listCustomers>>["rows"] = [];
  let total = 0;
  try {
    const result = await listCustomers({
      search: params.q,
      status: params.status === "all" ? undefined : params.status,
      page,
      pageSize,
    });
    rows = result.rows;
    total = result.total;
  } catch {
    // offline
  }

  const csvColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "company", label: "Company" },
    { key: "plan", label: "Plan" },
    { key: "status", label: "Status" },
    { key: "country", label: "Country" },
    { key: "revenue", label: "Revenue" },
  ];

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Manage your customer base — add, edit, search and export."
      >
        <ExportCsvButton
          filename="customers.csv"
          columns={csvColumns}
          rows={rows as unknown as Record<string, unknown>[]}
        />
      </PageHeader>

      <CustomerTable
        rows={rows as never}
        total={total}
        page={page}
        pageSize={pageSize}
        canWrite={canWrite}
      />
    </div>
  );
}
