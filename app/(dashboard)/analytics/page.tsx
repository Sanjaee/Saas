import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueAreaChart, SalesBarChart, TrafficLineChart, DonutChart } from "@/components/charts";
import { generateAnalytics } from "@/lib/analytics";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCompactNumber } from "@/lib/format";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const analytics = generateAnalytics();
  const totalSessions = analytics.traffic.reduce((sum, t) => sum + t.sessions, 0);
  const totalVisitors = analytics.traffic.reduce((sum, t) => sum + t.visitors, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Traffic</CardTitle>
            <CardDescription>Sessions &amp; visitors over the last 30 days</CardDescription>
            <div className="mt-2 flex gap-4">
              <div>
                <p className="text-2xl font-bold">{formatCompactNumber(totalSessions)}</p>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCompactNumber(totalVisitors)}</p>
                <p className="text-xs text-muted-foreground">Visitors</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TrafficLineChart data={analytics.traffic} height={260} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sales</CardTitle>
            <CardDescription>Monthly sales count</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesBarChart data={analytics.sales} height={260} color="#6366f1" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Device Analytics</CardTitle>
            <CardDescription>Share of traffic by device</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={analytics.devices} centerLabel={`${analytics.devices[0]?.value ?? 0}%`} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most visited paths</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.topPages.map((page) => (
              <div key={page.path} className="flex items-center justify-between text-sm">
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs font-medium">{page.path}</p>
                  <p className="text-muted-foreground">{formatCompactNumber(page.views)} views</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    page.trend >= 0
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                      : "border-destructive/30 bg-destructive/10 text-destructive"
                  }
                >
                  {page.trend >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                  {Math.abs(page.trend)}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Country Analytics</CardTitle>
            <CardDescription>Visitors by country</CardDescription>
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

      <Card>
        <CardHeader>
          <CardTitle>Targets</CardTitle>
          <CardDescription>Progress against this quarter&apos;s goals</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {analytics.targets.map((target) => {
            const pct = Math.min(100, Math.round((target.value / target.target) * 100));
            return (
              <div key={target.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{target.label}</span>
                  <span className="font-semibold">{pct}%</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {formatCompactNumber(target.value)} / {formatCompactNumber(target.target)}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
