import Link from "next/link";
import {
  Users,
  CreditCard,
  DollarSign,
  TicketPercent,
  Activity,
  ShieldAlert,
} from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RevenueAreaChart } from "@/components/charts";
import { auth, requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listUsers, listSubscriptions, listPayments, listCoupons, listAuditLogs } from "@/lib/data";
import { generateAnalytics } from "@/lib/analytics";
import { timeAgo } from "@/lib/format";

export const metadata = { title: "Admin Overview" };

export default async function AdminOverviewPage() {
  const session = await auth();
  const admin = await requireAdmin();
  if (!session?.user || !admin) redirect("/403");

  let userCount = 0;
  let subCount = 0;
  let payTotal = 0;
  let couponCount = 0;
  let auditLogs: Awaited<ReturnType<typeof listAuditLogs>>["rows"] = [];

  try {
    userCount = (await listUsers({ pageSize: 1000 })).total;
    subCount = (await listSubscriptions({ pageSize: 1000 })).total;
    const payments = await listPayments({ pageSize: 1000 });
    payTotal = payments.rows.reduce((sum, p) => sum + (p.amount ?? 0), 0);
    couponCount = (await listCoupons()).length;
    auditLogs = (await listAuditLogs({ page: 1, pageSize: 8 })).rows;
  } catch {
    // offline
  }

  const analytics = generateAnalytics();
  const revenueSeries = analytics.revenue;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users" value={userCount} delta={8.4} icon={Users} iconClassName="bg-violet-500/10 text-violet-500" />
        <StatCard label="Active Subscriptions" value={subCount} delta={6.1} icon={CreditCard} iconClassName="bg-indigo-500/10 text-indigo-500" />
        <StatCard label="Gross Volume" value={payTotal} delta={12.9} icon={DollarSign} iconClassName="bg-emerald-500/10 text-emerald-500" />
        <StatCard label="Coupons Active" value={couponCount} delta={3.2} icon={TicketPercent} iconClassName="bg-amber-500/10 text-amber-500" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Platform revenue</CardTitle>
            <CardDescription>Gross volume across all providers</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueAreaChart data={revenueSeries} color="#6366f1" height={300} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Audit log</CardTitle>
              <CardDescription>Recent security events</CardDescription>
            </div>
            <Link href="/admin/audit-logs" className="text-sm font-medium text-violet-500 hover:text-violet-600">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {auditLogs.slice(0, 7).map((log) => (
              <div key={log.id} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Activity className="size-3.5 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">
                    <span className="font-mono">{log.action}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {log.actorEmail ?? "system"} · {timeAgo(log.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
              <ShieldAlert className="size-5 text-amber-500" />
            </span>
            <div>
              <p className="font-medium">Admin actions are logged</p>
              <p className="text-sm text-muted-foreground">
                Every change you make here is recorded in the audit log with your identity and IP.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
            Audit trail active
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
