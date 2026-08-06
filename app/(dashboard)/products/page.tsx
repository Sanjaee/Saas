import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { ProductsTable } from "@/components/dashboard/products/products-table";
import { auth, requireRole } from "@/lib/auth";
import { listProducts } from "@/lib/data";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const canWrite = !!(await requireRole("manager"));

  let rows: Awaited<ReturnType<typeof listProducts>> = [];
  try {
    rows = await listProducts();
  } catch {
    // offline
  }

  return (
    <div>
      <PageHeader title="Products" description="Your catalog & inventory." />
      <ProductsTable rows={rows as never} canWrite={canWrite} />
    </div>
  );
}
