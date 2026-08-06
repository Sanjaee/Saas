import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { AdminFaqsTable } from "@/components/admin/content-tables";
import { auth, requireAdmin } from "@/lib/auth";
import { listAllFaqs } from "@/lib/data";

export const metadata: Metadata = { title: "Admin · FAQs" };

export default async function AdminFaqsPage() {
  const session = await auth();
  const admin = await requireAdmin();
  if (!session?.user || !admin) redirect("/403");

  let rows: Awaited<ReturnType<typeof listAllFaqs>> = [];
  try {
    rows = await listAllFaqs();
  } catch {
    // offline
  }

  return (
    <div>
      <PageHeader title="FAQs" description="Help center content for the landing page." />
      <AdminFaqsTable rows={rows as never} />
    </div>
  );
}
