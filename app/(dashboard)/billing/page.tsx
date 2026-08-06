import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreditCard, FileText, CalendarClock } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { PlanUpgrade } from "@/components/dashboard/billing/plan-upgrade";
import { ExportCsvButton } from "@/components/dashboard/export-csv-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth, requireUser } from "@/lib/auth";
import { getSubscriptionByUser, getPlanById, listInvoices, listPlans } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = await requireUser();
  if (!user) redirect("/login");

  let subscription: Awaited<ReturnType<typeof getSubscriptionByUser>> = null;
  let currentPlan: Awaited<ReturnType<typeof getPlanById>> = null;
  let invoices: Awaited<ReturnType<typeof listInvoices>>["rows"] = [];
  let plans: Awaited<ReturnType<typeof listPlans>> = [];

  try {
    subscription = await getSubscriptionByUser(user.id);
    currentPlan = subscription?.planId ? await getPlanById(subscription.planId) : null;
    invoices = (await listInvoices({ page: 1, pageSize: 20, userId: user.id })).rows;
    plans = await listPlans(true);
  } catch {
    // offline fallback
  }

  const nextInvoice = subscription?.currentPeriodEnd;

  return (
    <div className="space-y-6">
      <PageHeader title="Billing" description="Manage your plan, invoices and payment methods." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Current plan</CardTitle>
            <CardDescription>Your active subscription</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 text-white">
                  <CreditCard className="size-5" />
                </span>
                <div>
                  <p className="text-lg font-bold">{currentPlan?.name ?? "Free"}</p>
                  <p className="text-sm text-muted-foreground">
                    {subscription
                      ? `${subscription.interval === "annual" ? "Annual" : "Monthly"} billing · ${subscription.provider}`
                      : "No active subscription"}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {nextInvoice && (
                  <span className="flex items-center gap-1.5">
                    <CalendarClock className="size-4" /> Next billing date: {formatDate(nextInvoice)}
                  </span>
                )}
                <Badge
                  variant="outline"
                  className={
                    subscription?.status === "active"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                      : "border-amber-500/30 bg-amber-500/10 text-amber-500"
                  }
                >
                  {subscription?.status ?? "none"}
                </Badge>
              </div>
            </div>
            <Button variant="outline" disabled={!subscription}>
              Cancel subscription
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment method</CardTitle>
            <CardDescription>Default card on file</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-violet-500/10">
                <CreditCard className="size-5 text-violet-500" />
              </span>
              <div>
                <p className="text-sm font-medium">Visa •••• 4242</p>
                <p className="text-xs text-muted-foreground">Expires 08/29</p>
              </div>
            </div>
            <Button variant="outline" className="mt-4 w-full">Update payment method</Button>
          </CardContent>
        </Card>
      </div>

      <PlanUpgrade plans={plans as never} currentPlanId={subscription?.planId ?? null} />

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Billing history</CardTitle>
            <CardDescription>Download past invoices</CardDescription>
          </div>
          <ExportCsvButton
            filename="invoices.csv"
            columns={[
              { key: "number", label: "Number" },
              { key: "issuedAt", label: "Issued" },
              { key: "subtotal", label: "Subtotal" },
              { key: "taxAmount", label: "Tax" },
              { key: "total", label: "Total" },
              { key: "status", label: "Status" },
            ]}
            rows={invoices as unknown as Record<string, unknown>[]}
          />
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <FileText className="mx-auto mb-2 size-8 opacity-40" />
              No invoices yet.
            </div>
          ) : (
            <div className="divide-y">
              {invoices.slice(0, 8).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
                      <FileText className="size-4 text-muted-foreground" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{invoice.number}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(invoice.issuedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold">{formatCurrency(invoice.total)}</span>
                    <Badge
                      variant="outline"
                      className={
                        invoice.status === "paid"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                          : invoice.status === "refunded"
                            ? "border-destructive/30 bg-destructive/10 text-destructive"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-500"
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
