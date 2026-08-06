import { NextRequest, NextResponse } from "next/server";
import { completeOrderPayment } from "@/lib/payments";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 501 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const StripeModule: any = await import("stripe");
  const stripe = new StripeModule.default(env.STRIPE_SECRET_KEY);

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const orderId = (session.metadata?.orderId as string) ?? (session.client_reference_id as string);
      if (orderId) {
        try {
          await completeOrderPayment(orderId, "stripe", session.payment_intent ?? session.id);
        } catch (error) {
          console.error("Failed to finalize order:", error);
          return NextResponse.json({ error: "Failed" }, { status: 500 });
        }
      }
      break;
    }
    case "invoice.paid": {
      break;
    }
  }

  return NextResponse.json({ received: true });
}
