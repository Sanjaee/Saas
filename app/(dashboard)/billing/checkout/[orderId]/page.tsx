import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";

import { CheckoutForm, type CheckoutOrder } from "@/components/dashboard/billing/checkout-form";
import { auth, requireUser } from "@/lib/auth";
import { getOrderById, getPlanById } from "@/lib/data";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = await requireUser();
  if (!user) redirect("/login");

  const { orderId } = await params;

  let order: Awaited<ReturnType<typeof getOrderById>> = null;
  try {
    order = await getOrderById(orderId);
  } catch {
    order = null;
  }
  if (!order || order.userId !== user.id) notFound();
  if (order.status === "paid") redirect("/billing?success=1");

  const plan = order.planId ? await getPlanById(order.planId).catch(() => null) : null;

  const checkoutOrder: CheckoutOrder = {
    id: order.id,
    amount: order.amount,
    currency: order.currency,
    interval: order.interval,
    planName: plan?.name ?? "Zacode Plan",
    provider: order.provider,
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Suspense>
        <CheckoutForm order={checkoutOrder} />
      </Suspense>
    </div>
  );
}
