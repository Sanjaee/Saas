import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { OrdersTable } from "@/components/dashboard/orders/orders-table";
import { auth } from "@/lib/auth";
import { listOrders } from "@/lib/data";

export const metadata: Metadata = { title: "Orders" };

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let rows: Awaited<ReturnType<typeof listOrders>>["rows"] = [];
  try {
    const result = await listOrders({ page: 1, pageSize: 1000 });
    rows = result.rows;
  } catch {
    // offline
  }

  return (
    <div>
      <PageHeader title="Orders" description="All transactions across your workspace." />
      <OrdersTable rows={rows as never} />
    </div>
  );
}
