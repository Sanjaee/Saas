"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CreditCard, ShieldCheck, Tag, Check, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { AVAILABLE_PROVIDERS, PROVIDER_LABELS, providerConfigured, type PaymentProvider } from "@/lib/payments"
import { checkoutAction, validateCouponAction } from "@/actions/billing"

export interface UpgradePlanItem {
  id: string;
  name: string;
  slug: string;
  monthlyPrice: number;
  annualPrice: number;
  popular: boolean;
  features: string[];
}

export function PlanUpgrade({
  plans,
  currentPlanId,
}: {
  plans: UpgradePlanItem[];
  currentPlanId?: string | null;
}) {
  const router = useRouter();
  const [interval, setInterval] = React.useState<"monthly" | "annual">("annual");
  const [provider, setProvider] = React.useState<PaymentProvider>("demo");
  const [selected, setSelected] = React.useState<string>(
    plans.find((p) => p.id === currentPlanId)?.id ?? plans.find((p) => p.popular)?.id ?? plans[0]?.id ?? "",
  );
  const [coupon, setCoupon] = React.useState("");
  const [couponStatus, setCouponStatus] = React.useState<{ valid: boolean; message: string } | null>(null);
  const [checkingCoupon, setCheckingCoupon] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);

  const selectedPlan = plans.find((p) => p.id === selected);
  const price = selectedPlan
    ? interval === "annual"
      ? selectedPlan.annualPrice
      : selectedPlan.monthlyPrice
    : 0;

  async function checkCoupon() {
    if (!coupon.trim()) return;
    setCheckingCoupon(true);
    const result = await validateCouponAction(coupon.trim());
    setCouponStatus(result as { valid: boolean; message: string });
    setCheckingCoupon(false);
  }

  async function handleCheckout() {
    if (!selectedPlan || selectedPlan.slug === "enterprise") {
      toast.info("Enterprise plans are handled by our sales team.");
      return;
    }
    setProcessing(true);
    try {
      const form = new FormData();
      form.set("planId", selectedPlan.id);
      form.set("interval", interval);
      form.set("provider", provider);
      if (coupon.trim()) form.set("coupon", coupon.trim());
      const result = (await checkoutAction(form)) as { error?: string } | undefined;
      if (result?.error) {
        toast.error(result.error);
        setProcessing(false);
      }
    } catch {
      setProcessing(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Upgrade your plan</h3>
            <p className="text-sm text-muted-foreground">Choose a plan and payment method.</p>
          </div>
          <Badge variant="outline" className="gap-1 border-violet-500/30 bg-violet-500/10 text-violet-500">
            <Sparkles className="size-3" /> Save 20% annually
          </Badge>
        </div>

        <div className="mt-4 flex gap-1 rounded-full border bg-muted/50 p-1">
          {(["monthly", "annual"] as const).map((iv) => (
            <button
              key={iv}
              onClick={() => setInterval(iv)}
              className={cn(
                "flex-1 rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-all",
                interval === iv ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground",
              )}
            >
              {iv} billing
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className={cn(
                "relative rounded-xl border p-4 text-left transition-all",
                selected === plan.id
                  ? "border-violet-500 ring-2 ring-violet-500/30"
                  : "hover:border-border hover:bg-muted/40",
              )}
            >
              {plan.popular && (
                <span className="absolute -top-2 right-3 rounded-full bg-violet-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  POPULAR
                </span>
              )}
              <p className="font-semibold">{plan.name}</p>
              <p className="mt-1 text-2xl font-extrabold">
                {plan.slug === "enterprise" ? "Custom" : `$${interval === "annual" ? plan.annualPrice : plan.monthlyPrice}`}
                {plan.slug !== "enterprise" && <span className="text-xs font-normal text-muted-foreground">/{interval === "annual" ? "yr" : "mo"}</span>}
              </p>
              <ul className="mt-3 space-y-1">
                {plan.features.slice(0, 3).map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="size-3 text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium">Payment method</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {AVAILABLE_PROVIDERS.map((p) => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  disabled={!providerConfigured(p) && p !== "demo"}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-2.5 text-sm transition-all",
                    provider === p ? "border-violet-500 ring-2 ring-violet-500/20" : "hover:bg-muted/40",
                    !providerConfigured(p) && p !== "demo" && "cursor-not-allowed opacity-50",
                  )}
                >
                  <CreditCard className="size-4 text-violet-500" />
                  <span className="font-medium">{PROVIDER_LABELS[p]}</span>
                  {!providerConfigured(p) && p !== "demo" && (
                    <span className="text-[9px] text-muted-foreground">keys</span>
                  )}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Providers without API keys fall back to the built-in demo checkout.
            </p>
          </div>

          <div className="rounded-xl border bg-muted/30 p-4">
            <p className="text-sm font-medium">Coupon code</p>
            <div className="mt-2 flex gap-2">
              <Input
                value={coupon}
                onChange={(e) => {
                  setCoupon(e.target.value);
                  setCouponStatus(null);
                }}
                placeholder="LAUNCH35"
                className="bg-background"
              />
              <Button variant="outline" onClick={checkCoupon} disabled={checkingCoupon || !coupon.trim()}>
                {checkingCoupon ? "…" : "Apply"}
              </Button>
            </div>
            {couponStatus && (
              <p className={cn("mt-2 text-xs", couponStatus.valid ? "text-emerald-500" : "text-destructive")}>
                {couponStatus.message}
              </p>
            )}
            <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
              <span className="text-muted-foreground">Due today</span>
              <span className="text-lg font-bold">${price.toFixed(2)}</span>
            </div>
            <Button className="mt-3 w-full" size="lg" disabled={processing || !selectedPlan} onClick={handleCheckout}>
              {processing ? "Redirecting…" : "Continue to checkout"}
            </Button>
            <p className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck className="size-3" /> Secure 256-bit encrypted payments
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
