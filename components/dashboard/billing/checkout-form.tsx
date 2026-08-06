"use client"

import * as React from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Lock, CheckCircle2, CreditCard, Landmark, Wallet } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { completeMockPaymentAction } from "@/actions/billing"
import { formatCurrency } from "@/lib/format"

export interface CheckoutOrder {
  id: string;
  amount: number;
  currency: string;
  interval: string;
  planName: string;
  provider: string;
}

const PROVIDER_ICONS: Record<string, React.ElementType> = {
  stripe: CreditCard,
  midtrans: Landmark,
  xendit: Landmark,
  paypal: Wallet,
  demo: CreditCard,
};

const BANK_LIST = ["BCA", "BNI", "Mandiri", "BRI", "GoPay", "OVO", "DANA"];

export function CheckoutForm({ order }: { order: CheckoutOrder }) {
  const searchParams = useSearchParams();
  const provider = (searchParams.get("provider") ?? order.provider) as string;
  const [method, setMethod] = React.useState("card");
  const [pending, setPending] = React.useState(false);
  const Icon = PROVIDER_ICONS[provider] ?? CreditCard;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    await new Promise((r) => setTimeout(r, 1200));
    const form = new FormData();
    form.set("orderId", order.id);
    form.set("provider", provider);
    try {
      const result = (await completeMockPaymentAction(form)) as { error?: string } | undefined;
      if (result?.error) {
        toast.error(result.error);
        setPending(false);
      }
    } catch {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 rounded-2xl border bg-card p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10">
            <Icon className="size-5 text-violet-500" />
          </span>
          <div>
            <p className="font-semibold capitalize">{provider} checkout</p>
            <p className="text-xs text-muted-foreground">
              {order.planName} · {order.interval} billing
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between border-t pt-4">
          <span className="text-sm text-muted-foreground">Amount due</span>
          <span className="text-3xl font-extrabold">{formatCurrency(order.amount)}</span>
        </div>
      </div>

      <Card>
        <CardContent className="p-5">
          {provider === "demo" && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-500">
              <CheckCircle2 className="size-4" /> Demo mode — instant payment, no real charge.
            </div>
          )}

          {(provider === "midtrans" || provider === "xendit") && (
            <>
              <p className="mb-2 text-sm font-medium">Choose payment method</p>
              <div className="grid grid-cols-2 gap-2">
                {BANK_LIST.map((bank) => (
                  <button
                    key={bank}
                    onClick={() => setMethod(bank)}
                    className={cn(
                      "rounded-lg border p-3 text-sm font-medium transition-all",
                      method === bank ? "border-violet-500 ring-2 ring-violet-500/20" : "hover:bg-muted/40",
                    )}
                  >
                    {bank}
                  </button>
                ))}
              </div>
            </>
          )}

          {provider === "paypal" && (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-6">
              <Wallet className="size-8 text-[#003087]" />
              <p className="text-sm text-muted-foreground">You&apos;ll be redirected to PayPal to complete payment.</p>
            </div>
          )}

          {provider !== "midtrans" && provider !== "xendit" && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="card-number">Card number</Label>
                <Input id="card-number" placeholder="4242 4242 4242 4242" inputMode="numeric" defaultValue="4242 4242 4242 4242" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry</Label>
                  <Input id="expiry" placeholder="08/29" defaultValue="08/29" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" inputMode="numeric" defaultValue="123" />
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={pending}>
                {pending ? "Processing…" : `Pay ${formatCurrency(order.amount)}`}
              </Button>
            </form>
          )}

          {(provider === "midtrans" || provider === "xendit") && (
            <form onSubmit={handleSubmit} className="mt-4">
              <Button type="submit" className="w-full" size="lg" disabled={pending}>
                {pending ? "Processing…" : `Pay ${formatCurrency(order.amount)} via ${method}`}
              </Button>
            </form>
          )}

          {provider === "paypal" && (
            <form onSubmit={handleSubmit} className="mt-4">
              <Button type="submit" className="w-full" size="lg" disabled={pending}>
                {pending ? "Processing…" : `Pay ${formatCurrency(order.amount)} with PayPal`}
              </Button>
            </form>
          )}

          <p className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Lock className="size-3" /> Secured by {provider} · 256-bit encryption
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
