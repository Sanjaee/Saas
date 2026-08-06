import { env } from "@/lib/env";
import {
  createOrder,
  createPayment,
  createInvoice,
  createSubscription,
  getPlanById,
  getOrderById,
  getCouponByCode,
  incrementCouponUse,
  updateOrder,
} from "@/lib/data";

export type PaymentProvider = "stripe" | "midtrans" | "xendit" | "paypal" | "demo";

export const PROVIDER_LABELS: Record<PaymentProvider, string> = {
  stripe: "Stripe",
  midtrans: "Midtrans",
  xendit: "Xendit",
  paypal: "PayPal",
  demo: "Demo (instant)",
};

export const AVAILABLE_PROVIDERS: PaymentProvider[] = ["stripe", "midtrans", "xendit", "paypal", "demo"];

export function providerConfigured(provider: PaymentProvider) {
  switch (provider) {
    case "stripe":
      return !!env.STRIPE_SECRET_KEY;
    case "midtrans":
      return !!env.MIDTRANS_SERVER_KEY;
    case "xendit":
      return !!env.XENDIT_SECRET_KEY;
    case "paypal":
      return !!env.PAYPAL_CLIENT_ID && !!env.PAYPAL_CLIENT_SECRET;
    case "demo":
      return true;
  }
}

export interface CheckoutInput {
  userId: string;
  planId: string;
  interval: "monthly" | "annual";
  provider: PaymentProvider;
  couponCode?: string;
}

export async function startCheckout(input: CheckoutInput) {
  const plan = await getPlanById(input.planId);
  if (!plan) throw new Error("Plan not found");

  const price = input.interval === "annual" ? plan.annualPrice : plan.monthlyPrice;
  let discount = 0;
  let couponId: string | null = null;

  if (input.couponCode) {
    const coupon = await getCouponByCode(input.couponCode);
    if (coupon && coupon.active) {
      const expired = coupon.expiresAt ? coupon.expiresAt.getTime() < Date.now() : false;
      const usedUp = coupon.maxUses > 0 && coupon.uses >= coupon.maxUses;
      if (!expired && !usedUp) {
        couponId = coupon.id;
        discount = coupon.type === "percent" ? (price * coupon.value) / 100 : coupon.value;
        await incrementCouponUse(coupon.id);
      }
    }
  }

  const amount = Math.max(0, Math.round((price - discount) * 100) / 100);
  const order = await createOrder({
    userId: input.userId,
    planId: plan.id,
    customerName: "Zacode Customer",
    customerEmail: "billing@zacode.dev",
    amount,
    currency: "USD",
    status: "pending",
    provider: input.provider,
    couponId,
    interval: input.interval,
  });

  return { orderId: order.id, amount, plan, provider: input.provider, discount };
}

function checkoutPageUrl(provider: PaymentProvider, orderId: string) {
  return `/billing/checkout/${orderId}?provider=${provider}`;
}

export async function resolveCheckoutUrl(provider: PaymentProvider, orderId: string) {
  if (provider === "stripe" && providerConfigured("stripe")) {
    try {
      const order = await getOrderById(orderId);
      const plan = order?.planId ? await getPlanById(order.planId) : null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const StripeModule: any = await import("stripe");
      const stripe = new StripeModule.default(env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [
          {
            price_data: {
              currency: order?.currency ?? "usd",
              product_data: { name: plan?.name ?? "Zacode Plan" },
              unit_amount: Math.round((order?.amount ?? 0) * 100),
              recurring: { interval: order?.interval === "annual" ? "year" : "month" },
            },
            quantity: 1,
          },
        ],
        success_url: `${env.public.NEXT_PUBLIC_APP_URL}/billing/checkout/${orderId}/success?provider=stripe`,
        cancel_url: `${env.public.NEXT_PUBLIC_APP_URL}/billing/checkout/${orderId}?provider=stripe&canceled=1`,
        client_reference_id: orderId,
        metadata: { orderId },
      });
      return session.url ?? checkoutPageUrl(provider, orderId);
    } catch (error) {
      console.error("Stripe session error:", error);
      return checkoutPageUrl(provider, orderId);
    }
  }
  return checkoutPageUrl(provider, orderId);
}

export async function completeOrderPayment(orderId: string, provider: PaymentProvider, transactionId?: string) {
  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found");
  if (order.status === "paid") return order;

  await createPayment({
    userId: order.userId,
    orderId: order.id,
    provider,
    amount: order.amount,
    currency: order.currency,
    status: "succeeded",
    providerTransactionId: transactionId ?? `txn_${Math.random().toString(36).slice(2, 14)}`,
  });

  await updateOrder(order.id, { status: "paid" });

  const invoiceNumber = `INV-${new Date().getFullYear()}${String(Math.floor(Math.random() * 9000) + 1000)}`;
  await createInvoice({
    userId: order.userId,
    orderId: order.id,
    number: invoiceNumber,
    subtotal: order.amount,
    taxAmount: Math.round(order.amount * 0.1 * 100) / 100,
    total: Math.round(order.amount * 1.1 * 100) / 100,
    currency: order.currency,
    status: "paid",
  });

  if (order.planId) {
    const end = new Date();
    if (order.interval === "annual") end.setFullYear(end.getFullYear() + 1);
    else end.setMonth(end.getMonth() + 1);
    await createSubscription({
      userId: order.userId,
      planId: order.planId,
      status: "active",
      provider,
      interval: order.interval,
      couponId: order.couponId,
      currentPeriodStart: new Date(),
      currentPeriodEnd: end,
    });
  }

  return order;
}
