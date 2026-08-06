import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { LeadsTable } from "@/components/dashboard/leads/leads-table";
import { auth } from "@/lib/auth";
import { listLeads } from "@/lib/data";

export const metadata: Metadata = { title: "Leads" };

export default async function LeadsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let rows: Awaited<ReturnType<typeof listLeads>>["rows"] = [];
  try {
    const result = await listLeads({ page: 1, pageSize: 1000 });
    rows = result.rows;
  } catch {
    // offline
  }

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Track, qualify and convert your pipeline."
      />
      <LeadsTable rows={rows as never} />
    </div>
  );
}
