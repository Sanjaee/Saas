"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser, requireAdmin } from "@/lib/auth";
import { getCouponByCode } from "@/lib/data";
import { startCheckout, resolveCheckoutUrl, completeOrderPayment, type PaymentProvider } from "@/lib/payments";
import { updateSubscription } from "@/lib/data";

export async function checkoutAction(formData: FormData) {
  const user = await requireUser();
  if (!user) return { error: "Not authenticated" };

  const planId = String(formData.get("planId") ?? "");
  const interval = String(formData.get("interval") ?? "monthly") as "monthly" | "annual";
  const provider = String(formData.get("provider") ?? "demo") as PaymentProvider;
  const couponCode = String(formData.get("coupon") ?? "") || undefined;

  try {
    const { orderId } = await startCheckout({
      userId: user.id,
      planId,
      interval,
      provider,
      couponCode,
    });
    const url = await resolveCheckoutUrl(provider, orderId);
    redirect(url);
  } catch (error) {
    console.error("Checkout failed:", error);
    return { error: "Checkout could not be started." };
  }
}

export async function validateCouponAction(code: string) {
  const coupon = await getCouponByCode(code);
  if (!coupon || !coupon.active) return { valid: false as const, message: "Invalid or expired code." };
  const expired = coupon.expiresAt ? coupon.expiresAt.getTime() < Date.now() : false;
  const usedUp = coupon.maxUses > 0 && coupon.uses >= coupon.maxUses;
  if (expired || usedUp) return { valid: false as const, message: "This code is no longer available." };
  return { valid: true as const, discount: coupon.value, type: coupon.type, message: `You save ${coupon.type === "percent" ? coupon.value + "%" : "$" + coupon.value}!` };
}

export async function completeMockPaymentAction(formData: FormData) {
  const user = await requireUser();
  if (!user) return { error: "Not authenticated" };
  const orderId = String(formData.get("orderId") ?? "");
  const provider = String(formData.get("provider") ?? "demo") as PaymentProvider;

  const { getOrderById } = await import("@/lib/data");
  const order = await getOrderById(orderId);
  if (!order || order.userId !== user.id) return { error: "Order not found." };

  await completeOrderPayment(orderId, provider);
  redirect("/billing?success=1");
}

export async function cancelSubscriptionAction(id: string) {
  const user = await requireUser();
  if (!user) return { error: "Not authenticated" };
  const { getSubscriptionById } = await import("@/lib/data");
  const sub = await getSubscriptionById(id);
  if (!sub || sub.userId !== user.id) return { error: "Subscription not found." };
  await updateSubscription(id, { status: "canceled" });
  revalidatePath("/billing");
  return { success: "Subscription canceled. You'll have access until the end of the period." };
}

export async function upgradeSubscriptionAction(id: string, planId: string) {
  const user = await requireUser();
  if (!user) return { error: "Not authenticated" };
  const { getSubscriptionById } = await import("@/lib/data");
  const sub = await getSubscriptionById(id);
  if (!sub || sub.userId !== user.id) return { error: "Subscription not found." };
  await updateSubscription(id, { planId });
  revalidatePath("/billing");
  return { success: "Plan updated." };
}

export async function adminRefundPaymentAction(paymentId: string) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Admin access required" };
  const { updatePayment } = await import("@/lib/data");
  await updatePayment(paymentId, { status: "refunded" });
  revalidatePath("/admin/payments");
  revalidatePath("/admin/subscriptions");
  return { success: "Payment refunded." };
}
