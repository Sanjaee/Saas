import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueAreaChart, SalesBarChart, DonutChart, TrafficLineChart } from "@/components/charts";
import { auth, requireAdmin } from "@/lib/auth";
import { generateAnalytics } from "@/lib/analytics";
import { formatCompactNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Admin · Analytics" };

export default async function AdminAnalyticsPage() {
  const session = await auth();
  const admin = await requireAdmin();
  if (!session?.user || !admin) redirect("/403");

  const analytics = generateAnalytics();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Platform revenue, last 12 months</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueAreaChart data={analytics.revenue} color="#6366f1" height={280} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>User growth</CardTitle>
            <CardDescription>New accounts per month</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesBarChart data={analytics.users} color="#7c3aed" height={280} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Traffic</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <TrafficLineChart data={analytics.traffic} height={240} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
            <CardDescription>Platform access by device</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={analytics.devices} centerLabel={`${analytics.devices[0]?.value ?? 0}%`} height={240} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top pages</CardTitle>
            <CardDescription>Most visited paths</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.topPages.map((page) => (
              <div key={page.path} className="flex items-center justify-between text-sm">
                <span className="font-mono text-xs font-medium">{page.path}</span>
                <span className="font-semibold tabular-nums">{formatCompactNumber(page.views)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
