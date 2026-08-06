import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { AdminBlogTable } from "@/components/admin/content-tables";
import { auth, requireAdmin } from "@/lib/auth";
import { listPosts } from "@/lib/data";

export const metadata: Metadata = { title: "Admin · Blog" };

export default async function AdminBlogPage() {
  const session = await auth();
  const admin = await requireAdmin();
  if (!session?.user || !admin) redirect("/403");

  let rows: Awaited<ReturnType<typeof listPosts>> = [];
  try {
    rows = await listPosts();
  } catch {
    // offline
  }

  return (
    <div>
      <PageHeader title="Blog" description="Write and publish articles." />
      <AdminBlogTable rows={rows as never} />
    </div>
  );
}
