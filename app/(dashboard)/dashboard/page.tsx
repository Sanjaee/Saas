import Link from "next/link";
import {
  DollarSign,
  Users,
  UserPlus,
  MousePointerClick,
  CreditCard,
  TrendingUp,
  CalendarClock,
  UserMinus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RevenueAreaChart, SalesBarChart, DonutChart } from "@/components/charts";
import { generateAnalytics, generateDashboardStats } from "@/lib/analytics";
import { formatCurrency, formatDateTime, initials } from "@/lib/format";

export const metadata = { title: "Dashboard" };

export default async function DashboardHomePage() {
  const stats = generateDashboardStats();
  const analytics = generateAnalytics();
  const revenueSeries = analytics.revenue;
  const lastRevenue = revenueSeries[revenueSeries.length - 1]?.value ?? 0;
  const prevRevenue = revenueSeries[revenueSeries.length - 2]?.value ?? 0;
  const revenueDelta = prevRevenue ? Math.round(((lastRevenue - prevRevenue) / prevRevenue) * 1000) / 10 : 0;
  const recentOrders = [
    { name: "Sarah Lee", email: "sarah.lee@acme.io", amount: 470, status: "paid", at: new Date("2026-08-06T06:00:00Z") },
    { name: "Marcus Chen", email: "marcus.chen@piedpiper.net", amount: 49, status: "paid", at: new Date("2026-08-06T03:00:00Z") },
    { name: "Amelia Rodriguez", email: "amelia.r@hooli.com", amount: 758, status: "pending", at: new Date("2026-08-05T23:00:00Z") },
    { name: "David Kim", email: "david.kim@vandelay.io", amount: 470, status: "paid", at: new Date("2026-08-05T02:00:00Z") },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue" value={stats.totalRevenue} delta={stats.deltas.totalRevenue} icon={DollarSign} iconClassName="bg-emerald-500/10 text-emerald-500" />
        <StatCard label="Active Users" value={stats.activeUsers} delta={stats.deltas.activeUsers} icon={Users} iconClassName="bg-violet-500/10 text-violet-500" />
        <StatCard label="New Users" value={stats.newUsers} delta={stats.deltas.newUsers} icon={UserPlus} iconClassName="bg-sky-500/10 text-sky-500" />
        <StatCard label="Conversion Rate" value={`${stats.conversionRate}%`} delta={stats.deltas.conversionRate} icon={MousePointerClick} iconClassName="bg-amber-500/10 text-amber-500" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Subscriptions" value={stats.activeSubscriptions} delta={stats.deltas.activeSubscriptions} icon={CreditCard} iconClassName="bg-indigo-500/10 text-indigo-500" />
        <StatCard label="Monthly Recurring Revenue" value={stats.mrr} delta={stats.deltas.mrr} icon={TrendingUp} iconClassName="bg-fuchsia-500/10 text-fuchsia-500" hint="MRR" />
        <StatCard label="Annual Recurring Revenue" value={stats.arr} delta={stats.deltas.arr} icon={CalendarClock} iconClassName="bg-rose-500/10 text-rose-500" hint="ARR" />
        <StatCard label="Churn Rate" value={`${stats.churnRate}%`} delta={stats.deltas.churnRate} icon={UserMinus} iconClassName="bg-teal-500/10 text-teal-500" hint="vs. last month" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Revenue</CardTitle>
              <CardDescription>Monthly revenue for the last 12 months</CardDescription>
            </div>
            <Badge
              variant="outline"
              className={
                revenueDelta >= 0
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }
            >
              {revenueDelta >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              {Math.abs(revenueDelta)}%
            </Badge>
          </CardHeader>
          <CardContent>
            <RevenueAreaChart data={revenueSeries} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Device Analytics</CardTitle>
            <CardDescription>Traffic by device</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={analytics.devices} centerLabel={`${analytics.devices[0]?.value ?? 0}%`} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Monthly signups</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesBarChart data={analytics.users} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Country Analytics</CardTitle>
            <CardDescription>Where your users come from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.countries.map((country) => (
                <div key={country.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{country.name}</span>
                    <span className="font-medium">{country.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                      style={{ width: `${country.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Smart recommendations from your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              "Revenue is trending 24% above target — consider scaling ad spend.",
              "Churn risk detected for 5 accounts on Starter. Send a win-back email.",
              "Enterprise pipeline up 18% this week. Follow up with 3 warm leads.",
            ].map((insight) => (
              <div key={insight} className="rounded-lg bg-violet-500/5 p-3 text-sm ring-1 ring-violet-500/10">
                ✨ {insight}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recent orders</CardTitle>
              <CardDescription>Latest transactions</CardDescription>
            </div>
            <Link href="/orders" className="text-sm font-medium text-violet-500 hover:text-violet-600">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {recentOrders.map((order) => (
                <div key={order.email} className="flex items-center gap-3 py-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-500 text-xs text-white">
                      {initials(order.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{order.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{order.email} · {formatDateTime(order.at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(order.amount)}</p>
                    <Badge
                      variant="outline"
                      className={
                        order.status === "paid"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-500"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
