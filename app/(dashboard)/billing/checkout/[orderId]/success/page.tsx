import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getOrderById } from "@/lib/data";

export const metadata = { title: "Payment received" };

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { orderId } = await params;

  const order = await getOrderById(orderId).catch(() => null);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
        <CheckCircle2 className="size-9 text-emerald-500" />
      </span>
      <h1 className="mt-6 text-2xl font-bold">Payment successful</h1>
      <p className="mt-2 text-muted-foreground">
        {order
          ? `Your ${order.interval} subscription is now active. A receipt has been sent to your inbox.`
          : "Your payment was processed successfully. Your subscription is now active."}
      </p>
      <Link href="/billing">
        <Button className="mt-8 gap-2">
          Go to billing <ArrowRight className="size-4" />
        </Button>
      </Link>
    </div>
  );
}
