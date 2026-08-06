import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { AdminTestimonialsTable } from "@/components/admin/content-tables";
import { auth, requireAdmin } from "@/lib/auth";
import { listTestimonials } from "@/lib/data";

export const metadata: Metadata = { title: "Admin · Testimonials" };

export default async function AdminTestimonialsPage() {
  const session = await auth();
  const admin = await requireAdmin();
  if (!session?.user || !admin) redirect("/403");

  let rows: Awaited<ReturnType<typeof listTestimonials>> = [];
  try {
    rows = await listTestimonials();
  } catch {
    // offline
  }

  return (
    <div>
      <PageHeader title="Testimonials" description="Social proof shown on the landing page." />
      <AdminTestimonialsTable rows={rows as never} />
    </div>
  );
}
