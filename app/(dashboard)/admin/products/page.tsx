import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { ProductsTable } from "@/components/dashboard/products/products-table";
import { auth, requireAdmin } from "@/lib/auth";
import { listProducts } from "@/lib/data";

export const metadata: Metadata = { title: "Admin · Products" };

export default async function AdminProductsPage() {
  const session = await auth();
  const admin = await requireAdmin();
  if (!session?.user || !admin) redirect("/403");

  let rows: Awaited<ReturnType<typeof listProducts>> = [];
  try {
    rows = await listProducts();
  } catch {
    // offline
  }

  return (
    <div>
      <PageHeader title="Products" description="Full catalog management." />
      <ProductsTable rows={rows as never} />
    </div>
  );
}
